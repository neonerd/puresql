'use strict';

/**
/* Validates and escapes a passed parameter. If it is an array, turns it into a SQL array representation.
*/
function escapeParameter(parameter, adapter) {

  var output

  if(Array.isArray(parameter)) {
    var tokens = []
    for(let token of parameter) {
      tokens.push(adapter.escape(token))
    }
    output = `(${ tokens.join(', ') })`
  } else {
    output = adapter.escape(parameter)
  }

  return output

}

/**
* Replaces parameters in passed SQL query, escaping them using the adapter's escape function
*/
function parseQuery(parameters, sql, adapter) {

  if(parameters['?']) {
    for(let parameter of parameters['?']) {
      sql = sql.replace(':?', escapeParameter(parameter, adapter))
    }
  }

  for(let parameterKey of Object.keys(parameters)) {
    if(parameterKey!='?') {
      sql = sql.replace(`:${ parameterKey }`, escapeParameter(parameters[parameterKey], adapter))
    }
  }

  return sql

}

// EXPORT
module.exports = {
  parseQuery : parseQuery
}
