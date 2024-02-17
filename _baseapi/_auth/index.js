
module.exports = (API, { config }) => {

	const { _verify } = config

	API.Auth = { ...require('./helpers')({ config }) }

	//not all tokens are with user auth; why this is separate of user
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
			const decoded = await API.Utils.try('Auth.requireToken', API.Auth.validateToken(token))
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

	API.Auth.requireUser = async (req, res, next) => {
		let { _id } = req.auth
		try {
			req.user = await API.Utils.try('Auth.requireUser', API.DB.user.read({ _id }))
			next()
		}
		catch (err) {
			res.status(422).send({ err })
		}
	}

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


	API.post('/register', [], async (req, res) => {
		const { email, password } = req.body
		try {
			//checking if user email already registered
			let user = await API.Utils.try('Auth.register:user.read', API.DB.user.read({ email }))
			if (user) { throw `${user} is already registered!` }

			//creating user
			user = await API.Utils.try('Auth.register:user.create', API.DB.user.create({
				..._.omit(req.body, ['sms', 'password']),
				password_hash: await API.Auth.hashPassword(password)
			}))

			res.status(200).send({
				message: `user registered!`,
				..._.omit(user, ['password_hash', 'password'])
			})
		}
		catch (err) {
			API.Utils.errorHandler({ res, err })
		}
	})

	API.post('/login', [], async (req, res) => {
		const { email, password } = req.body
		try {
			const user = await API.Utils.try('Auth.login:user.read', API.DB.user.read({ email }))
			if (!user) { throw `user not found!` }
			const correctPassword = await API.Utils.try('Auth.login:comparePasswordWithHashed', API.Auth.comparePasswordWithHashed(password, user.password_hash))
			if (!correctPassword) { throw 422 }
			const token = await API.Utils.try('Auth.login:createToken', API.Auth.createToken('auth', user._id, {}))
			res.status(200).send({ token, message: `logged in!` })
		}
		catch (err) {
			API.Utils.errorHandler({ res, err })
		}
	})

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







	// API = require('./db')(API, { auth })

	// API = require('./services')(API, { auth })

	// API = require('./middlewares')(API, { auth })

	// API = require('./routes')(API, { auth })

	return API

}