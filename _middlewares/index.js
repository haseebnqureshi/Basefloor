
/*
ENV VARIABLES
-------------------
REQUEST_SIZE_LIMIT // optional, '50mb' or other string
*/

const morgan = require('morgan')
const cors = require('cors')
const bodyParser = require('body-parser')

module.exports = (API) => {

	const morganMode = process.env.NODE_ENV === 'production' ? 'tiny' : 'dev'
	API.use(morgan(morganMode))
	API.use(cors())
	API.use(bodyParser.urlencoded({ 
		limit: process.env.REQUEST_SIZE_LIMIT || '50mb', 
		extended: false, 
	}))
	API.use(bodyParser.json({ 
		limit: process.env.REQUEST_SIZE_LIMIT || '50mb', 
	}))

	return API

}