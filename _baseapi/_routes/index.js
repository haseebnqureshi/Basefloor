
const _ = require('underscore')

module.exports = (API, { routes }) => {

	const methods = {
		_create: { http: 'post', db: 'create' },
		_readAll: { http: 'get', db: 'readAll' },
		_read: { http: 'get', db: 'read' },
		_update: { http: 'put', db: 'update' },
		_delete: { http: 'delete', db: 'delete' },
	}

	//getting base information for each router's routes
	let routers = routes.map(r => {
		const pattern = RegExp(/([^\/]*)\/([^\(]+)\(([^\(]+)\)/)
		const [id, parentPath, path, model] = r._id.match(pattern)
		for (let m in methods) {
			if (r[m]) {
				if (!r[m].where) {
					r[m].url = `/${path}`
				} else {
					r[m].params = {}
					let paramKey
					let dbKey
					if (_.isString(r[m].where)) {
						paramKey = `${model}${r[m].where}`
						dbKey = `${model}.${r[m].where}`
					} 
					else if (_.isObject(r[m].where)) {
						const key = Object.keys(r[m].where)[0]
						paramKey = `${model}${key}`
						dbKey = r[m].where[key].map(v => `${model}.${v}`)
					}
					r[m].url = `/${path}/:${paramKey}`
					r[m].params[paramKey] = dbKey
				}
			}
		}
		return { ...r, model, path, parentPath, parents: [] }
	})

	//chaining parent routers together
	let processed = 0
	while (processed < routers.length) {
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
		for (let m in methods) {
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

	//cataloging all parent req.params for each router's routes
	for (let r of routers) {
		if (r.parents.length > 0) {
			r.parentsParams = {}
			for (let p of r.parents) {
				r.parentsParams = { ...r.parentsParams, ...p._read.params || {} }
			}
		}
	}

	//figuring out permissions
	for (let r of routers) {
		for (let m in methods) {
			if (r[m]) {
				const { allow } = r[m]
				if (allow) {

					const json = JSON.stringify(allow)
					const pattern = RegExp(/\"([a-z0-9\_]+)\./g)
					const models = _.unique(json.match(pattern).map(v => v.substr(1, v.length-2)))

					//finding params to find required model rows
					let params = {}
					_.each(routers, router => {
						_.each(models, model => {
							if (router.model === model) {
								params[model] = router._read.params || {}
							}
						})
					})

					r[m].allowMiddleware = async (req, res, next) => {
						let data = {}
						if (models.indexOf('user') > -1) {
							data.user = req.user || {}
						}
						for (let model of models) {
							let where = {}
							let whereKey = Object.keys(params[model])
							let whereValue = req.params[whereKey]
							where[whereKey] = whereValue
							data[model] = await API.DB[model].read(where)
						}

						//this is where the route allow logic gets applied to the found data
						console.log(data)
						next()
					}

				}
			}
		}
	}


	for (const router of routers) {
		for (const m in methods) {
			if (router[m]) {
				const { http, db } = methods[m]
				const r = router[m]

				API[http](r.url, [], async (req, res) => {
					try {

						const paramsAllowed = [
							...Object.keys(router.parentsParams || {}),
							...Object.keys(r.params || {})
						]
						const where = _.pick(req.params, paramsAllowed)
						const values = { ...req.body, ...where }

						await API.DB.open()
						const data = await API.DB[router.model][db]({ where, values })
						await API.DB.close()
						let statusCode = 200
						if (data === undefined) { statusCode = 500 }
						else if (data === null) { statusCode = 404 }
						else if (_.isArray(data) && data.length === 0) { statusCode = 404 }
						res.status(statusCode).send({ data })
					}
					catch (err) {
						API.Utils.errorHandler({ res, err })
					}
				})

			}
		}
	}

	return API

}

