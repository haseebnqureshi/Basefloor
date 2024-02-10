
const postmark = require('postmark')

module.exports = ({ config }) => {

	const { _env } = config

	const client = new postmark.ServerClient(_env.getToken())

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