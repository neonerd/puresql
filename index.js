/**
* puresql
* v 1.0.0
* Functional SQL abstraction for node.js (>4.0.0)
* Inspired by yesql (https://github.com/krisajenkins/yesql)
* Andrej Sykora <as@andrejsykora.com>
* Licensed under MIT license
*/

'use strict'

var file = require('./lib/file')
var query = require('./lib/query')

module.exports = {

  // define a single query based on the passed sql string
  defineQuery: function (sql) {
    return query.makeQuery(sql)
  },
  // define multiple queries based on a single file
  loadQueries: function (filePath) {
    let queries = file.parseFile(filePath)
    for (let key of Object.keys(queries)) {
      queries[key] = query.makeQuery(queries[key])
    }
    return queries
  },

  // readymade adapters
  // usage: require('puresql').adapters.mysql(mysqlConnection)
  adapters: {
    // mySQL using 'mysql' module
    mysql: require('./lib/adapters/mysql'),
    // SQLite using 'sqlite3' module
    sqlite: require('./lib/adapters/sqlite'),
    // dummy adapter for testing purposes
    test: require('./lib/adapters/test')
  }

}
