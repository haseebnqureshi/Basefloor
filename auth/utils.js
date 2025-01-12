
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const speakeasy = require('speakeasy')
const { promisify } = require('util')
const fs = require('fs')
const { phone } = require('phone')
const writeFileAsync = promisify(fs.writeFile)
const unlinkAsync = promisify(fs.unlink)
const totpEncoding = 'base32'

module.exports = ({ secret }) => {

	let utils = {}

	utils.removeFile = async (filepath) => {
		return await unlinkAsync(filepath)
	}

	utils.md5 = (data) => {
		return crypto.createHash('md5').update(data).digest('hex')
	}

	utils.sha1 = (data) => {
		return crypto.createHash('sha1').update(data).digest('hex')
	}

	utils.hashPassword = async (password) => {
		return await bcrypt.hash(password, 10)
	}

	utils.comparePasswordWithHashed = async (password, hashed) => {
		return await bcrypt.compare(password, hashed)
	}

	utils.normalizePhone = (value, countryAbbr) => {
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

	utils.emailParts = (value) => {
		const parts = value.split('@')
		return {
			username: parts[0],
			domain: parts[1],
		}
	}

	utils.createToken = async (sub, _id, payload) => {
		const expiry = utils.expirations(sub)
		if (!expiry) { return undefined }
		return await jwt.sign({ sub, _id, ...payload }, secret, {
			algorithm: 'HS256',
			expiresIn: expiry.value,
		})
	}

	utils.validateToken = async (token) => {
		try {
			return await jwt.verify(token, secret)
		}
		catch(err) {
			return false
		}
	}

	utils.expirations = (type) => {
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

	utils.createTotpCode = async () => {
		const secret = speakeasy.generateSecret({ length: 20 })[totpEncoding]
		const code = speakeasy.totp({ secret, encoding: totpEncoding })
		return { code, secret }
	}

	utils.validateTotpCode = async ({ code, secret }) => {
		return speakeasy.totp.verify({
			token: code,
			secret,
			encoding: totpEncoding,
			window: 6,
		})
	}

	return utils

}