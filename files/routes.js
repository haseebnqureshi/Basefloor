
const Busboy = require('busboy')

module.exports = (API, { paths, project }) => {

	API.get('/files', [
		API.requireAuthentication, 
		API.postAuthentication,
	], async (req, res) => {
		//files are specific to authenticated user
		const user_id = req.user._id
		try {
			const where = { user_id }
			const result = await API.DB.Files.readAll({ where })
			if (!result) { throw 'error occured when reading files' }
			res.status(200).send(result)
		}
		catch (err) {
			API.Utils.errorHandler({ res, err })
		}
	})

	API.put('/files', [
		API.requireAuthentication, 
		API.postAuthentication,
	], async (req, res) => {
		//files are specific to authenticated user
		const user_id = req.user._id
		const values = req.body
		try {
			const where = { user_id }
			const result = await API.DB.Files.updateAll({ where, values })
			if (!result) { throw 'error occured when updating files' }
			res.status(200).send(result)
		}
		catch (err) {
			API.Utils.errorHandler({ res, err })
		}
	})

	API.delete('/files', [
		API.requireAuthentication, 
		API.postAuthentication,
	], async (req, res) => {
		//files are specific to authenticated user
		const user_id = req.user._id
		try {
			const where = { user_id }
			const result = await API.DB.Files.deleteAll({ where })
			if (!result) { throw 'error occured when deleting files' }
			res.status(200).send(result)
		}
		catch (err) {
			API.Utils.errorHandler({ res, err })
		}
	})

	API.get('/files/:_id', [
		API.requireAuthentication, 
		API.postAuthentication,
	], async (req, res) => {
		//files are specific to authenticated user
		const user_id = req.user._id
		const { _id } = req.params
		try {
			const where = { _id, user_id }
			const result = await API.DB.Files.read({ where })
			if (!result) { throw 'error occured when reading file' }
			res.status(200).send(result)
		}
		catch (err) {
			API.Utils.errorHandler({ res, err })
		}
	})

	API.get('/files/:parent_file/files', [
		API.requireAuthentication, 
		API.postAuthentication,
	], async (req, res) => {
		//files are specific to authenticated user
		const user_id = req.user._id
		const { parent_file } = req.params
		try {
			const where = { _id, user_id }
			const result = await API.DB.Files.readAll({ where })
			if (!result) { throw `error occured when reading files for parent` }
			res.status(200).send(result)
		}
		catch (err) {
			API.Utils.errorHandler({ res, err })
		}
	})

	API.put('/files/:_id', [
		API.requireAuthentication, 
		API.postAuthentication,
	], async (req, res) => {
		//files are specific to authenticated user
		const user_id = req.user._id
		const { _id } = req.params
		const values = req.body
		try {
			const where = { _id, user_id }
			const result = await API.DB.Files.update({ where, values })
			if (!result) { throw 'error occured when updating file' }
			res.status(200).send(result)
		}
		catch (err) {
			API.Utils.errorHandler({ res, err })
		}
	})

	API.put('/files/:parent_file/files', [
		API.requireAuthentication, 
		API.postAuthentication,
	], async (req, res) => {
		//files are specific to authenticated user
		const user_id = req.user._id
		const { parent_file } = req.params
		const values = req.body
		try {
			const where = { parent_file, user_id }
			const result = await API.DB.Files.updateAll({ where, values })
			if (!result) { throw `error occured when updating files for parent` }
			res.status(200).send(result)
		}
		catch (err) {
			API.Utils.errorHandler({ res, err })
		}
	})

	//this links existing files with one parent file, and is done so by passing
	//req.body = { _ids: [ ObjectId, ObjectId, ... ] } and that's it
	API.put('/files/:_id/files', [
		API.requireAuthentication, 
		API.postAuthentication,
	], async (req, res) => {
		//files are specific to authenticated user
		const user_id = req.user._id
		const { _id } = req.params
		const { _ids } = req.body
		try {
			const where = { user_id, _id: {$in:_ids}}
			const values = { parent_file: _id }
			const result = await API.DB.Files.updateAll({ where, values })
			if (!result) { throw `error occured when linking files with parent` }
			res.status(200).send(result)
		}
		catch (err) {
			API.Utils.errorHandler({ res, err })
		}
	})

	API.delete('/files/:_id', [
		API.requireAuthentication, 
		API.postAuthentication,
	], async (req, res) => {
		//files are specific to authenticated user
		const user_id = req.user._id
		const { _id } = req.params
		try {
			const where = { _id, user_id }
			const result = await API.DB.Files.delete({ where })
			if (!result) { throw 'error occured when deleting file' }
			res.status(200).send(result)
		}
		catch (err) {
			API.Utils.errorHandler({ res, err })
		}
	})

	API.delete('/files/:parent_file/files', [
		API.requireAuthentication, 
		API.postAuthentication,
	], async (req, res) => {
		//files are specific to authenticated user
		const user_id = req.user._id
		const { parent_file } = req.params
		try {
			const where = { parent_file, user_id }
			const result = await API.DB.Files.deleteAll({ where })
			if (!result) { throw 'error occured when deleting files for parent' }
			res.status(200).send(result)
		}
		catch (err) {
			API.Utils.errorHandler({ res, err })
		}
	})

	const parseFileParams = (req, res, next) => {
		const user_id = req.user._id
		try {
			console.log(req.file)
			req.fileParsed = API.Files.createFileValues({ 
				user_id, 
				name: file.name,
				size: file.size,
				content_type: file.type,
				lastModified: file.lastModified,
				cdnUrl: API.Files.Remote.CDN_URL, 
				createHash: API.Files.createFileHash,
			})
			next()
		}
		catch (err) {
			API.Utils.errorHandler({ res, err })
		}	
	}

	API.post('/files', [
		API.requireAuthentication, 
		API.postAuthentication,

		/*
		STEP 1: Parse our incoming file information using headers
		*/

		(req, res, next) => {
			try {
				const info = API.Utils.CollectMinapiHeaders(req.headers)
			  const [,extension] = info.name.match(/(\.[a-z0-9]+)$/)

				//@todo: still not ideal, as same files may have different names, and so we're still storing duplicates. may need client to send hash of file contents, because it's the client's duty to pipeline the body of the file to end cdn.
				const hash = API.Utils.hashObject({ 
					user_id: req.user._id.toString(),
					name: info.name,
					size: info.size,
					content_type: info.type,
				}, { algorithm: 'md5' })

			  const filename = `${hash}${extension}`
			  req.file = {
			  	pending: {},
			  	saved: {},
			  }

				req.file.pending = {
					hash,
					filename,
					extension,
					user_id: req.user._id,
					name: info.name,
					size: info.size,
					content_type: info.type,
					file_modified_at: info.modified,
					key: `${filename}`,
					url: `${API.Files.Remote.CDN_URL}/${filename}`,
					created_at: new Date().toISOString(),
				}
				API.Log('req.file.pending', req.file.pending)

				next()
			} catch (err) {
				API.Utils.errorHandler({ res, err })
			}
		},

		/*
		STEP 2: Attempt to load file from db if already saved to avoid duplications
		*/

		async (req, res, next) => {
			try {
				req.file.saved = await API.DB.Files.read({ 
					where: { 
						hash: req.file.pending.hash, 
						user_id: req.file.pending.user_id, 
					},
				})
				if (!req.file.saved) { 
					API.Log('- file not found in db, going to upload...')
					return next() 
				}
				if (req.file.saved.uploaded_at) {
					API.Log('- file found found in db and with "uploaded_at", returning saved file now...')
					return res.status(200).send(req.file.saved)
				}
				API.Log('- file found, req.file.saved', req.file.saved)
				next()
			}
			catch (err) {
				console.log(err, '- not trying to upload, something was wrong with fileParsed data')
				API.Utils.errorHandler({ res, err })
			}
		},

		/*
		STEP 3: Increase timeout for request to ensure upload has time to occur
		- need to implement resumable uploads
		- if we make it to this point, we've reduced the risk of duplicates and now we attempt to upload
		*/

		(req, res, next) => {
			const minutes = 10
			API.Log('- setting request timeout to this many minutes: ', minutes)
			req.socket.setTimeout(minutes * 60 * 1000) // 10 minutes for uploading (need to implement resumable uploads)
			next()
		},

	/*
	STEP 4: Attempt to upload our file, using busboy to handle the incoming file stream
	- load our "Remote" provider's "uploadFile" that should accept a stream
	- by default, this is using aws-sdk/s3-client and its lib-storage to manage uploads
	*/

	], async (req, res) => {
		
		API.Log('- attempting to upload req.file.pending:', req.file.pending)
		const busboy = Busboy({ headers: req.headers })
		
		busboy.on('file', async (fieldName, fileStream, file) => {
			try {
				const status = API.Files.Remote.uploadFile({
					Key: req.file.pending.key,
					Body: fileStream,
					ContentType: req.file.pending.content_type, 
				})

				status.on('httpUploadProgress', async progress => {
					const percent = Math.round(10000 * progress.loaded / req.file.pending.size) / 100
					API.Log(`  - uploaded ${percent}%`, progress)

					if (percent == 100) {
						API.Log(`- finished uploading!`)
						API.Log('- now attempting to save req.file.pending into db:', req.file.pending)
						
						if (req.file.saved) {
							await API.DB.Files.update({
								where: { _id: req.file.saved._id },
								values: {
									uploaded_at: new Date().toISOString(),
								},
							})
						} else {
							req.file.saved = {}
							const createResult = await API.DB.Files.create({
								values: {
									...req.file.pending,
									uploaded_at: new Date().toISOString(),
								}
							})
							req.file.saved._id = createResult.insertedId
						}

						req.file.saved = await API.DB.Files.read({
							where: { _id: req.file.saved._id }
						})

						API.Log('- saved!', { 'req.file.saved': req.file.saved })
						res.send(req.file.saved)
					}

				})

				await status.done()

			} catch(err) {
				console.error('- failed to upload req.file.pending...')
				console.error(err)
			}

		})
		
		/*
		STEP 5: Save our uploaded file
		- we may want to save our file information into db on start of upload for resumable
		*/

		busboy.on('finish', async () => {

		})

		busboy.on('error', err => console.error(err))

		req.pipe(busboy)
	})


	API.post('/files/:_id/pdf', [
		API.requireAuthentication, 
		API.postAuthentication,
	], async (req, res) => {



	})


	API.put('/files/:_id/flatten', [
		API.requireAuthentication, 
		API.postAuthentication,
	], async (req, res) => {
		const user_id = req.user._id
		const { _id } = req.params
		try {
			const where = { _id, user_id }
			let file = await API.DB.Files.read({ where })
			if (!file) { throw 'error occured when getting file' }

			// console.log({ file })

			const { filename, extension, url, name } = file

			if (!API.Files.SUPPORTED_FORMATS[extension]) { //file is not a convertible format, so return out 
				return res.status(200).send()
			}

			let pages = await API.Files.processDocument({
				name,
				inputKey: filename,
				outputBasename: filename.replace(extension, ''),
				convertToPdf: API.Files.Libreoffice.convertToPdf,
				sharp: API.Files.Sharp,
			})

			const flattened_at = new Date().toISOString() 
			let flattened_pages = {}

			for (let page of pages) {
				page = {
					...page,
					user_id: file.user_id,
					parent_file: file._id,
				}
				const hash = API.Files.createFileHash(page) 
				let result = await API.DB.Files.readOrCreate({
					where: { hash, user_id: file.user_id },
					values: page,
				})
				flattened_pages[page.url] = result.insertedId
			}

			// console.log({ flattened_pages, flattened_at })

			result = await API.DB.Files.update({ where, values: {
				flattened_at,
				flattened_pages,
			}})

			if (!result) { throw 'error occured when updating file' }
			res.status(200).send()
		}
		catch (err) {
			API.Utils.errorHandler({ res, err })
		}
	})

	// API.post('/presign', [
// 	API.requireAuthentication, 
// 	API.postAuthentication,
// ], async (req, res) => {
	// 	const { _id } = req.user
	// 	const { key, contentType } = req.body
	// 	try {
	// 		const url = await API.Files.Provider.presign(
	// 			API.Files.storage.putObjectCommand({
	// 				Key: key,
	// 				ContentType: contentType,
	// 			})
	// 		)
	// 		res.status(200).send({ url })
	// 	}
	// 	catch (err) {
	// 		API.Utils.errorHandler({ res, err })
	// 	}
	// })

	return API

}