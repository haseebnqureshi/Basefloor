
const path = require('path')
const express = require('express')
const fs = require('fs')
const _ = require('underscore')

module.exports = ({ projectPath, envPath }) => {

	require('dotenv').config({ path: envPath })

	const { 
		name, 
		auth,
		routes, 
		models, 
		notifications 
	} = require(path.resolve(projectPath, 'baseapi.config.js'))

	let API = express()
	API.Express = express
	API = require('./_utils')(API)
	API = require('./_middlewares')(API)	
	API = require('./_notifications')(API, { config: notifications })
	API = require('./_db')(API)
	API = require('./_models')(API, { models })
	API = require('./_auth')(API, { config: auth })
	API = require('./_routes')(API, { routes: routes() })

	API.get('/', (req, res) => {
		res.status(200).send({ message: 'healthy' })
	})

	API.Start = () => {
		const port = process.env.PORT || 4000
		API.listen(port, () => {
			API.Log(`${name} BaseAPI started HTTP:${port} in ${process.env.NODE_ENV || 'development'} node environment ...`)
		})
	}

	API.StartHTTPS = ({ key, crt }) => {
		if (process.env.NODE_ENV !== 'production') {
			return API.Log(`${name} BaseAPI attempted to start HTTPS in not-production node environment, quitting now ...`)
		}
		const httpServer = require('http').createServer(API)
		const httpsServer = require('https').createServer({
			key: fs.readFileSync(key, 'utf8'),
			cert: fs.readFileSync(crt, 'utf8'),
		}, API)
		httpServer.listen(80)
		httpsServer.listen(443)
		API.Log(`${name} BaseAPI started HTTPS in production node environment ...`)
	}

	return API

}
