
module.exports = (To, { appName, appAuthor, appAuthorEmail }) => ({
	To,
	Subject: `${appName} - Password Changed`,
	TextBody: `
Hey there,

You recently changed your password for your ${appName} account.

If you did not request this password reset, please check the security of your passwords and contact ${appAuthorEmail}.

Thanks!
${appAuthor}

`
})
