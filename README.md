# puresql

[![npm version](https://badge.fury.io/js/puresql.svg)](https://badge.fury.io/js/puresql)
[![Build Status](https://travis-ci.org/neonerd/puresql.svg?branch=master)](https://travis-ci.org/neonerd/puresql)
[![Dependency Status](https://david-dm.org/neonerd/puresql.svg)](https://david-dm.org/neonerd/puresql)
[![Coverage Status](https://coveralls.io/repos/github/neonerd/puresql/badge.svg?branch=master)](https://coveralls.io/github/neonerd/puresql?branch=master)
[![JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

puresql is an ES6/7 ready SQL library for node.js, heavily inspired by Clojure's [yesql](https://github.com/krisajenkins/yesql).

Note: This README is aimed at Node 8.0.0 and higher and does not contain examples for generator-based workflow. See README_OLD.md for the previous version of documentation.

## Intro

SQL is a great [DSL](https://en.wikipedia.org/wiki/Domain-specific_language) itself. Why abstract it and do this:

```js
const db = initDb(options)
const query = db.select('*').from('user').where('id', '=', 1)
```

When you can do this:

```sql
-- user.sql
-- name: get_user_by_id
SELECT *
FROM user
WHERE id = :id
```

```js
// something.js
const db = puresql.loadQueries('user.sql')

async function foo() {
const rows = await db.get_user_by_id({id:1}, adapter)
// do something with rows
}
```

## Installation

```
npm install puresql
```

## Usage

puresql takes a path to a .sql file containing query definitions and turns them into promisified functions. You can then call them and either pass one of the provided adapters (mySQL), or your own adapter (see one of the existing ones on the structure).

Alternatively, you can define individual queries manually via the exposed ```puresql.defineQuery(str)``` function.

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
const mysql = require("mysql")
const puresql = require("puresql")

// Create a connection the adapter will use
const connection = mysql.createConnection({
  host : '192.168.99.100',
  port : 3307,
  user : 'test',
  password : '',
  database : 'test'
})
// Create the adapter
const adapter = puresql.adapters.mysql(connection)

// Load our queries
const queries = puresql.loadQueries("user.sql")

// Do something
async function foo() {
  const rows = await queries.get_all({}, adapter)
  rows.map(row => {
    console.log('Name: ' + row.name)
  })
}
foo()
```

## Parameters

puresql query definitions can contain both named (:parameter) and anonymous (:?) parameters. These are later resolved by passing a parameters object into the query.

Arrays are automatically converted into their SQL representation.

If query function doesn't get all the parameters it needs, it throws an error.

Named parameters support modifiers. Cheatsheet:

|Modifier|Name|Example|Input|Output|Is sanitized?|
|---|---|---|---|---|---|
|(blank)|Normal parameter|:id|1|1|Yes|
|!|Dangerous parameter|:!order|ORDER ASC|ORDER ASC|No|
|$|Object parameter (insert)|:$user{name,rights}|{name:'foo', rights:'bar'}|('foo', 'bar')|Yes|
|@|Object parameter (update)|:@user{name,rights}|{name:'foo', rights:'bar'}|name = 'foo', rights = 'bar'|Yes|
|$ or @|Object parameter (schemaless)|:$user|{name:'foo', rights:'bar', somethingElse: 'test'}|('foo', 'bar', 'test')|Yes|
|*|Conditioned parameter|:\*limit{LIMIT \*}|10|LIMIT 10 (if '\*limit' parameter is not undefined)|No|
|~|Dynamic conditions|:~conditions|see bellow|see bellow|Not applicable|

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
queries.get_by_ids({ids:[1, 2, 3, 4]}, adapter)
// SELECT * FROM user WHERE id IN (1, 2, 3, 4)
```

Sub-arrays:
```js
// INSERT INTO user (name) VALUES :values
queries.create_users({values: [['john'], ['mark']]}, adapter)
// INSERT INTO user (name) VALUES ("john"), ("mark")
```

Parameter validation:
```js
// SELECT * FROM user WHERE position = :position AND division = :division
queries.get_by_position_and_division({position:'manager'}, adapter)
// Throws an error
```

Dangerous parameters (unescaped):
```js
// SELECT * FROM user ORDER BY :!order
queries.get_users({'!order': 'id ASC'}, adapter)
// SELECT * FROM user ORDER BY id ASC
```

Object parameters (insert):
```js
// INSERT INTO user (name, surname) VALUES :$user
queries.insert_user({'$user': {name: 'John', surname: 'Doe'}}, adapter)
// INSERT INTO user (name, surname) VALUES ('John', 'Doe')
```

Object parameters (update):
```js
// UPDATE user SET :@user
queries.insert_user({'@user': {name: 'John', surname: 'Doe'}}, adapter)
// UPDATE user SET name = 'John', surname = 'Doe'
```

Concitioned parameters:
```js
// SELECT * FROM user ORDER BY name :*limit{LIMIT *!}
queries.get_users({'*limit': 10}, adapter)
queries.get_users({}, adapter)
// SELECT * FROM user ORDER BY name LIMIT 10
// SELECT * FROM user ORDER BY name
```

## Dynamic parameters

When building parts of query dynamically (i.e. table filtering), you can use the dynamic (~) parameter type.

```js
// SELECT * FROM user WHERE :~conditions
queries.search_users({'~conditions':{
  operator: 'AND',
  parts: [
    ['position = :position', {position: 'manager'}],
    ['division = :division', {division: 'division'}]
  ]
}})
// SELECT * FROM user WHERE position = "manager" AND division = "division"
```

## ES 6/7

With async/await, we can now take our SQL functions and use them in a sync-like way, avoiding the callback / .then() hell.

```js
// ES2015 (node.js >8)
async function test () {
  const rows = await queries.get_all({}, adapter)
  console.log(rows)
}
```

## Koa

As Koa (>2.0.0) uses async/await workflow by default, puresql works out-of-box there too!

```js
const koa = require("koa")
// Create a simple server
const app = koa()

app.use(async function() {
  // Like sync, but async!
  const rows = await queries.get_all({}, adapter)
  this.body = JSON.stringify(rows)
})

app.listen(3000)
```

## Security

puresql automatically escapes the provided parameters using the adapter's escape function. The bundled adapters all use underlying drivers to escape safely. You should pay attention to properly implementing escaping when providing your own adapter.

## API

puresql exposes these functions:

### puresql.loadQueries(filePath)

Parses provided file and returns an object literal in {queryName:fn} format.

```js
const queries = puresql.loadQueries('user.sql')
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
const query = puresql.defineQuery("SELECT * FROM user WHERE id = :id")
```

### puresql.adapters.mysql(mysqlConnection, debugFn)

Returns a mySQL adapter. Takes connection object from 'mysql' module as parameter.

```js
// dependencies
const mysql = require('mysql')
const puresql = require('puresql')
// create a connection the adapter will use
const connection = mysql.createConnection({
  host : '192.168.99.100',
  port : 3307,
  user : 'test',
  password : '',
  database : 'test'
})
// create the adapter
const adapter = puresql.adapters.mysql(connection)
```

This adapter can optionally take debugFn function as a parameter. This function will receive the processed query before it runs.

This adapter exposes the lastInsertId value on itself.

```js
await queries.insert({data:['foo', 'bar']}, mysqlAdapter)
console.log(mysqlAdapter.lastInsertId)
// should output the ID of the last inserted row if possible
```

### puresql.adapters.sqlite(db, debugFn)

Returns an SQLite adapter. Takes a db object from 'sqlite3' module as parameter.

```js
// dependencies
const sqlite3 = require('sqlite3')
const puresql = require('puresql')
// create the db adapter will use
const db = new sqlite3.Database(':memory:')
const adapter = puresql.adapters.sqlite(db)
```

This adapter can optionally take debugFn function as a parameter. This function will receive the processed query before it runs.

### puresql.adapters.mssql(mssqlConnection, debugFn)

Returns a SQL Server adapter. Takes a connection object from 'mssql' module as parameter.

Note: The mssql adapter currently only works with mssql version 3.x.x. The newest 4.x.x version is currently not supported.

```js
// dependencies
const mssql = require('mssql')
const puresql = require('puresql')
// create a connection the adapter will use
mssql.connect(CREDENTIALS)
.then(function () {
  // create the adapter
  const adapter = puresql.adapters.mssql(mssql)
})
```

This adapter can optionally take debugFn function as a parameter. This function will receive the processed query before it runs.

### puresql.adapters.pg(pgConnection, debugFn)

Returns a PostgreSQL adapter. Takes a client instance from 'pg' module as parameter.

```js
// dependencies
const pg = require('pg')
const puresql = require('puresql')
// create a connection the adapter will use
const client = new pg.Client(config)
// create the adapter
const adapter = puresql.adapters.pg(client)
pg.connect((err) => {
  // do something
})
```

This adapter can optionally take debugFn function as a parameter. This function will receive the processed query before it runs.

### puresql.adapters.test()

Returns a testing adapter. This adapter always returns the parsed SQL query (with parameters replaced by passed values) as a result.

## License

MIT
