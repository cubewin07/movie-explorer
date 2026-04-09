alter table film
    add column if not exists director_sync_completed boolean not null default false;

alter table film
    add column if not exists keyword_sync_completed boolean not null default false;

alter table film
    add column if not exists genre_sync_completed boolean not null default false;

alter table film
    add column if not exists recommendation_sync_completed boolean not null default false;

create table if not exists sync_task (
    id bigserial primary key,
    film_internal_id bigint not null,
    tmdb_id bigint not null,
    sync_category varchar(32) not null,
    status varchar(32) not null,
    attempts integer not null default 0,
    max_attempts integer not null default 8,
    next_retry_at timestamptz,
    last_error_code varchar(64),
    last_error_message varchar(1000),
    constraint fk_sync_task_film foreign key (film_internal_id) references film (internal_id),
    constraint uq_sync_task_film_category unique (film_internal_id, sync_category)
);

create index if not exists idx_sync_task_status_next_retry
    on sync_task (status, next_retry_at);
