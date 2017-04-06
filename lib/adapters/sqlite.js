const pgFormat = require('pg-format')

function makeAdapter (db, debugFn) {
  return {
    query: function (query) {
      if (debugFn !== undefined) debugFn(query)
      
      return new Promise((resolve, reject) => {
        db.all(query, (err, rows) => {
          if (err) reject(err)
          else {
            resolve(rows)
          }
        })
      })
    },
    escape: function (parameter) {
      if(+parameter === parameter) {
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
