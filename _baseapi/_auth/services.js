
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

	let services = {}

	services.removeFile = async (filepath) => {
		return await unlinkAsync(filepath)
	}

	services.md5 = (data) => {
		return crypto.createHash('md5').update(data).digest('hex')
	}

	services.sha1 = (data) => {
		return crypto.createHash('sha1').update(data).digest('hex')
	}

	services.hashPassword = async (password) => {
		return await bcrypt.hash(password, 10)
	}

	services.comparePasswordWithHashed = async (password, hashed) => {
		return await bcrypt.compare(password, hashed)
	}

	services.normalizePhone = (value, countryAbbr) => {
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

	services.emailParts = (value) => {
		const parts = value.split('@')
		return {
			username: parts[0],
			domain: parts[1],
		}
	}

	services.createToken = async (sub, _id, payload) => {
		const expiry = services.expirations(sub)
		if (!expiry) { return undefined }
		return await jwt.sign({ sub, _id, payload }, secret, {
			algorithm: 'HS256',
			expiresIn: expiry.value,
		})
	}

	services.validateToken = async (token) => {
		try {
			return await jwt.verify(token, secret)
		}
		catch(err) {
			return false
		}
	}

	services.expirations = (type) => {
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

	// services.isUserVerified = (user) => {
	// 	const { email_verified, sms_verified } = user
	// 	return email_verified === true ? true : false
	// }

	return services

}