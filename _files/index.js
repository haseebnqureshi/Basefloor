
module.exports = (API, { config }) => {

	const { _active, _providers } = config

	API.Files = {}
	
	for (let method in _active) {
		const providerName = _active[method]
		const providerConfig = _providers[providerName]
		API.Files[method] = require(`./providers/${providerName}`)({ config: providerConfig })
	}

	return API

}