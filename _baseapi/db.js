
const fs = require('fs')
const path = require('path')

//@see https://www.mongodb.com/developer/languages/javascript/node-crud-tutorial/

const mongodb = module.exports.mongodb = require('mongodb')
const { MongoClient, ServerApiVersion } = mongodb

module.exports = (API) => {

  API.DB = {}

  API.DB.mongodb = mongodb

  API.DB.connectionString = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_HOST}/?retryWrites=true&w=majority`

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
    console.log('opening mongodb connection')
    await API.DB.client.connect()
  }

  API.DB.close = async () => {
    // console.log('closing mongodb connection')
    // await API.DB.client.close()
  }

  return API

}






// SCRAPS


// module.exports.register = async () => {
  
//   const dirpath = path.resolve(__dirname, 'collections')
//   const items = fs.readdirSync(dirpath).filter(f => f.match(/\.js$/i))
//   if (items.length === 0) { return }

//   let map = {}
//   for (let item of items) {
//     const name = item.replace(/\.js$/i, '')
//     const contents = fs.readFileSync(path.resolve(dirpath, item), 'utf8')
//     map[name] = 



//     const replaced = contents.replace(/exports/gmi, `exports.${name}`)
//     fs.appendFileSync(outpath, replaced)
//   const outpath = path.resolve(__dirname, 'collections.map.json')
//   fs.writeFileSync(outpath, '', 'utf8')


//   }
// }

// if (process.env.NODE_ENV !== 'production') {
//   module.exports.register()
// }
