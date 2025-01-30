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
		const collection = API.DB[model].collection

		// For each CRUD method defined in the route
		for (let m in methods) {
			if (r[m]) {

				//it's a collection endpoint or create on collection
				if (m === '_readAll' || m === '_create') {
					r[m].params = {}
					r[m].url = `/${path}`
				}
				//assuming individual endpoint, must have a 'where' clause
				else if (r[m].where) {
					let routeParam //i.e., ":post_id" or `:${collection}${key}`
					let modelAndKey //i.e., { model: 'Post', key: '_id' }, following { model, key }
					r[m].params = {} //creating a map for our route keys with corresponding model names and where keys

					//only accepting simple where clauses referencing a string
					routeParam = `${collection}${r[m].where}`
					modelAndKey = { model, key: r[m].where }
					r[m].params[routeParam] = modelAndKey

					// Build URL with parameters (e.g., /users/:user_id)
					r[m].url = `/${path}/:${routeParam}`
				}

				else {
					r[m].params = {}
					r[m].url = `/${path}`
				}

			}
		}

		// console.dir({ id, parentPath, path, model, collection, r })

		return { 
			...r, 
			model, 
			path, 
			collection,
			parentPath, 
			parents: [] 
		}
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

				// Extract models referenced in permission rules
				const allowJSON = JSON.stringify(r.allow || '')
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
						let partPattern = RegExp(/\@(req)*[\.]*([a-z0-9\_]+)\.([a-z0-9\_]+)$/)
						let partMatches = part.match(partPattern)
						if (!partMatches) {
							values[i] = part
						} else {

							// Extract collection and field from @collection.field format
							// (or @req.user.role, for i.e. format)
							let field = partMatches[3] || partMatches[2]
							let collection = partMatches[3] ? `${partMatches[1]}.${partMatches[2]}` : partMatches[1]
							// let value = partMatches[3] ? `${collection}.${field}` : modelData[collection][field]
							let value = modelData[collection][field]
							API.Log({ value, collection, field })

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
								API.Log(`-- @${collection}.${field} didn't exist in db!`)
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
				API[http](r.url, [
					API.requireAuthentication,
					API.postAuthentication,
					async function(req, res, next) {
						try {
							if (!r.allow) { return next() }

							// Load data for all models referenced in permission rules
							for (let routeParam in allParams) {

								//we're only loading models that are referenced in the url path (including the user object)
								let { model, key } = allParams[routeParam]
								
								//creating a where object to locate the correct data
								let where = {}
								where[key] = req.params[routeParam] || null

								//pulling data from each route w/ params
								modelData[model] = await API.DB[model].read({ where })

								// API.Log({ modelData, model, where, 'modelData[model]':modelData[model] })
							}

							// API.Log({ allParams, 'r.url':r.url })
							// API.Log({ modelData, allowJSON, modelsInAllow, modelDataJSON: JSON.stringify(modelData) })
							
							// Load authenticated user data if needed
							// if (modelsInAllow.indexOf('req.user') > -1) {
								// API.Log('req.user found in modelsInAllow', modelsInAllow)
							modelData['req.user'] = req.user
							API.Log(`modelData['req.user']`, modelData['req.user'])
							// }

							const isAuthorized = traverseAllowCommands(r.allow)
							API.Log({ isAuthorized })

							if (!isAuthorized) { 
								throw { code: 403, err: `user not authorized! permissions invalid.` }
							}
							next() 
						}
						catch (err) {
							API.Utils.errorHandler({ res, err })
						}
					}
				], async (req, res) => {
					try {

						const values = req.body
						API.Log('values (req.body)', values)

						const injectReqUser = (obj, reqUser) => {
							//Then iterate through and see if there are any auth'd user strings
							//that we would use the req.user object...
							for (let key in obj) {
								const value = obj[key]
								if (value) {
									if (value.match) {
										const matches = value.match(/^req\.user\.([a-z0-9\_]+)$/i)
										if (matches) {
											if (matches[1]) {
												const userKey = matches[1]
												obj[key] = reqUser[userKey]
											}
										}
									}
								}
							}
							return obj
						}

						//Collect all of our route params with models and keys
						let allParams = { ...r.params || {} } //Start with the current route's params

						API.Log('router.parentsParams', router.parentsParams)
						
						//Next, iterate through parent params
						for (let param in router.parentsParams) {

							//Transform into model and key relative to existing path and model!
							//For example, { model: 'Users', key: '_id' } for Posts would become
							//{ model: 'Posts', key: 'user_id' }, for now we can search all posts
							//by the appropriate user_id. That creation of the mapped key comes 
							//from the collection of a route. The collection name is also the key
							//that is used to construct a foreign key. 
							//
							//Good thing is that the route param itself is that mapped foreign key!

							allParams[param] = { model: router.model, key: param }
						}


						//Then iterate through and see if there are any auth'd user strings
						//that we would use the req.user object...
						if (req.user) {
							allParams = injectReqUser(allParams, req.user)
						}

						API.Log('allParams', allParams)

						//Only allow whitelisted route parameters from our request
						const whitelist = Object.keys(allParams)
						const allParamsAllowed = _.pick(req.params, whitelist)

						API.Log('whitelist', whitelist)
						API.Log('allParamsAllowed', allParamsAllowed)

						//Loading up our model where values to retrieve values
						let modelsAndParams = {}
						for (let param in allParamsAllowed) {
							let value = allParamsAllowed[param]
							let { model, key } = allParams[param]

							//There should only be one model... Keeping this flexibility for
							//future development.
							if (!modelsAndParams[model]) { 
								modelsAndParams[model] = { where: {} } 
							}
							modelsAndParams[model].where[key] = value		
						}

						API.Log('modelsAndParams', modelsAndParams)

						//Ensuring the correct database query selections
						let whereAndValues = {}
						for (let model in modelsAndParams) {
							if (model === router.model) {
								whereAndValues = modelsAndParams[model]
							}
						}

						if (values && req.user) {
							whereAndValues.values = injectReqUser(values, req.user)
						} 

						//No matter what, ensuring values are provided since 
						//collection endpoints (for readAll and create) do not have params,
						//ensuring values are provided.
						else if (values) {
							whereAndValues.values = values 
						}

						API.Log('router.model', router.model)
						API.Log('values', values)
						API.Log('whereAndValues', whereAndValues)
						API.Log('db', db)

						// Execute database operation
						await API.DB.connect()
						const data = await API.DB[router.model][db](whereAndValues)
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

