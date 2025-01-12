const loadProvider = require('../providers/loader');

module.exports = (API, { files, paths, providers, checks }) => {
	const { enabled } = files

	if (!enabled) { return API }

	if (files.provider) {
		try {
			API.Files = { 
				...API.Files,
				...loadProvider(`${paths.minapi}/providers/${files.provider}`)({ 
					providerVars: providers[files.provider]
				})
			}
		} catch (err) {
			console.error(`File Service Error: ${err.message}`);
			return API;
		}
		return API;
	}
		
	/*
	for if we decide to enable multiple providers
	could be useful, only use with the following config in config.minapi.js:
		
    "files": {
        enabled: true,
        providers: {
            "Remote": "@digitalocean/files",
        },
    },

    */

	else if (files.providers) {
		for (let key in files.providers) {
			const name = files.providers[key];
			try {
				API.Files[key] = loadProvider(`${paths.minapi}/providers/${name}`)({ 
					providerVars: providers[name]
				});
			} catch (err) {
				console.error(`File Service Error (${key}): ${err.message}`);
			}
		}
	}

	return API;
}