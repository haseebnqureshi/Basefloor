const loadProvider = require('../providers/loader');

module.exports = (API, { emails, paths, providers, checks }) => {

	API.Emails.enabled = true

	if (emails.provider) {
		try {
			API.Emails = { 
				...API.Emails,
				...loadProvider(`${paths.basefloor}/providers/${emails.provider}`)({ 
					providerVars: providers[emails.provider],
					providerName: emails.provider,
				})
			}
		} catch (err) {
			console.error(`Email Service Error: ${err.message}`);
			return API;
		}
		return API;
	}
  
  /*
  for if we decide to enable multiple providers
  could be useful, only use with the following config in config.basefloor.js:
  
  "emails": {
    enabled: true,
    providers: {
      "Transactional": "@mailgun/emails",
      "Marketing": "@postmark/emails",
    },
  },

  */

	else if (emails.providers) {
		for (let key in emails.providers) {
			const name = emails.providers[key];
			try {
				API.Emails[key] = loadProvider(`${paths.basefloor}/providers/${name}`)({ 
					providerVars: providers[name],
					providerName: name,
				});
			} catch (err) {
				console.error(`Email Service Error (${key}): ${err.message}`);
			}
		}
	}

	return API;
}