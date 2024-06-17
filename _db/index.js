
//@see https://www.mongodb.com/developer/languages/javascript/node-crud-tutorial/

const mongodb = module.exports.mongodb = require('mongodb')
const { MongoClient, ServerApiVersion } = mongodb

module.exports = (API) => {

  API.DB = {}

  API.DB.mongodb = mongodb

  API.DB.connectionString = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_HOST}/?retryWrites=true&w=majority&appName=${process.env.MONGODB_APPNAME}`

  // Create a MongoClient with a MongoClientOptions object to set the Stable API version
  API.DB.client = new MongoClient(API.DB.connectionString, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  })

  API.DB.test = async () => {
    try {
      await client.connect()
      return await client.db(process.env.MONGODB_DATABASE).command({ ping: 1 })
    }
    catch (err) {
      console.dir(err)
    }
    finally {
      await client.close()
    }
  }

  API.DB.open = async () => {
    API.Log('opening mongodb connection')
    await API.DB.client.connect()
  }

  API.DB.close = async () => {
    // console.log('closing mongodb connection')
    // await API.DB.client.close()
  }

  return API

}

