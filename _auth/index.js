
const _ = require('underscore')

module.exports = (API, { config }) => {

	const { _verify } = config

	API.Auth = { ...require('./helpers')({ config }) }

	//middleware requiring jwt tokens (verify, auth, and reset jwt tokens)
	API.Auth.requireToken = async (req, res, next) => {
		const { authorization } = req.headers
		let { token } = req.body
		try {
	
			//only if we even have authorization headers (which we may not for reset and verifications)
			if (authorization) {
				const authToken = authorization.split('Bearer ')[1]
				if (!token && !authToken) {
					throw { code: 422, err: `missing token or malformed headers!` }
				} else if (!token && authToken) {
					token = authToken
				}
			}

			//checking token validity
			const decoded = await API.Utils.try('Auth.requireToken', 
				API.Auth.validateToken(token))
			if (!decoded) { throw { code: 422, err: `malformed, expired, or invalid token!` } }

			//persisting decoded token if whitelisted
			switch (decoded.sub) {
				case 'verify':
				case 'auth':
				case 'reset':
					req[decoded.sub] = decoded
					break
				default:
					throw { code: 422, err: `invalid token subject!` }
			}
			next()
		}
		catch (err) {
			API.Utils.errorHandler({ res, err })
		}
	}

	//middleware loading user from db
	API.Auth.requireUser = async (req, res, next) => {
		if (!req.auth) {
			throw { code: 422, err: `invalid authentication provided!` }
		}
		let { _id } = req.auth
		try {
			req.user = await API.DB.user.read({ where: { _id } })
			if (!req.user) { throw { code: 422, err: `user could not be found with credentials!` }}
			next()
		}
		catch (err) {
			API.Utils.errorHandler({ res, err })
		}
	}

	//middleware requiring verified user
	API.Auth.requireVerifiedUser = async (req, res, next) => {
		const { user } = req
		try {
			if (user.email_verified !== true && user.sms_verified !== true) { 
				throw { code: 422, err: `user not yet verified!` }
			}
			next()
		}
		catch (err) {
			API.Utils.errorHandler({ res, err })
		}
	}

	//registration route
	API.post('/register', [], async (req, res) => {
		const { email, password } = req.body
		try {
			//checking if user email already registered
			let user = await API.DB.user.read({ where: { email } })
			if (user) { 
				throw { code: 400, err: `${email} is already registered!` }
			}

			//normalize sms to acceptable format
			// const validSMS = API.Auth.normalizePhone(sms)

			//checking if user sms already registered
			// user = await API.DB.user.read({ where: { sms: validSMS.normalized } })
			// if (user) { throw `${validSMS.normalized} is already registered!` }

			//creating user
			user = await API.DB.user.create({ 
				values: {
					..._.omit(req.body, ['sms', 'password']),
					password_hash: await API.Auth.hashPassword(password),
					email_verified: false,
				}
			})

			res.status(200).send({
				message: `user registered!`,
				..._.omit(user, ['password_hash', 'password'])
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
			const user = await API.DB.user.read({ where: { email } })
			if (!user) { throw `user not found!` }
			const correctPassword = await API.Utils.try('Auth.login:comparePasswordWithHashed', 
				API.Auth.comparePasswordWithHashed(password, user.password_hash))
			if (!correctPassword) { throw { code: 422, err: `incorrect login information!` } }
			const token = await API.Utils.try('Auth.login:createToken', 
				API.Auth.createToken('auth', user._id, {}))
			// console.log({ token })
			res.status(200).send({ token, message: `logged in!` })
		}
		catch (err) {
			API.Utils.errorHandler({ res, err })
		}
	})

	//user information
	API.get('/user', [API.Auth.requireToken, API.Auth.requireUser], async (req, res) => {
		try {
			res.status(200).send(
				_.omit(req.user, ['password_hash', '_id', 'created_at'])
			)
		}
		catch (err) {
			API.Utils.errorHandler({ res, err })
		}
	})

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

	//request reset password verification code to email 
	API.post('/user/reset/password', [], async (req, res) => {
		const { email } = req.body
		let user, token, totp
		try {

			//checking if user exists via email
			user = await API.DB.user.read({ where: { email } })

			//creating jwt token
			totp = await API.Auth.createTotpCode()

			token = await API.Utils.try('Auth.resetPassword:createToken',
				API.Auth.createToken('reset', user._id, { 
					code: totp.code, 
					secret: totp.secret 
				})
			)

			const duration = API.Auth.expirations('reset')
			const emailArgs = require('./emails/resetPasswordWithCode')(email, {
				code: totp.code,
				durationText: duration.text,
				appName: process.env.APP_NAME,
				appAuthor: process.env.APP_AUTHOR,
				appAuthorEmail: process.env.APP_AUTHOR_EMAIL,
			})

			//sending email
			await API.Utils.try('Auth.resetPassword:email.send', 
				API.Notifications.email.send(emailArgs))

			console.log('emailed code and return jwt token to client. payload has secret, must be provided with emailed code to verify identity.', { token, totp })

			res.status(200).send({ 
				token,
				message: `emailed code!` 
			})

		}
		catch (err) {
			API.Utils.errorHandler({ res, err })
		}

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

	API.get('/user/reset/password/:code', [API.Auth.requireToken], async(req, res) => {
		const { _id, secret } = req.reset
		try {
			const { code } = req.params
			if (!code) { throw 'no code provided' }
			const validated = await API.Auth.validateTotpCode({ code, secret })
			if (!validated) { throw 'invalid code' }
			const token = validated ? await API.Utils.try('Auth.resetPasswordValidCode:createToken',
				API.Auth.createToken('reset', _id, {})
			) : null
			res.status(200).send({ token, validated })
		}
		catch(err) {
			API.Utils.errorHandler({ res, err })
		}
	})

	//change user's password
	API.put('/user/reset/password', [API.Auth.requireToken], async(req, res) => {
		const { _id } = req.reset
		const { password } = req.body
		try {

			//resetting user's password
			await API.DB.user.update({ 
				where: { _id }, 
				values: { password_hash: await API.Auth.hashPassword(password) },
			})

			//getting user information
			const user = await API.DB.user.read({ where: { _id } })

			const emailArgs = require('./emails/changedPassword')(user.email, {
				appName: process.env.APP_NAME,
				appAuthor: process.env.APP_AUTHOR,
				appAuthorEmail: process.env.APP_AUTHOR_EMAIL,
			})

			//sending email
			await API.Utils.try('Auth.resetPassword:email.send', 
				API.Notifications.email.send(emailArgs))

			//creating login token for presumed login
			const token = await API.Utils.try('Auth.resetPasswordChange:createToken', 
				API.Auth.createToken('auth', _id, {}))
			// console.log({ token })
			res.status(200).send({ token, message: `password changed and logged in!` })

		}
		catch (err) {
			API.Utils.errorHandler({ res, err })
		}
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

	API.post('/user/verify/:method', [API.Auth.requireToken, API.Auth.requireUser], async(req, res) => {
		const { email, sms, _id } = req.user
		const { method } = req.params
		let payload = { method, value: '' }
		let token

		try {
			
			//ensuring appropriate verification value given method
			if (method === 'email') {
				payload.value = email
			} else if (method === 'sms') {
				payload.value = sms
			}

			//creating necessary token and link for verifying method
			token = await API.Utils.try('Auth.verify:createToken',
				API.Auth.createToken('verify', _id, payload))

			res.status(200).send({ message: `sending verification!`, token })
		}
		catch (err) {
			API.Utils.errorHandler({ res, err })
		}

		try {
			const url = process.env.APP_URL_VERIFY.replace(':token', token)

			//delivering email verification notification
			if (method === 'email') {
				const emailArgs = require('./emails/verifyEmail')(email, {
					url,
					appName: process.env.APP_NAME,
					appAuthor: process.env.APP_AUTHOR,
				})

				//sending email
				API.Utils.try('Auth.verify:email.send', 
					API.Notifications.email.send(emailArgs))

			//delivering sms verification notification
			} else if (method === 'sms') {
				console.log({ method, token })
			}
		}
		catch (err) {
			console.log(err)
		}
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

	API.get('/user/verify', [API.Auth.requireToken], async (req, res) => {

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
			const user = await API.DB.user.read({ where })
			console.log('user/verify', where, { user })


			res.status(200).send({
				status: user ? true : false,
				message: `user ${method} ${user ? 'is verified' : 'not verified'}!`
			})
		}
		catch (err) {
			API.Utils.errorHandler({ res, err })
		}
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

	//complete verification of method
	API.put('/user/verify', [API.Auth.requireToken], async (req, res) => {

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
			await API.DB.user.update({ where, values })

			res.status(200).send({ message: `user ${method} verified!` })
		}
		catch (err) {
			API.Utils.errorHandler({ res, err })
		}
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

	//update user
	API.put('/user', [API.Auth.requireToken, API.Auth.requireUser], async(req, res) => {
		const { _id } = req.user
		const values = { 
			...API.DB.user.sanitize(req.body, 'u'), 
			updated_at: new Date().toISOString()
		}
		try {
			const where = { _id }
			await API.DB.user.update({ where, values })
			res.status(200).send({ message: `updated user!` })
		}
		catch (err) {
			API.Utils.errorHandler({ res, err })
		}
	})





	return API

}