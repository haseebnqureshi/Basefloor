
const _ = require('underscore')
const methods = ['_create', '_readAll', '_read', '_update', '_delete']

const organizeRoutes = (routesConfig, API) => {

	const totalRoutes = routesConfig.length

	//getting base information for each router's routes
	let routers = routesConfig.map(r => {
		const pattern = RegExp(/([^\/]*)\/([^\(]+)\(([^\(]+)\)/)
		const [id, parentPath, path, model] = r._id.match(pattern)
		for (let m of methods) {
			if (r[m]) {
				if (!r[m].where) {
					r[m].url = `/${path}`
				} else {
					if (_.isString(r[m].where)) {
						r[m].url = `/${path}/:${model}${r[m].where}`
					} else if (_.isObject(r[m].where)) {
						const key = Object.keys(r[m].where)[0]
						r[m].url = `/${path}/:${model}${key}`
					}
				}
			}
		}
		return { ...r, model, path, parentPath, parents: [] }
	})

	//chaining parent routers together
	let processed = 0
	while (processed < totalRoutes) {
		for (const r of routers) {
			let cursor = r.parentPath
			let depth = 0
			while (cursor !== '') {
				const found = routers.find(router => cursor === router.path)
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

	//determining full url for each router's routes
	for (let r of routers) {
		for (let m of methods) {
			if (r[m]) {
				let url = ''
				for (let parent of r.parents) {
					const p = parent._read
					url += p.url
				}
				url += r[m].url
				r[m].url = url
			}
		}
	}


	API.LogObj(routers)
	
	return routers
}



module.exports = (API, { routes }) => {

	routes = organizeRoutes(routes, API)

	for (const route of routes) {
		for (const method of methods) {
			const r = route[method]
			if (r) {
				switch (method) {
					case '_create':
						API.post(r.url, [], async (req, res) => {
							try {
								await API.DB.open()
								const data = await API.DB[route.model].create(req.body)
								await API.DB.close()
								res.status(200).send({ data })
							}
							catch (err) {
								API.Utils.errorHandler({ res, err })
							}
						})
						break
					case '_readAll':
						API.get(r.url, [], async (req, res) => {
							try {
								await API.DB.open()
								const data = await API.DB[route.model].readAll()
								await API.DB.close()
								res.status(200).send({ data })
							}
							catch (err) {
								API.Utils.errorHandler({ res, err })
							}
						})
						break
					case '_read':
						API.get(r.url, [], async (req, res) => {
							try {
								await API.DB.open()
								const data = await API.DB[route.model].read(req.params)
								await API.DB.close()
								res.status(200).send({ data })
							}
							catch (err) {
								API.Utils.errorHandler({ res, err })
							}
						})
						break
					case '_update':
						API.put(r.url, [], async (req, res) => {
							try {
								await API.DB.open()
								const data = await API.DB[route.model].update(req.params, req.body)
								await API.DB.close()
								res.status(200).send({ data })
							}
							catch (err) {
								API.Utils.errorHandler({ res, err })
							}
						})
						break
					case '_delete':
						API.delete(r.url, [], async (req, res) => {
							try {
								await API.DB.open()
								const data = await API.DB[route.model].delete(req.params)
								await API.DB.close()
								res.status(200).send({ data })
							}
							catch (err) {
								API.Utils.errorHandler({ res, err })
							}
						})
						break
				}


			}
		}
	}

	// console.log(API._router.stack)

	/* REGISTERING ROUTES ==========================
	it's up to the routes to use any middlewares
	if middlewares not used in routes, then must be bound at definition
	so at auth, auth must API.use any and all middlewares
	*/

	// for (let key in loadedRoutes) {
	// 	for (let route of routes[key]) {
	// 		API[route.method](route.path, route.middlewares || [], route.fn)
	// 	}
	// }

	return API

}

