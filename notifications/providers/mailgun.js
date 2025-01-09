
const _ = require('underscore') 

const formData = require('form-data')
const Mailgun = require('mailgun.js')
const mailgun = new Mailgun(formData)

module.exports = ({ config }) => {

	const { _env } = config

	const client = mailgun.client({ 
		username: 'api',
		key: _env.getToken()
	})

	let helpers = {}

	helpers.send = async ({ To /* ['email', 'email', ...] */, Subject, Text, Html }) => {
		try {
			let params = {
				from: _env.getFrom(),
				to: To,
				subject: Subject,
			}
			if (Text) { params.text = Text }
			if (Html) { params.html = Html }
			const msg = await client.messages.create(_env.getDomain(), params)
			console.log(msg) 
			return msg
		}
		catch (err) {
			console.log(err)
			return err
		}
	}

	return { client, helpers }
	
}