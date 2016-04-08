'use strict';

// We will use the co workflow library to handle generators here. Rest remains the same.

var co = require("co")
var mysql = require("mysql")
var puresql = require("../")

// Create a connection the adapter will use
var connection = mysql.createConnection({
  host : '192.168.99.100',
  port : 3307,
  user : 'test',
  password : '',
  database : 'test'
})
// Create the adapter
var adapter = puresql.adapters.mysql(connection)

// Load our queries
var queries = puresql.loadQueries(__dirname + "/../fixtures/queries/user.sql")

// Use our queries in a generator-based workflow
co(function*(){

  // Like sync code, but async!
  var rows = yield queries.get_all({}, adapter)
  console.log(rows)

})
.catch((error)=>{

  console.log(error)

})

// Koa JS framework comes with co-based workflow included. See 'koa.js' for an example.
