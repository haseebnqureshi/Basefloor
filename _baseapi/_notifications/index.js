
module.exports = (API, { config }) => {

	const { _active, _services } = config

	API.Notifications = {}

	for (let method in _active) {
		const serviceName = _active[method]
		const serviceConfig = _services[serviceName]
		const service = require(`./services/${serviceName}`)({ config: serviceConfig })
		API.Notifications[method] = require(`./methods/${method}`)({ 
			client: service.client,
			helpers: service.helpers,
		})
	}

	return API

}