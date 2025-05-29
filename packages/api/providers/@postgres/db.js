//@see https://node-postgres.com/

const { Pool, Client } = require('pg')

module.exports = ({ providerVars, providerName }) => {

  const NAME = providerName
  const ENV = providerVars

  const CONNECTION_CONFIG = {
    user: providerVars.username,
    host: providerVars.host,
    database: providerVars.database,
    password: providerVars.password,
    port: providerVars.port || 5432,
    ssl: providerVars.ssl !== false ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: providerVars.connectionTimeout || 5000,
    idleTimeoutMillis: providerVars.idleTimeout || 30000,
    max: providerVars.maxConnections || 20,
  }

  const CONNECTION_STRING = `postgresql://${providerVars.username}:${providerVars.password}@${providerVars.host}:${providerVars.port || 5432}/${providerVars.database}`

  // Create a connection pool for better performance
  const pool = new Pool(CONNECTION_CONFIG)

  // Handle pool errors
  pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err)
    process.exit(-1)
  })

  const run = () => pool

  const test = async () => {
    const client = new Client(CONNECTION_CONFIG)
    try {
      await client.connect()
      const result = await client.query('SELECT NOW()')
      return result.rows[0]
    }
    catch (err) {
      console.error('PostgreSQL connection test failed:', err)
      throw err
    }
    finally {
      await client.end()
    }
  }

  const connect = async () => {
    console.log('postgresql connection pool initialized')
    // Pool connects automatically when needed
  }

  const close = async () => {
    console.log('closing postgresql connection pool')
    await pool.end()
  }

  // Helper methods for common operations
  const query = async (text, params) => {
    const start = Date.now()
    const res = await pool.query(text, params)
    const duration = Date.now() - start
    console.log('executed query', { text, duration, rows: res.rowCount })
    return res
  }

  const getClient = async () => {
    const client = await pool.connect()
    const query = client.query
    const release = client.release
    // Set a timeout of 5 seconds, after which we will log this client's last query
    const timeout = setTimeout(() => {
      console.error('A client has been checked out for more than 5 seconds!')
      console.error(`The last executed query on this client was: ${client.lastQuery}`)
    }, 5000)
    // Monkey patch the query method to keep track of the last query executed
    client.query = (...args) => {
      client.lastQuery = args
      return query.apply(client, args)
    }
    client.release = () => {
      // Clear the timeout
      clearTimeout(timeout)
      // Set the methods back to their old un-monkey-patched version
      client.query = query
      client.release = release
      return release.apply(client)
    }
    return client
  }

  return {
    NAME,
    ENV,
    CONNECTION_STRING,
    CONNECTION_CONFIG,
    pg: { Pool, Client },
    pool,
    run,
    test,
    connect,
    close,
    query,
    getClient,
  }

} 