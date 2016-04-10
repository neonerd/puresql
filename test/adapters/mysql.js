'use strict';

// test stuff
var chai = require('chai')
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

var expect = chai.expect

var mysql = require('mysql')

// exported library
var puresql = require("../../index")

// config
// defaults to travis, use test/config.js file to export your own
var config = {
  mysql : {
    host : '127.0.0.1',
    user : 'travis',
    password : '',
    database : 'puresql_test'
  }
}
var localConfig = undefined
try {
  var localConfig = require("../config")
} catch(error) {
}
if(localConfig != undefined) {config = localConfig;}

// -- TESTS

// LIBRARY
describe('puresql.adapters.mysql', ()=> {

  // create a connection the adapter will use
  var connection = mysql.createConnection(config.mysql)
  var adapter = puresql.adapters.mysql(connection)

  it('should escape a string correctly', ()=>{

    expect(adapter.escape('john')).to.equal("'john'")
    expect(adapter.escape(1)).to.equal("1")
    expect(adapter.escape("john' OR 'michael'")).to.equal("'john\\' OR \\'michael\\''")

  })

  it('should process a query correctly', (done)=>{

    adapter.query("SELECT 1 AS foo")
    .then((rows)=>{
      expect(rows[0]['foo']).to.equal(1)
      done()
    })

  })

  it('should throw a query error correctly', ()=>{

    expect(adapter.query("SELECT 1 A foo")).to.be.rejected

  })

})
