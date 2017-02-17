'use strict'

function makeAdapter (connection) {
  return {
    lastInsertId: null,
    query: function (query) {
      return new Promise((resolve, reject) => {
        connection.query(query, (err, rows, fields) => {
          if (err) reject(err)
          else {
            if (rows && rows.insertId) this.lastInsertId = rows.insertId
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
