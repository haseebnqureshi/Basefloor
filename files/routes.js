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

	API.get('/convert/:to?', [ //:to without "."
		API.requireAuthentication,
		API.postAuthentication,
	], async (req, res) => {

		const from = `.${req.params.to}`
		const converter = API.Files.checkConverters(from)

		res.status(200).send({
			extension: from,
			accepted: converter ? true : false,
			to: converter ? converter.to : null,
		})
	})

	API.post('/:_id/convert', [
		API.requireAuthentication,
		API.postAuthentication,
		API.Files.loadFileById,
	], async (req, res) => {

		const convertFile = async ({ key, from, user_id, parentId, parentName, inPath }) => {
			try {
				const converter = API.Files.checkConverters(from)
				if (!converter) { return [] }
				if (converter.to === from) { return [] } //avoiding infinite loops (particularly png to png, resizing)
	
				//convert
				const to = converter.to
				const outPath = API.Files.ensureTempFilepath(`${user_id}-${key}-${from}-to-${to}`)
				const response = await converter.convert(inPath, outPath)
				const result = converter.out({ response, inPath, outPath })
				const { outPaths } = result
				if (!outPaths) { throw new Error(`Failed to convert from ${from}: no outPaths returned`) }
	
				//create values
				let values = API.Files.createManyFileValues({
					user_id,
					parentName,
					filepaths: outPaths,
					extension: to,
					parentId,
				})
	
				//upload
				values = await API.Files.uploadFiles(values)
	
				//save
				const created = await API.DB.Files.createMany({ values })
				const insertedIds = Object.values(created.insertedIds)
				if (insertedIds.length !== values.length) { throw new Error(`Failed to saved everything that is converted from ${from}: less insertedIds than values`) }
				
				let files = values.map((v,i) => ({ ...v, _id: insertedIds[i] }))
				if (files.length === 0) { return [] }
	
				return [
					...files,
					... await convertFile({ 
						key,
						user_id,
						parentName,
						from: to,
						// parentId: files[0]._id, //assuming that only the last converter could be a one to many conversion
						parentId, //have it link to the original file. that allows us to search by content_type and extension for the original file that we want
						inPath: outPaths[0]  //assuming that only the last converter could be a one to many conversion
					})
				]
			}
			catch (err) {
				throw new Error(`Failed to convert from ${from}: ${err.message}`)
			}
		}

		try {

			let files = []

			//get important baseline information
			const { extension, key } = req.file
			const from = extension
			const inPath = await API.Files.downloadFile({ key })
			const parentId = req.file._id
			const parentName = req.file.name
			const user_id = req.user._id

			files = await convertFile({ key, from, user_id, parentId, parentName, inPath })

			//send back our finalized values
			res.status(200).send(files.flat())

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