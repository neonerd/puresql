'use strict'

function makeAdapter (connection) {
  return {
    query: function (query) {
      return new Promise((resolve, reject) => {
        connection.query(query, (err, rows, fields) => {
          if (err) reject(err)
          else {
            resolve(rows)
          }
        })
      })
    },
    escape: function (parameter) {
      return connection.escape(parameter)
    }
  }
}

module.exports = makeAdapter
