
const Busboy = require('busboy')

module.exports = (API, { paths, project }) => {

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
		API.Auth.requireToken,
		API.Auth.requireUser,
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
		async (req, res, next) => {
			try {
				req.file.saved = await API.DB.Files.read({ 
					where: { 
						hash: req.file.pending.hash, 
						user_id: req.file.pending.user_id, 
					},
				})
				if (!req.file.saved) { return next() }
				if (req.file.saved.uploaded_at) {
					return res.status(200).send(req.file.saved)
				}
				API.Log('req.file.saved', req.file.saved)
				next()
			}
			catch (err) {
				console.log(err, 'not trying to upload, something was wrong with fileParsed data')
				API.Utils.errorHandler({ res, err })
			}
		},
	], async (req, res) => {
		API.Log('req.file', req.file)
		const busboy = Busboy({ headers: req.headers })
		busboy.on('file', async (fieldName, fileStream, file) => {
			try {
				const status = API.Files.Remote.uploadFile({
					Key: req.file.pending.key,
					Body: fileStream,
					ContentType: req.file.pending.content_type, 
				})

				status.on('httpUploadProgress', progress => console.log(progress))
				await status.done()
			} catch(err) {
				console.log(err)
			}

		})
		busboy.on('finish', () => {
			console.log({ success: true })
			res.send({ success: true })
		})
		req.pipe(busboy)
	})


	// API.post('/files', [
	// 	API.Auth.requireToken, 
	// 	API.Auth.requireUser,
	// 	(req, res, next) => {
	// 		req.socket.setTimeout(10 * 60 * 1000) // 10 minutes for uploading (need to implement resumable uploads)
	// 		next()
	// 	},
	// 	parseFileParams,
	// 	checkIfFileAlreadyUploaded,
	// 	(req, res, next) => {
	// 		const mw = API.Files.Remote.getUploadMiddleware({ 
	// 			name: req.fileParsed.name,
	// 			key: req.fileParsed.key,
	// 		})
	// 		return mw(req, res, next)
	// 	},
	// ], async (req, res) => {
	// 	try {

	// 		// console.log('req.file', req.file)

	// 		// const upload = API.Files.Remote.uploadFile({
	// 		// 	key: req.fileParsed.key,
	// 		// 	stream: req,
	// 		// 	contentType: req.fileParsed.content_type,
	// 		// })
	// 		// const uploadResult = await upload.done()

	// 		// if (req.savedFile) {
	// 		// 	await API.DB.Files.update({
	// 		// 		where: { _id: req.savedFile._id },
	// 		// 		values: {
	// 		// 			uploaded_at: new Date().toISOString(),
	// 		// 		},
	// 		// 	})
	// 		// } else {
	// 		// 	req.savedFile = {}
	// 		// 	const createResult = await API.DB.Files.create({
	// 		// 		values: {
	// 		// 			...req.fileParsed,
	// 		// 			uploaded_at: new Date().toISOString(),
	// 		// 		}
	// 		// 	})
	// 		// 	req.savedFile._id = createResult.insertedId
	// 		// }

	// 		// const readResult = await API.DB.Files.read({
	// 		// 	where: { _id: req.savedFile._id }
	// 		// })

	// 		// console.log('uploadResult, readResult', uploadResult, readResult)

	// 		// res.status(200).send(readResult)
	// 	}
	// 	catch (err) {
	// 		API.Utils.errorHandler({ res, err })
	// 	}
	// })

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