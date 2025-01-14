/**
 * Routes Module
 * This module handles the creation and configuration of API routes, including:
 * - CRUD operations mapping
 * - Permission handling
 * - Hierarchical routing
 * - Database operations
 */

const _ = require('underscore')

module.exports = (API, { routes, paths, providers, project }) => {

	//convert new syntax to older (avoids whole code refactor at the moment)
	// API.Log('routes from config', routes)
	routes = Object.keys(routes).map(url => {
		let route = { url }
		if (routes[url].c) { route._create = routes[url].c }
		if (routes[url].rA) { route._readAll = routes[url].rA }
		if (routes[url].r) { route._read = routes[url].r }
		if (routes[url].u) { route._update = routes[url].u }
		if (routes[url].d) { route._delete = routes[url].d }
		return route
	})
	// API.Log('routes converted to handlers', routes)

	// Map internal CRUD operations to HTTP methods and database actions
	const methods = {
		_create: { http: 'post', db: 'create' },     // Create -> POST
		_readAll: { http: 'get', db: 'readAll' },    // List -> GET
		_read: { http: 'get', db: 'read' },          // Read -> GET
		_update: { http: 'put', db: 'update' },      // Update -> PUT
		_delete: { http: 'delete', db: 'delete' },   // Delete -> DELETE
	}

	// Process route configurations from minapi.config.js
	let routers = routes.map(r => {
		// Parse route pattern like '/parent/path(model)'
		const pattern = RegExp(/\/?([^\/]*)\/([^\(]+)\(([^\(]+)\)/)
		const [id, parentPath, path, model] = r.url.match(pattern)

		// For each CRUD method defined in the route
		for (let m in methods) {
			if (r[m]) {
				// If no 'where' clause, it's a collection endpoint
				if (!r[m].where) {
					r[m].url = `/${path}`
				} else {
					// If 'where' exists, it's a single resource endpoint
					r[m].params = {}
					let paramKey
					let dbKey
					
					// Handle string and object where clauses
					if (_.isString(r[m].where)) {
						// Simple where clause like '_id'
						paramKey = `${model}${r[m].where}`
						dbKey = `${model}.${r[m].where}`
					} 
					else if (_.isObject(r[m].where)) {
						// Complex where clause with multiple fields
						const key = Object.keys(r[m].where)[0]
						paramKey = `${model}${key}`
						dbKey = r[m].where[key].map(v => `${model}.${v}`)
					}
					// Build URL with parameters (e.g., /users/:userId)
					r[m].url = `/${path}/:${paramKey}`
					r[m].params[paramKey] = dbKey
				}
			}
		}
		return { ...r, model, path, parentPath, parents: [] }
	})

	// Build hierarchical routing structure
	let processed = 0
	while (processed < routers.length) {
		for (const r of routers) {
			let cursor = r.parentPath
			let depth = 0
			// Walk up the parent chain
			while (cursor !== '') {
				const found = routers.find(router => cursor === router.path)
				// Add parent route information
				r.parents.unshift({
					path: found.path,
					parentPath: found.parentPath,
					model: found.model,
					depth,
					_create: _.omit(found._create, 'allow'),
					_readAll: _.omit(found._readAll, 'allow'),
					_read: _.omit(found._read, 'allow'),
					_update: _.omit(found._update, 'allow'),
					_delete: _.omit(found._delete, 'allow'),
				})
				cursor = found.parentPath
				depth--
			}
			processed++
		}
	}

	// Build complete URLs including parent paths
	for (let r of routers) {
		for (let m in methods) {
			if (r[m]) {
				let url = ''
				// Add parent URLs to create full path
				for (let parent of r.parents) {
					const p = parent._read
					url += p.url
				}
				url += r[m].url
				r[m].url = url
			}
		}
	}

	// Collect parameters from parent routes
	for (let r of routers) {
		if (r.parents.length > 0) {
			r.parentsParams = {}
			for (let p of r.parents) {
				r.parentsParams = { ...r.parentsParams, ...p._read.params || {} }
			}
		}
	}

	// Create actual Express routes
	for (const router of routers) {
		for (const m in methods) {
			if (router[m]) {
				const { http, db } = methods[m]
				const r = router[m]

				// Default middleware stack
				let middlewares = [
					API.Auth.requireToken,
					API.Auth.requireUser,
					API.Auth.getAfterRequireUserMiddleware()
				]

				// Extract models referenced in permission rules
				const allowJSON = JSON.stringify(r.allow)
				const pattern = RegExp(/\@([a-z0-9\_]+)\./g)
				const matches = allowJSON.match(pattern) || []
				const modelsInAllow = _.unique(matches).map(v => v.substr(1, v.length-2))

				// Collect all parameters from current and parent routes
				let allParams = {
					...router.parentsParams || {},
					...r.params || {},                        
				}
				let keys = {}
				let modelData = {}

				/**
				 * Process permission rules in the format:
				 * - Simple: '@user.url=123'
				 * - Array membership: 'admin=in=@user.roles'
				 * Returns: boolean indicating if permission is granted
				 */
				const processAllowString = str => {
					let values = []

					// Parse operator (=, =in=, etc.)
					let operatorPattern = RegExp(/[^\=]+(\=[in]*\=?)/)
					let operator = str.match(operatorPattern)[1]
					let parts = str.split(operator)
					
					// Process each part of the comparison
					for (let i in parts) {
						let part = parts[i]
						let partPattern = RegExp(/^\@([^\.]+)\.(.*)$/)
						let partMatches = part.match(partPattern)
						if (!partMatches) {
							values[i] = part
						} else {
							// Extract collection and field from @collection.field format
							let collection = partMatches[1]
							let field = partMatches[2]
							let value = modelData[collection][field]

							// Handle ObjectId comparisons
							if (API.DB.mongodb.ObjectId.isValid(value)) {
								value = String(value)
							}
							if (Array.isArray(value)) {
								value = value.map(item => {
									if (API.DB.mongodb.ObjectId.isValid(item)) {
										return String(item)
									} else {
										return item
									}
								})
							}

							values[i] = value
							if (value === null || value === undefined) {
								console.log(`-- @${collection}.${field} didn't exist in db!`)
								return null
							}
						}
					}

					// Evaluate the comparison based on operator
					switch (operator) {
						case '=':
							return values[0] == values[1]
						case '=in=':
							if (!Array.isArray(values[1])) { return false }
							return values[1].indexOf(values[0]) > -1
					}

					return false
				}

				/**
				 * Recursively process permission rules
				 * Handles complex AND/OR logic in permission rules
				 */
				const traverseAllowCommands = (allow, comparison) => {
					let result
					if (_.isString(allow)) {
						result = processAllowString(allow)
					}
					else if (Array.isArray(allow)) {
						arrResult = allow.map(item => traverseAllowCommands(item))
						switch (comparison) {
							case 'and':
								result = true
								for (let value of arrResult) {
									if (value === null) { result = false }
									else if (value === false) { result = false }
								}
								break
							case 'or':
								result = false
								for (let value of arrResult) {
									if (value === true) { result = true }
								}
								break
						}
					}
					else if (_.isObject(allow)) {
						if (allow.and) {
							result = traverseAllowCommands(allow.and, 'and')
						} 
						else if (allow.or) {
							result = traverseAllowCommands(allow.or, 'or')
						}
					}
					return result
				}

				// Add permission middleware
				API[http](r.url, [...middlewares, async function(req, res, next) {
					try {
						if (r.allow) {
							// Load authenticated user data if needed
							if (modelsInAllow.indexOf('_user') > -1) {
								modelData['_user'] = req.user
							}

							// Load data for all models referenced in permission rules
							for (let routeParam in allParams) {

								//we're only loading models that are referenced in the url path (including the user object)
								let [model, key] = allParams[routeParam].split('.')
								
								//creating a where object to locate the correct data
								let where = {}
								where[key] = req.params[routeParam] || null

								//pulling data from each route w/ params
								modelData[model] = await API.DB[model].read({ where })

								// console.log({ modelData, model, where, 'modelData[model]':modelData[model] })
							}

							// console.log({ allParams, 'r.url':r.url })
							// console.log({ modelData, allowJSON, modelsInAllow, modelDataJSON: JSON.stringify(modelData) })

							const isAuthorized = traverseAllowCommands(r.allow)
							// console.log({ isAuthorized })

							if (!isAuthorized) { 
								throw { code: 422, err: `user not authorized! permissions invalid.` }
							}
							next() 
						}
					}
					catch (err) {
						API.Utils.errorHandler({ res, err })
					}
				}], async (req, res) => {
					try {
						// Extract parameters for database query
						const paramsAllowed = [
							...Object.keys(router.parentsParams || {}),
							...Object.keys(r.params || {})
						]
						const where = _.pick(req.params, paramsAllowed)
						const values = { ...req.body, ...where }

						// Execute database operation
						await API.DB.open()
						const data = await API.DB[router.model][db]({ where, values })
						await API.DB.close()
						let statusCode = 200
						
						// Handle different response scenarios
						if (data === undefined) { statusCode = 500 }
						else if (data === null) { statusCode = 404 }
						else if (Array.isArray(data) && data.length === 0) { statusCode = 200 }
						
						res.status(statusCode).send({ data })
					}
					catch (err) {
						API.Utils.errorHandler({ res, err })
					}
				})

				if (project.checks) {
					// Register route for API testing/documentation
					let newCheck = {
						resource: r.url,
						description: `${m} for accessing ${router.model} items at ${r.url}`,
						
						method: http.toUpperCase(),
						params: ``,
						bearerToken: ``,
						body: ``,
						output: ``,
						expectedStatusCode: 200,
					}

					if (m === '_create') {
						newCheck.body = API.DB[router.model].dummy('c')
						newCheck.body = `(${JSON.stringify(newCheck.body)})`
					}
					API.Checks.register(newCheck)
				}
	
			}
		}
	}

	// Add health check endpoint
	API.get('/', (req, res) => {
		res.status(200).send({ message: 'healthy' })
	})

	if (project.checks) {
		API.Checks.register({ 
			resource: '/',
			description: 'health checks for api',
			method: 'GET',
			params: ``,
			bearerToken: ``,
			body: ``,
			output: ``,
			expectedStatusCode: 200,
		})
	}

	return API
}

