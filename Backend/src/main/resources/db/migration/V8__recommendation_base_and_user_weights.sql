
create table if not exists genre (
    genre_id bigint not null,
    name varchar(255) not null,
    type varchar(255) not null,
    primary key (genre_id)
);

create table if not exists keyword (
    keyword_id bigint not null,
    name varchar(255) not null,
    type varchar(255) not null,
    primary key (keyword_id)
);

create table if not exists film_genre (
    internal_film_id bigint not null,
    genre_id bigint not null,
    primary key (internal_film_id, genre_id),
    constraint fk_film_genre_film foreign key (internal_film_id) references film(internal_id),
    constraint fk_film_genre_genre foreign key (genre_id) references genre(genre_id)
);

create table if not exists film_keyword (
    internal_film_id bigint not null,
    keyword_id bigint not null,
    primary key (internal_film_id, keyword_id),
    constraint fk_film_keyword_film foreign key (internal_film_id) references film(internal_id),
    constraint fk_film_keyword_keyword foreign key (keyword_id) references keyword(keyword_id)
);

create table if not exists recommendation (
    film_id bigint not null,
    recommended_film_id bigint not null,
    primary key (film_id, recommended_film_id),
    constraint fk_recommendation_film foreign key (film_id) references film(internal_id),
    constraint fk_recommendation_recommended_film foreign key (recommended_film_id) references film(internal_id)
);

create table if not exists user_genre_weight (
    user_id bigint not null,
    genre_id bigint not null,
    weight bigint not null,
    type varchar(255) not null,
    primary key (user_id, genre_id),
    constraint fk_user_genre_weight_user foreign key (user_id) references user_film_reference(user_id),
    constraint fk_user_genre_weight_genre foreign key (genre_id) references genre(genre_id)
);

create table if not exists user_keyword_weight (
    user_id bigint not null,
    keyword_id bigint not null,
    weight bigint not null,
    type varchar(255) not null,
    primary key (user_id, keyword_id),
    constraint fk_user_keyword_weight_user foreign key (user_id) references user_film_reference(user_id),
    constraint fk_user_keyword_weight_keyword foreign key (keyword_id) references keyword(keyword_id)
);

create index if not exists idx_film_genre_genre on film_genre (genre_id);
create index if not exists idx_film_keyword_keyword on film_keyword (keyword_id);
create index if not exists idx_user_genre_weight_user on user_genre_weight (user_id);
create index if not exists idx_user_genre_weight_genre on user_genre_weight (genre_id);
create index if not exists idx_user_keyword_weight_user on user_keyword_weight (user_id);
create index if not exists idx_user_keyword_weight_keyword on user_keyword_weight (keyword_id);
create index if not exists idx_recommendation_film on recommendation (film_id);
create index if not exists idx_recommendation_recommended_film on recommendation (recommended_film_id);
