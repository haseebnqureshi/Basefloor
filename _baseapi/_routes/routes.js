
const _ = require('underscore')

const newCreate = function(API, collectionName, whitelist) {
	return async (req, res) => {
		const values = _.pick(req.body, whitelist)
		try {
			await API.DB.open()
			const data = await API.DB[collectionName].create(values)
			await API.DB.close()
			res.status(200).send({ data })
		}
		catch (err) {
			API.Utils.errorHandler({ res, err })
		}
	}
}

const newReadAll = function(API, collectionName) {
	return async (req, res) => {
		try {
			await API.DB.open()
			const data = await API.DB[collectionName].readAll()
			await API.DB.close()
			res.status(200).send({ data })
		}
		catch (err) {
			API.Utils.errorHandler({ res, err })
		}
	}
}

const newRead = function(API, collectionName, key) {
	return async (req, res) => {
		let where = {}
		where[key] = req.params[key]
		try {
			if (key === '_id') { 
				where._id = new API.DB.mongodb.ObjectId(req.params[key]) 
			}
			console.log(where)
			await API.DB.open()
			const data = await API.DB[collectionName].read(where)
			await API.DB.close()
			res.status(200).send({ data })
		}
		catch (err) {
			API.Utils.errorHandler({ res, err })
		}
	}
}

const newUpdate = function(API, collectionName, key, whitelist) {
	return async (req, res) => {
		let where = {}
		where[key] = req.params[key]
		try {
			if (key === '_id') { 
				where._id = new API.DB.mongodb.ObjectId(req.params[key]) 
			}
			let values = _.pick(req.body, whitelist)
			await API.DB.open()
			const data = await API.DB[collectionName].update(where, values)
			await API.DB.close()
			res.status(200).send({ data })
		}
		catch (err) {
			API.Utils.errorHandler({ res, err })
		}
	}
}

const newDelete = function(API, collectionName, key) {
	return async (req, res) => {
		let where = {}
		where[key] = req.params[key]
		try {
			if (key === '_id') { 
				where._id = new API.DB.mongodb.ObjectId(req.params[key]) 
			}
			await API.DB.open()
			const data = await API.DB[collectionName].delete(where)
			await API.DB.close()
			res.status(200).send({ data })
		}
		catch (err) {
			API.Utils.errorHandler({ res, err })
		}
	}
}

module.exports = (API, { collections }) => {

	for (let name in collections) {

		API.Routes[name] = []
		const routes = collections[name]
		for (let route in routes) {

			let args = routes[route]
			const active = args[0]
			let key

			if (active) {
				switch (route) {

					case 'create':
						API.Routes[name].push({ 
							method: 'post', 
							path: `/${name}`,
							name: route, 
							fn: newCreate(API, name, args[1]) 
						})
						break

					case 'readAll':
						API.Routes[name].push({ 
							method: 'get', 
							path: `/${name}`,
							name: route, 
							fn: newReadAll(API, name) 
						})
						break

					case 'read':
						key = args[1] || '_id'
						API.Routes[name].push({ 
							method: 'get', 
							path: `/${name}/:${key}`,
							name: route, 
							fn: newRead(API, name, key) 
						})
						break

					case 'update':
						key = args[1] || '_id'
						API.Routes[name].push({ 
							method: 'put', 
							path: `/${name}/:${key}`,
							name: route, 
							fn: newUpdate(API, name, key, args[2]) 
						})
						break

					case 'delete':
						key = args[1] || '_id'
						API.Routes[name].push({ 
							method: 'delete', 
							path: `/${name}/:${key}`,
							name: route, 
							fn: newDelete(API, name, key) 
						})
						break

					default:

				}
			}
		}
	}

	return API

}