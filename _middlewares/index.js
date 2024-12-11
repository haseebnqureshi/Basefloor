
const morgan = require('morgan')
const cors = require('cors')
const bodyParser = require('body-parser')

module.exports = (API) => {

	const morganMode = process.env.NODE_ENV === 'production' ? 'tiny' : 'dev'
	API.use(morgan(morganMode))
	API.use(cors())
	API.use(bodyParser.urlencoded({ limit: '5mb', extended: false }))
	API.use(bodyParser.json({ limit: '5mb' }))

	return API

}