function makeAdapter (connection) {
  return {
    query: function (query) {
      return new connection.Request().query(query)
    },
    escape: function (parameter) {
      return parameter
    }
  }
}

module.exports = makeAdapter