/* global it, describe */
'use strict'

// test stuff
var chai = require('chai')
var chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

var expect = chai.expect

var mysql = require('mysql')

// exported library
var puresql = require('../../index')

// config
// defaults to travis, use test/config.js file to export your own
var config = {
  mysql: {
    host: '127.0.0.1',
    user: 'travis',
    password: '',
    database: 'puresql_test'
  }
}
var localConfig
try {
  localConfig = require('../config')
} catch (error) {
}
if (localConfig !== undefined) config = localConfig

// -- TESTS

// LIBRARY
describe('puresql.adapters.mysql', () => {
  // create a connection the adapter will use
  var connection = mysql.createConnection(config.mysql)
  var adapter = puresql.adapters.mysql(connection)

  it('should escape a string correctly', () => {
    expect(adapter.escape('john')).to.equal("'john'")
    expect(adapter.escape(1)).to.equal('1')
    expect(adapter.escape("john' OR 'michael'")).to.equal("'john\\' OR \\'michael\\''")
  })

  it('should pass the sql injection test cases', () => {
    expect(adapter.escape('john -- \n DROP TABLE users;')).to.equal("'john -- \\n DROP TABLE users;'")
    expect(adapter.escape('0x457578 OR 1=1')).to.equal("'0x457578 OR 1=1'")
    expect(adapter.escape(0x457578)).to.equal("4552056")
  })

  it('should process a query correctly', (done) => {
    adapter.query('SELECT 1 AS foo')
    .then((rows) => {
      expect(rows[0]['foo']).to.equal(1)
      done()
    })
  })

  it('should throw a query error correctly', () => {
    expect(adapter.query('SELECT 1 A foo')).to.be.rejected
  })

  it('should escape an identifier correctly', () => {
    expect(adapter.escapeIdentifier('id')).to.equal('`id`')
  })

})
