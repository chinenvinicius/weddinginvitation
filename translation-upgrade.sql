USE weddinginvitation;

ALTER TABLE submissions
  ADD COLUMN source_language_code VARCHAR(12) NOT NULL DEFAULT 'unknown' AFTER language_code;

ALTER TABLE submissions
  ADD COLUMN translations_json LONGTEXT NULL;

UPDATE submissions SET translations_json = '{}' WHERE translations_json IS NULL;

ALTER TABLE submissions MODIFY COLUMN translations_json LONGTEXT NOT NULL;

CREATE TABLE IF NOT EXISTS translation_settings (
  id TINYINT NOT NULL PRIMARY KEY,
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  provider VARCHAR(20) NOT NULL DEFAULT 'openrouter',
  model VARCHAR(160) NOT NULL DEFAULT '',
  base_url VARCHAR(500) NOT NULL DEFAULT 'https://ollama.com',
  api_keys_encrypted LONGTEXT NOT NULL,
  key_cursor INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO translation_settings
  (id, enabled, provider, model, base_url, api_keys_encrypted, key_cursor)
VALUES
  (1, FALSE, 'openrouter', '', 'https://ollama.com', '', 0)
ON DUPLICATE KEY UPDATE id = id;
