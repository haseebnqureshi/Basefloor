
const fs = require('fs')
const path = require('path')
const _ = require('underscore')

module.exports = (API, { paths, providers, project }) => {

	const enabled = project.checks

  if (!enabled) { return API }

	const filepath = path.resolve(paths.app, 'minapi.test.js')

	API.Checks = { ...API.Checks }

	API.Checks.requests = []

	//middleware, checker on non-production environments
	const notInProduction = async (req, res, next) => {
		if (project.env === 'production') {
			res.status(422).send({ message: `checker not available in production mode for security reasons!` })
		}
		next()	
	}

	//creating our sync route for tester view
	API.post('/minapi/checks', [notInProduction], async (req, res) => {
		try {
			const json = JSON.stringify(req.body)
			fs.writeFileSync(filepath, json, 'utf8')
			res.status(200).send({ message: 'synced!' })
		}
		catch (err) {
			API.Utils.errorHandler({ res, err })
		}
	})

	API.get('/minapi/checks', [notInProduction], async (req, res) => {
		try {
			const json = fs.readFileSync(filepath)
			const data = JSON.parse(json)
			res.status(200).send({ data })
		}
		catch (err) {
			API.Utils.errorHandler({ res, err })
		}
	})

	API.Checks.register = ({ resource, description, method, params, bearerToken, body, output, expectedStatusCode }) => {
		API.Checks.requests.push({
			resource,
			description,
			method,
			params,
			bearerToken,
			body,
			output,
			expectedStatusCode,
		})
	} 

	API.Checks.enable = () => {

		//ensure we have minapi.test.js in projectpath
		if (!fs.existsSync(filepath)) {
			let id = 1
			const contents = JSON.stringify({
				name: 'Auto-Generated MinAPI Checks',
				endpoint: 'http://localhost:4000',
				output: { firstName: '', lastName: '', email: '', password: '', newPassword: '' },
				coverage: 0,
				requests: API.Checks.requests.map(v => {
					v.id = id
					v.response = {}
					id++
					return v
				})
			})
			fs.writeFileSync(filepath, contents, "utf8")
		}
	}

	return API

}