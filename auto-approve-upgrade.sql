-- Run once because guestbook_settings already exists in TiDB.
USE weddinginvitation;

ALTER TABLE guestbook_settings
  ADD COLUMN auto_approve BOOLEAN NOT NULL DEFAULT FALSE AFTER submissions_close_at;
