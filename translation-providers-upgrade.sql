USE weddinginvitation;

CREATE TABLE IF NOT EXISTS translation_providers (
  provider VARCHAR(20) NOT NULL PRIMARY KEY,
  model VARCHAR(160) NOT NULL DEFAULT '',
  base_url VARCHAR(500) NOT NULL DEFAULT '',
  api_keys_encrypted LONGTEXT NOT NULL,
  key_cursor INT NOT NULL DEFAULT 0,
  priority INT NOT NULL DEFAULT 1,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX translation_providers_priority (enabled, priority)
);

INSERT INTO translation_providers
  (provider, model, base_url, api_keys_encrypted, key_cursor, priority, enabled)
SELECT provider, model, base_url, api_keys_encrypted, key_cursor, 1, TRUE
FROM translation_settings
WHERE id = 1 AND model <> '' AND api_keys_encrypted <> ''
ON DUPLICATE KEY UPDATE provider = provider;
