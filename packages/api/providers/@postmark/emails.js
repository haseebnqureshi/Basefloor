
const _ = require('underscore') 
const postmark = require('postmark')

module.exports = ({ providerVars, providerName }) => {

	const NAME = providerName
	const ENV = providerVars
	const client = new postmark.ServerClient(providerVars.token)
	const emailFields = [
		'From',
		'To',
		'Cc',
		'Bcc',
		'Subject',
		'Tag',
		'HtmlBody',
		'TextBody',
		'ReplyTo',
		'Headers',
		'TrackOpens',
		'TrackLinks',
		'Attachments',
		'Metadata',
		'MessageStream',
	]

	return {

		NAME,
		ENV,

		send: async (values) => {
			values = { ...values, From: providerVars.from }
			values = _.pick(values, emailFields)
			return client.sendEmail(values)
		},

	}	
}
