
const postmark = require('postmark')

module.exports = (API, { email }) => {

	API.Notifications.email = {}

	const { use } = email
	let token, client = null

	switch (use) {
		case 'postmark':

			token = email[use].token()
			client = new postmark.ServerClient(token)

			API.Notifications.email.send = async (values) => {
				return client.sendEmail(
					_.pick(values, [
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
					])
				)
			}

			break
	}

	return API
	
}