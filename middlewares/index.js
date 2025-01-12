
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

	return API

}