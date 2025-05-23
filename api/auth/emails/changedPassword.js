
module.exports = (To, { appName, appAuthor, appAuthorEmail }) => ({
	To,
	Subject: `${appName} - Password Changed`,
	Text: `
Hey there,

You recently changed your password for your ${appName} account.

Thanks!
${appAuthor}

-------

If you did not request a password reset, please ignore this email or contact ${appAuthorEmail} if you have any questions.

`

})
