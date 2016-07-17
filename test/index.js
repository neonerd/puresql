/* global it, describe */
'use strict'

// test stuff
var chai = require('chai')
var expect = chai.expect

// exported library
var puresql = require('../index')

// single components
var queryFactory = require('../lib/query')
var parser = require('../lib/parser')
var file = require('../lib/file')

// testing adapter
var adapter = puresql.adapters.test()

// -- TEST CONSTANTS
const FILE_SQL_MULTIPLE = __dirname + '/../fixtures/queries/user.sql'
const FILE_SQL_SINGLE = __dirname + '/../fixtures/queries/single.sql'
const FILE_SQL_WRONG = __dirname + '/../fixtures/queries/wrong.sql'

// -- TESTS

// LIBRARY
describe('puresql', () => {
  it('should return a properly working function when defining a query manually', (done) => {
    let query = puresql.defineQuery('SELECT * FROM user')
    expect(query).to.be.a('function')
    query({}, adapter)
    .then((result) => {
      expect(result).to.equal('SELECT * FROM user')
      done()
    })
  })

  it('should return an object of properly working functions when loading queries from file', (done) => {
    let queries = puresql.loadQueries(FILE_SQL_MULTIPLE)
    expect(queries).to.be.an('object')
    expect(queries.get_by_id).to.be.a('function')
    queries.get_all({}, adapter)
    .then((result) => {
      expect(result).to.equal('SELECT * FROM user')
      done()
    })
  })
})

// QUERY PARSER
describe('query parser', () => {
  it('should process unparametrized SQL correctly', () => {
    expect(
      parser.parseQuery({}, 'SELECT * FROM user', adapter)
    ).to.equal('SELECT * FROM user')
  })

  it('should process named parameters correctly', () => {
    expect(
      parser.parseQuery({id: 1}, 'SELECT * FROM user WHERE id = :id', adapter)
    ).to.equal('SELECT * FROM user WHERE id = 1')
  })

  it('should process anonymous parameters correctly', () => {
    expect(
      parser.parseQuery({'?': [1, 2]}, 'SELECT * FROM user WHERE id = :? OR id = :?', adapter)
    ).to.equal('SELECT * FROM user WHERE id = 1 OR id = 2')
  })

  it('should process array parameter correctly', () => {
    expect(
      parser.parseQuery({ids: [1, 2, 3, 4]}, 'SELECT * FROM user WHERE id IN :ids', adapter)
    ).to.equal('SELECT * FROM user WHERE id IN (1, 2, 3, 4)')
  })

  it('should process recursive array parameter correctly', () => {
    expect(
      parser.parseQuery({users: [['john', 'doe'], ['foo', 'bar']]}, 'INSERT INTO user (name, surname) VALUES :users', adapter)
    ).to.equal('INSERT INTO user (name, surname) VALUES (john, doe), (foo, bar)')
  })

  it('should throw an error when passing wrong number of named parameters', () => {
    expect(() => {
      parser.parseQuery({id: 1}, 'SELECT * FROM user WHERE id = :id AND rights = :rights', adapter)
    }).to.throw()
  })

  it('should throw an error when passing wrong number of anonymous parameters', () => {
    expect(() => {
      parser.parseQuery({'?': [1]}, 'SELECT * FROM user WHERE id = :? AND rights = :?', adapter)
    }).to.throw()
  })
})

// FILE PARSER
describe('file parser', () => {
  it('should process multiple command file correctly', () => {
    let queries = file.parseFile(FILE_SQL_MULTIPLE)

    expect(queries).to.be.an('object')
    expect(queries.get_by_id).to.equal('SELECT * FROM user WHERE id = :id')
    expect(queries.get_all).to.equal('SELECT * FROM user')
  })

  it('should process single command file correctly', () => {
    let queries = file.parseFile(FILE_SQL_SINGLE)
    expect(queries).to.be.an('object')
    expect(queries.single).to.equal('SELECT * FROM user')
  })

  it('should throw an error with improperly formatted file', () => {
    expect(() => file.parseFile(FILE_SQL_WRONG)).to.throw(Error)
  })
})

// QUERY FACTORY
describe('query factory', () => {
  it('should return a promisied function', () => {
    let query = queryFactory.makeQuery('SELECT * FROM user')
    expect(query).to.be.a('function')
  })

  it('should return a funtion that fail if adapter is not provided', () => {
    let query = queryFactory.makeQuery('SELECT * FROM user')
    expect(() => {
      query({})
    }).to.throw()
  })
})
