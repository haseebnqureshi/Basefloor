
module.exports = (API, { db, paths, providers }) => {

  const { enabled, provider } = db

  if (!enabled) { return API }

  const providerVars = providers[provider]

  API.DB = { 
    ...API.DB,
    ...require(`${paths.minapi}/_providers/${provider}`)({ providerVars })
  }

  return API

}
