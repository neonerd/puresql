const parser = require('./parser')

function PureSQLException (message, q, adapterError) {
  this.message = message
  this.query = q
  this.adapterError = adapterError
  this.name = 'PureSQLException'
}

/**
* Makes a function that parses passed SQL and returns a promisified function using the passed adapter.
*/
function makeQuery (sql) {
  return function (parameters, adapter) {
    // validate adapter
    if (adapter === undefined || adapter.query === undefined || adapter.escape === undefined) {
      throw new Error('Missing adapter!')
    }

    const generatedSqlQuery = parser.parseQuery(parameters, sql, adapter)

    // return promise
    return adapter.query(
      generatedSqlQuery
    )
    // catch error and use custom structure to handle it
    .catch(e => {
      throw new PureSQLException('PureSQL query failed.', generatedSqlQuery, e)
    })
  }
}

// -- EXPORT
module.exports = {
  makeQuery: makeQuery
}
