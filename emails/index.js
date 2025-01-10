
module.exports = (API, { emails, paths, providers, checks }) => {

	const { enabled, provider } = emails

  if (!enabled) { return API }

  const providerVars = providers[provider]

  API.Emails = { 
    ...API.Emails,
    ...require(`${paths.minapi}/_providers/${provider}`)({ providerVars })
  }

  return API

}