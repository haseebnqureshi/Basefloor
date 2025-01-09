
/*
ENV VARIABLES
-------------------
REQUEST_SIZE_LIMIT // optional, '50mb' or other string
*/

const morgan = require('morgan')
const cors = require('cors')
const bodyParser = require('body-parser')

module.exports = (API, { middlewares, paths, providers }) => {

	const morganMode = middlewares.env === 'production' ? 'tiny' : 'dev'
	
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

	return API

}