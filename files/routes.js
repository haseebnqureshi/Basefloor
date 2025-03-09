

module.exports = (API, { paths, project }) => {

	API.get('/:_id?', [
		API.requireAuthentication,
		API.postAuthentication,
	], async (req, res) => {
		try {
			let where = { user_id: req.user._id }
			if (req.params._id) { where._id = req.params._id }
			const result = await API.DB.Files.readAll({ where })
			if (!result) { throw 'error occured when reading file(s)' }
			res.status(200).send(result)
		}
		catch (err) {
			API.Utils.errorHandler({ res, err })
		}
	})

	//can add a query 'force=true' to force download of file from api endpoint 
	API.get('/:_id/download', [
		API.requireAuthentication, 
		API.postAuthentication,
		API.Files.loadFileById,
	], async (req, res) => {
		try {
			const fileStream = await API.Files.Remote.getFileStream({	Key: req.file.key })

			if (req.query.force) {
				res.setHeader('Content-Disposition', `attachment; filename="${req.file.filename}"`)
			}

			res.setHeader('Content-Type', req.file.content_type)
			fileStream.Body.pipe(res)
		}
		catch (err) {
			API.Utils.errorHandler({ res, err })
		}
	})

	API.get('/:_id/files', [
		API.requireAuthentication, 
		API.postAuthentication,
		API.Files.loadFileById,
		API.Files.loadFilesByParentId,
	], async (req, res) => {
		try {
			res.status(200).send(req.files)
		}
		catch (err) {
			API.Utils.errorHandler({ res, err })
		}
	})

	API.get('/convert/:to?', [
		API.requireAuthentication,
		API.postAuthentication,
	], async (req, res) => {

		//@TODO modify to include "."
		const extension = req.params.to
		const to = API.Files.autoDetectConvertTo({ extension })
		res.status(200).send({
			extension,
			accepted: to ? true : false,
			to,
		})
	})

	API.post('/:_id/convert/:to?', [
		API.requireAuthentication,
		API.postAuthentication,
		API.Files.loadFileById,
	], async (req, res) => {
		try {

			//get important baseline information
			const { extension, key } = req.file

			//auto selecting our "to" if not present - to is an array of formats
			const manyTo = req.params.to ? [`.${req.params.to}`] : API.Files.autoDetectConvertTo({ extension })

			//conversions
			let all = manyTo.map(to => ({ to, from:null, outPath:null, inPath:null,  }))

			for (const i in all) {
				const to = all[i].to
				const from = i === 0 ? extension : all[i-1].to
				const outPath = API.Files.ensureTempFilepath(`${key}-${from}-to-${to}`)
				const inPath = i === 0 ? await API.Files.downloadFile({ key }) : all[i-1].outPath
				all[i].from = from
				all[i].outPath = outPath
				all[i].inPath = inPath
			}

			for (const i in all) {
				const conversion = all[i]

				//then we convert our file. the resulting output may be multiple files
				const response = await API.Files.convertFile({ 
					inType: conversion.from,
					outType: conversion.to,
					inPath: conversion.inPath,
					outPath: conversion.outPath,
				})

				const parentId = i === 0 ? req.file._id : conversion.files[i-1]._id
				const parentName = req.file.name
				const user_id = req.user._id

				//because response has an array of filepaths, we assume bulk from here on
				const manyFileValues = API.Files.createManyFileValues({
					user_id,
					parentId,
					parentName,
					filepaths: response.outPaths,
					extension: conversion.to,
				})
				API.Log('POST /:_id/convert/:to? manyFileValues', manyFileValues)

				//now we upload our file(s)
				all[i].files = await API.Files.uploadFiles(manyFileValues)
				API.Log('POST /:_id/convert/:to? uploaded:all[i].files', all[i].files)

			}

			//then we save our file(s)
			const values = all[i].map(v => v.files).flat()
			API.Log('POST /:_id/convert/:to? values', values)
			const created = await API.DB.Files.createMany({ values })
			const insertedIds = Object.values(created.insertedIds)
			API.Log('POST /:_id/convert/:to? insertedIds', insertedIds)

			//update our values with newly created _ids, and return those values
			res.status(200).send(
				values.map((v,i) => ({ 
					...v,
					_id: insertedIds[i]
				}))
			)
		}
		catch (err) {
			API.Utils.errorHandler({ res, err })
		}
	})

	API.put('/:_id?', [
		API.requireAuthentication,
		API.postAuthentication,
	], async (req, res) => {
		try {
			let where = { user_id: req.user._id }
			if (req.params._id) { where._id = req.params._id }
			const values = req.body
			const result = await API.DB.Files.updateAll({ where, values })
			if (!result) { throw 'error occured when updating file(s)' }
			res.status(200).send(result)
		}
		catch (err) {
			API.Utils.errorHandler({ res, err })
		}
	})

	API.delete('/:_id?', [
		API.requireAuthentication,
		API.postAuthentication,
	], async (req, res) => {
		try {
			let where = { user_id: req.user._id }
			if (req.params._id) { where._id = req.params._id }
			const result = await API.DB.Files.deleteAll({ where })
			if (!result) { throw 'error occured when deleting file(s)' }
			res.status(200).send(result)
		}
		catch (err) {
			API.Utils.errorHandler({ res, err })
		}
	})

	API.post('/', [
		API.requireAuthentication,
		API.postAuthentication,

		/*
		STEP 1: Does this file exist and has it been uploaded?
		*/

		async (req, res, next) => {
			try {

				//parse our incoming file information using headers
				let info = API.Utils.CollectMinapiHeaders(req.headers)

				//allowing $req_user.{field} in the header, to access the req.user object
				if (info.prefix) {
					const parts = info.prefix.split('.')
					if (parts[0] == '@req_user') {
						const key = parts[1]
						if (req.user[key]) {
							info.prefix = req.user[key]
						}
					}
				}

				req.file = API.Files.createFileValues({
					user_id: req.user._id,
					name: info.name,
					size: info.size,
					content_type: info.type,
					prefix: info.prefix || null,
					file_modified_at: info.modified,
				})

				//checking by hash whether file exists (and user_id)
				const file = await API.DB.Files.read({
					where: {
						hash: req.file.hash,
						user_id: req.user._id,
					}
				})

				//if the file is in our db and presumed to be uploaded, sending that info back now
				if (file) {
					req.file = file
					if (file.uploaded_at) {
						API.Log('- file found in db and with "uploaded_at", returning saved file now...')
						return res.status(200).send(req.file)
					}
				}

				//otherwise, presuming file needs to be uploaded or created...
				API.Log('- file not found in db or is without "uploaded_at", uploading and upserting...')
				next()

			} catch (err) {
				API.Utils.errorHandler({ res, err })
			}
		},

		/*
		STEP 2: Increase timeout for request to ensure upload has time to occur
		- need to implement resumable uploads
		- if we make it to this point, we've reduced the risk of duplicates and now we attempt to upload
		*/

		API.Files.increaseRequestTimeout,

		/*
		STEP 3: Attempt to upload our file, using busboy to handle the incoming file stream
		- load our "Remote" provider's "uploadFile" that should accept a stream
		- by default, this is using aws-sdk/s3-client and its lib-storage to manage uploads
		*/

		API.Files.handleUpload,

	], async (req, res) => {
    try {
	    API.Log('- saved! req.file', req.file)
	    res.send(req.file)
    } 
    catch (err) {
    	console.error('POST / err', err)
      API.Utils.errorHandler({ res, err })
    }
	})

	return API

}