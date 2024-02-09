
module.exports = (API, { auth }) => {

	API = require('./db')(API, { auth })

	API = require('./services')(API, { auth })

	API = require('./middlewares')(API, { auth })

	API = require('./routes')(API, { auth })

	return API

}