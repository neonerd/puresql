# puresql

[![Build Status](https://travis-ci.org/neonerd/puresql.svg?branch=master)](https://travis-ci.org/neonerd/puresql)

puresql is an ES6/7 ready SQL library for node.js, heavily inspired by Clojure's yesql.

## Installation

```
npm install puresql
```

## Usage

puresql takes a path to a .sql file containing query definitions and turns them into promisified functions. You can then call them and either pass one of the provided adapters (mySQL), or your own adapter (see one of the existing ones on the structure).

## Quickstart

user.sql
```sql
-- name: get_by_id
SELECT *
FROM user
WHERE id = :id

-- name: get_all
SELECT *
FROM user

-- name: get_by_ids
SELECT *
FROM user
WHERE id IN :ids

-- name: get_or
SELECT *
FROM user
WHERE id = :? OR id = :?
```

basic.js
```js
'use strict';

var mysql = require("mysql")
var puresql = require("puresql")

// create a connection the adapter will use
var connection = mysql.createConnection({
  host : '192.168.99.100',
  port : 3307,
  user : 'test',
  password : '',
  database : 'test'
})
// create the adapter
var adapter = puresql.adapters.mysql(connection)

// load our queries
var queries = puresql.loadQueries("user.sql")

// do something
queries.get_all({}, adapter)
.then((rows)=>{

  console.log(rows)

})
.catch((error)=>{

  console.log(error)

})
```

## Parameters

puresql query definitions can contain both named (:parameter) and anonymous (:?) parameters. These are later resolved by passing a parameters object into the query.

Arrays are automatically converted into their SQL representation.

Named parameter:
```js
// SELECT * FROM user WHERE id = :id
queries.get_by_id({id:1}, adapter)
// SELECT * FROM user WHERE id = 1
```

Unnamed parameters:
```js
// SELECT * FROM user WHERE id = :? OR id = :?
queries.get_or({'?':[1, 2]}, adapter)
// SELECT * FROM user WHERE id = 1 OR id = 2
```

Array:
```js
// SELECT * FROM user WHERE id IN :ids
queries.get_by_ids({ids:[1, 2, 3, 4]})
// SELECT * FROM user WHERE id IN (1, 2, 3, 4)
```

## ES 6/7

With generators or async/await, we can now take our SQL functions and use them in a sync-like way, avoiding the callback / .then() hell.

```js
// Use our queries in a generator-based workflow
co(function*(){

  // Like sync code, but async!
  var rows = yield queries.get_all({}, adapter)
  console.log(rows)

})
.catch((error)=>{

  console.log(error)

})
```

## Koa

As Koa uses generator-based workflow by default, puresql works out-of-box there too!

```js
var koa = require("koa")
// Create a simple server
var app = koa()

app.use(function*(){

  // Like sync, but async!
  var rows = yield queries.get_all({}, adapter)
  this.body = JSON.stringify(rows)

})

app.listen(3000)
```

## Security

puresql automatically escapes the provided parameters using the adapter's escape function. The bundled adapters all use underlying driver's to escape safely. You should pay attention to properly implementing escaping when providing your own adapter.

## API

puresql exposes these functions:

### puresql.loadQueries(filePath)

Parses provided file and returns an object literal in {queryName:fn} format.

```js
var queries = puresql.loadQueries('user.sql')
console.log(queries)

/*
{
  get_by_id : fn,
  get_all : fn,
  get_by_ids : fn,
  get_or : fn
}
*/
```

### puresql.defineQuery(str)

Returns a query function based on the provided string representation.

```js
var query = puresql.defineQuery("SELECT * FROM user WHERE id = :id")
```

### puresql.adapters.mysql(mysqlConnection)

Returns a mySQL adapter. Takes connection object from 'mysql' module as parameter.

```js
// create a connection the adapter will use
var connection = mysql.createConnection({
  host : '192.168.99.100',
  port : 3307,
  user : 'test',
  password : '',
  database : 'test'
})
// create the adapter
var adapter = puresql.adapters.mysql(connection)
```

### puresql.adapters.test()

Returns a testing adapter. This adapter always returns the parsed SQL query (with parameters replaced by passed values) as a result.

## License

MIT
