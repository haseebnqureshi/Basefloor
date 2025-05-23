
module.exports = (To, { url, appName, appAuthor, appAuthorEmail, durationText }) => ({
	To,
	Subject: `${appName} - Password Reset Link`,
	Text: `
Hey there,

You recently requested to reset your password for your ${appName} account. Use the link below to reset it. This password reset is only valid for the next ${durationText}.

${url}

If you did not request a password reset, please ignore this email or contact ${appAuthorEmail} if you have any questions.

Thanks!
${appAuthor}

-------

If you're having trouble with the link above, copy and paste the URL into your web browser.

`
})