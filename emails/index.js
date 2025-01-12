
module.exports = (API, { emails, paths, providers, checks }) => {

	const { enabled } = emails

  if (!enabled) { return API }

  if (emails.provider) {
    API.Emails = { 
      ...API.Emails,
      Provider: ...require(`${paths.minapi}/_providers/${emails.provider}`)({ 
        providerVars: providers[emails.provider]
      })
    }
    return API
  }

  /*
  for if we decide to enable multiple providers
  could be useful, only use with the following config in config.minapi.js:
  
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
      const name = emails.providers[key]
      API.Emails[key] = require(`${paths.minapi}/_providers/${name}`)({ 
        providerVars: providers[name]
      })
    }
  }

  return API

}