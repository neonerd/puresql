/**
 * Returns the parameter in an array if not already an Arraz
 */
function arrayize (val) {
  if (Array.isArray(val))
    return val
  else
    return [val]
}

/**
 * Escapes a regex.
 */
function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

/**
* Escapes an array.
*/
function escapeArrayParameter (parameter, adapter, outside) {
  if (outside === undefined) outside = false
  const tokens = []
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

function escapeAnonymousInsertObjectParameterItem (parameter, adapter) {
  return '(' + Object.keys(parameter).map(key => escapeStaticParameter(parameter[key], adapter)).join(', ') + ')'
}

function escapeAnonymousUpdateObjectParameterItem (parameter, adapter) {
  return Object.keys(parameter).map(key => 
      '`' + key + '` = ' + escapeStaticParameter(parameter[key], adapter)
  )
  .join(', ')
}

function escapeInsertObjectParameterItem (parameter, objectKeys, adapter) {
  return '(' + objectKeys.map(key => escapeStaticParameter(parameter[key], adapter)).join(', ') + ')'
}

function escapeUpdateObjectParameterItem (parameter, objectKeys, adapter) {
  return objectKeys.map(key =>
      '`' + key + '` = ' + escapeStaticParameter(parameter[key], adapter)
  )
  .join(', ')
}

/**
 * Escapes an object parameter
 * @param  {[type]} parameter [description]
 * @param  {[type]} adapter   [description]
 * @param  {[type]} type      [description]
 * @return {[type]}           [description]
 */
function escapeObjectParameterItem (parameter, options, adapter, type) {
  if (type === 'insert') {
    if (options.objectKeys !== undefined) return escapeInsertObjectParameterItem(parameter, options.objectKeys, adapter)
    else return escapeAnonymousInsertObjectParameterItem(parameter, adapter)
  }
  if (type === 'update') {
    if (options.objectKeys !== undefined) return escapeUpdateObjectParameterItem(parameter, options.objectKeys, adapter)
    else return escapeAnonymousUpdateObjectParameterItem(parameter, adapter)
  }
  throw new Error('Unknown object escaping type!')
}

function escapeObjectParameter (parameter, options, adapter, type) {
  if (Array.isArray(parameter)) {
    return parameter.map(item => escapeObjectParameterItem(item, options, adapter, type)).join(', ')
  } else {
    return escapeObjectParameterItem(parameter, options, adapter, type)
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
  const processedParts = []
  for (const part of parameter.parts) {
    processedParts.push(parseQuery(part[1], part[0], adapter))
  }
  return processedParts.join(` ${parameter.operator} `)
}

/**
* Escapes the passed parameter statically.
*/
function escapeStaticParameter (parameter, adapter) {
  if (Array.isArray(parameter)) {
    return escapeArrayParameter(parameter, adapter, true)
  } else {
    return adapter.escape(parameter)
  }
}

/**
/* Escapes the passed parameter. If it contains a modifier, uses appropriate function.
*/
function escapeParameter (parameter, options, adapter) {
  if (options.strRaw[1] === '~') {
    return escapeDynamicParameter(parameter, adapter)
  }
  if (options.strRaw[1] === '!') {
    return escapeDangerousParameter(parameter, adapter)
  }
  if (options.strRaw[1] === '$') {
    return escapeObjectParameter(parameter, options, adapter, 'insert')
  }
  if (options.strRaw[1] === '@') {
    return escapeObjectParameter(parameter, options, adapter, 'update')
  }
  return escapeStaticParameter(parameter, adapter)
}

function validateObjectParameter (parameter, def, missingParameters, parameterName) {
  if (typeof parameter !== 'object') {
    throw new Error('This parameter expects object!')
  }
  
  const parsedDef = def.replace(/[{}]+/g, '')
  const keys = parsedDef.split(',').map(token => token.trim())
  const parametersToProcess = arrayize(parameter)

  parametersToProcess.map(p => {
    keys.map(key => {
      if (p[key] === undefined) {
        missingParameters.push([parameterName, '.', key].join(''))
      }
    })
  })

  return keys
}

const OBJECT_PARAMETER_MODIFIERS = ['$', '@']
/**
* Validates the parameters object based on the passed SQL.
*/
function validateParameters (parameters, sql) {
  const regexAnonymous = /:\?/g
  const regexNamed = /:([~!@$]*)([a-zA-Z0-9_]+)({.+})*/g
  const missingParameters = []
  const parametersOptions = {}

  // find and validate all anonymous parameters
  const anonymousParameters = sql.match(regexAnonymous)
  if (anonymousParameters != null) {
    if (parameters['?'] === undefined || parameters['?'].length !== anonymousParameters.length) {
      missingParameters.push('?')
    }
  }

  // find and validate all named parameters
  while ((const namedParameter = regexNamed.exec(sql)) !== null) {
    if (namedParameter != null) {
      const namedParameterName = namedParameter[1] + namedParameter[2]

      parametersOptions[namedParameterName] = {
        strToReplace: escapeRegExp(namedParameter[0]),
        strRaw: namedParameter[0]
      }

      if (parameters[namedParameterName] === undefined) {
        missingParameters.push(namedParameterName)
      }
      // if this modifier marks an object, validate the parameters for the presence of the object
      if (OBJECT_PARAMETER_MODIFIERS.indexOf(namedParameter[1]) > -1 && namedParameter[3] !== undefined) {
        parametersOptions[namedParameterName].objectKeys = validateObjectParameter(parameters[namedParameterName], namedParameter[3], missingParameters, namedParameterName)
      }
    }
  }

  return {
    // missing parameters
    missingParameters,
    // options for parameters
    parametersOptions
  }
}

/**
* Replaces parameters in passed SQL query, escaping them using the adapter's escape function
*/
function parseQuery (parameters, sql, adapter) {
  const parsedParameters = validateParameters(parameters, sql)

  if (parsedParameters.missingParameters.length > 0) {
    throw new Error(`Missing query parameters: ${ parsedParameters.missingParameters.join(', ') }`)
  }

  if (parameters['?']) {
    for (const parameter of parameters['?']) {
      sql = sql.replace(':?', escapeParameter(parameter, {strToReplace: ':?', strRaw: ':?'}, adapter))
    }
  }

  // this sorts the parameters by the length of their name, solving a situation when :user overwrites :userId
  const parameterKeys = Object.keys(parameters).sort((a, b) => (a.length-b.length)).reverse()
  
  for (const parameterKey of parameterKeys) {
    if (parameterKey !== '?') {

      if (parsedParameters.parametersOptions[parameterKey] === undefined) {
        throw new Error('Unexpected parameter "' + parameterKey + '"!')
      }

      sql = sql.replace(
          new RegExp(parsedParameters.parametersOptions[parameterKey].strToReplace, 'g'),
          escapeParameter(parameters[parameterKey], parsedParameters.parametersOptions[parameterKey], adapter)
        )
    }
  }

  return sql
}

// EXPORT
module.exports = {
  parseQuery: parseQuery
}
