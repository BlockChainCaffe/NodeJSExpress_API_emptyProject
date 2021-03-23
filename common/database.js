const config = require('../config/config')
const util = require('util')
const mysql = require('mysql')
const logger = require('../common/logger.js').logger


// Global vars
var LUTable_breeds      // <--- might get HUGE
var LUTable_countries
var LUTable_document_type
var LUTable_regions     // <--- might get HUGE
var LUTable_roles
var LUTable_species

/* ------------------------------------------------------------------
    POOL SETUP
-------------------------------------------------------------------*/


const pool = mysql.createPool({
  connectionLimit: config.db_cons,
  host: config.db_host,
  user: config.db_user,
  password: config.db_pass,
  database: config.db_schema
})



/* ------------------------------------------------------------------
    LOWER LEVEL FUNCTIONS
-------------------------------------------------------------------*/

// Ping database to check for common exception errors.
pool.getConnection((err, connection) => {
  logger.info('Getting Database Connection')
  if (err) {
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.error('Database connection was closed.')
      logger.fatal('Database connection CLOSED.')
    }
    if (err.code === 'ER_CON_COUNT_ERROR') {
      console.error('Database has too many connections.')
      logger.fatal('Database too many connections')
    }
    if (err.code === 'ECONNREFUSED') {
      console.error('Database connection was refused.')
      logger.fatal('Database connection was refused.')
    }
  }

  if (connection) connection.release()
  logger.info('Datanase Connection OK')
  return
})

// Promisify for Node.js async/await.
pool.query = util.promisify(pool.query)


/* ------------------------------------------------------------------
    HIGH LEVEL FUNCTIONS
-------------------------------------------------------------------*/

async function query2obj (query) {
  logger.info('Function: query2obj')
  var [ok, res] = await runQuery(query)
  if (!ok) {
    logger.debug("query: ", query)
    logger.error("database error: ", res)
    return [false, res]
  }
  var resobj = res.map( (row,i) => {
    return Object.assign({}, row)
  })
  return [true, resobj]
}

async function table2obj (table) {
  logger.info('Function: table2obj')
  var query='select * from '+table+';'
  var [ok, res] = await query2obj(query)
  if (!ok) {
    logger.debug('query: ', query)
    logger.error('database error: ', res)
    return false
  }
  logger.debug("returning: ", res)
  return res
}


/* ------------------------------------------------------------------
    MODULE EXPORTS
-------------------------------------------------------------------*/

module.exports = {
    pool,
    runQuery,
    getEoaTxList,
    addEoaTx,
    isKnownFluid,
    isKnownHuman,

    // validDocType,

    addKnownHuman,
    addKnownFluid,

    reloadLookup,
    LUTable_breeds,
    LUTable_countries,
    LUTable_document_type,
    LUTable_regions,
    LUTable_roles,
    LUTable_species,
}