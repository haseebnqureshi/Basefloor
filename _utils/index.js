
const util = require('util')
const _ = require('underscore')
const mongodb = require('mongodb')
const hashObject = require('object-hash')
const chance = new require('chance')()

module.exports = (API) => {

	API.Utils = { ...API.Utils }

	API.Log = API.Utils.log = (...args) => {
		// if (process.env.NODE_ENV !== 'production') {
			console.log(...args)
		// }    
	}

	API.LogObj = API.Utils.logObj = (obj) => {
		API.Log(util.inspect(obj, {
			showHidden: false,
			depth: null,
			colors: true,
		}))
	}

	API.ParseProviderString = (str) => {
		/*
		Expecting '@{providerName}/{service}'
		So for instance, @digitalocean/files means that for our files service,
		a provider available is digitalocean. The providerVars are loaded
		from the minapi.config.js and the provider methods are then loaded
		from the "_providers" directory.
		*/
		const [provider, service] = str.split('/')
		return { provider, service }
	}

	API.Utils.hashObject = (obj, options) => hashObject(obj, options || null)

	API.Utils.errorHandler = ({ res, err }) => {
		API.Log(err)
		if (_.isString(err)) {
			res.status(500).send({ status: 500, message: err })
		}
		else if (_.isNumber(err)) {
			res.status(err).send({ status: err, message: null })
		}
		else if (_.isObject(err) && _.isNumber(err.code) && _.isString(err.err)) {
			res.status(err.code).send({ status: err.code, message: err.err })
		}
		else {
			res.status(500).send({ status: 500, message: err })
		}
	}

	API.Utils.bodyHas = (body, arrValues) => {
		//FYI, even if body value is empty string, that will pass this test
		let missing = false
		for (let value of arrValues) {
			if (!(value in body)) { missing = true }
		}
		return missing ? false : _.pick(body, arrValues)
	}

	API.Utils.missing = (value) => {
		if (value === null || value === '') { return true }
		return false
	}

	API.Utils.missingAny = (arrValue) => {
		for (const value of arrValue) {
			if (value === null || value === '') { return true }
		}
		return false
	}

	API.Utils.nullcheck = (value) => {
		if (_.isBoolean(value)) {
			return value
		}
		if (value) {
			if (_.isString(value)) {
				if (value.match(/^\s+$/mi)) { return null }
				if (value === '') { return null }
			}
		}
		if (!value) { return null }
		return value
	}

	API.Utils.try = async (name, fn) => {
		//there's 2 levels of trycatch -- this level, which catches any database errors
		//then there's the second layer, which is in our routes and manages the request
		let result, err
		try {
			result = await fn
		}
		catch (e) {
			err = { name, e }
		}
		if (err) { throw err }
		return result
	}

	API.Utils.valueType = (value, valueType) => {
		// console.log({ value, valueType })
		let obj
		switch (valueType) {
			case 'String':
				return String(value)
				break
			case 'Boolean':
				if (_.isString(value)) {
					if (value.toLowerCase() === 'false') {
						return false
					}
				}
				return Boolean(!!value)
				break
			case 'Number':
				return Number(value)
				break
			case 'Date':
				return new Date(value).toISOString()
				break
			case 'ObjectId':
				return new mongodb.ObjectId(value)
				break
			case 'Array':
				return Array(...value)
				break
			case 'Array(ObjectId)':
				return Array(...value).map(v => new mongodb.ObjectId(v))
				break
			case 'Object':
				obj = Object(value)
				Object.keys(obj).forEach(key => {
					let v = obj[key]
					obj[key] = v
				})
				return obj
				break
			case 'Object(ObjectId)':
				obj = Object(value)
				Object.keys(obj).forEach(key => {
					let v = obj[key]
					obj[key] = new mongodb.ObjectId(v)
				})
				return obj
				break
		}
	}

	API.Utils.dummyValue = (valueType, defaultValue) => {

		let value
		if (defaultValue) {
			const key = defaultValue[0]
			if (key === '_default') {
				return defaultValue[1]
			} else {
				const args = defaultValue[1]
				return chance[key](args)
			}
		}

		let total

		switch (valueType) {
			case 'String':
				return chance.string()
				break
			case 'Boolean':
				return chance.bool()
				break
			case 'Number':
				return chance.natural()
				break
			case 'Date':
				return chance.date()
				break
			case 'Object': 
				value = {}
				total = chance.natural({ min: 1, max: 12 })
				for (let i = 0; i < total; i++) {
					const key = chance.word()
					value[key] = chance.sentence()
				}
				return value
				break
			case 'ObjectId':
				return new mongodb.ObjectId()
				break
			case 'Array(String)':
				value = []
				total = chance.natural({ min: 1, max: 12 })
				for (let i = 0; i < total; i++) {
					value.push(chance.string())
				}
				return value
				break
			case 'Array(ObjectId)':
				value = []
				total = chance.natural({ min: 1, max: 12 })
				for (let i = 0; i < total; i++) {
					value.push(new mongodb.ObjectId())
				}
				return value
				break
		}
	}

	return API

}






