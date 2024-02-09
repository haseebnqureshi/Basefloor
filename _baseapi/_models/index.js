
const _ = require('underscore')

module.exports = (API, { models }) => {

	API.Models = {}

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

		API.DB[_name].name = _name

		API.DB[_name].label = _label

		API.DB[_name].collection = _collection

		API.DB[_name].sanitize = (values, dbAction /* c, rA, r, u, d */ ) => {
			let sanitized = {}
			for (let key in values) {
				if (key in _values) {
					const valueType = _values[key][0]
					const dbActions = _values[key][1]
					if (dbActions.match(dbAction)) {
						sanitized[key] = API.Utils.valueType(values[key], valueType)
					}
				}
			}
			return sanitized
		}

		API.DB[_name].create = async (values) => {
			values = API.DB[_name].sanitize(values, 'c')
			if (collectionFilter) { 
				values = { ...values, ...collectionFilter } 
			}
			return await API.Utils.tryCatch(`try:${collectionName}:create`,
				API.DB.collection(collectionName).insertOne(values)
			)
		}

		API.DB[_name].readAll = async () => {
			let where = {}
			if (collectionFilter) { where = collectionFilter }
			return await API.Utils.tryCatch(`try:${collectionName}:readAll(where:${JSON.stringify(where)})`,
				API.DB.collection(collectionName).find(where).toArray()
			)
		}

		API.DB[_name].read = async (where) => {
			if (collectionFilter) { 
				where = { ...where, ...collectionFilter } 
			}
			return await API.Utils.tryCatch(`try:${collectionName}:read(where:${JSON.stringify(where)})`,
				API.DB.collection(collectionName).findOne(where)
			)
		}

		API.DB[_name].update = async (where, values) => {
			if (collectionFilter) { 
				where = { ...where, ...collectionFilter } 
			}	
			return await API.Utils.tryCatch(`try:${collectionName}:update(where:${JSON.stringify(where)})`,
				API.DB.collection(collectionName).updateOne(where, {
					$set: API.DB[_name].sanitize(values, 'u')
				})
			)
		}

		API.DB[_name].delete = async (where) => {
			if (collectionFilter) { 
				where = { ...where, ...collectionFilter } 
			}
			return await API.Utils.tryCatch(`try:${collectionName}:delete(where:${JSON.stringify(where)})`,
				API.DB.collection(collectionName).deleteOne(where)
			)
		}

	}

	return API

}