
module.exports = (API, { notifications }) => {

	const { email } = notifications

	API = require('./email')(API, { email })

	return API

}