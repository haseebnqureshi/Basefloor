const loadProvider = require('../providers/loader');

module.exports = (API, { files, paths, providers, project }) => {
	const { enabled } = files

	if (!enabled) { return API }

	API.Files = { 
		...API.Files,
		...require('./utils'),
	}

	API.Files.createFileHash = ({ user_id, size, type, name }) => {
	  return API.Utils.hashObject({
	    user_id: user_id.toString(),
	    size,
	    type,
	    name, //@todo: still not ideal, as same files may have different names, and so we're still storing duplicates. may need client to send hash of file contents, because it's the client's duty to pipeline the body of the file to end cdn.
	  }, {
	    algorithm: 'md5'
	  })
	}

	API = require(`./routes`)(API, { paths, project })

	if (files.provider) {
		try {
			API.Files = { 
				...API.Files,
				Provider: loadProvider(`${paths.minapi}/providers/${files.provider}`)({ 
					providerVars: providers[files.provider]
				}),
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