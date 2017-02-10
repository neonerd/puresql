'use strict'

/**
* Escapes an array.
*/
function escapeArrayParameter (parameter, adapter, outside) {
  if (outside === undefined) outside = false
  var tokens = []
  let hasSubArrays = false
  for (let token of parameter) {
    if (Array.isArray(token)) {
      hasSubArrays = true
      tokens.push(escapeArrayParameter(token, adapter))
    } else {
      tokens.push(adapter.escape(token))
    }
  }
  if (!outside || !hasSubArrays) {
    return `(${ tokens.join(', ') })`
  } else {
    return tokens.join(', ')
  }
}

/**
* Escapes a dangerous parameter
*/
function escapeDangerousParameter (parameter, adapter) {
  return parameter
}

/**
* Escapes the passed adapter as dynamic.
*/
function escapeDynamicParameter (parameter, adapter) {
  let processedParts = []
  for (let part of parameter.parts) {
    processedParts.push(parseQuery(part[1], part[0], adapter))
  }
  return processedParts.join(` ${parameter.operator} `)
}

/**
* Escapes the passed parameter statically.
*/
function escapeStaticParameter (parameter, adapter) {
  var output

  if (Array.isArray(parameter)) {
    output = escapeArrayParameter(parameter, adapter, true)
  } else {
    output = adapter.escape(parameter)
  }

  return output
}

/**
/* Escapes the passed parameter. If it is an array, turns it into a SQL array representation.
*/
function escapeParameter (parameter, key, adapter) {
  if (key[0] === '~') {
    return escapeDynamicParameter(parameter, adapter)
  }
  if (key[0] === '!') {
    return escapeDangerousParameter(parameter, adapter)
  }
  return escapeStaticParameter(parameter, adapter)
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
      sql = sql.replace(':?', escapeParameter(parameter, '?', adapter))
    }
  }

  for (let parameterKey of Object.keys(parameters)) {
    if (parameterKey !== '?') {
      sql = sql.replace(new RegExp(`:${ parameterKey }`, 'g'), escapeParameter(parameters[parameterKey], parameterKey, adapter))
    }
  }

  return sql
}

// EXPORT
module.exports = {
  parseQuery: parseQuery
}
