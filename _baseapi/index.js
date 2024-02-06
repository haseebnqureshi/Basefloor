
const path = require('path')
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const bodyParser = require('body-parser')

module.exports = ({ name, envPath, collections, auth, notifications }) => {

	require('dotenv').config({ 
		path: envPath || path.resolve(__dirname, '..', '.env') 
	})

	let API = express()
	API.express = express
	API.Utils = require('./utils')
	const Log = API.Log = API.Utils.Log
	API.DB = require('./db')
	API.Routes = {}
	API.Middlewares = {}
	API.Services = {}
	API.Notifications = {}

	const morganMode = process.env.NODE_ENV === 'production' ? 'tiny' : 'dev'
	API.use(morgan(morganMode))
	API.use(cors())
	API.use(bodyParser.urlencoded({ extended: false }))
	API.use(bodyParser.json())
	
	API = require('./collections/db')(API, { collections })
	API = require('./collections/routes')(API, { collections })
	API = require('./auth')(API, { auth })
	API = require('./notifications')(API, { notifications })

	// //register all the middlewares
	// for (let key in API.Middlewares) {
	// 	for (let middleware of API.Middlewares[key]) {
	// 		API[middleware.method](middleware.path, middleware.fn)
	// 	}
	// }

	//register all the routes
	//it's up to the routes to use any middlewares
	//if middlewares not used in routes, then must be bound at definition
	//so at auth, auth must API.use any and all middlewares
	
	for (let key in API.Routes) {
		for (let route of API.Routes[key]) {
			API[route.method](route.path, route.middlewares || [], route.fn)
		}
	}

	API.start = async ({ key, crt }) => {

		API.DB.close()
		API.DB.open()

		port = process.env.PORT || 4000
		if (process.env.NODE_ENV == 'production' && key && crt ) {
			const credentials = {
				key: fs.readFileSync(key, 'utf8'),
				cert: fs.readFileSync(crt, 'utf8'),
			}
			const httpServer = require('http').createServer(Api);
			const httpsServer = require('https').createServer(credentials, Api);
			httpServer.listen(80);
			httpsServer.listen(443);
		}
		else {
			const server = API.listen(port, () => {
				Log(`${name} BaseAPI started on Port ${port} (${process.env.NODE_ENV || 'development'} node environment) ...`)
			})
			const onShutDown = () => {
				console.log('received kill signal, shutting down gracefully')
				API.DB.close()
				server.close(() => {
					process.exit(0)
				})
				setTimeout(() => {
					process.exit(1)
				}, 10000)
			}
			process.on('SIGTERM', onShutDown)
			process.on('SIGINT', onShutDown)
		}	
	}

	//in 'development' node_env mode, take the wanted modules and
	//render example CRUD db operations and routes, all into a 
	//separate folder in the project directory. that way, boilerplate
	//is provided and easy reference to get going quick	

	return API

}
