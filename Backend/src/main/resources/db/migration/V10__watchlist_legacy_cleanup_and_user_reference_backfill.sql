-- Ensure every existing user has a watchlist row.
insert into watchlist (user_id)
select u.id
from users u
left join watchlist w on w.user_id = u.id
where w.user_id is null;

-- Ensure every existing user has a user_film_reference row.
insert into user_film_reference (user_id)
select u.id
from users u
left join user_film_reference r on r.user_id = u.id
where r.user_id is null;

-- Remove legacy split watchlist tables after migration to watchlist_items.
drop table if exists watchlist_movies;
drop table if exists watchlist_series;
