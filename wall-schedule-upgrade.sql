-- Run once in TiDB before deploying the wall scheduling controls.
USE weddinginvitation;

ALTER TABLE guestbook_settings
  ADD COLUMN wall_open_at TIMESTAMP NULL DEFAULT NULL AFTER submissions_close_at,
  ADD COLUMN wall_close_at TIMESTAMP NULL DEFAULT NULL AFTER wall_open_at;
