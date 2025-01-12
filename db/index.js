
module.exports = (API, { db, paths, providers, project }) => {

  const provider = db //here, we have no optionality for db -- it must be enabled at this point

  const providerVars = providers[provider]

  API.DB = { 
    ...API.DB,
    ...require(`${paths.minapi}/providers/${provider}`)({ providerVars }),
  }

  return API

}
