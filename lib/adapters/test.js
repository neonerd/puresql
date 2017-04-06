function makeAdapter () {

  return {
    query : function(query) {
      return new Promise((resolve, reject) => {
        resolve(query)
      })
    },
    escape : function (parameter) {
      return parameter
    },
    escapeIdentifier: function (identifier) {
      return identifier
    }
  }

}

module.exports = makeAdapter
