
const collectionName = 'files'

module.exports = (API, { config }) => {

	API = require('./models.js')(API)

	const flatten = require('./utils/flatten.js')

	API.Files.downloadFromSpace = flatten.downloadFromSpace
	API.Files.removeFilepath = flatten.removeFilepath

	const { _active, _providers } = config

	API.Files = { ...API.Files }
	
	for (let method in _active) {
		const providerName = _active[method]
		const providerConfig = _providers[providerName]
		API.Files[method] = require(`./providers/${providerName}`)({ config: providerConfig })
	}

	API.post('/files', [API.Auth.requireToken, API.Auth.requireUser], async (req, res) => {
		//files are specific to authenticated user
		const user_id = req.user._id
		const { file, endpoint } = req.body
		try {
			const { name, size, type, lastModified } = file
			const file_modified_at = new Date(lastModified).toISOString()
			const values = { name, size, type, file_modified_at, user_id }
			const response = await API.DB.file.create({ values, endpoint })
			if (!response) { throw response }
			const { insertedId } = response
			const result = await API.DB.file.read({ where: { _id: insertedId }})
			res.status(200).send(result)
		}
		catch (err) {
			API.Utils.errorHandler({ res, err })
		}
	})

	API.get('/files', [API.Auth.requireToken, API.Auth.requireUser], async (req, res) => {
		//files are specific to authenticated user
		const user_id = req.user._id
		try {
			const where = { user_id }
			const result = await API.DB.file.readAll({ where })
			if (!result) { throw 'error occured when reading files' }
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
			const result = await API.DB.file.read({ where })
			if (!result) { throw 'error occured when reading file' }
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
			const result = await API.DB.file.updateAll({ where, values })
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
			const result = await API.DB.file.deleteAll({ where })
			if (!result) { throw 'error occured when deleting files' }
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
			const result = await API.DB.file.update({ where, values })
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
			const result = await API.DB.file.update({ where, values })
			if (!result) { throw 'error occured when updating file' }
			res.status(200).send(result)
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
			let file = await API.DB.file.read({ where })
			if (!file) { throw 'error occured when getting file' }

			// console.log({ file })

			const { filename, extension, url, name } = file

			if (!flatten.SUPPORTED_FORMATS[extension]) { //file is not a convertible format, so return out 
				return res.status(200).send()
			}

			let pages = await flatten.processDocument({
				name,
				inputKey: filename,
				outputBasename: filename.replace(extension, ''),
			})

			const flattened_at = new Date().toISOString() 
			let flattened_pages = {}

			for (let page of pages) {
				page = {
					...page,
					user_id: file.user_id,
					parent_file: file._id,
				}
				let result = await API.DB.file.createSimple({ values: page })
				flattened_pages[page.url] = result.insertedId
			}

			// console.log({ flattened_pages, flattened_at })

			result = await API.DB.file.update({ where, values: {
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

	API.delete('/files/:_id', [API.Auth.requireToken, API.Auth.requireUser], async (req, res) => {
		//files are specific to authenticated user
		const user_id = req.user._id
		const { _id } = req.params
		try {
			const where = { _id, user_id }
			const result = await API.DB.file.delete({ where })
			if (!result) { throw 'error occured when reading file' }
			res.status(200).send(result)
		}
		catch (err) {
			API.Utils.errorHandler({ res, err })
		}
	})

	// API.post('/presign', [API.Auth.requireToken, API.Auth.requireUser], async (req, res) => {
	// 	const { _id } = req.user
	// 	const { key, contentType } = req.body
	// 	try {
	// 		const url = await API.Files.storage.presign(
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