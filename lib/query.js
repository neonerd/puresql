const parser = require('./parser')

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
      throw new Error({
        message: 'PureSQL query failed.',
        query: generatedSqlQuery,
        adapterError: e
      })
    })
  }
}

// -- EXPORT
module.exports = {
  makeQuery: makeQuery
}
