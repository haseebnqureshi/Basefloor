// In-memory database provider for testing
const mongodb = require('mongodb')
const { ObjectId } = mongodb

module.exports = ({ providerVars, providerName }) => {
  
  const NAME = providerName
  const ENV = providerVars
  
  // In-memory storage - collections as objects
  const collections = {}
  
  const run = () => {
    return {
      // MongoDB-compatible interface
      collection: (name) => {
        if (!collections[name]) {
          collections[name] = []
        }
        
        return {
          // MongoDB-style methods
          insertOne: async (doc) => {
            const id = generateObjectId()
            const newDoc = { _id: id, ...doc }
            collections[name].push(newDoc)
            return { insertedId: id }
          },
          
          findOne: async (query) => {
            const docs = collections[name] || []
            return docs.find(doc => matchesQuery(doc, query))
          },
          
          find: (query) => {
            const docs = collections[name] || []
            const results = query ? docs.filter(doc => matchesQuery(doc, query)) : docs
            return {
              toArray: () => Promise.resolve(results)
            }
          },
          
          updateOne: async (query, update) => {
            const docs = collections[name] || []
            const index = docs.findIndex(doc => matchesQuery(doc, query))
            if (index !== -1) {
              if (update.$set) {
                docs[index] = { ...docs[index], ...update.$set }
              } else {
                docs[index] = { ...docs[index], ...update }
              }
              return { modifiedCount: 1 }
            }
            return { modifiedCount: 0 }
          },
          
          deleteOne: async (query) => {
            const docs = collections[name] || []
            const index = docs.findIndex(doc => matchesQuery(doc, query))
            if (index !== -1) {
              docs.splice(index, 1)
              return { deletedCount: 1 }
            }
            return { deletedCount: 0 }
          },
          
          deleteMany: async (query) => {
            const docs = collections[name] || []
            const initialLength = docs.length
            collections[name] = docs.filter(doc => !matchesQuery(doc, query))
            return { deletedCount: initialLength - collections[name].length }
          }
        }
      }
    }
  }
  
  const test = async () => {
    return { ok: 1 } // Always passes for in-memory
  }
  
  const connect = async () => {
    console.log('in-memory database connected')
  }
  
  const close = async () => {
    console.log('in-memory database closed')
  }
  
  // Helper functions
  function generateObjectId() {
    return new ObjectId()
  }
  
  function matchesQuery(doc, query) {
    if (!query) return true
    
    return Object.keys(query).every(key => {
      const queryValue = query[key]
      const docValue = doc[key]
      
      if (queryValue && typeof queryValue === 'object' && !Array.isArray(queryValue)) {
        // Handle operators like $in, $ne, etc.
        return Object.keys(queryValue).every(op => {
          switch (op) {
            case '$in':
              return queryValue[op].includes(docValue)
            case '$ne':
              return docValue !== queryValue[op]
            case '$gt':
              return docValue > queryValue[op]
            case '$lt':
              return docValue < queryValue[op]
            default:
              return false
          }
        })
      }
      
      // Handle ObjectId comparisons - convert both to strings for comparison
      const docValueStr = docValue && docValue.toString ? docValue.toString() : docValue
      const queryValueStr = queryValue && queryValue.toString ? queryValue.toString() : queryValue
      
      // Special handling for ObjectId strings - normalize both values
      if (key === '_id') {
        // If queryValue is a string representation of ObjectId, compare as strings
        const normalizedDocValue = docValueStr
        const normalizedQueryValue = queryValueStr
        return normalizedDocValue === normalizedQueryValue
      }
      
      return docValueStr === queryValueStr
    })
  }
  
  return {
    NAME,
    ENV,
    CONNECTION_STRING: 'memory://local',
    mongodb,  // Expose mongodb module for ObjectId compatibility
    run,
    test,
    connect,
    close,
    // Expose collections for debugging
    _collections: collections
  }
}