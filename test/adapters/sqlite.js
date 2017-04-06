/* global it, describe */
'use strict'

// test stuff
var chai = require('chai')
var chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

var expect = chai.expect

const sqlite = require('sqlite3')

// exported library
var puresql = require('../../index')

// LIBRARY
describe('puresql.adapters.sqlite', () => {
  // create a connection the adapter will use
  const connection = new sqlite.Database(':memory:')
  const adapter = puresql.adapters.sqlite(connection)

  it('should escape a string correctly', () => {
    expect(adapter.escape('john')).to.equal("'john'")
    expect(adapter.escape(1)).to.equal(1)
    expect(adapter.escape("john' OR 'michael'")).to.equal("'john'' OR ''michael'''")
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
    expect(adapter.escapeIdentifier('id')).to.equal('id')
  })

})
