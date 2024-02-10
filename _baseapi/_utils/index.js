
const util = require('util')
const _ = require('underscore')
const mongodb = require('mongodb')

module.exports = (API) => {

	API.Utils = {}

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

	API.Utils.tryCatch = async (name, fn) => {
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

		switch (valueType) {
			case 'String':
				return String(value)
				break
			case 'Boolean':
				if (value.toLowerCase() === 'false') {
					return false
				}
				return Boolean(!!value)
				break
			case 'Number':
				return Number(value)
				break
			case 'Date':
				return Date(value)
				break
			case 'ObjectId':
				return mongodb.ObjectId(value)
				break
			case 'Array':
				return Array(...value)
				break
			case 'Array(ObjectId)':
				return Array(...value).map(v => mongodb.ObjectId(v))
				break
		}
	}

	return API

}






