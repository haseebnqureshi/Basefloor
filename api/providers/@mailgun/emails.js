
const _ = require('underscore') 
const formData = require('form-data')
const Mailgun = require('mailgun.js')
const mailgun = new Mailgun(formData)

module.exports = ({ providerVars, providerName }) => {

	const NAME = providerName
	const ENV = providerVars

	const client = mailgun.client({ 
		username: providerVars.username,
		key: providerVars.token
	})

	return {

		NAME,
		ENV,
		
		send: async ({ To /* ['email', 'email', ...] */, Subject, Text, Html }) => {
			try {
				let params = {
					from: providerVars.from,
					to: To,
					subject: Subject,
				}
				if (Text) { params.text = Text }
				if (Html) { params.html = Html }
				const msg = await client.messages.create(providerVars.domain, params)
				console.log(msg) 
				return msg
			}
			catch (err) {
				console.log(err)
				return err
			}
		}

	}	
}
