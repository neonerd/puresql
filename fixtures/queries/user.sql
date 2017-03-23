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

-- name: get_with_comment
SELECT *
-- here I do something
FROM user
-- another comment
-- breaking comment with name: something
WHERE id IN :ids
