alter table sync_task
    add column if not exists user_id bigint;

create index if not exists idx_sync_task_user_category
    on sync_task (user_id, sync_category);