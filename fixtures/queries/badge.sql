-- name: get_by_user
SELECT *
FROM badge
WHERE user_id = :user_id
