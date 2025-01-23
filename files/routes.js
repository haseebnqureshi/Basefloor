
module.exports = (API, { paths, project }) => {

	const middlewareParseFiles = (req, res, next) => {
		const user_id = req.user._id
		const { file, endpoint } = req.body
		try {
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

	const checkIfFileAlreadyUploaded = async (req, res, next) => {
		try {
			const savedFile = await API.DB.Files.read({ 
				where: { 
					hash: req.fileParsed.hash, 
					user_id: req.fileParsed.user_id, 
				},
			})
			if (!savedFile) { return next() }
			if (savedFile.uploaded_at) {
				return res.status(200).send(savedFile)
			}
			req.savedFile = savedFile
			next()
		}
		catch (err) {
			console.log(err, 'not trying to upload, something was wrong with fileParsed data')
			API.Utils.errorHandler({ res, err })
		}
	}

	API.get('/files', [API.Auth.requireToken, API.Auth.requireUser], async (req, res) => {
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

	API.put('/files', [API.Auth.requireToken, API.Auth.requireUser], async (req, res) => {
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

	API.delete('/files', [API.Auth.requireToken, API.Auth.requireUser], async (req, res) => {
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

	API.get('/files/:_id', [API.Auth.requireToken, API.Auth.requireUser], async (req, res) => {
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

	API.put('/files/:_id', [API.Auth.requireToken, API.Auth.requireUser], async (req, res) => {
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

	API.put('/files/:_id/uploaded', [API.Auth.requireToken, API.Auth.requireUser], async (req, res) => {
		//files are specific to authenticated user
		const user_id = req.user._id
		const { _id } = req.params
		const values = { uploaded_at: new Date().toISOString() }
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

	API.delete('/files/:_id', [API.Auth.requireToken, API.Auth.requireUser], async (req, res) => {
		//files are specific to authenticated user
		const user_id = req.user._id
		const { _id } = req.params
		try {
			const where = { _id, user_id }
			const result = await API.DB.Files.delete({ where })
			if (!result) { throw 'error occured when reading file' }
			res.status(200).send(result)
		}
		catch (err) {
			API.Utils.errorHandler({ res, err })
		}
	})

	API.post('/files', [
		API.Auth.requireToken, 
		API.Auth.requireUser,
		(req, res, next) => {
			req.socket.setTimeout(10 * 60 * 1000) // 10 minutes for uploading (need to implement resumable uploads)
			next()
		},
		parseFileParams,
		checkIfFileAlreadyUploaded,
	], async (req, res) => {
		try {

			const upload = API.Files.Remote.uploadFile({
				key: req.fileParsed.key,
				stream: req,
				contentType: req.fileParsed.content_type,
			})
			const uploadResult = await upload.done()

			if (req.savedFile) {
				await API.DB.Files.update({
					where: { _id: req.savedFile._id },
					values: {
						uploaded_at: new Date().toISOString(),
					},
				})
			} else {
				req.savedFile = {}
				const createResult = await API.DB.Files.create({
					values: {
						...req.fileParsed,
						uploaded_at: new Date().toISOString(),
					}
				})
				req.savedFile._id = createResult.insertedId
			}

			const readResult = await API.DB.Files.read({
				where: { _id: req.savedFile._id }
			})

			console.log('uploadResult, readResult', uploadResult, readResult)

			res.status(200).send(readResult)
		}
		catch (err) {
			API.Utils.errorHandler({ res, err })
		}
	})

	API.put('/files/:_id/flatten', [API.Auth.requireToken, API.Auth.requireUser], async (req, res) => {
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

	// API.post('/presign', [API.Auth.requireToken, API.Auth.requireUser], async (req, res) => {
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