alter table film
    add column if not exists credits_sync_completed boolean not null default false;

create table if not exists role (
    role_id bigserial primary key,
    role_code varchar(64) not null,
    role_name varchar(128) not null,
    role_group varchar(32) not null,
    constraint uq_role_code unique (role_code),
    constraint chk_role_group check (role_group in ('CAST', 'CREW'))
);

create table if not exists credit (
    credit_id bigint not null,
    name varchar(255) not null,
    department varchar(255),
    profile_path varchar(255),
    primary key (credit_id)
);

create table if not exists film_role (
    id bigserial primary key,
    film_id bigint not null,
    credit_id bigint not null,
    role_id bigint not null,
    character_name varchar(255),
    job_name varchar(255),
    constraint fk_film_role_film foreign key (film_id) references film(internal_id),
    constraint fk_film_role_credit foreign key (credit_id) references credit(credit_id),
    constraint fk_film_role_role foreign key (role_id) references role(role_id),
    constraint uq_film_role unique (film_id, credit_id, role_id)
);

create table if not exists user_credit_weight (
    user_id bigint not null,
    credit_id bigint not null,
    role_id bigint not null,
    weight bigint not null,
    primary key (user_id, credit_id, role_id),
    constraint fk_user_credit_weight_user foreign key (user_id) references user_film_reference(user_id),
    constraint fk_user_credit_weight_credit foreign key (credit_id) references credit(credit_id),
    constraint fk_user_credit_weight_role foreign key (role_id) references role(role_id)
);

create index if not exists idx_role_code on role(role_code);
create index if not exists idx_role_group on role(role_group);
create index if not exists idx_credit_name on credit(name);
create index if not exists idx_film_role_film on film_role(film_id);
create index if not exists idx_film_role_credit on film_role(credit_id);
create index if not exists idx_film_role_role on film_role(role_id);
create index if not exists idx_user_credit_weight_user on user_credit_weight(user_id);
create index if not exists idx_user_credit_weight_credit on user_credit_weight(credit_id);
create index if not exists idx_user_credit_weight_role on user_credit_weight(role_id);

insert into role (role_code, role_name, role_group)
values
    ('CAST', 'Cast', 'CAST'),
    ('DIRECTOR', 'Director', 'CREW'),
    ('CREW', 'Crew', 'CREW')
on conflict (role_code) do update
set role_name = excluded.role_name,
    role_group = excluded.role_group;

insert into credit (credit_id, name)
select d.director_id, d.name
from director d
on conflict (credit_id) do update
set name = excluded.name;

insert into film_role (film_id, credit_id, role_id, job_name)
select df.internal_film_id, df.director_id, r.role_id, 'Director'
from director_film df
join role r on r.role_code = 'DIRECTOR'
on conflict (film_id, credit_id, role_id) do nothing;

insert into user_credit_weight (user_id, credit_id, role_id, weight)
select udw.user_id, udw.director_id, r.role_id, udw.weight
from user_director_weight udw
join role r on r.role_code = 'DIRECTOR'
on conflict (user_id, credit_id, role_id) do update
set weight = excluded.weight;

update film
set credits_sync_completed = true
where director_sync_completed = true;

update sync_task
set sync_category = 'CREDITS'
where sync_category = 'DIRECTOR';
