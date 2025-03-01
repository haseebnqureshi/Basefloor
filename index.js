
const path = require('path')
const express = require('express')
const fs = require('fs')
const _ = require('underscore')

module.exports = ({ projectPath, envPath }) => {

	if (envPath) { //may want to delegate to project or runtime var setting
		require('dotenv').config({ path: envPath })
	}

	const paths = {
		app: projectPath,
		env: envPath,
		minapi: __dirname,
	}

	let API = express()
	
	API.express = express
	API.Utils = {}
	API.Checks = {}
	API.DB = {}
	API.Auth = {}
	API.Files = {}
	API.Emails = {}
	API.AI = {}

	const {
		project,
		middlewares,
		db,
		providers,
		models,
		routes,
		auth,
		files,
		emails,
		ai,
	} = require(path.resolve(projectPath, 'minapi.config.js'))(API)

	API.Init = () => {
		
		//low level helpers first
		API = require('./utils')(API, { paths, providers, project })
		API = require('./checks')(API, { paths, providers, project }) //before, so other features can load checks into the checker
		
		//then database handling and models
		API = require('./db')(API, { db, paths, providers, project })
		API = require('./models')(API, { models, paths, providers, project })

		//middlewares, since these may be required by internal components -- but need DB access
		API = require('./middlewares')(API, { middlewares, paths, providers, project }) //loads json middleware

		//our critical services that may be required by middlewares/routes
		if (auth && auth.enabled == true) {
			API = require('./auth')(API, { auth, paths, providers, project })
		}

		if (files && files?.enabled == true) {
			API = require('./files')(API, { files, paths, providers, project })
		}

		if (emails && emails?.enabled == true) {
			API = require('./emails')(API, { emails, paths, providers, project })
		}

		if (ai && ai?.enabled == true) {
			API = require('./ai')(API, { ai, paths, providers, project })
		}

		//and routes
		API = require('./routes')(API, { routes: routes(), paths, providers, project })

		if (project.checks) {
			API.Checks.enable()
		}	
	}

	API.Start = () => {
		API.listen(project.port, () => {
			API.Log(`${project.name} running MinAPI/Express started HTTP:${project.port} in ${project.env} node environment ...`)
		})
	}

	API.StartHTTPS = ({ key, crt }) => {
		if (project.env !== 'production') {
			return API.Log(`${project.name} running MinAPI/Express attempted to start HTTPS in not-production node environment, quitting now ...`)
		}
		const httpServer = require('http').createServer(API)
		const httpsServer = require('https').createServer({
			key: fs.readFileSync(key, 'utf8'),
			cert: fs.readFileSync(crt, 'utf8'),
		}, API)
		httpServer.listen(80)
		httpsServer.listen(443)
		API.Log(`${project.name} running MinAPI/Express started HTTPS in production node environment ...`)
	}

	return API

}
