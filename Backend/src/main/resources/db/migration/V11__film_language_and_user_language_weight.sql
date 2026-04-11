alter table film
    add column if not exists original_language varchar(16);

create table if not exists user_language_weight (
    user_id bigint not null,
    language_code varchar(16) not null,
    weight bigint not null,
    primary key (user_id, language_code),
    constraint fk_user_language_weight_user foreign key (user_id) references user_film_reference(user_id)
);

create index if not exists idx_user_language_weight_user on user_language_weight (user_id);
create index if not exists idx_user_language_weight_language on user_language_weight (language_code);
