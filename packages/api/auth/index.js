
const _ = require('underscore')

module.exports = (API, { paths, providers, project }) => {

	API.Auth.enabled = true

	API.Auth = { 
		...API.Auth, 
		...require('./utils')({ 
			secret: project.app.secret,
		}) 
	}

	//registration route
	API.post('/register', [], async (req, res) => {
		try {
			let values = req.body
			API.Log('POST /register values', values)
			const { email, password } = values

			//checking if user email already registered
			const where = { email }
			API.Log('POST /register where', where)
			let user = await API.DB.Users.read({ where })
			if (user) { 
				throw { code: 400, err: `${email} is already registered!` }
			}

			//normalize sms to acceptable format
			// const validSMS = API.Auth.normalizePhone(sms)

			//checking if user sms already registered
			// user = await API.DB.Users.read({ where: { sms: validSMS.normalized } })
			// if (user) { throw `${validSMS.normalized} is already registered!` }

			//creating user
			const password_hash = await API.Auth.hashPassword(password)
			const email_verified = false
			delete values.password
			values = {
				...values,
				password_hash,
				email_verified,
			}
			API.Log('POST /register values', values)

			user = await API.DB.Users.create({ values })
			res.status(200).send({
				message: `user registered!`,
			})
		}
		catch (err) {
			API.Utils.errorHandler({ res, err })
		}
	})

	//login route
	API.post('/login', [], async (req, res) => {
		const { email, password } = req.body
		try {
			const where = { email }
			const user = await API.DB.Users.read({ where })

			if (!user) { throw { code: 404, err: `user not found!` } }
			if (!password) { throw { code: 400, err: `password required!` } }
			if (!user.password_hash) { throw { code: 500, err: `user password hash not found!` } }
			const correctPassword = await API.Utils.try('Auth.login:comparePasswordWithHashed', 
				API.Auth.comparePasswordWithHashed(password, user.password_hash)
			)

			if (!correctPassword) { throw { code: 401, err: `incorrect login information!` } }
			const token = await API.Utils.createUserAuthToken({ user })
			
			API.Log({ token })
			res.status(200).send({ token, message: `logged in!` })
		}
		catch (err) {
			API.Utils.errorHandler({ res, err })
		}
	})

	//user information
	API.get('/user', [
		API.requireAuthentication,
		API.postAuthentication, 
	], async (req, res) => {
		try {
			res.status(200).send(req.user)
		}
		catch (err) {
			API.Utils.errorHandler({ res, err })
		}
	})

	//update user
	API.put('/user', [
		API.requireAuthentication, 
		API.postAuthentication,
	], async(req, res) => {
		try {
			const { _id } = req.user
			const where = { _id }
			const values = req.body
			await API.DB.Users.update({ where, values })
			res.status(200).send({ message: `updated user!` })
		}
		catch (err) {
			API.Utils.errorHandler({ res, err })
		}
	})

	//delete user
	API.delete('/user', [
		API.requireAuthentication, 
		API.postAuthentication,
	], async(req, res) => {
		try {
			const { _id } = req.user
			const where = { _id }
			await API.DB.Users.delete({ where })
			res.status(200).send({ message: `deleted user!` })
		}
		catch (err) {
			API.Utils.errorHandler({ res, err })
		}
	})



	//request reset password verification code to email 
	API.post('/user/reset/password', [], async (req, res) => {
		const { email } = req.body
		let user, token, totp
		try {

			//checking if user exists via email
			user = await API.DB.Users.read({ where: { email } })

			//creating jwt token
			totp = await API.Utils.createTotpCode()

			token = await API.Utils.try('Auth.resetPassword:createToken',
				API.Utils.createToken('reset', {
					_id: user._id, 
					code: totp.code, 
					secret: totp.secret 
				})
			)

			const durationLabel = API.Utils.EXPIRATIONS['RESET_LABEL']
			const emailArgs = require('./emails/resetPasswordWithCode')(email, {
				code: totp.code,
				durationText: durationLabel,
				appName: project.app.name,
				appAuthor: project.app.author.name,
				appAuthorEmail: project.app.author.email,
			})

			//sending email
			await API.Utils.try('Auth.resetPassword:email.send', 
				API.Emails.send(emailArgs))

			API.Log('emailed code and return jwt token to client. payload has secret, must be provided with emailed code to verify identity.', { token, totp })

			res.status(200).send({ 
				token,
				message: `emailed code!` 
			})

		}
		catch (err) {
			API.Utils.errorHandler({ res, err })
		}

	})


	API.get('/user/reset/password/:code', [
		API.requireAuthentication,
		API.postAuthentication,
	], async(req, res) => {
		const { _id, secret } = req.reset
		try {
			const { code } = req.params
			if (!code) { throw 'no code provided' }
			const validated = await API.Utils.validateTotpCode({ code, secret })
			if (!validated) { throw 'invalid code' }
			const token = validated ? await API.Utils.try('Auth.resetPasswordValidCode:createToken',
				API.Utils.createToken('reset', { _id })
			) : null
			res.status(200).send({ token, validated })
		}
		catch(err) {
			API.Utils.errorHandler({ res, err })
		}
	})

	//change user's password
	API.put('/user/reset/password', [
		API.requireAuthentication,
		API.postAuthentication,
	], async(req, res) => {
		const { _id } = req.reset
		const { password } = req.body
		try {

			//resetting user's password
			await API.DB.Users.update({ 
				where: { _id }, 
				values: { password_hash: await API.Auth.hashPassword(password) },
			})

			//getting user information
			const user = await API.DB.Users.read({ where: { _id } })

			const emailArgs = require('./emails/changedPassword')(user.email, {
				appName: project.app.name,
				appAuthor: project.app.author.name,
				appAuthorEmail: project.app.author.email,
			})

			//sending email
			await API.Utils.try('Auth.resetPassword:email.send', 
				API.Emails.send(emailArgs))

			//creating login token for presumed login
			const token = await API.Utils.createUserAuthToken({ user })
			// API.Log({ token })
			res.status(200).send({ token, message: `password changed and logged in!` })

		}
		catch (err) {
			API.Utils.errorHandler({ res, err })
		}
	})





	API.post('/user/verify/:method', [
		API.requireAuthentication, 
		API.postAuthentication,
	], async(req, res) => {
		const { email, sms, _id } = req.user
		const { method } = req.params
		let payload = { _id, method, value: '' }
		let token

		try {
			
			//ensuring appropriate verification value given method
			if (method === 'email') {
				payload.value = email
			} else if (method === 'sms') {
				payload.value = sms
			}

			//creating necessary token and link for verifying method
			token = await API.Utils.try('Utisl.createToken:verify',
				API.Utils.createToken('verify', payload))

			res.status(200).send({ message: `sending verification!`, token })
		}
		catch (err) {
			API.Utils.errorHandler({ res, err })
		}

		try {
			const url = project.app.urls.verify.replace(':token', token)

			//delivering email verification notification
			if (method === 'email') {
				const emailArgs = require('./emails/verifyEmail')(email, {
					url,
					appName: project.app.name,
					appAuthor: project.app.author.name,
				})

				//sending email
				API.Utils.try('Emails.send:verifyEmail', 
					API.Emails.send(emailArgs))

			//delivering sms verification notification
			} else if (method === 'sms') {
				API.Log({ method, token })
			}
		}
		catch (err) {
			API.Log(err)
		}
	})


	API.get('/user/verify', [
		API.requireAuthentication
	], async (req, res) => {

		//verify token carries all necessary info (w/ verify method)
		const { _id, method, value } = req.verify
		try {
			switch (method) {
				case 'email':
				case 'sms':
					break
				default:
					throw `${method} verification unavailable!`
			}

			//we pass the value (email or sms) to ensure less likely for anonymous public attempts at gaining user status, as opposed to via url param (since only requiring jwt token and not user auth)
			let where = { _id }
			where[method] = value 
			where[`${method}_verified`] = true

			//updating user verification status
			const user = await API.DB.Users.read({ where })
			API.Log('user/verify', where, { user })


			res.status(200).send({
				status: user ? true : false,
				message: `user ${method} ${user ? 'is verified' : 'not verified'}!`
			})
		}
		catch (err) {
			API.Utils.errorHandler({ res, err })
		}
	})


	//complete verification of method
	API.put('/user/verify', [
		API.requireAuthentication,
		API.postAuthentication,
	], async (req, res) => {

		//verify token carries all necessary info (w/ verify method)
		const { _id, method, value } = req.verify
		try {
			switch (method) {
				case 'email':
				case 'sms':
					break
				default:
					throw `${method} verification unavailable!`
			}

			let where, values

			//we pass the value (email or sms) to ensure less likely for anonymous public attempts at gaining user status, as opposed to via url param (since only requiring jwt token and not user auth)
			where = { _id }
			where[method] = value 
			values = {}
			values[`${method}_verified`] = true

			//updating user verification status
			await API.DB.Users.update({ where, values })

			res.status(200).send({ message: `user ${method} verified!` })
		}
		catch (err) {
			API.Utils.errorHandler({ res, err })
		}
	})




	if (project.checks) {

		API.Checks.register({
			resource: '/register',
			description: 'register new user',
			method: 'POST',
			params: ``,
			bearerToken: ``,
			body: `({ first_name: output.firstName, last_name: output.lastName, email: output.email, password: output.password })`,
			output: `({ output, request }) => ({ ...output, email: request.body.email, password: request.body.password })`,
			expectedStatusCode: 200,
		})

		API.Checks.register({
			resource: '/login',
			description: 'login user',
			method: 'POST',
			params: ``,
			bearerToken: ``,
			body: `({ email: output.email, password: output.password })`,
			output: `({ data, output }) => ({ ...output, token: data.token })`,
			expectedStatusCode: 200,
		})

		API.Checks.register({
			resource: '/user',
			description: 'get user information',
			method: 'GET',
			params: ``,
			bearerToken: `(output.token)`,
			body: ``,
			output: `({ data, output }) => ({ ...output, user: data })`,
			expectedStatusCode: 200,
		})


		API.Checks.register({
			resource: '/user/reset/password',
			description: 'emailing password reset verification code',
			method: 'POST',
			params: ``,
			bearerToken: ``,
			body: `({ email: output.email })`,
			output: `({ data, output }) => ({ ...output, token: data.token })`,
			expectedStatusCode: 200,
		})

		API.Checks.register({
			resource: '/user/reset/password',
			description: 'update password after clicking email link',
			method: 'PUT',
			params: ``,
			bearerToken: `(output.token)`,
			body: `({ password: output.newPassword })`,
			output: `({ output, request }) => ({ ...output, password: request.body.password })`,
			expectedStatusCode: 200,
		})

		API.Checks.register({
			resource: '/login',
			description: 'login user after changing password',
			method: 'POST',
			params: ``,
			bearerToken: ``,
			body: `({ email: output.email, password: output.newPassword })`,
			output: `({ data, output }) => ({ ...output, token: data.token })`,
			expectedStatusCode: 200,
		})

		API.Checks.register({
			resource: '/user',
			description: 'get user information after changing password',
			method: 'GET',
			params: ``,
			bearerToken: `(output.token)`,
			body: ``,
			output: `({ data, output }) => ({ ...output, user: data })`,
			expectedStatusCode: 200,
		})

		API.Checks.register({
			resource: '/user/verify/:method',
			description: 'verifying email',
			method: 'POST',
			params: `({ method: 'email' })`,
			bearerToken: `(output.token)`,
			body: ``,
			output: `({ data, output, request }) => ({ ...output, token: data.token, method: request.params.method })`,
			expectedStatusCode: 200,
		})	

		API.Checks.register({
			resource: '/user/verify',
			description: 'checking email verification status',
			method: 'GET',
			params: ``,
			bearerToken: `(output.token)`,
			body: ``,
			output: `({ output }) => ({ ...output })`,
			expectedStatusCode: 200,
		})

		API.Checks.register({
			resource: '/user/verify',
			description: 'completing email verification',
			method: 'PUT',
			params: ``,
			bearerToken: `(output.token)`,
			body: ``,
			output: `({ output }) => ({ ...output })`,
			expectedStatusCode: 200,
		})

		API.Checks.register({
			resource: '/user/verify',
			description: 'checking email verification status',
			method: 'GET',
			params: ``,
			bearerToken: `(output.token)`,
			body: ``,
			output: `({ output }) => ({ ...output })`,
			expectedStatusCode: 200,
		})
	}

	return API

}