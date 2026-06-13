create table if not exists user_recompute_tasks (
    user_id bigint primary key,
    scheduled_at timestamp not null,
    triggered_by varchar(64) not null,
    attempt_count int not null default 0,
    last_error varchar(512),
    updated_at timestamp not null default now(),
    constraint fk_user_recompute_tasks_user foreign key (user_id) references users(id) on delete cascade
);

create index if not exists idx_user_recompute_tasks_scheduled on user_recompute_tasks (scheduled_at);

create table if not exists user_recommendation_snapshot_state (
    user_id bigint primary key,
    active_version bigint not null default 0,
    updated_at timestamp not null default now(),
    constraint fk_user_snapshot_state_user foreign key (user_id) references users(id) on delete cascade
);

create table if not exists user_recommendation_snapshot (
    id bigserial primary key,
    user_id bigint not null,
    snapshot_version bigint not null,
    rank int not null,
    film_internal_id bigint not null,
    tmdb_id bigint not null,
    type varchar(16) not null,
    title varchar(512),
    rating double precision,
    date date,
    background_img varchar(512),
    score double precision not null,
    keyword_score double precision not null,
    genre_score double precision not null,
    language_score double precision not null,
    director_score double precision not null,
    rating_score double precision not null,
    recency_boost double precision not null,
    created_at timestamp not null default now(),

    constraint fk_user_snapshot_user foreign key (user_id) references users(id) on delete cascade,
    constraint fk_user_snapshot_film foreign key (film_internal_id) references film(internal_id) on delete cascade,

    constraint uq_user_snapshot_rank unique (user_id, snapshot_version, rank),
    constraint uq_user_snapshot_film unique (user_id, snapshot_version, film_internal_id)
);

create index if not exists idx_user_snapshot_user_version on user_recommendation_snapshot (user_id, snapshot_version);
create index if not exists idx_user_snapshot_user_version_rank on user_recommendation_snapshot (user_id, snapshot_version, rank);
