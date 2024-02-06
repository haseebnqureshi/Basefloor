
const _ = require('underscore')

//TODO: Support for nested data routes (for example, items/:id/subitems, subitems need where by :id)

const newCreate = function(API, collectionName, whitelist) {
	return async (values) => {

		const result = await API.Utils.tryCatch(`try:${collectionName}:create`,
			API.DB.client.db(process.env.MONGODB_DATABASE)
				.collection(collectionName)
				.insertOne(_.pick(values, whitelist)))

		return result
	}
}

const newReadAll = function(API, collectionName) {
	return async () => {

		const result = await API.Utils.tryCatch(`try:${collectionName}:readAll`,
			API.DB.client.db(process.env.MONGODB_DATABASE)
				.collection(collectionName)
				.find()
				.toArray())

		return result
	}
}

const newRead = function(API, collectionName, key) {
	return async (where) => {

		const result = await API.Utils.tryCatch(`try:${collectionName}:read`,
			API.DB.client.db(process.env.MONGODB_DATABASE)
				.collection(collectionName)
				.findOne(where))

		return result
	}
}

const newUpdate = function(API, collectionName, key, whitelist) {
	return async (where, values) => {

		const result = await API.Utils.tryCatch(`try:${collectionName}:update`,
			API.DB.client.db(process.env.MONGODB_DATABASE)
				.collection(collectionName)
				.updateOne(where, { $set: _.pick(values, whitelist) }))

		return result
	}
}

const newDelete = function(API, collectionName, key) {
	return async (where) => {

		const result = await API.Utils.tryCatch(`try:${collectionName}:delete`,
			API.DB.client.db(process.env.MONGODB_DATABASE)
				.collection(collectionName)
				.deleteOne(where))

		return result
	}
}


module.exports = (API, { collections }) => {

	for (let name in collections) {

		API.DB[name] = {}
		const methods = collections[name]
		for (let method in methods) {
			
			let args = methods[method]
			const active = args[0]
			
			if (active) {
				switch (method) {

					case 'create':
						API.DB[name][method] = newCreate(API, name, args[1])
						break

					case 'readAll':
						API.DB[name][method] = newReadAll(API, name)
						break

					case 'read':
						API.DB[name][method] = newRead(API, name, args[1])
						break

					case 'update':
						API.DB[name][method] = newUpdate(API, name, args[1], args[2])
						break

					case 'delete':
						API.DB[name][method] = newDelete(API, name, args[1])
						break

					default: 

				}
			}

		}
	}

	return API

}
