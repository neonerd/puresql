const pgFormat = require('pg-format')

function makeAdapter (connection, debug) {
  return {
    query: function (query) {
      if (debug) {
        console.log('\n\nPuresql MSSQL adapter: ')
        console.log(query)
      }
      return new connection.Request().query(query)
    },
    escape: function (parameter) {
      if (+parameter === parameter) {
        return parameter
      } else {
        return pgFormat.literal(parameter)
      }
    }
  }
}

module.exports = makeAdapter