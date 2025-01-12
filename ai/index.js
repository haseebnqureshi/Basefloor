const loadProvider = require('../providers/loader');

module.exports = (API, { ai, paths, providers, checks }) => {

  const { enabled } = ai

  if (!enabled) { return API }

  if (ai.provider) {
    try {
      API.AI = { 
        ...API.AI,
        ...loadProvider(`${paths.minapi}/providers/${ai.provider}`)({ 
          providerVars: providers[ai.provider]
        })
      }
    } catch (err) {
      // If dependencies are missing, log error with installation instructions
      console.error(`AI Service Error: ${err.message}`);
      // Continue without AI service
      return API;
    }
    return API;
  }

  else if (ai.providers) {
    for (let key in ai.providers) {
      const name = ai.providers[key];
      try {
        API.AI[key] = loadProvider(`${paths.minapi}/providers/${name}`)({ 
          providerVars: providers[name]
        });
      } catch (err) {
        console.error(`AI Service Error (${key}): ${err.message}`);
        // Continue with other providers
      }
    }
  }

  return API;

}