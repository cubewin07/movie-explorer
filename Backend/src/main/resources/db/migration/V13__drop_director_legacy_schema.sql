delete from sync_task
where sync_category = 'DIRECTOR';

alter table film
    drop column if exists director_sync_completed;

drop table if exists user_director_weight;
drop table if exists director_film;
drop table if exists director;
