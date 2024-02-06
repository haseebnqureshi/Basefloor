
const _ = require('underscore')

module.exports = (API, { auth }) => {

	const { collection } = auth

	API.DB.auth = {}

	API.DB.auth.createUser = async (values) => {

		if (!values.email) { return undefined }
		if (!values.password_hash) { return undefined }

		const result = await API.Utils.tryCatch(`try:${collection.name}:createUser`,
			API.DB.client.db(process.env.MONGODB_DATABASE)
				.collection(collection.name)
				.insertOne({
					created_at: new Date(),
					..._.pick(values, [...collection.whitelist, 'email', 'sms', 'password_hash']),
				}))

		return result
	}

	API.DB.auth.readUser = async (where) => {

		if (where._id) { 
			where._id = new API.DB.mongodb.ObjectId(where._id) 
		}

		const result = await API.Utils.tryCatch(`try:${collection.name}:readUser`,
			API.DB.client.db(process.env.MONGODB_DATABASE)
				.collection(collection.name)
				.findOne(_.pick(where, ['_id', 'email', 'sms', 'email_verified', 'sms_verified'])))

		return result

	}

	API.DB.auth.verifyUser = async (method, { _id }) => {

		let $set = {}
		$set[`${method}_verified`] = true
		$set[`${method}_verified_at`] = new Date()

		_id = new API.DB.mongodb.ObjectId(_id) 

		const result = await API.Utils.tryCatch(`try:${collection.name}:verifyUser`,
			API.DB.client.db(process.env.MONGODB_DATABASE)
				.collection(collection.name)
				.updateOne({ _id }, { $set }))

		return result

	}

	API.DB.auth.updateUserPasswordHash = async ({ _id, password_hash }) => {

		_id = new API.DB.mongodb.ObjectId(_id) 

		const result = await API.Utils.tryCatch(`try:${collection.name}:updateUserPasswordHash`,
			API.DB.client.db(process.env.MONGODB_DATABASE)
				.collection(collection.name)
				.updateOne({ _id }, { $set: { 
					password_hash,
					updated_at: new Date(), 
				} }))

		return result

	}

	return API

}