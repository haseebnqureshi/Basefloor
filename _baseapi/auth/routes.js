
const _ = require('underscore')

module.exports = (API, { auth }) => {

	API.Routes.auth = []

	API.Routes.auth.push({
		method: 'post',
		path: `/auth/user`,
		fn: async (req, res) => {

			const { email, password, sms } = req.body
			let user

			try {

				//checking if user email already registered
				user = await API.Utils.tryCatch('try:auth:readUser', API.DB.auth.readUser({ email }))
				if (user) { throw `${email} is already registered!` }

				//normalize sms to acceptable format
				// const validSMS = API.Services.auth.normalizePhone(sms)
				// if (!validSMS) { throw `${validSMS.normalized} appears to be invalid!` }

				//checking if user sms already registered
				// user = await API.Utils.tryCatch('try:auth:readUser', API.DB.auth.readUser({ sms: validSMS.normalized} ))
				// if (user) { throw `${validSMS.normalized} is already registered!` }

				//creating user
				user = await API.Utils.tryCatch('try:auth:createUser', API.DB.auth.createUser({
					..._.omit(req.body, ['sms', 'password']),
					// sms: validSMS.normalized,
					password_hash: await API.Services.auth.hashPassword(password),
				}))

				res.status(200).send({ 
					message: `User created!`,
					..._.omit(user, ['password_hash', 'password'])
				})

			}
			catch (err) {
				API.Utils.errorHandler({ res, err })
			}

		},
	})	

	API.Routes.auth.push({
		method: 'get',
		path: `/auth/user`,
		middlewares: [API.Middlewares.auth.tokenRequired, API.Middlewares.auth.loadAuthdUser],
		fn: async (req, res) => {

			try {
				res.status(200).send(_.omit(req.user, ['password_hash', '_id', 'created_at']))

			}
			catch (err) {
				API.Utils.errorHandler({ res, err })
			}

		},
	})	

	API.Routes.auth.push({
		method: 'post',
		path: `/auth/user/login`,
		fn: async (req, res) => {

			const { email, password } = req.body

			try {

				//checking if user email already registered
				user = await API.Utils.tryCatch('try:auth:readUser', API.DB.auth.readUser({ email }))
				if (!user) { throw `User not found!` }

				const passwordPasses = await API.Utils.tryCatch('try:auth:comparePasswordWithHashed', 
					API.Services.auth.comparePasswordWithHashed(password, user.password_hash)
				)
				if (!passwordPasses) { throw 422 }

				//creating jwt token
				const token = await API.Utils.tryCatch('try:auth:createToken',
					API.Services.auth.createToken('auth', user._id, {})
				)

				res.status(200).send({ token, message: `Logged in!` })

			}
			catch (err) {
				API.Utils.errorHandler({ res, err })
			}

		},
	})	


	API.Routes.auth.push({
		method: 'post',
		path: `/auth/user/reset/password`,
		fn: async (req, res) => {

			const { email } = req.body

			try {

				//checking if user exists via email
				user = await API.Utils.tryCatch('try:auth:readUser', API.DB.auth.readUser({ email }))
				if (!user) { throw `User not found!` }

				//creating jwt token
				const token = await API.Utils.tryCatch('try:auth:createToken',
					API.Services.auth.createToken('reset', user._id, {})
				)

				//send email for reset password
				const duration = API.Services.auth.expirations('reset')
				const url = process.env.APP_URL_RESET_PASSWORD.replace(':token', token)
				const TextBody = `
Hey there,

You recently requested to reset your password for your ${process.env.APP_NAME} account. Use the link below to reset it. This password reset is only valid for the next ${duration.text}.

${url}

If you did not request a password reset, please ignore this email or contact ${process.env.APP_AUTHOR_EMAIL} if you have any questions.

Thanks!
${process.env.APP_AUTHOR}

-------

If you're having trouble with the link above, copy and paste the URL into your web browser.

`

				API.Utils.tryCatch('try:auth:email.send', API.Notifications.email.send({
					To: email,
					Subject: `${process.env.APP_NAME} - Password Reset Link`,
					TextBody, 
				}))

				res.status(200).send({ message: `Email sent!` })

			}
			catch (err) {
				API.Utils.errorHandler({ res, err })
			}
		},
	})	

	API.Routes.auth.push({
		method: 'put',
		path: `/auth/user/reset/password`,
		middlewares: [API.Middlewares.auth.tokenRequired],
		fn: async (req, res) => {

			const { _id } = req.reset
			const { password } = req.body

			try {

				const password_hash = API.Services.auth.hashPassword(password)
				await API.DB.auth.updateUserPasswordHash({ _id, password_hash })
				res.status(200).send({ message: `User password reset!` })

				const TextBody = `
Hey there,

You recently changed your password for your ${process.env.APP_NAME} account.

If you did not request this password reset, please check the security of your passwords and contact ${process.env.APP_AUTHOR_EMAIL}.

Thanks!
${process.env.APP_AUTHOR}

`
				API.Utils.tryCatch('try:auth:email.send', API.Notifications.email.send({
					To: email,
					Subject: `${process.env.APP_NAME} - Password Changed`,
					TextBody, 
				}))

			}
			catch (err) {
				API.Utils.errorHandler({ res, err })
			}
		},
	})	

	//request verify method
	API.Routes.auth.push({
		method: 'post',
		path: `/auth/user/verify/:method`,
		middlewares: [API.Middlewares.auth.tokenRequired, API.Middlewares.auth.loadAuthdUser],
		fn: async (req, res) => {

			const { email, sms, _id } = req.user
			let payload = { method, value: '' }

			try {

				switch (method) {
					case 'email':
						payload.value = email
						break
					case 'sms':
						payload.value = sms
						break
				}

				const token = API.Services.auth.createToken('verify', _id, payload)
				const url = process.env.APP_URL_VERIFY.replace(':token', token)

				if (method === 'email') {
					const TextBody = `
	Hey there,

	Here's your verification email for ${process.env.APP_NAME}. Please follow the link to complete your email verification:

	${url}

	Thanks!
	${process.env.APP_AUTHOR}

	-------

	If you're having trouble with the link above, copy and paste the URL into your web browser. Also, this email was auto-generated by your email being registered with our system. If this was in error, please email us back and we'll look into what's going on.


	`
					API.Utils.tryCatch('try:auth:email.send', API.Notifications.email.send({
						To: email,
						Subject: `${process.env.APP_NAME} - Email Verification`,
						TextBody, 
					}))
				}
				else if (method === 'sms') {
					console.log({ method, token })
				}

				res.status(200).send({ message: `Verification sent!` })

			}
			catch (err) {
				API.Utils.errorHandler({ res, err })
			}
		},
	})	

	//check status of verification method
	API.Routes.auth.push({
		method: 'get',
		path: `/auth/user/verify`,
		middlewares: [API.Middlewares.auth.tokenRequired], 
		fn: async (req, res) => {

			//the verify token carries all the necessary information, including method of verification
			const { _id, method, value } = req.verify
			let where = { _id }
			where[method] = value //we pass the value (email or sms) to ensure less likely for anonymous public attempts at gaining user status
			where[`${method}_verified`] = true

			try {
				const user = await API.Utils.tryCatch('try:auth:readUser', API.DB.auth.readUser(where))
				res.status(200).send({ status: user ? true : false })
			}
			catch (err) {
				API.Utils.errorHandler({ res, err })
			}

		},
	})	

	//finish verification method
	API.Routes.auth.push({
		method: 'put',
		path: `/auth/user/verify`,
		middlewares: [API.Middlewares.auth.tokenRequired],
		fn: async (req, res) => {

			//the verify token carries all the necessary information, including method of verification
			const { _id, method } = req.verify

			try {
				await API.DB.auth.verifyUser(method, { _id })
				res.status(200).send({ message: `User ${method} verified!` })
			}
			catch (err) {
				API.Utils.errorHandler({ res, err })
			}
		},
	})	

	return API

}