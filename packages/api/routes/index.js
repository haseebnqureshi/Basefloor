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

	// Process route configurations from basefloor.config.js
	let routers = routes.map(r => {
		// Parse route pattern like '/parent/path(model)'
		const pattern = RegExp(/\/?([^\/]*)\/([^\(]+)\(([^\(]+)\)/)
		const [id, parentPath, path, model] = r.url.match(pattern)
		const collection = API.DB[model].collection

		// For each CRUD method defined in the route
		for (let m in methods) {
			if (r[m]) {

				//it's a collection endpoint or collection
				r[m].params = {}
				r[m].url = `/${path}`

				//has a 'where' clause
				if (r[m].where) {
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

				// Extract models referenced in permission rules and filter rules
				const allowJSON = JSON.stringify(r.allow || '')
				const filterJSON = JSON.stringify(r.filter || '')
				const pattern = RegExp(/\@([a-z0-9\_]+)\./gi)
				const allowMatches = allowJSON.match(pattern) || []
				const filterMatches = filterJSON.match(pattern) || []
				const modelsInAllow = _.unique(allowMatches).map(v => v.substr(1, v.length-2))
				const modelsInFilter = _.unique(filterMatches).map(v => v.substr(1, v.length-2))
				const allReferencedModels = _.unique([...modelsInAllow, ...modelsInFilter])
				// API.Log('- allowJSON', allowJSON)
				// API.Log('- modelsInAllow', modelsInAllow)
				// API.Log('- filterJSON', filterJSON)
				// API.Log('- modelsInFilter', modelsInFilter)
				// API.Log('- allReferencedModels', allReferencedModels)

				// Collect all parameters from current and parent routes
				let allParams = {
					...router.parentsParams || {},
					...r.params || {},                        
				}

				// API.Log('- allParams', allParams)
				let keys = {}
				let modelData = {}

				/**
				 * Process permission rules in the format:
				 * - Simple: '@user.url=123'
				 * - Array membership: 'admin=in=@user.roles'
				 * - Model-to-user comparison: '@course.professor=@req_user._id'
				 * Returns: boolean indicating if permission is granted
				 */
				const processAllowString = async str => {
					API.Log(`Processing permission rule: "${str}"`)
					let values = []

					// Parse operator (=, =in=, etc.)
					let operatorPattern = RegExp(/[^\=]+(\=[in]*\=?)/)
					let operator = str.match(operatorPattern)[1]

					// Only 2 parts given the matching constructs above
					let parts = str.split(operator)
					API.Log(`Permission parts: [${parts.join(', ')}], operator: "${operator}"`)

					parts = parts.map(part => {
						let partPattern = RegExp(/\@([a-z0-9\_]+)\.([a-z0-9\_]+)$/i)
						let partMatches = part.match(partPattern)
						return {
							str: !partMatches ? part : null,
							model: partMatches? partMatches[1] : null,
							field: partMatches? partMatches[2] : null,
						}
					})
					API.Log(`Permission parts (deconstructed):`, parts)

					const postValue = (value, i) => {

						// Handle ObjectId comparisons
						if (API.DB.mongodb.ObjectId.isValid(value)) {
							value = String(value)
							API.Log(`Converted ObjectId to string: ${value}`)
						}
						if (Array.isArray(value)) {
							API.Log(`Processing array value with ${value.length} items`)
							value = value.map(item => {
								if (API.DB.mongodb.ObjectId.isValid(item)) {
									API.Log(`Converting array item from ObjectId to string: ${item}`)
									return String(item)
								} else {
									return item
								}
							})
						}

						values[i] = value
						API.Log(`Final processed value:`, values[i])
						// if (value === null || value === undefined) {
						// 	API.Log(`-- @${model}.${field} didn't exist in db!`)
						// 	return null
						// }
					}

					// Collect value methods that can be invoked to obtain the value to test truthiness
					for (let i in parts) {
						const part = parts[i]
						const { model, field, str } = part

						if (str) {
							postValue(str, i)
						}

						// If the @model.field is already in our modelData, easily set the value 
						else if (modelData[model] && modelData[model][field] !== undefined) {
							API.Log(`Found value in modelData[${model}][${field}]`)
							postValue(modelData[model][field], i)
						} 

						// Next easiest thing, determining if we're accessing our authenticated user data
						else if (model === 'req_user' && req.user && req.user[field] !== undefined) {
							API.Log(`Found value in req.user[${field}]`)
							// Direct access to req.user for cases like @req_user._id
							postValue(req.user[field], i)
						} 

						// Lastly, showing we hadn't found anything
						else {
							API.Log(`-- @${model}.${field} didn't exist in modelData or req.user...`)
							postValue(null, i)
						}
					}

					for (let i in parts) {
						const part = parts[i]
						const { model, field, str } = part

						// Need to perform costly DB reads looking in modelsInAllow
						if (modelsInAllow.indexOf(model) > -1 && model !== 'req_user') {
							API.Log(`-- @${model} found in modelsInAllow (permissions)...`)
							let where = {}
							where[field] = values[1-i]
							API.Log(`-- Attempting to find @${model}.${field} = ${where[field]}`)
							const row = await API.DB[model].read({ where })
							const v = row ? row[field] : null
							API.Log(`-- Found value "${v}" for @${model}.${field} = ${where[field]}`)
							postValue(v, i)
						}

					}

					// Evaluate the comparison based on operator
					let result = false
					switch (operator) {
						case '=':
							result = values[0] == values[1]
							API.Log(`Equality check: ${values[0]} == ${values[1]} => ${result}`)
							break
						case '=in=':
							if (!Array.isArray(values[1])) { 
								API.Log(`Array membership check failed: second value is not an array`)
								result = false 
							} else {
								result = values[1].indexOf(values[0]) > -1
								API.Log(`Array membership check: ${values[0]} in [${values[1]}] => ${result}`)
							}
							break
					}

					API.Log(`Permission rule "${str}" evaluation result: ${result}`)
					return result
				}

				/**
				 * Recursively process permission rules
				 * Handles complex AND/OR logic in permission rules
				 */
				const traverseAllowCommands = async (allow, comparison) => {
					let result
					if (_.isString(allow)) {
						result = await processAllowString(allow)
					}
					else if (Array.isArray(allow)) {
						arrResult = allow.map(async item => await traverseAllowCommands(item))
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
							result = await traverseAllowCommands(allow.and, 'and')
						} 
						else if (allow.or) {
							result = await traverseAllowCommands(allow.or, 'or')
						}
					}
					return result
				}

				/**
				 * Process filter rules in the format:
				 * - Simple: '@Course.professor=@req_user._id'
				 * Returns: object with filter conditions
				 */
				const processFilterString = async (str, req) => {
					API.Log(`Processing filter rule: "${str}"`)
					
					// Parse operator (=, =in=, etc.)
					let operatorPattern = RegExp(/[^\=]+(\=[in]*\=?)/)
					let operator = str.match(operatorPattern)[1]

					// Only 2 parts given the matching constructs above
					let parts = str.split(operator)
					API.Log(`Filter parts: [${parts.join(', ')}], operator: "${operator}"`)

					parts = parts.map(part => {
						let partPattern = RegExp(/\@([a-z0-9\_]+)\.([a-z0-9\_]+)$/i)
						let partMatches = part.match(partPattern)
						return {
							str: !partMatches ? part : null,
							model: partMatches? partMatches[1] : null,
							field: partMatches? partMatches[2] : null,
						}
					})
					API.Log(`Filter parts (deconstructed):`, parts)

					// Extract the model field to filter on and the value to filter with
					const [filterField, filterValue] = parts;
					let fieldToFilter, valueToFilterWith;

					// Process the field part (left side of the filter expression)
					if (filterField.model && filterField.field) {
						if (filterField.model === router.model) {
							fieldToFilter = filterField.field;
						} else {
							API.Log(`Filter field model ${filterField.model} doesn't match route model ${router.model}`);
							return null;
						}
					}

					// Process the value part (right side of the filter expression)
					if (filterValue.str) {
						valueToFilterWith = filterValue.str;
					} else if (filterValue.model === 'req_user' && req.user && req.user[filterValue.field] !== undefined) {
						valueToFilterWith = req.user[filterValue.field];
					} else if (modelData[filterValue.model] && modelData[filterValue.model][filterValue.field] !== undefined) {
						valueToFilterWith = modelData[filterValue.model][filterValue.field];
					} else {
						API.Log(`Could not resolve filter value for @${filterValue.model}.${filterValue.field}`);
						return null;
					}

					// Handle ObjectId conversions if needed
					if (API.DB.mongodb.ObjectId.isValid(valueToFilterWith)) {
						valueToFilterWith = String(valueToFilterWith);
						API.Log(`Converted ObjectId to string for filter: ${valueToFilterWith}`);
					}

					// Return the filter condition
					let filterCondition = {};
					filterCondition[fieldToFilter] = valueToFilterWith;
					API.Log(`Generated filter condition:`, filterCondition);
					return filterCondition;
				}

				/**
				 * Process all filter rules and combine them
				 */
				const processFilterRules = async (filter, req) => {
					if (!filter) return {};
					
					let filterConditions = {};
					
					if (_.isString(filter)) {
						const condition = await processFilterString(filter, req);
						if (condition) {
							filterConditions = { ...filterConditions, ...condition };
						}
					} else if (Array.isArray(filter)) {
						for (const item of filter) {
							const condition = await processFilterString(item, req);
							if (condition) {
								filterConditions = { ...filterConditions, ...condition };
							}
						}
					}
					
					API.Log(`Final filter conditions:`, filterConditions);
					return filterConditions;
				}

				API.Log(`- registering endpoint ${http} ${r.url}`)

				// Add permission middleware
				API[http](r.url, [
					API.requireAuthentication,
					API.postAuthentication,
					async function(req, res, next) {
						try {
							if (!r.allow) { return next() }

							// Load data for all models referenced in permission rules and filter rules
							for (let routeParam in allParams) {
								//we're only loading models that are referenced in the url path (including the user object)
								let { model, key } = allParams[routeParam]

								//creating a where object to locate the correct data
								let where = {}
								where[key] = req.params[routeParam] || null

								//pulling data from each route w/ params
								modelData[model] = await API.DB[model].read({ where })

								API.Log({ modelData, model, where, 'modelData[model]':modelData[model] })
							}

							API.Log('allReferencedModels', allReferencedModels)

							if (req.user && (allReferencedModels.indexOf('req_user') > -1)) {
								modelData['req_user'] = req.user
								API.Log(`modelData['req_user']`, modelData['req_user'])
							}

							const isAuthorized = await traverseAllowCommands(r.allow)

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
							//that we would use the req.user object... requiring the string
							//to access via @req_user
							for (let key in obj) {
								const value = obj[key]
								if (value) {
									if (value.match) {
										const matches = value.match(/^\@req\_user\.([a-z0-9\_]+)$/i)
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

						// Process filter rules if they exist
						if (r.filter) {
							const filterConditions = await processFilterRules(r.filter, req);
							
							// Apply filter conditions to the where clause
							if (Object.keys(filterConditions).length > 0) {
								whereAndValues.where = {
									...whereAndValues.where || {},
									...filterConditions
								};
							}
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

