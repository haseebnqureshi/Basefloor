
module.exports = (API, { files, paths, providers, project }) => {

	const { enabled } = files

	if (!enabled) { return API }

  if (files.provider) {

  	const Provider = require(`${paths.minapi}/providers/${files.provider}`)({ 
    	providerVars: providers[files.provider]
    })

	  API.Files = { 
	    ...API.Files,
	    Provider,
	  }
	  return API
  }

  /*
  for if we decide to enable multiple providers
  could be useful, only use with the following config in config.minapi.js:
	
	"files": {
		enabled: true,
		providers: {
			"Remote": "@digitalocean/files",
		},
	},

	*/

  else if (files.providers) {
  	for (let key in files.providers) {
  		const name = files.providers[key]
  		API.Files[key] = require(`${paths.minapi}/providers/${name}`)({ 
	    	providerVars: providers[name]
	    })
  	}
  }

	API.post('/files', [API.Auth.requireToken, API.Auth.requireUser], async (req, res) => {
		//files are specific to authenticated user
		const user_id = req.user._id
		const { file, endpoint } = req.body
		try {
			const { name, size, type, lastModified } = file
			const file_modified_at = new Date(lastModified).toISOString()
			const values = { name, size, type, file_modified_at, user_id }
			const response = await API.DB.Files.create({ values, endpoint })
			if (!response) { throw response }
			const { insertedId } = response
			const result = await API.DB.Files.read({ where: { _id: insertedId }})
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
			const result = await API.DB.Files.readAll({ where })
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
			const result = await API.DB.Files.read({ where })
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

	API.put('/files/:_id/flatten', [API.Auth.requireToken, API.Auth.requireUser], async (req, res) => {
		const user_id = req.user._id
		const { _id } = req.params
		try {
			const where = { _id, user_id }
			let file = await API.DB.Files.read({ where })
			if (!file) { throw 'error occured when getting file' }

			const { filename, extension, url, name } = file

			if (!API.Files.SUPPORTED_FORMATS[extension]) {
				return res.status(200).send()
			}

			let pages = await API.Files.processDocument({
				name,
				inputKey: filename,
				outputBasename: filename.replace(extension, ''),
				downloadFile: API.Files.Provider.downloadFile,
				uploadFile: API.Files.Provider.uploadFile,
			})

			const flattened_at = new Date().toISOString() 
			let flattened_pages = {}

			for (let page of pages) {
				page = {
					...page,
					user_id: file.user_id,
					parent_file: file._id,
				}
				let result = await API.DB.Files.create({ values: page })
				flattened_pages[page.url] = result.insertedId
			}

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

	// API.post('/presign', [API.Auth.requireToken, API.Auth.requireUser], async (req, res) => {
	// 	const { _id } = req.user
	// 	const { key, contentType } = req.body
	// 	try {
	// 		const url = await API.Files.Provider.presign(
	// 			API.Files.Provider.putObjectCommand({
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