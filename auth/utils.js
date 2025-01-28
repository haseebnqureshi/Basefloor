

const bcrypt = require('bcrypt')
const crypto = require('crypto')
const fs = require('fs')
const { promisify } = require('util')
const writeFileAsync = promisify(fs.writeFile)
const unlinkAsync = promisify(fs.unlink)

module.exports = ({ secret }) => {

	const removeFile = async (filepath) => {
		return await unlinkAsync(filepath)
	}

	const md5 = (data) => {
		return crypto.createHash('md5').update(data).digest('hex')
	}

	const sha1 = (data) => {
		return crypto.createHash('sha1').update(data).digest('hex')
	}

	const hashPassword = async (password) => {
		return await bcrypt.hash(password, 10)
	}

	const comparePasswordWithHashed = async (password, hashed) => {
		return await bcrypt.compare(password, hashed)
	}

	const emailParts = (value) => {
		const parts = value.split('@')
		return {
			username: parts[0],
			domain: parts[1],
		}
	}

	return {
		removeFile,
		md5,
		sha1,
		hashPassword,
		comparePasswordWithHashed,
		emailParts,
	}

}