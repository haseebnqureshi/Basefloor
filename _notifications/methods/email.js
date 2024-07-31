
module.exports = ({ client, helpers }) => {

	let email = {}

	email.send = async (values) => helpers.send(values)

	return email
	
}