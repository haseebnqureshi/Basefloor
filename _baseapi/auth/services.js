
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const { promisify } = require('util')
const fs = require('fs')
const { phone } = require('phone')
const writeFileAsync = promisify(fs.writeFile)
const unlinkAsync = promisify(fs.unlink)

module.exports = (API, { auth }) => {

	const { collection } = auth

	API.Services.auth = {}

	API.Services.auth.removeFile = async (filepath) => {
		return await unlinkAsync(filepath)
	}

	API.Services.auth.md5 = (data) => {
		return crypto.createHash('md5').update(data).digest('hex')
	}

	API.Services.auth.sha1 = (data) => {
		return crypto.createHash('sha1').update(data).digest('hex')
	}

	API.Services.auth.hashPassword = async (password) => {
		return await bcrypt.hash(password, 10)
	}

	API.Services.auth.comparePasswordWithHashed = async (password, hashed) => {
		return await bcrypt.compare(password, hashed)
	}

	API.Services.auth.normalizePhone = (value, countryAbbr) => {
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

	API.Services.auth.emailParts = (value) => {
		const parts = value.split('@')
		return {
			username: parts[0],
			domain: parts[1],
		}
	}

	API.Services.auth.createToken = async (sub, user_id, payload) => {
		const expiry = API.Services.auth.expirations(sub)
		if (!expiry) { return undefined }
		return await jwt.sign({
			_id: user_id,
			sub,
			payload,
		}, process.env.AUTH_SECRET, {
			algorithm: 'HS256',
			expiresIn: expiry.value,
		})
	}

	API.Services.auth.validateToken = async (token) => {
		try {
			return await jwt.verify(token, process.env.AUTH_SECRET)
		}
		catch(err) {
			return false
		}
	}

	API.Services.auth.expirations = (type) => {
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

	API.Services.auth.isUserVerified = (user) => {

		const { email_verified, sms_verified } = user

		return email_verified === true ? true : false

	}

	return API

}


