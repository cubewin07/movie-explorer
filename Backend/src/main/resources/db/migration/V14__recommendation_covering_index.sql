create index if not exists idx_recommendation_film_recommended
    on recommendation (film_id, recommended_film_id);
