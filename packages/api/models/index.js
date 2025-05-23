module.exports = (API, { models, paths, providers, project }) => {

	if (!models.Files) {
		models.Files = {
			collection: 'file',
			labels: ['File', 'Files'],
			values: {
				_id: 							['ObjectId', 'rud'],
				user_id: 					['ObjectId', 'cru'],
				name: 						['String', 'cru'],
				description:  		['String', 'cru'],
				filename: 				['String', 'cr'],
				provider: 				['String', 'cru'],
				bucket: 					['String', 'cru'],
				key: 							['String', 'cru'],
				url: 							['String', 'cru'],
				uploaded_at: 			['Date', 'cru'],
				file_modified_at: ['Date', 'cru'],
				hash: 						['String', 'cru'],
				size: 						['Number', 'cru'],
				content_type: 		['String', 'cru'],
				extension:  			['String', 'cru'],
				parent_file: 			['ObjectId', 'cru'],

				//legacy fields needed for migrating from previous releases, for whitelisting 
				//and retrieving existing data
				type: 						['String', 'ru'],
				flattened_at: 		['Date', 'cru'],
				flattened_pages: 	['Object(ObjectId)', 'cru'], //'static CDN url':'ObjectID to file object'
			},
			// filters: {
			// 	"read": {
			// 		where: (w, values) => {
			// 			const { user_id, size, type, name } = values
			// 			const hash = API.Utils.hashObject({
			// 				user_id: user_id.toString(),
			// 				size,
			// 				type,
			// 				name, //@todo: still not ideal, as same files may have different names, and so we're still storing duplicates. may need client to send hash of file contents, because it's the client's duty to pipeline the body of the file to end cdn.
			// 			}, {
			// 				algorithm: 'md5'
			// 			})
			// 			w = { hash, user_id }
			// 			return w
			// 		},
			// 	},
			// 	"create": {
			// 		values: values => {
			// 			const { user_id, endpoint, size, type, name } = values
			// 			const hash = API.Utils.hashObject({
			// 				user_id: user_id.toString(),
			// 				size,
			// 				type,
			// 				name, //@todo: still not ideal, as same files may have different names, and so we're still storing duplicates. may need client to send hash of file contents, because it's the client's duty to pipeline the body of the file to end cdn.
			// 			}, {
			// 				algorithm: 'md5'
			// 			})

			// 			const matches = name.match(/(\.[a-z0-9]+)$/)
			// 			if (!matches) { throw `file extension not propertly extracted` }
			// 			const extension = matches[1]
			// 			const filename = `${hash}${extension}`
			// 			const url = `${endpoint}/${filename}`
						
			// 			const uploaded_at = null
			// 			const created_at = new Date().toISOString()

			// 			return { ...values, hash, extension, filename, url, uploaded_at, created_at }
			// 		},
			// 	},
			// },

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

			run: async (method) => {
				return await API.DB.run().collection(collection)[method]
			},

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

			// Helper function to safely apply filters
			applyFilter: (filterFn, data) => {
				if (!filterFn) return data
				try {
					return filterFn(data)
				} 
				catch (error) {
					API.Log(`- model filter error: ${error.message}`, { error })
					return data // Return original data if filter fails
				}
			},

			create: async ({ values }) => {
				if (!values) { return undefined }
				values = API.DB[name].sanitize(values, 'c')
				if (filters.values) {
					values = API.DB[name].applyFilter(filters.values, values);
					values = API.DB[name].sanitize(values, 'c')
				}
				if (filters.create?.values) {
					values = API.DB[name].applyFilter(filters.create.values, values);
					values = API.DB[name].sanitize(values, 'c')
				}
				values = { ...values, created_at: new Date().toISOString() }
				const output = await API.Utils.try(`try:${collection}:create`,
					API.DB.run().collection(collection).insertOne(values)
				)
				return filters.output ? API.DB[name].applyFilter(filters.output, output) : output
			},

			createMany: async ({ values }) => {
				if (!values) { return undefined }
				values = values.map(row => {
					let v = API.DB[name].sanitize(row, 'c')
					if (filters.values) {
						v = API.DB[name].applyFilter(filters.values, v);
						v = API.DB[name].sanitize(v, 'c')
					}
					if (filters.createMany?.values) {
						v = API.DB[name].applyFilter(filters.createMany.values, v);
						v = API.DB[name].sanitize(v, 'c')
					}
					v = { ...v, created_at: new Date().toISOString() }
					return v
				})
				const output = await API.Utils.try(`try:${collection}:createMany`,
					API.DB.run().collection(collection).insertMany(values)
				)
				return filters.output ? API.DB[name].applyFilter(filters.output, output) : output
			},

			read: async ({ where }) => {
				if (!where) { return undefined }
				where = API.DB[name].sanitize(where, 'r', name)
				if (filters.where) { 
					where = API.DB[name].applyFilter(filters.where, where);
					where = API.DB[name].sanitize(where, 'r', name)
				}
				if (filters.read?.where) {
					where = API.DB[name].applyFilter(filters.read.where, where);
					where = API.DB[name].sanitize(where, 'r', name)
				}
				if (Object.values(where).length === 0) { return undefined }
				const output = await API.Utils.try(`try:${collection}:read(where:${JSON.stringify(where)})`,
					API.DB.run().collection(collection).findOne(where)
				)
				return filters.output ? API.DB[name].applyFilter(filters.output, output) : output
			},

			readOrCreate: async ({ where, values }) => {
				if (!where) { return undefined }
				if (!values) { return undefined }

				// Apply filters to where clause for reading
				if (filters.where) { 
					where = API.DB[name].applyFilter(filters.where, where);
					where = API.DB[name].sanitize(where, 'r', name)
				}
				if (filters.readOrCreate?.where) {
					where = API.DB[name].applyFilter(filters.readOrCreate.where, where);
					where = API.DB[name].sanitize(where, 'r', name)
				}

				let output
				const existing = await API.DB[name].read({ where })
				if (existing) {
					output = { insertedId: existing._id }
				}
				else {
					// Apply readOrCreate values filter if it exists
					if (filters.readOrCreate?.values) {
						values = API.DB[name].applyFilter(filters.readOrCreate.values, values);
						values = API.DB[name].sanitize(values, 'c')
					}
					// If not found, create with potentially different filters
					output = await API.DB[name].create({ values })
				}

				// Apply output filter 
				return filters.output ? API.DB[name].applyFilter(filters.output, output) : output
			},

			readAll: async ({ where }) => {
				where = where || {}
				where = API.DB[name].sanitize(where, 'r', name)
				if (filters.where) { 
					where = API.DB[name].applyFilter(filters.where, where);
					where = API.DB[name].sanitize(where, 'r', name)
				}
				if (filters.readAll?.where) {
					where = API.DB[name].applyFilter(filters.readAll.where, where);
					where = API.DB[name].sanitize(where, 'r', name)
				}
				const output = await API.Utils.try(`try:${collection}:readAll(where:${JSON.stringify(where)})`,
					API.DB.run().collection(collection).find(where).toArray()
				)
				return filters.output ? API.DB[name].applyFilter(filters.output, output) : output
			},

			update: async ({ where, values, options }, one=true) => {
				if (!where) { return undefined }
				if (!values) { return undefined }
				where = API.DB[name].sanitize(where, 'r', name)
				values = API.DB[name].sanitize(values, 'u', name)
				
				if (filters.where) { 
					where = API.DB[name].applyFilter(filters.where, where);
					where = API.DB[name].sanitize(where, 'r', name)
				}
				if (filters.update?.where) {
					where = API.DB[name].applyFilter(filters.update.where, where);
					where = API.DB[name].sanitize(where, 'r', name)
				}
				
				if (filters.values) { 
					values = API.DB[name].applyFilter(filters.values, values);
					values = API.DB[name].sanitize(values, 'u', name)
				}
				if (filters.update?.values) {
					values = API.DB[name].applyFilter(filters.update.values, values);
					values = API.DB[name].sanitize(values, 'u', name)
				}
				
				values = { ...values, updated_at: new Date().toISOString() }
				const output = await API.Utils.try(`try:${collection}:update(where:${JSON.stringify(where)})`,
					API.DB.run().collection(collection)[one ? 'updateOne' : 'update'](where, { $set: values }, options || {})
				)
				return filters.output ? API.DB[name].applyFilter(filters.output, output) : output
			},

			updateAll: async ({ where, values, options }) => {
				if (!where) { return undefined }
				if (!values) { return undefined }
				where = API.DB[name].sanitize(where, 'r', name)
				values = API.DB[name].sanitize(values, 'u', name)
				
				if (filters.where) { 
					where = API.DB[name].applyFilter(filters.where, where);
					where = API.DB[name].sanitize(where, 'r', name)
				}
				if (filters.updateAll?.where) {
					where = API.DB[name].applyFilter(filters.updateAll.where, where);
					where = API.DB[name].sanitize(where, 'r', name)
				}
				
				if (filters.values) { 
					values = API.DB[name].applyFilter(filters.values, values);
					values = API.DB[name].sanitize(values, 'u', name)
				}
				if (filters.updateAll?.values) {
					values = API.DB[name].applyFilter(filters.updateAll.values, values);
					values = API.DB[name].sanitize(values, 'u', name)
				}
				
				values = { ...values, updated_at: new Date().toISOString() }
				const output = await API.Utils.try(`try:${collection}:updateAll(where:${JSON.stringify(where)})`,
					API.DB.run().collection(collection).updateMany(where, { $set: values }, options || {})
				)
				return filters.output ? API.DB[name].applyFilter(filters.output, output) : output
			},

			delete: async ({ where }, one=true) => {
				if (!where) { return undefined }
				where = API.DB[name].sanitize(where, 'd', name)
				if (filters.where) { 
					where = API.DB[name].applyFilter(filters.where, where);
					where = API.DB[name].sanitize(where, 'd', name)
				}
				if (filters.delete?.where) {
					where = API.DB[name].applyFilter(filters.delete.where, where);
					where = API.DB[name].sanitize(where, 'd', name)
				}
				const output = await API.Utils.try(`try:${collection}:delete(where:${JSON.stringify(where)})`,
					API.DB.run().collection(collection)[one ? 'deleteOne' : 'delete'](where)
				)
				return filters.output ? API.DB[name].applyFilter(filters.output, output) : output
			},

			deleteAll: async ({ where }) => {
				if (!where) { return undefined }
				where = API.DB[name].sanitize(where, 'd', name)
				if (filters.where) { 
					where = API.DB[name].applyFilter(filters.where, where);
					where = API.DB[name].sanitize(where, 'd', name)
				}
				if (filters.deleteAll?.where) {
					where = API.DB[name].applyFilter(filters.deleteAll.where, where);
					where = API.DB[name].sanitize(where, 'd', name)
				}
				const output = await API.Utils.try(`try:${collection}:deleteAll(where:${JSON.stringify(where)})`,
					API.DB.run().collection(collection).deleteMany(where)
				)
				return filters.output ? API.DB[name].applyFilter(filters.output, output) : output
			},

		}

	}

	return API

}