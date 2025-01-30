
const morgan = require('morgan')
const cors = require('cors')
const bodyParser = require('body-parser')

module.exports = (API, { middlewares, paths, providers, project }) => {

	const morganMode = project.env === 'production' ? 'tiny' : 'dev'
	
	API.use(morgan(morganMode))

	if (middlewares.cors) {
		API.use(cors())
	}

	API.use(bodyParser.urlencoded({ 
		limit: middlewares.limit || '50mb', 
		extended: middlewares.extended !== null ? middlewares.extended : false, 
	}))

	API.use(bodyParser.json({ 
		limit: middlewares.limit || '50mb', 
	}))

	//.use is an array of functions, each returning a singular middleware
	if (middlewares.use) {
		//middleware is a fn that gets executed here
		for (let middleware of middlewares.use) {
			API.use(middleware())
		}
	}

	API.postAuthentication = async (req, res, next) => {
		next()	
	}

	//middleware requiring jwt tokens (verify, auth, and reset jwt tokens)
	API.requireAuthentication = async (req, res, next) => {
		const { authorization } = req.headers
		let { token } = req.body
		try {
	
			//only if we even have authorization headers (which we may not for reset and verifications)
			if (authorization) {
				const authToken = authorization.split('Bearer ')[1]
				if (!token && !authToken) {
					throw { code: 401, err: `missing token or malformed headers!` }
				} else if (!token && authToken) {
					token = authToken
				}
			}

			//checking token validity
			const decoded = await API.Utils.validateUserToken({ token })
			if (!decoded) { throw { code: 401, err: `malformed, expired, or invalid token!` } }
			req[decoded.sub] = decoded
			if (decoded.sub === 'auth') {
				req.user = decoded.user
			}
			next()
		}
		catch (err) {
			API.Utils.errorHandler({ res, err })
		}
	}


	return API

}