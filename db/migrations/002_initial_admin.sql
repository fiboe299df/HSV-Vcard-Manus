INSERT IGNORE INTO access_allowlist (email, role, enabled, mfa_required)
VALUES ('fiboe02@outlook.de', 'admin', 1, 1);

INSERT IGNORE INTO app_users (email, display_name, role, allowed, mfa_required)
VALUES ('fiboe02@outlook.de', NULL, 'admin', 1, 1);
