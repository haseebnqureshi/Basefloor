
module.exports = (API, { config }) => {

	const { _active, _providers } = config

	API.Notifications = {}

	for (let method in _active) {
		const providerName = _active[method]
		const providerConfig = _providers[providerName]
		const provider = require(`./providers/${providerName}`)({ config: providerConfig })
		API.Notifications[method] = require(`./methods/${method}`)({ 
			client: provider.client,
			services: provider.services,
		})
	}

	return API

}