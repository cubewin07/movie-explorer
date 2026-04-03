create table if not exists user_film_reference (
    user_id bigint not null,
    primary key (user_id),
    constraint fk_user_film_reference_user foreign key (user_id) references users(id)
);

create table if not exists user_director_weight (
    user_id bigint not null,
    director_id bigint not null,
    weight bigint not null,
    primary key (user_id, director_id),
    constraint fk_user_director_weight_user foreign key (user_id) references user_film_reference(user_id),
    constraint fk_user_director_weight_director foreign key (director_id) references director
);

create index if not exists idx_user_director_weight_user on user_director_weight (user_id);
create index if not exists idx_user_director_weight_director on user_director_weight (director_id);
