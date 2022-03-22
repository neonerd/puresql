# Changelog

## 1.9.0

- added TypeScript definition file (credit to Pedro Prado)
## 1.5.0

- update modifier now correctly escapes identifiers

## 1.4.2

- fixed a problem with comments breaking SQL file parsing
- added a custom error that is thrown if unknown named parameters are passed to a query

## 1.4.1

- fixed a problem with pg adapter both rejecting and resolving at the same time

## 1.4.0

- added the pg (PostgreSQL) adapter
- removed the strict mode and stopped support node 4 / 5

## 1.3.0

- introduced debugging to all adapters
- added mssql adapter to documentation
- corrected some errors in documentation

## 1.2.0

- first fully supported release
- mysql adapter exposes lastInsertId on itself