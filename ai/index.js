
module.exports = (API, { ai, paths, providers, checks }) => {

  const { enabled } = ai

  if (!enabled) { return API }

  if (ai.provider) {
	  API.AI = { 
	    ...API.AI,
	    ...require(`${paths.minapi}/_providers/${ai.provider}`)({ 
	    	providerVars: providers[ai.provider]
	    })
	  }
	  return API
  }

  else if (ai.providers) {
  	for (let key in ai.providers) {
  		const name = ai.providers[key]
  		API.AI[key] = require(`${paths.minapi}/_providers/${name}`)({ 
	    	providerVars: providers[name]
	    })
  	}
  }

}