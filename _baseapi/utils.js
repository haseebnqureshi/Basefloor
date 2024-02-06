
const util = require('util')
const _ = require('underscore')

const log = module.exports.Log = (...args) => {
	// if (process.env.NODE_ENV !== 'production') {
		console.log(...args)
	// }    
}

module.exports.errorHandler = ({ res, err }) => {
	log(err)
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

module.exports.bodyHas = (body, arrValues) => {
	//FYI, even if body value is empty string, that will pass this test
	let missing = false
	for (let value of arrValues) {
		if (!(value in body)) { missing = true }
	}
	return missing ? false : _.pick(body, arrValues)
}

module.exports.missing = (value) => {
	if (value === null || value === '') { return true }
	return false
}

module.exports.missingAny = (arrValue) => {
	for (const value of arrValue) {
		if (value === null || value === '') { return true }
	}
	return false
}

module.exports.nullcheck = (value) => {
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

module.exports.logobj = (obj) => {
	log(util.inspect(obj, {
		showHidden: false,
		depth: null,
		colors: true,
	}))
}

module.exports.tryCatch = async (name, fn) => {
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






