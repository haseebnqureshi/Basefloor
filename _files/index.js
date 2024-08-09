
module.exports = (API, { config }) => {

	const { _active, _providers } = config

	API.Files = {}
	
	for (let method in _active) {
		const providerName = _active[method]
		const providerConfig = _providers[providerName]
		API.Files[method] = require(`./providers/${providerName}`)({ config: providerConfig })
	}

	API.post('/files', [API.Auth.requireToken, API.Auth.requireUser], async (req, res) => {
		const { _id } = req.user
		const { key, contentType } = req.body
		try {
			const url = await API.Files.storage.presign(
				API.Files.storage.putObjectCommand({
					Key: key,
					ContentType: contentType,
				})
			)
			res.status(200).send({ url })
		}
		catch (err) {
			API.Utils.errorHandler({ res, err })
		}
	})

	return API

}