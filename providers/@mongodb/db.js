
//@see https://www.mongodb.com/developer/languages/javascript/node-crud-tutorial/

const mongodb = require('mongodb')
const { MongoClient, ServerApiVersion } = mongodb

module.exports = ({ providerVars }) => {

  const CONNECTION_STRING = 'mongodb+srv://'
    + providerVars.username + ':'
    + providerVars.password + '@'
    + providerVars.host + '/?retryWrites=true&w=majority&appName='
    + providerVars.appName

  // Create a MongoClient with a MongoClientOptions object to set the Stable API version
  const client = new MongoClient(CONNECTION_STRING, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  })

  const run = () => client.db(providerVars.database)

  const test = async () => {
    try {
      await client.connect()
      return await client.db(providerVars.database)
        .command({ ping: 1 })
    }
    catch (err) {
      console.dir(err)
    }
    finally {
      await client.close()
    }
  }

  const connect = async () => {
    console.log('mongodb connection')
    await client.connect()
  }

  const close = async () => {
    // console.log('closing mongodb connection')
    // await client.close()
  }

  return {
    CONNECTION_STRING,
    mongodb,
    client,
    run,
    test,
    connect,
    close,
  }

}
