
module.exports = (API) => {

	const _name = 'file'
	const _collection = 'file'
	const _values = {
		_id: 							['ObjectId', 'r,u,d'],
		user_id: 					['ObjectId', 'c,r'],
		name: 						['String', 'c,r,u'],
		description:  		['String', 'c,r,u'],
		hash: 						['String', 'c,r'],
		size: 						['Number', 'c,r'],
		type: 						['String', 'c,r'],
		extension:  			['String', 'r'],
		filename: 				['String', 'r'],
		url: 							['String', 'r,u'],
		uploaded_at: 			['Date', 'c,r,u'],
		file_modified_at: ['Date', 'c,r,u'],
		flattened_at: 		['Date', 'c,r,u'],
		flattened_url: 		['String', 'r,u'],
		flattened_filename: ['String', 'r,u'],
		flattened_extension: ['String', 'r,u'],
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

			const hash = API.Utils.hashObject({
				user_id: values.user_id.toString(),
				size: values.size,
				type: values.type,
				name: values.name, //@todo: still not ideal, as same files may have different names, and so we're still storing duplicates. may need client to send hash of file contents, because it's the client's duty to pipeline the body of the file to end cdn.
			}, {
				algorithm: 'md5'
			})

			// console.log({
			// 	hash,
			// 	user_id: values.user_id.toString(),
			// 	size: values.size,
			// 	type: values.type,
			// 	name: values.name, 
			// })

			const { user_id } = values
			// console.log({ values, hash, user_id })
			const existingFile = await API.DB.file.read({ where: { hash, user_id } })
			// console.log({ existingFile })
			if (existingFile) { 
				return { insertedId: existingFile._id }
				// throw { code: 303, err: `File already exists for user!` }
			}

			// console.log({ values })
			const matches = values.name.match(/(\.[a-z0-9]+)$/)
			if (!matches) { throw `file extension not propertly extracted` }
			const extension = matches[1]
			const filename = `${hash}${extension}`
			const url = `${endpoint}/${filename}`
			const uploaded_at = null
			const created_at = new Date().toISOString()
			values = { ...values, hash, extension, filename, url, uploaded_at, created_at }
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
		values = { ...values, updated_at: new Date().toISOString() }
		return await API.Utils.try(`try:${_collection}:update(where:${JSON.stringify(where)})`,
			API.DB.client.db(process.env.MONGODB_DATABASE).collection(_collection).updateOne(where, { $set: values })
		)
	}

	API.DB[_name].updateAll = async ({ where, values }) => {
		where = where || {}
		where = API.DB[_name].sanitize(where, 'r')
		values = API.DB[_name].sanitize(values, 'u')
		values = { ...values, updated_at: new Date().toISOString() }
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