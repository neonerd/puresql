const pgFormat = require('pg-format')

function makeAdapter (connection, debugFn) {
  return {
    query: function (query) {
      if (debugFn !== undefined) debugFn(query) 
      return new Promise((resolve, reject) => {
        connection.query(query, (err, result) => {
          if (err) reject(err)
          else resolve(result.rows)
        })
      })
    },
    escape: function (parameter) {
      if (+parameter === parameter) {
        return parameter
      } else {
        return pgFormat.literal(parameter)
      }
    },
    escapeIdentifier: function (identifier) {
      return pgFormat.ident(identifier)
    }
  }
}

module.exports = makeAdapter
