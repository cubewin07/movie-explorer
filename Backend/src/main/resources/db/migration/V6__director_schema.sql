create table if not exists director (
    director_id bigint not null,
    name varchar(255) not null,
    primary key (director_id)
);

create index if not exists idx_director_name on director (name);

create table if not exists director_film (
    director_id bigint not null,
    internal_film_id bigint not null,
    primary key (director_id, internal_film_id),
    constraint fk_director_film_director foreign key (director_id) references director,
    constraint fk_director_film_film foreign key (internal_film_id) references film
);

create index if not exists idx_director_film_film on director_film (internal_film_id);