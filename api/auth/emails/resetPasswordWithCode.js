
module.exports = (To, { code, appName, appAuthor, appAuthorEmail, durationText }) => ({
	To,
	Subject: `${appName} - Password Reset Code Verification`,
	Text: `
Hey there,

You recently requested to reset your password for your ${appName} account. Use the code below to verify your identity. This code is only valid for the next ${durationText}.

${code}

Thanks!
${appAuthor}

-------

If you did not request a password reset, please ignore this email or contact ${appAuthorEmail} if you have any questions.

`
})