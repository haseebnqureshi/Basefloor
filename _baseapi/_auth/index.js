
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
					throw `missing token or malformed headers!`
				} else if (!token && authToken) {
					token = authToken
				}
			}

			//checking token validity
			const decoded = await API.Utils.try('Auth.requireToken', 
				API.Auth.validateToken(token))
			if (!decoded) { throw `malformed, expired, or invalid token!` }

			//persisting decoded token if whitelisted
			switch (decoded.sub) {
				case 'verify':
				case 'auth':
				case 'reset':
					req[decoded.sub] = decoded
					break
				default:
					throw `invalid token subject!`
			}
			next()
		}
		catch (err) {
			res.status(422).send({ err })
		}
	}

	//middleware loading user from db
	API.Auth.requireUser = async (req, res, next) => {
		let { _id } = req.auth
		try {
			req.user = await API.DB.user.read({ where: { _id } })
			next()
		}
		catch (err) {
			res.status(422).send({ err })
		}
	}

	//middleware requiring verified user
	API.Auth.requireVerifiedUser = async (req, res, next) => {
		const { user } = req
		try {
			if (user.email_verified !== true && user.sms_verified !== true) { 
				throw `user not yet verified!`
			}
			next()
		}
		catch (err) {
			res.status(422).send({ err })
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
			if (!correctPassword) { throw 422 }
			const token = await API.Utils.try('Auth.login:createToken', 
				API.Auth.createToken('auth', user._id, {}))
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
		body: `({ first_name: 'Haseeb', last_name: 'Qureshi', email: 'haseeb.n.qureshi@gmail.com', password: 'admin' })`,
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
		output: `({ data }) => ({ ...output, token: data.token })`,
		expectedStatusCode: 200,
	})

	API.Checks.register({
		resource: '/user',
		description: 'get user information',
		method: 'GET',
		params: ``,
		bearerToken: `(output.token)`,
		body: ``,
		output: `({ data }) => ({ ...output, user: data })`,
		expectedStatusCode: 200,
	})

	//request reset password instructions be emailed 
	API.post('/user/reset/password', [], async (req, res) => {
		const { email } = req.body
		try {

			//checking if user exists via email
			const user = await API.DB.user.read({ where: { email } })

			//creating jwt token
			const token = await API.Utils.try('Auth.resetPassword:createToken',
				API.Auth.createToken('reset', user._id, {}))

			//send email for reset password
			const duration = API.Auth.expirations('reset')
			const url = process.env.APP_URL_RESET_PASSWORD.replace(':token', token)
			const emailArgs = require('./emails/resetPassword')({
				url,
				durationText: duration.text,
				appName: process.env.APP_NAME,
				appAuthor: process.env.APP_AUTHOR,
				appAuthorEmail: process.env.APP_AUTHOR_EMAIL,
			})

			//sending email
			API.Utils.try('Auth.resetPassword:email.send', 
				API.Notifications.email.send(emailArgs))

			res.status(200).send({ message: `reset password instructions emailed!` })
		}
		catch (err) {
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
				values: { password_hash: API.Auth.hashPassword(password) },
			})

			res.status(200).send({ message: `changed password for user!` })

			const emailArgs = require('./emails/changedPassword')({
				appName: process.env.APP_NAME,
				appAuthor: process.env.APP_AUTHOR,
				appAuthorEmail: process.env.APP_AUTHOR_EMAIL,
			})

			//sending email
			API.Utils.try('Auth.resetPassword(put):email.send', 
				API.Notifications.email.send(emailArgs))
		}
		catch (err) {
			API.Utils.errorHandler({ res, err })
		}
	})

	API.post('/user/verify/:method', [API.Auth.requireToken, API.Auth.requireUser], async(req, res) => {
		const { email, sms, _id } = req.user
		let payload = { method, value: '' }
		try {
			
			//ensuring appropriate verification value given method
			if (method === 'email') {
				payload.value = email
			} else if (method === 'sms') {
				payload.value = sms
			}

			//creating necessary token and link for verifying method
			const token = await API.Utils.try('Auth.verify:createToken',
				API.Auth.createToken('verify', _id, payload))
			const url = process.env.APP_URL_VERIFY.replace(':token', token)

			//delivering email verification notification
			if (method === 'email') {
				const emailArgs = require('./emails/verifyEmail')({
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

			res.status(200).send({ message: `verification sent!` })
		}
		catch (err) {
			API.Utils.errorHandler({ res, err })
		}
	})

	API.get('/user/verify', [API.Auth.requireToken], async (req, res) => {

		//verify token carries all necessary info (w/ verify method)
		const { _id, method, value } = req.verify
		try {

			//we pass the value (email or sms) to ensure less likely for anonymous public attempts at gaining user status, as opposed to via url param (since only requiring jwt token and not user auth)
			let where = { _id }
			where[method] = value 
			where[`${method}_verified`] = true

			//updating user verification status
			const user = await API.DB.user.read({ where })

			res.status(200).send({
				status: user ? true : false,
				message: `user ${method} is ${user ? 'verified' : 'not verified'}!`
			})
		}
		catch (err) {
			API.Utils.errorHandler({ res, err })
		}
	})

	//complete verification of method
	API.put('/user/verify', [API.Auth.requireToken], async (req, res) => {

		//verify token carries all necessary info (w/ verify method)
		const { _id, method, value } = req.verify
		try {
			let where, values

			//we pass the value (email or sms) to ensure less likely for anonymous public attempts at gaining user status, as opposed to via url param (since only requiring jwt token and not user auth)
			where = { _id }
			where[method] = value 
			values[`${method}_verified`] = true

			//updating user verification status
			await API.DB.user.update({ where, values })

			res.status(200).send({ message: `user ${method} verified!` })
		}
		catch (err) {
			API.Utils.errorHandler({ res, err })
		}
	})




















	return API

}