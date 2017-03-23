/**
* File parsing
*/

// -- DEPENDENCIES
const fs = require('fs')
const path = require('path')

// -- FUNCTIONS

/**
* Takes a string and splits it into queries based on the '-- name: xxx' structure
*/
function splitIntoQueries (str) {
  const regex = /.*--[\s]*name.*:.*/g
  const result = {'__file': []}
  const lines = str.split('\n')

  
  // TODO: this should be functional
  // build an array of queryName:queryParts
  let currentQueryName = '__file'
  for (const line of lines) {
    if (line.match(regex)) {
      currentQueryName = line.split(':')[1].trim()
      result[currentQueryName] = []
    } else {
      if (currentQueryName) {
        result[currentQueryName].push(line)
      }
    }
  }

  // join the different lines of single queries
  for (const key of Object.keys(result)) {
    result[key] = result[key].join('\n').trim()
  }

  // if we have both unnamed and named queries, throw an error
  if (result.__file.length > 0 && Object.keys(result).length > 1) {
    throw new Error('Improperly formatted file! Either use only one query per file, or use named queries using "-- name: fooobar" pattern.')
  }

  return result
}

/**
/* Parses a file and returns an object consisting of {name:sqlQuery}
*/
function parseFile (filePath) {
  const contents = fs.readFileSync(filePath, 'utf-8')
  const queries = splitIntoQueries(contents)

  // rename the '__file' query to the basename of the file
  if (queries.__file.length > 0) {
    const basename = path.basename(filePath)
    const queryName = basename.split('.')[0]
    queries[queryName] = queries.__file
    delete queries.__file
  }

  return queries
}

// -- EXPORT
module.exports = {
  parseFile: parseFile
}
