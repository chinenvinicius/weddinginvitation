-- Run this ONCE only if the earlier six-column `submissions` table already exists.
-- New installations should run schema.sql instead.
SET time_zone = '+00:00';
ALTER TABLE submissions
  ADD COLUMN language_code VARCHAR(5) NOT NULL DEFAULT 'en' AFTER photos_json,
  ADD COLUMN consent_to_publish BOOLEAN NOT NULL DEFAULT FALSE AFTER language_code,
  ADD COLUMN reviewed_at TIMESTAMP NULL DEFAULT NULL AFTER status,
  ADD COLUMN approved_at TIMESTAMP NULL DEFAULT NULL AFTER reviewed_at,
  ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP AFTER created_at;

CREATE TABLE IF NOT EXISTS guestbook_settings (
  id TINYINT NOT NULL PRIMARY KEY,
  submissions_open_at TIMESTAMP NULL DEFAULT NULL,
  submissions_close_at TIMESTAMP NULL DEFAULT NULL,
  wall_open_at TIMESTAMP NULL DEFAULT NULL,
  wall_close_at TIMESTAMP NULL DEFAULT NULL,
  auto_approve BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO guestbook_settings
  (id, submissions_open_at, submissions_close_at)
VALUES
  (1, '2026-08-12 00:00:00', '2026-08-13 00:00:00')
ON DUPLICATE KEY UPDATE id = id;
