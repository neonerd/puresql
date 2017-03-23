/**
* File parsing
*/

// -- DEPENDENCIES
var fs = require('fs')
var path = require('path')

// -- FUNCTIONS

/**
* Takes a string and splits it into queries based on the '-- name: xxx' structure
*/
function splitIntoQueries (str) {
  const regex = /.*--[\s]*name.*:.*/g
  let result = {'__file': []}
  let lines = str.split('\n')
  let currentQueryName = '__file'

  // build an array of queryName:queryParts
  for (let line of lines) {
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
  for (let key of Object.keys(result)) {
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
  let contents = fs.readFileSync(filePath, 'utf-8')
  let queries = splitIntoQueries(contents)

  // rename the '__file' query to the basename of the file
  if (queries.__file.length > 0) {
    let basename = path.basename(filePath)
    let queryName = basename.split('.')[0]
    queries[queryName] = queries.__file
    delete queries.__file
  }

  return queries
}

// -- EXPORT
module.exports = {
  parseFile: parseFile
}
