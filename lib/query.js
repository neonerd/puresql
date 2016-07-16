'use strict'
var parser = require('./parser')

/**
* Makes a function that parses passed SQL and returns a promisified function using the passed adapter.
*/
function makeQuery (sql) {
  return function (parameters, adapter) {
    // validate adapter
    if (adapter === undefined || adapter.query === undefined || adapter.escape === undefined) {
      throw new Error('Missing adapter!')
    }

    // validate parameters

    // return promise
    return adapter.query(
      parser.parseQuery(parameters, sql, adapter)
    )
  }
}

// -- EXPORT
module.exports = {
  makeQuery: makeQuery
}
