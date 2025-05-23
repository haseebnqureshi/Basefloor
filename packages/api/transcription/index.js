const loadProvider = require('../providers/loader');

module.exports = (API, { transcription, paths, providers, project }) => {

  API.Transcription = { enabled: true };

  const finishAndReturnAPI = () => {
    // Add any helper functions, middlewares, or routes here if needed
    return API;
  };

  const initLoad = (name) => {
    return loadProvider(`${paths.basefloor}/providers/${name}`)({ 
      providerVars: providers[name],
      providerName: name,
    });
  };

  try {
    if (transcription.provider) {
      API.Transcription = { 
        ...API.Transcription, 
        Provider: initLoad(transcription.provider) 
      };
    } else if (transcription.providers) {
      for (let key in transcription.providers) {
        API.Transcription[key] = initLoad(transcription.providers[key]);
      }
    }
  }
  catch (err) {
    console.error(`Transcription Service Error: ${err.message}`);
  }

  return finishAndReturnAPI();
}; 