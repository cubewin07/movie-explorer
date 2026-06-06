alter table film
    add column if not exists enrichment_status varchar(32) not null default 'PENDING';

alter table film
    add column if not exists lease_expires_at timestamp;

alter table film
    add column if not exists enriched_at timestamp;

-- Phase 3 models film enrichment as one film-level task. Legacy `sync_task` still stores
-- recommendation-ingestion retries, but enrichment uses a single ENRICHMENT row per film
-- instead of separate CREDITS/KEYWORD/GENRE worker rows.
delete from sync_task
where sync_category in ('CREDITS', 'KEYWORD', 'GENRE');

update film
set enrichment_status = 'DONE',
    lease_expires_at = null,
    enriched_at = coalesce(enriched_at, now())
where credits_sync_completed = true
  and keyword_sync_completed = true
  and genre_sync_completed = true;

create index if not exists idx_film_enrichment_status_lease
    on film (enrichment_status, lease_expires_at);
