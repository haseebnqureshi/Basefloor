module.exports = (API, { models, paths, providers, project }) => {

	if (!models.Files) {
		models.Files = {
			collection: 'file',
			labels: ['File', 'Files'],
			values: {
				_id: 							['ObjectId', 'rud'],
				user_id: 					['ObjectId', 'cr'],
				name: 						['String', 'cru'],
				description:  		['String', 'cru'],
				endpoint: 				['String', 'cru'],
				url: 							['String', 'cru'],
				uploaded_at: 			['Date', 'cru'],
				file_modified_at: ['Date', 'cru'],
				parent_file: 			['ObjectId', 'cru'],
				flattened_at: 		['Date', 'cru'],
				flattened_pages: 	['Object(ObjectId)', 'cru'], //'static CDN url':'ObjectID to file object'
				hash: 						['String', 'cr'],
				size: 						['Number', 'cr'],
				type: 						['String', 'cr'],
				extension:  			['String', 'r'],
				filename: 				['String', 'r'],
			},
			filters: {
				"read": {
					where: (w, values) => {
						const { user_id, size, type, name } = values
						const hash = API.Utils.hashObject({
							user_id: user_id.toString(),
							size,
							type,
							name, //@todo: still not ideal, as same files may have different names, and so we're still storing duplicates. may need client to send hash of file contents, because it's the client's duty to pipeline the body of the file to end cdn.
						}, {
							algorithm: 'md5'
						})
						w = { hash, user_id }
						return w
					},
				},
				"create": {
					values: values => {
						const { user_id, endpoint, size, type, name } = values
						const hash = API.Utils.hashObject({
							user_id: user_id.toString(),
							size,
							type,
							name, //@todo: still not ideal, as same files may have different names, and so we're still storing duplicates. may need client to send hash of file contents, because it's the client's duty to pipeline the body of the file to end cdn.
						}, {
							algorithm: 'md5'
						})

						const matches = name.match(/(\.[a-z0-9]+)$/)
						if (!matches) { throw `file extension not propertly extracted` }
						const extension = matches[1]
						const filename = `${hash}${extension}`
						const url = `${endpoint}/${filename}`
						
						const uploaded_at = null
						const created_at = new Date().toISOString()

						return { ...values, hash, extension, filename, url, uploaded_at, created_at }
					},
				},
			},

			// filters: {
			// 	where: w => { ...w }, //for any where predicate
			// 	update: body => { ...body }, //for values to be updated, is applied onto any rows of data
			// 	values: row => { ...row }, //for returning any values, is applied onto any rows of data
			// },
		}
	}

	for (const name in models) {
		const { collection, labels, values } = models[name]
		let { filters } = models[name]
		filters = filters || {}

		API.DB[name] = {
			name,
			labels,
			collection,
			filters,
			values,

			sanitize: (v, dbAction /* c, rA, r, u, d */ , collection) => {
				// API.Log({ dbAction, values })
				let sanitized = {}

				//first, ensure no `${collection}_${key}` formats in keys
				for (let key in v) {
					const pattern = new RegExp('^' + collection)
					// API.Log(key, collection, key.match(pattern))
					if (key.match(pattern)) {
						const newKey = key.replace(collection, '')
						v[newKey] = v[key]
					}
				}

				for (let key in v) {
					if (key in values) {
						const valueType = values[key][0]
						const dbActions = values[key][1].split('')
						if (dbActions.indexOf(dbAction) > -1) {
							// API.Log({ key, valueType })
							sanitized[key] = API.Utils.valueType(v[key], valueType)
							// API.Log(API.Utils.valueType(v[key], valueType))
						}
					}
				}
				return sanitized
			},

			dummy: (dbAction /* c, rA, r, u, d */) => {
				let dummy = {}
				for (let key in values) {
					const valueType = values[key][0]
					const dbActions = values[key][1].split('')
					const defaultValue = values[key][2] || null;
					if (dbActions.indexOf(dbAction) > -1) {
						dummy[key] = API.Utils.dummyValue(valueType, defaultValue)
					}
				}
				return dummy
			},

			create: async ({ values }) => {
				if (!values) { return undefined }
				values = API.DB[name].sanitize(values, 'c')
				values = { ...values, created_at: new Date().toISOString() }
				if (filters.values) {
					values = filters.values(values)
					values = API.DB[name].sanitize(values, 'c')
				}
				if (filters.create?.values) {
					values = filters.create.values(values)
					values = API.DB[name].sanitize(values, 'c')
				}
				return await API.Utils.try(`try:${collection}:create`,
					API.DB.run().collection(collection).insertOne(values)
				)
			},

			createMany: async ({ values }) => {
				if (!values) { return undefined }
				values = values.map(row => {
					let v = API.DB[name].sanitize(row, 'c')
					v = { ...v, created_at: new Date().toISOString() }
					if (filters.values) {
						v = filters.values(v)
						v = API.DB[name].sanitize(v, 'c')
					}
					if (filters.createMany?.values) {
						v = filters.createMany.values(v)
						v = API.DB[name].sanitize(v, 'c')
					}
					return v
				})
				return await API.Utils.try(`try:${collection}:createMany`,
					API.DB.run().collection(collection).insertMany(values)
				)
			},

			readAll: async ({ where }) => {
				where = where || {}
				where = API.DB[name].sanitize(where, 'r', name)
				if (filters.where) { 
					where = filters.where(where)
					where = API.DB[name].sanitize(where, 'r', name)
				}
				if (filters.readAll?.where) {
					where = filters.readAll.where(where)
					where = API.DB[name].sanitize(where, 'r', name)
				}
				return await API.Utils.try(`try:${collection}:readAll(where:${JSON.stringify(where)})`,
					API.DB.run().collection(collection).find(where).toArray()
				)
			},

			read: async ({ where }) => {
				if (!where) { return undefined }
				where = API.DB[name].sanitize(where, 'r', name)
				if (filters.where) { 
					where = filters.where(where)
					where = API.DB[name].sanitize(where, 'r', name)
				}
				if (filters.read?.where) {
					where = filters.read.where(where)
					where = API.DB[name].sanitize(where, 'r', name)
				}
				if (Object.values(where).length === 0) { return undefined }
				return await API.Utils.try(`try:${collection}:read(where:${JSON.stringify(where)})`,
					API.DB.run().collection(collection).findOne(where)
				)
			},

			readOrCreate: async ({ where, values }) => {
				if (!where) { return undefined }
				if (!values) { return undefined }

				// Apply filters to where clause for reading
				if (filters.where) { 
					where = filters.where(where)
					where = API.DB[name].sanitize(where, 'r', name)
				}
				if (filters.readOrCreate?.where) {
					where = filters.readOrCreate.where(where)
					where = API.DB[name].sanitize(where, 'r', name)
				}

				const existing = await API.DB[name].read({ where })
				if (existing) {
					return { insertedId: existing._id }
				}

				// If not found, create with potentially different filters
				return await API.DB[name].create({ values })
			},

			update: async ({ where, values }, one=true) => {
				if (!where) { return undefined }
				if (!values) { return undefined }
				where = API.DB[name].sanitize(where, 'r', name)
				values = API.DB[name].sanitize(values, 'u', name)
				values = { ...values, updated_at: new Date().toISOString() }
				
				if (filters.where) { 
					where = filters.where(where)
					where = API.DB[name].sanitize(where, 'r', name)
				}
				if (filters.update?.where) {
					where = filters.update.where(where)
					where = API.DB[name].sanitize(where, 'r', name)
				}
				
				if (filters.values) { 
					values = filters.values(values)
					values = API.DB[name].sanitize(values, 'u', name)
				}
				if (filters.update?.values) {
					values = filters.update.values(values)
					values = API.DB[name].sanitize(values, 'u', name)
				}
				
				return await API.Utils.try(`try:${collection}:update(where:${JSON.stringify(where)})`,
					API.DB.run().collection(collection)[one ? 'updateOne' : 'update'](where, { $set: values })
				)
			},

			updateAll: async ({ where, values }) => {
				if (!where) { return undefined }
				if (!values) { return undefined }
				where = API.DB[name].sanitize(where, 'r', name)
				values = API.DB[name].sanitize(values, 'u', name)
				values = { ...values, updated_at: new Date().toISOString() }
				
				if (filters.where) { 
					where = filters.where(where)
					where = API.DB[name].sanitize(where, 'r', name)
				}
				if (filters.updateAll?.where) {
					where = filters.updateAll.where(where)
					where = API.DB[name].sanitize(where, 'r', name)
				}
				
				if (filters.values) { 
					values = filters.values(values)
					values = API.DB[name].sanitize(values, 'u', name)
				}
				if (filters.updateAll?.values) {
					values = filters.updateAll.values(values)
					values = API.DB[name].sanitize(values, 'u', name)
				}
				
				return await API.Utils.try(`try:${collection}:updateAll(where:${JSON.stringify(where)})`,
					API.DB.run().collection(collection).updateMany(where, { $set: values })
				)
			},

			delete: async ({ where }, one=true) => {
				if (!where) { return undefined }
				where = API.DB[name].sanitize(where, 'd', name)
				if (filters.where) { 
					where = filters.where(where)
					where = API.DB[name].sanitize(where, 'r', name)
				}
				if (filters.delete?.where) {
					where = filters.delete.where(where)
					where = API.DB[name].sanitize(where, 'r', name)
				}
				return await API.Utils.try(`try:${collection}:delete(where:${JSON.stringify(where)})`,
					API.DB.run().collection(collection)[one ? 'deleteOne' : 'delete'](where)
				)
			},

			deleteAll: async ({ where }) => {
				if (!where) { return undefined }
				where = API.DB[name].sanitize(where, 'd', name)
				if (filters.where) { 
					where = filters.where(where)
					where = API.DB[name].sanitize(where, 'r', name)
				}
				if (filters.deleteAll?.where) {
					where = filters.deleteAll.where(where)
					where = API.DB[name].sanitize(where, 'r', name)
				}
				return await API.Utils.try(`try:${collection}:deleteAll(where:${JSON.stringify(where)})`,
					API.DB.run().collection(collection).deleteMany(where)
				)
			},

		}

	}

	return API

}