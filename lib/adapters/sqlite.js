'use strict'

const pgFormat = require('pg-format')

function makeAdapter (db) {
  return {
    query: function (query) {
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
    }
  }
}

module.exports = makeAdapter
