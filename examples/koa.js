'use strict';

// We will use koa.js framework here. As it integrates the co-based workflow (along with error catching), there is nothing else to care about.

var koa = require("koa")
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

// Create a simple server
var app = koa()

app.use(function*(){

  // Like sync, but async!
  var rows = yield queries.get_all({}, adapter)
  this.body = JSON.stringify(rows)

})

app.listen(3000)
