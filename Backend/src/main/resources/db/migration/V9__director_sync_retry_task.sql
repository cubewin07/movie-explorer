alter table film
    add column if not exists director_sync_completed boolean not null default false;

create table if not exists director_sync_task (
    id bigserial primary key,
    film_internal_id bigint not null,
    tmdb_id bigint not null,
    status varchar(32) not null,
    attempts integer not null default 0,
    max_attempts integer not null default 8,
    next_retry_at timestamptz,
    last_error_code varchar(64),
    last_error_message varchar(1000),
    constraint fk_director_sync_task_film foreign key (film_internal_id) references film (internal_id),
    constraint uq_director_sync_task_film unique (film_internal_id)
);

create index if not exists idx_director_sync_task_status_next_retry
    on director_sync_task (status, next_retry_at);
