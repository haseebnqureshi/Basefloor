const _ = require('underscore')
const sgMail = require('@sendgrid/mail')

module.exports = ({ providerVars, providerName }) => {

	const NAME = providerName
	const ENV = providerVars
	
	// Initialize SendGrid with API key
	sgMail.setApiKey(providerVars.apiKey)
	
	const emailFields = [
		'from',
		'to',
		'cc',
		'bcc',
		'subject',
		'text',
		'html',
		'replyTo',
		'attachments',
		'templateId',
		'dynamicTemplateData',
		'categories',
		'customArgs'
	]

	return {

		NAME,
		ENV,

		send: async (values) => {
			values = { ...values, from: providerVars.from }
			values = _.pick(values, emailFields)
			
			try {
				const result = await sgMail.send(values)
				return result[0] // SendGrid returns an array, we want the first result
			} catch (error) {
				console.error('SendGrid Error:', error)
				if (error.response) {
					console.error('SendGrid Response Body:', error.response.body)
				}
				throw error
			}
		}

	}	
} 