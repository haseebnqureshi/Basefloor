const mongodb = require('mongodb')
const { MongoClient } = mongodb

module.exports = ({ providerVars, providerName }) => {

  const NAME = providerName
  const ENV = providerVars

  const CONNECTION_STRING = providerVars.uri || 'mongodb://localhost:27017/basefloor'

  // Create a MongoClient for local development
  const client = new MongoClient(CONNECTION_STRING)

  const run = () => {
    const dbName = providerVars.database || CONNECTION_STRING.split('/').pop() || 'basefloor'
    return client.db(dbName)
  }

  const test = async () => {
    try {
      await client.connect()
      const dbName = providerVars.database || CONNECTION_STRING.split('/').pop() || 'basefloor'
      return await client.db(dbName).command({ ping: 1 })
    }
    catch (err) {
      console.dir(err)
      throw err
    }
    finally {
      await client.close()
    }
  }

  const connect = async () => {
    console.log('mongodb local connection')
    await client.connect()
  }

  const close = async () => {
    // console.log('closing mongodb connection')
    // await client.close()
  }

  return {
    NAME,
    ENV,
    CONNECTION_STRING,
    mongodb,
    client,
    run,
    test,
    connect,
    close,
  }

} 