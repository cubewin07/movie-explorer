ALTER TABLE review ADD COLUMN season_number INT DEFAULT NULL;
ALTER TABLE review ADD COLUMN episode_number INT DEFAULT NULL;

ALTER TABLE review ADD CONSTRAINT chk_episode_both 
  CHECK ((season_number IS NULL AND episode_number IS NULL) OR 
         (season_number IS NOT NULL AND episode_number IS NOT NULL));

CREATE INDEX idx_review_film_episode ON review (film_id, type, season_number, episode_number);
