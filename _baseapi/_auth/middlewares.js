
module.exports = (API, { auth }) => {

	const { collection } = auth

	API.Middlewares.auth = {}

	API.Middlewares.auth.tokenRequired = async (req, res, next) => {

		//request expectations
		const { authorization } = req.headers //for login
		let { token } = req.body //for verify and reset (via POST requests, avoids headers and persistence logic on client side)

		try {

			//only if we even have authorization headers (which we may not for reset and verifications)
			if (authorization) {

				//deciding on our token
				const authToken = authorization.split('Bearer ')[1]
				if (!token && !authToken) { 
					throw 'Missing token or malformed headers!' 
				}
				else if (!token && authToken) { 
					token = authToken 
				}
			}

			//checking token validity
			const decoded = await API.Utils.tryCatch('try:auth:validateToken', API.Services.auth.validateToken(token))
			if (!decoded) { throw 'Malformed, expired, or invalid token!' }

			//persisting decoded token if whitelisted
			switch (decoded.sub) {
				case 'verify':
				case 'auth':
				case 'reset':
					req[decoded.sub] = decoded
					break
				default:
					throw 'Invalid token subject!'
			}
			next()
		}
		catch (err) {
			console.log(err)
			res.status(422).send({ err })
		}
	}

	API.Middlewares.auth.loadAuthdUser = async (req, res, next) => {

		//request expectations
		let { _id } = req.auth

		_id = new API.DB.mongodb.ObjectId(_id) 

		try {

			//loading user
			const user = await API.Utils.tryCatch('try:auth:readUser', API.DB.auth.readUser({ _id }))

			//persist user and continue
			req.user = user

			next()
		}
		catch (err) {
			console.log(err)
			res.status(422).send({ err })
		}    
	}


	API.Middlewares.auth.ensureUserVerified = async (req, res, next) => {

		//request expectations
		const { user } = req

		try {

			//ensuring user has been verified
			if (!API.Services.auth.isUserVerified(user)) { throw `User not yet verified!` }

			//otherwise, continue
			next()
		}
		catch (err) {
			res.status(422).send({ err })
		}    
	}

	return API

}