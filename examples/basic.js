'use strict';

var mysql = require("mysql")
var puresql = require("../")

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
var queries = puresql.loadQueries(__dirname + "/../fixtures/queries/user.sql")

// do something
queries.get_all({}, adapter)
.then((rows)=>{

  console.log(rows)

})
.catch((error)=>{

  console.log(error)

})

// This is the old school way. Please see 'generators.js' for some ES6 goodness.
