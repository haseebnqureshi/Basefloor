
module.exports = ({ client, helpers }) => {

	let email = {}

	email.send = async (values) => {
		values = helpers.filterEmailValues(values)
		return client.sendEmail(values)	
	}

	return email
	
}