
module.exports = (API, { db, paths, providers, project }) => {

  const provider = db //here, we have no optionality for db -- it must be enabled at this point

  const providerVars = providers[provider]

  const providerName = provider

  API.DB = { 
    ...API.DB,
    ...require(`${paths.basefloor}/providers/${provider}`)({ providerVars, providerName }),
  }

  return API

}
