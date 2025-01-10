
const path = require('path')
const express = require('express')
const fs = require('fs')
const _ = require('underscore')

module.exports = ({ projectPath, envPath }) => {

	require('dotenv').config({ path: envPath })

	const paths = {
		app: projectPath,
		env: envPath,
		minapi: __dirname,
	}

	const {
		ai,
		name,
		providers,
		db,
		middlewares,
		checks,
		files,
		emails,
		models,
		routes,
	} = require(path.resolve(projectPath, 'minapi.config.js'))

	let API = express()
	API.Express = express
	API.Utils = {}
	API.Checks = {}
	API.DB = {}
	API.Auth = {}
	API.Files = {}
	API.Emails = {}
	API.AI = {}

	API.Init = () => {
		API = require('./utils')(API, { paths, providers, checks })
		API = require('./checks')(API, { checks, paths, providers }) //before, so other features can load checks into the checker
		API = require('./middlewares')(API, { middlewares, paths, providers, checks }) //must be the first thing, loads json middleware
		
		API = require('./db')(API, { db, paths, providers, checks })
		API = require('./auth')(API, { paths, providers, checks })
		API = require('./models')(API, { models, paths, providers, checks })
		API = require('./files')(API, { files, paths, providers, checks })

		API = require('./routes')(API, { routes: routes(), paths, providers, checks })
		API = require('./emails')(API, { emails, paths, providers, checks })
		API = require('./ai')(API, { ai, paths, providers, checks })

		if (checks.enabled) {
			API.Checks.enable()
		}		
	}

	API.Start = () => {
		const port = process.env.PORT || 4000
		API.listen(port, () => {
			API.Log(`${name} running MinAPI/Express started HTTP:${port} in ${process.env.NODE_ENV || 'development'} node environment ...`)
		})
	}

	API.StartHTTPS = ({ key, crt }) => {
		if (process.env.NODE_ENV !== 'production') {
			return API.Log(`${name} running MinAPI/Express attempted to start HTTPS in not-production node environment, quitting now ...`)
		}
		const httpServer = require('http').createServer(API)
		const httpsServer = require('https').createServer({
			key: fs.readFileSync(key, 'utf8'),
			cert: fs.readFileSync(crt, 'utf8'),
		}, API)
		httpServer.listen(80)
		httpsServer.listen(443)
		API.Log(`${name} running MinAPI/Express started HTTPS in production node environment ...`)
	}

	return API

}
