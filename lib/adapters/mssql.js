const pgFormat = require('pg-format')

function makeAdapter (connection, debugFn) {
  return {
    query: function (query) {
      if (debugFn !== undefined) debugFn(query) 
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