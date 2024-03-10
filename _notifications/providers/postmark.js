
const _ = require('underscore') 

const postmark = require('postmark')

module.exports = ({ config }) => {

	const { _env } = config

	const client = new postmark.ServerClient(_env.getToken())

	let helpers = {}

	helpers.emailFields = [
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

	helpers.filterEmailValues = (values) => {
		values = { ...values, From: _env.getFrom() }
		return _.pick(values, helpers.emailFields)
	}

	return { client, helpers }
	
}