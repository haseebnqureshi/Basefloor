
module.exports = (API, { config }) => {

	API.Auth.services = require('./services')({ config })












	API = require('./db')(API, { auth })

	API = require('./services')(API, { auth })

	API = require('./middlewares')(API, { auth })

	API = require('./routes')(API, { auth })

	return API

}