
module.exports = (API) => {

	const _name = 'file'
	const _collection = 'file'
	const _values = {
		_id: 							['ObjectId', 'r,u,d'],
		user_id: 					['ObjectId', 'c,r'],
		name: 						['String', 'c,r,u'],
		hash: 						['String', 'c,r'],
		size: 						['Number', 'c,r'],
		type: 						['String', 'c,r'],
		extension:  			['String', 'r'],
		filename: 				['String', 'r'],
		url: 							['String', 'r,u'],
		file_modified_at: ['Date', 'c,r,u'],
	}

	API.DB[_name] = {
		name: _name,
		label: ['File', 'Files'],
		collection: _collection,
	}

	//this is directly copied from models/index.js sanitize
	//need to generalize those model functions to use here, if needed (consolidated, DRY code)
	API.DB[_name].sanitize = (values, dbAction) => {
		// console.log({ dbAction, values })
		let sanitized = {}

		//first, ensure no `${_name}_${key}` formats in keys
		for (let key in values) {
			const pattern = new RegExp('^' + _name)
			// console.log(key, _name, key.match(pattern))
			if (key.match(pattern)) {
				const newKey = key.replace(_name, '')
				values[newKey] = values[key]
			}
		}

		for (let key in values) {
			if (key in _values) {
				const valueType = _values[key][0]
				const dbActions = _values[key][1].split(',')
				if (dbActions.indexOf(dbAction) > -1) {
					// console.log({ key, valueType })
					sanitized[key] = API.Utils.valueType(values[key], valueType)
					// console.log(API.Utils.valueType(values[key], valueType))
				}
			}
		}
		return sanitized

	}

	API.DB[_name].create = async ({ values, endpoint }) => {
		try {
			values = API.DB[_name].sanitize(values, 'c')
			const hash = API.Utils.hashObject(values)

			const { user_id } = values
			const existingFile = API.DB.file.read({ where: { hash, user_id } })
			if (existingFile) { throw `file hash already exsits for user!` }

			const extension = values.name.split('.')[1]
			const filename = `${hash}.${extension}`
			const url = `${endpoint}/${filename}`
			const created_at = new Date()
			values = { ...values, hash, extension, filename, url, created_at }
			return await API.Utils.try(`try:${_collection}:create`,
				API.DB.client.db(process.env.MONGODB_DATABASE).collection(_collection).insertOne(values)
			)
		}
		catch (err) {
			console.log(err)
			return undefined
		}
	}

	API.DB[_name].readAll = async ({ where }) => {
		where = where || {}
		where = API.DB[_name].sanitize(where, 'r')
		return await API.Utils.try(`try:${_collection}:readAll(where:${JSON.stringify(where)})`,
			API.DB.client.db(process.env.MONGODB_DATABASE).collection(_collection).find(where).toArray()
		)
	}

	API.DB[_name].read = async ({ where }) => {
		where = API.DB[_name].sanitize(where, 'r')
		return await API.Utils.try(`try:${_collection}:read(where:${JSON.stringify(where)})`,
			API.DB.client.db(process.env.MONGODB_DATABASE).collection(_collection).findOne(where)
		)
	}

	API.DB[_name].update = async ({ where, values }) => {
		where = API.DB[_name].sanitize(where, 'r')
		values = API.DB[_name].sanitize(values, 'u')
		values = { ...values, updated_at: new Date() }
		return await API.Utils.try(`try:${_collection}:update(where:${JSON.stringify(where)})`,
			API.DB.client.db(process.env.MONGODB_DATABASE).collection(_collection).updateOne(where, { $set: values })
		)
	}

	API.DB[_name].updateAll = async ({ where, values }) => {
		where = where || {}
		where = API.DB[_name].sanitize(where, 'r')
		values = API.DB[_name].sanitize(values, 'u')
		values = { ...values, updated_at: new Date() }
		//haven't tested mongodb.update function
		return await API.Utils.try(`try:${_collection}:updateAll(where:${JSON.stringify(where)})`,
			API.DB.client.db(process.env.MONGODB_DATABASE).collection(_collection).update(where, { $set: values })
		)
	}

	API.DB[_name].delete = async ({ where }) => {
		where = API.DB[_name].sanitize(where, 'd')
		return await API.Utils.try(`try:${_collection}:delete(where:${JSON.stringify(where)})`,
			API.DB.client.db(process.env.MONGODB_DATABASE).collection(_collection).deleteOne(where)
		)
	}

	API.DB[_name].deleteAll = async ({ where }) => {
		where = where || {}
		where = API.DB[_name].sanitize(where, 'd')
		return await API.Utils.try(`try:${_collection}:deleteAll(where:${JSON.stringify(where)})`,
			API.DB.client.db(process.env.MONGODB_DATABASE).collection(_collection).delete(where)
		)
	}

	return API

}