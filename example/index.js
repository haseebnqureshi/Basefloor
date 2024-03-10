
const path = require('path')

const API = require('..')({
	envPath: path.resolve(__dirname, '.env'),
	projectPath: path.resolve(__dirname),
})

API.Start()
