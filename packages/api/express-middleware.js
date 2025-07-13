/**
 * Basefloor Express Middleware
 * 
 * Extracts existing Basefloor functionality as standard Express middleware
 * This allows developers to use familiar Express patterns while leveraging
 * Basefloor's powerful auth, validation, and permission systems.
 */

const createBasefloorMiddleware = (API, config) => {
  
  // Extract auth middleware (already exists in API object)
  const auth = {
    /**
     * Requires valid JWT authentication
     * Sets req.user with decoded token data
     */
    required: API.requireAuthentication
  }

  // Extract model operations and validation
  const models = {}
  if (config.models) {
    Object.keys(config.models).forEach(modelName => {
      models[modelName] = {
        /**
         * Validates request body against model schema
         */
        validate: (req, res, next) => {
          try {
            // Use existing model validation logic
            const model = API.DB[modelName]
            if (!model) {
              return res.status(500).json({ error: `Model ${modelName} not found` })
            }
            
            // TODO: Extract existing validation logic from routes
            // For now, pass through - validation will be added in next iteration
            next()
          } catch (error) {
            res.status(400).json({ 
              error: 'Validation failed',
              details: error.message 
            })
          }
        },

        /**
         * Auto-inject userId from authenticated user
         */
        injectUser: (req, res, next) => {
          if (req.user && req.user._id) {
            req.body.userId = req.user._id
          }
          next()
        },

        /**
         * Database operations (direct access to existing functionality)
         */
        create: (data) => API.DB[modelName].create({ values: data }),
        read: (where) => API.DB[modelName].read({ where }),
        readAll: (where = {}) => API.DB[modelName].readAll({ where }),
        update: (where, values) => API.DB[modelName].update({ where, values }),
        delete: (where) => API.DB[modelName].delete({ where })
      }
    })
  }

  // Basic permission checking (will be enhanced in Week 2)
  const permissions = {
    /**
     * Basic permission check middleware
     * TODO: Integrate with existing permission evaluation engine
     */
    check: (modelName, operation) => (req, res, next) => {
      // For now, just require authentication
      // Will integrate with existing permission system in Week 2
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' })
      }
      next()
    }
  }

  return {
    auth,
    models, 
    permissions
  }
}

module.exports = createBasefloorMiddleware