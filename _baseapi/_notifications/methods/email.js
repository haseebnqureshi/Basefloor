
const _ = require('underscore') 

module.exports = ({ client, helpers }) => {

	let email = {}

	email.send = async (values) => {
		return client.sendEmail(
			_.pick(values, helpers.emailFields)
		)	
	}

	return email
	
}