'use strict'

/**
/* Escapes the passed parameter. If it is an array, turns it into a SQL array representation.
*/
function escapeParameter (parameter, adapter) {
  var output

  if (Array.isArray(parameter)) {
    var tokens = []
    for (let token of parameter) {
      tokens.push(adapter.escape(token))
    }
    output = `(${ tokens.join(', ') })`
  } else {
    output = adapter.escape(parameter)
  }

  return output
}

/**
* Validates the parameters object based on the passed SQL.
*/
function validateParameters (parameters, sql) {
  const regexAnonymous = /:\?/g
  const regexNamed = /:[a-zA-Z0-9]+/g
  let missingParameters = []

  // find and validate all anonymous parameters
  let anonymousParameters = sql.match(regexAnonymous)

  if (anonymousParameters != null) {
    if (parameters['?'] === undefined || parameters['?'].length !== anonymousParameters.length) {
      missingParameters.push('?')
    }
  }

  // find and validate all named parameters
  let namedParameters = sql.match(regexNamed)
  if (namedParameters != null) {
    for (let namedParameter of namedParameters) {
      if (parameters[namedParameter.slice(1)] === undefined) {
        missingParameters.push(namedParameter.slice(1))
      }
    }
  }

  return missingParameters
}

/**
* Replaces parameters in passed SQL query, escaping them using the adapter's escape function
*/
function parseQuery (parameters, sql, adapter) {
  let missingParameters = validateParameters(parameters, sql)
  if (missingParameters.length > 0) {
    throw new Error(`Missing query parameters: ${ missingParameters.join(', ') }`)
  }

  if (parameters['?']) {
    for (let parameter of parameters['?']) {
      sql = sql.replace(':?', escapeParameter(parameter, adapter))
    }
  }

  for (let parameterKey of Object.keys(parameters)) {
    if (parameterKey !== '?') {
      sql = sql.replace(`:${ parameterKey }`, escapeParameter(parameters[parameterKey], adapter))
    }
  }

  return sql
}

// EXPORT
module.exports = {
  parseQuery: parseQuery
}
