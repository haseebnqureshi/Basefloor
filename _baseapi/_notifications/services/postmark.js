
const postmark = require('postmark')

module.exports = ({ config }) => {

	let client = {}

	const token = config.getToken()

	client = new postmark.ServerClient(token)

	let helpers = {}

	helpers.emailFields = [
		'From',
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

	return { client, helpers }
	
}