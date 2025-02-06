
const Busboy = require('busboy')
const path = require('path')
const os = require('os')
const fs = require('fs')

module.exports = (API, { paths, project }) => {

	const PAGE_CONTENT_TYPE = 'image/png'
	const PDF_CONTENT_TYPE = 'application/pdf'

	const createFileValues = ({ prefix, user_id, name, size, content_type, file_modified_at, provider, bucket }) => {
	  //ensure user_id is a string and not a mongo ObjectId (can use user_id.toString())

	  /*
		still not ideal, as same files may have different names, and so we're still 
		storing duplicates. may need client to send hash of file contents, because 
		it's the client's duty to pipeline the body of the file to end cdn.
	  */
		const hash = API.Utils.hashObject({ user_id, name, size, content_type }, { algorithm: 'md5' })
	  const [,extension] = info.name.match(/(\.[a-z0-9]+)$/)
	  const filename = `${hash}${extension}`
	  const url = API.Files.Remote.CDN_URL + `/${filename}`
	  const key = prefix ? `${prefix}/${filename}` : filename

	  return {
	  	hash,
	  	filename,
	  	extension,
	  	user_id,
	  	name,
	  	size,
	  	content_type,
	  	file_modified_at,
	  	key,
	  	url,
	  	provider: provider || null,
	  	bucket: bucket || null,
	  }
	}

	const loadFileById = async (req, res, next) => {
		try {
			//pulling our file from db
			const user_id = req.user._id
			const { _id } = req.params
			const where = { _id, user_id }
			const file = await API.DB.Files.read({ where })
			if (!file) { throw 404 }
			req.file = file
			next()
		}
		catch (err) {
			API.Utils.errorHandler({ res, err })
		}
	}

	const loadPdfById = async (req, res, next) => {
		try {
			const user_id = req.user._id
			const { _id } = req.params
			const where = { 
				$and: [
					{ 'user_id': user_id },
					{ $or: [
						{ '_id': new API.DB.mongodb.ObjectId(_id) },
						{ 'parent_file': new API.DB.mongodb.ObjectId(_id) },
					] },
					{ 'content_type': PDF_CONTENT_TYPE }
				]
			}
			const pdf = await API.DB.Files.run().findOne(where)
			API.Log('loadPdfById:pdf', pdf)
			if (!pdf) { throw 404 }
			req.pdf = pdf
			next()
		}
		catch (err) {
			API.Utils.errorHandler({ res, err })
		}
	}

	const loadPdfWithPages = async (req, res, next) => {
		try {
			if (!req.pdf) { throw 404 }
			const user_id = req.user._id
			const parent_file = req.pdf._id
			const pages = await api.DB.Files.readAll({
				where: {
					user_id,
					parent_file,
					content_type: PAGE_CONTENT_TYPE,
				}
			})
			if (!pages) { throw 404 }
			req.pdf.pages = pages
			next()
		}
		catch (err) {
			API.Utils.errorHandler({ res, err })
		}
	}

	const checkFileByPending = async (req, res, next) => {
		try {
			req.file = await API.DB.Files.read({ 
				where: { 
					hash: req.pending.hash, 
					user_id: req.pending.user_id, 
				},
			}) || null
			next()
		}
		catch (err) {
			API.Utils.errorHandler({ res, err })
		}
	}











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
	API.post('/files/:parent_file/files', [
		API.requireAuthentication, 
		API.postAuthentication,
	], async (req, res) => {
		//files are specific to authenticated user
		const user_id = req.user._id
		const { parent_file } = req.params
		const { _ids } = req.body
		try {
			const where = { user_id, _id: {$in:_ids}}
			const values = { parent_file }
			const result = await API.DB.Files.updateAll({ where, values })
			if (!result) { throw `error occured when linking files with parent` }
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


	API.post('/files', [
		API.requireAuthentication, 
		API.postAuthentication,

		/*
		STEP 1: Parse our incoming file information using headers
		*/

		(req, res, next) => {
			try {
				const info = API.Utils.CollectMinapiHeaders(req.headers)
				req.pending = createFileValues({
					user_id: req.user._id.toString(),
					name: info.name,
					size: info.size,
					content_type: info.type,
					file_modified_at: info.modified,
				})
				API.Log('req.pending', req.pending)
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
				req.file = await API.DB.Files.read({ 
					where: { 
						hash: req.pending.hash, 
						user_id: req.pending.user_id, 
					},
				})
				if (!req.file) { 
					API.Log('- file not found in db, going to upload...')
					return next() 
				}
				if (req.file.uploaded_at) {
					API.Log('- file found found in db and with "uploaded_at", returning saved file now...')
					return res.status(200).send(req.file)
				}
				API.Log('- file found, req.file', req.file)
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
		
		API.Log('- attempting to upload req.pending:', req.pending)
		const busboy = Busboy({ headers: req.headers })
		
		busboy.on('file', async (fieldName, fileStream, file) => {
			try {
				const status = API.Files.Remote.uploadFile({
					Key: req.pending.key,
					Body: fileStream,
					ContentType: req.pending.content_type, 
				})

				status.on('httpUploadProgress', async progress => {
					const percent = Math.round(10000 * progress.loaded / req.pending.size) / 100
					API.Log(`  - uploaded ${percent}%`, progress)

					if (percent == 100) {
						API.Log(`- finished uploading!`)
						API.Log('- now attempting to save req.pending into db:', req.pending)
						
						if (req.file) {
							await API.DB.Files.update({
								where: { _id: req.file._id },
								values: {
									uploaded_at: new Date().toISOString(),
									provider: API.Files.Remote.NAME,
									bucket: API.Files.Remote.ENV.bucket,
								},
							})
						} else {
							req.file = {}
							const createResult = await API.DB.Files.create({
								values: {
									...req.pending,
									uploaded_at: new Date().toISOString(),
									provider: API.Files.Remote.NAME,
									bucket: API.Files.Remote.ENV.bucket,
								}
							})
							req.file._id = createResult.insertedId
						}

						req.file = await API.DB.Files.read({
							where: { _id: req.file._id }
						})

						API.Log('- saved!', { 'req.file': req.file })
						res.send(req.file)
					}

				})

				await status.done()

			} catch(err) {
				console.error('- failed to upload req.pending...')
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
		loadFileById,
		async (req, res, next) => {
			try {

				//file is already a pdf, conversion not required...
				const { filename, extension, url, name } = req.file
				if (extension == '.pdf') {
					return res.status(200).send(req.file)
				}

				//file type not supported...
				if (!API.Files.SUPPORTED_FORMATS[extension]) { throw 422 }

				//creating our pdf (has to be locally as a file, can't be buffed with libreoffice)
				const inputPath = path.join(os.tmpdir(), `${new Date().toISOString()}-${filename}`)
				const pdfPath = await API.Files.Libreoffice.convertToPdf({ inputPath })
				req.filepath = pdfPath

				//pulling relevant information to create new file object for pdf
				const pdfStats = fs.statSync(pdfPath)
				const size = pdfStats.size
				const file_modified_at = new Date().toISOString()
				req.pending = createFileValues({
					user_id: req.user._id.toString(),
					name,
					size,
					content_type: PDF_CONTENT_TYPE,
					file_modified_at,
				})
				req.pending.parent_file = file._id

				//remove the file object, no longer needed
				delete req.file

				next()
			}
			catch (err) {
				API.Utils.errorHandler({ res, err })
			}
		},

		//now attempting to load our potential pdf file, if in db...
		checkFileByPending,

	], async (req, res) => {
		try {

			//presuming there was no pdf file in our db
			let _id = null

			if (req.file) {
				if (req.file._id) {
					//we found a pdf file in our db, keep our _id
					_id = req.file._id
				}
			}

			//upload our file no matter what
			await API.Files.Remote.uploadFile({
				Key: req.pending.key,
				Body: fs.createReadStream(req.filepath),
				ContentType: req.pending.content_type,
			})
			req.pending.uploaded_at = new Date().toISOString()

			//then conditionally create or update our pdf file in db
			if (!_id) {
				const { insertedId } = await API.DB.Files.create({
					values: {
						...req.pending,
						uploaded_at: new Date().toISOString(),
						provider: API.Files.Remote.NAME,
						bucket: API.Files.Remote.ENV.bucket,
					}
				})
				_id = insertedId
			}
			else {
				await API.DB.Files.update({
					where: { _id },
					values: {
						...req.pending,
						uploaded_at: new Date().toISOString(),
						provider: API.Files.Remote.NAME,
						bucket: API.Files.Remote.ENV.bucket,
					},
				})
			}

			//read the file back
			req.file = await API.DB.Files.read({
				where: { _id },
			})

			res.status(200).send(req.file)
		}
		catch (err) {
			API.Utils.errorHandler({ res, err })
		}

	})


	API.post('/pdfs/:_id/pages', [
		API.requireAuthentication, 
		API.postAuthentication,
		loadPdfById,
		async (req, res, next) => {
			try {

				//first downloading our pdf to local storage
				const pdfPath = path.join(os.tmpdir(), `${new Date().toISOString()}-${req.pdf.filename}`)
				await API.Files.Remote.downloadFile({
					Key: req.pdf.key,
					localPath: pdfPath,
				})

				//then feeding into sharp to split pages into images
				const outputDir = path.join(os.tmpdir(), `${new Date().toISOString()}-${req.pdf.hash}-images`)
				let images = await API.Files.Sharp.convertPdfToImages({
					pdfPath,
					outputDir,
				})

				//if no images, error out
		    if (!images.length) {
		      throw new Error('No images were generated from the PDF');
		    }

		    //iterate through images and load up values into req.pages
		    const basename = req.pdf.name.replace(req.pdf.extension, '')
		    req.pages = []

		    for (let i in images) {
		    	const imagepath = images[i]
		    	const stats = fs.statSync(imagepath)
		    	const size = stats.size
		    	const page = String(parseInt(p)+1)
		    	const name = `${req.pdf.basename} (Page ${page} of ${images.length})`
		    	const values = createFileValues({ 
		    		user_id: req.user._id.toString(),
		    		name,
		    		size,
		    		content_type: PAGE_CONTENT_TYPE,
		    		file_modified_at: new Date().toISOString(),
		    	})
		    	req.pages[i] = {
	    			...values,
	    			localPath: imagepath,
	    			parent_file: req.pdf._id,
		    	}
		    }

		    next()
			}
			catch (err) {
				API.Utils.errorHandler({ res, err })
			}
		},
	], async (req, res) => {
		try {

			//upload each image unconditionally
			for (let i in req.pages) {
				const page = req.pages[i]
				await API.Files.Remote.uploadFile({
					Key: page.key,
					ContentType: page.content_type,
					Body: fs.createReadStream(page.localPath),
				})
				req.pages[i].uploaded_at = new Date().toISOString()
				req.pages[i].provider = API.Files.Remote.NAME
				req.pages[i].bucket = API.Files.Remote.ENV.bucket

				delete req.pages[i].localPath
			}

			//bulk insert pages into db
			const { insertedIds } = API.DB.Files.createMany(req.pages)

			//check the count, make sure all were created
			if (req.pages.length !== insertedIds.length) { throw 'not all pages appear to have been processed or saved to db!' }

			req.pages = req.pages.map((p,i) => {
				p._id = insertedIds[i]
				return p
			})
			res.status(200).send(req.pages)
		}
		catch (err) {
			API.Utils.errorHandler({ res, err })
		}
	})

	API.get('/pdfs/:_id', [
		API.requireAuthentication, 
		API.postAuthentication,
		loadPdfById,
		loadPdfWithPages,
	], async (req, res) => {
		res.status(200).send(req.pdf)
	})

	API.get('/pdfs/:_id/pages', [
		API.requireAuthentication, 
		API.postAuthentication,
		loadPdfById,
		loadPdfWithPages,
	], async (req, res) => {
		res.status(200).send(req.pdf.pages)
	})

	//can add a query 'force=true' to force download of file from api endpoint 
	API.get('/files/:_id/download', [
		API.requireAuthentication, 
		API.postAuthentication,
		loadFileById,
	], async(req, res) => {
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


	return API

}