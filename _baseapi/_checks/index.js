
const fs = require('fs')
const path = require('path')

module.exports = (API, { config }) => {

	const { projectPath } = config

	API.Checks = {}

	//ensure we have baseapi.test.js in projectpath
	const filepath = path.resolve(projectPath, 'baseapi.test.js')
	if (!fs.existsSync(filepath)) {
		fs.writeFileSync(filepath, "{}", "utf8")
	}

	//middleware, checker on non-production environments
	const notInProduction = async (req, res, next) => {
		if (process.env.NODE_ENV === 'production') {
			res.status(422).send({ message: `checker not available in production mode for security reasons!` })
		}
		next()	
	}

	//creating our sync route for tester view
	API.post('/checks', [notInProduction], async (req, res) => {
		try {
			const json = JSON.stringify(req.body)
			fs.writeFileSync(filepath, json, 'utf8')
			res.status(200).send({ message: 'synced!' })
		}
		catch (err) {
			API.Utils.errorHandling({ res, err })
		}
	})

	API.get('/checks', [notInProduction], async (req, res) => {
		try {
			const json = fs.readFileSync(filepath)
			const data = JSON.parse(json)
			res.status(200).send({ data })
		}
		catch (err) {
			API.Utils.errorHandling({ res, err })
		}
	})


	return API

}