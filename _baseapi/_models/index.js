
const _ = require('underscore')

module.exports = (API, { models }) => {

	for (let model of models) {
		
		const { _name, _label, _collection, _values } = model

		let collectionName, collectionFilter

		if (_.isObject(_collection)) {
			collectionName = _collection._name
			collectionFilter = _collection._filter
		} else if (_.isString(_collection)) {
			collectionName = _collection
			collectionFilter = false
		}

		API.DB[_name] = {}

		API.DB[_name].name = _name

		API.DB[_name].label = _label

		API.DB[_name].collection = _collection

		API.DB[_name].sanitize = (values, dbAction /* c, rA, r, u, d */ ) => {
			let sanitized = {}
			for (let key in values) {
				if (key in _values) {
					const valueType = _values[key][0]
					const dbActions = _values[key][1].split(',')
					if (dbActions.indexOf(dbAction) > -1) {
						sanitized[key] = API.Utils.valueType(values[key], valueType)
					}
				}
			}
			return sanitized
		}

		API.DB[_name].dummy = (dbAction /* c, rA, r, u, d */) => {
			let dummy = {}
			for (let key in _values) {
				const valueType = _values[key][0]
				const dbActions = _values[key][1].split(',')
				const defaultValue = _values[key][2] || null;
				console.log({ dbActions, dbAction }, dbActions.indexOf(dbAction))
				if (dbActions.indexOf(dbAction) > -1) {
					console.log(dbAction)
					dummy[key] = API.Utils.dummyValue(valueType, defaultValue)
				}
			}
			return dummy
		}

		API.DB[_name].create = async ({ values }) => {
			values = API.DB[_name].sanitize(values, 'c')
			values = { ...values, created_at: new Date() }
			if (collectionFilter) { 
				values = { ...values, ...collectionFilter } 
			}
			return await API.Utils.tryCatch(`try:${collectionName}:create`,
				API.DB.client.db(process.env.MONGODB_DATABASE).collection(collectionName).insertOne(values)
			)
		}

		API.DB[_name].readAll = async () => {
			let where = {}
			if (collectionFilter) { where = collectionFilter }
			return await API.Utils.tryCatch(`try:${collectionName}:readAll(where:${JSON.stringify(where)})`,
				API.DB.client.db(process.env.MONGODB_DATABASE).collection(collectionName).find(where).toArray()
			)
		}

		API.DB[_name].read = async ({ where }) => {
			where = API.DB[_name].sanitize(where, 'r')
			if (collectionFilter) { 
				where = { ...where, ...collectionFilter } 
			}
			return await API.Utils.tryCatch(`try:${collectionName}:read(where:${JSON.stringify(where)})`,
				API.DB.client.db(process.env.MONGODB_DATABASE).collection(collectionName).findOne(where)
			)
		}

		API.DB[_name].update = async ({ where, values }) => {
			where = API.DB[_name].sanitize(where, 'r')
			values = API.DB[_name].sanitize(values, 'u')
			values = { ...values, updated_at: new Date() }
			if (collectionFilter) { 
				where = { ...where, ...collectionFilter } 
			}	
			return await API.Utils.tryCatch(`try:${collectionName}:update(where:${JSON.stringify(where)})`,
				API.DB.client.db(process.env.MONGODB_DATABASE).collection(collectionName).updateOne(where, { $set: values })
			)
		}

		API.DB[_name].delete = async ({ where }) => {
			where = API.DB[_name].sanitize(where, 'd')
			if (collectionFilter) { 
				where = { ...where, ...collectionFilter } 
			}
			return await API.Utils.tryCatch(`try:${collectionName}:delete(where:${JSON.stringify(where)})`,
				API.DB.client.db(process.env.MONGODB_DATABASE).collection(collectionName).deleteOne(where)
			)
		}

	}

	return API

}