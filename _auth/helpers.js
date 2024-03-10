
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const { promisify } = require('util')
const fs = require('fs')
const { phone } = require('phone')
const writeFileAsync = promisify(fs.writeFile)
const unlinkAsync = promisify(fs.unlink)

module.exports = ({ config }) => {

	const { _env } = config

	const secret = _env.getSecret()

	let helpers = {}

	helpers.removeFile = async (filepath) => {
		return await unlinkAsync(filepath)
	}

	helpers.md5 = (data) => {
		return crypto.createHash('md5').update(data).digest('hex')
	}

	helpers.sha1 = (data) => {
		return crypto.createHash('sha1').update(data).digest('hex')
	}

	helpers.hashPassword = async (password) => {
		return await bcrypt.hash(password, 10)
	}

	helpers.comparePasswordWithHashed = async (password, hashed) => {
		return await bcrypt.compare(password, hashed)
	}

	helpers.normalizePhone = (value, countryAbbr) => {
		switch (countryAbbr) {
			default:
				countryAbbr = 'USA'
		}
		const n = phone(value, { country: countryAbbr })
		if (!n.isValid) { return false }
		return {
			normalized: n.phoneNumber,
			countryCode: n.countryCode,
			number: n.phoneNumber.replace(n.countryCode, '')
		}
	}

	helpers.emailParts = (value) => {
		const parts = value.split('@')
		return {
			username: parts[0],
			domain: parts[1],
		}
	}

	helpers.createToken = async (sub, _id, payload) => {
		const expiry = helpers.expirations(sub)
		if (!expiry) { return undefined }
		return await jwt.sign({ sub, _id, ...payload }, secret, {
			algorithm: 'HS256',
			expiresIn: expiry.value,
		})
	}

	helpers.validateToken = async (token) => {
		try {
			return await jwt.verify(token, secret)
		}
		catch(err) {
			return false
		}
	}

	helpers.expirations = (type) => {
		switch (type) {
			case 'auth':
				return { text: '7 days', value: '7d' }
				break
			case 'reset':
				return { text: '5 minutes', value: '5m' }
				break
			case 'verify':
				return { text: '10 minutes', value: '10m' }
				break
		}
	}

	return helpers

}