
const loadProvider = require('../providers/loader')

module.exports = (API, { files, paths, providers, project }) => {

	API.Files.enabled = true

	const finishAndReturnAPI = () => {
		API.Files = {
			...API.Files,
			...require('./helpers')({ API, paths, project }),
		}
		API = require('./middlewares')(API, { paths, project })
		API = require('./routes')(API, { paths, project })
		return API
	}

	const initLoad = (name) => {
		return loadProvider(`${paths.basefloor}/providers/${name}`)({ 
			providerVars: providers[name],
			providerName: name,
		})		
	}

	try {
		if (files.provider) {
			API.Files = { 
				...API.Files, 
				Provider: initLoad(files.provider) 
			}
		} else if (files.providers) {
			for (let key in files.providers) {
				API.Files[key] = initLoad(files.providers[key])
			}
		}
	}
	catch (err) {
		console.error(`File Service Error: ${err.message}`)
	}

	return finishAndReturnAPI()

}
