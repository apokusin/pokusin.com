-- One shared row per environment; preview button presses never affect the live countdown.
CREATE TABLE IF NOT EXISTS countdown (
  id TEXT PRIMARY KEY NOT NULL CHECK (id IN ('live', 'preview')),
  deadline INTEGER NOT NULL,
  count INTEGER NOT NULL DEFAULT 0 CHECK (count >= 0)
);

-- Per-minute hashes only: no stored IP addresses or persistent visitor identity.
CREATE TABLE IF NOT EXISTS countdown_reset_limits (
  id TEXT PRIMARY KEY NOT NULL,
  minute INTEGER NOT NULL,
  count INTEGER NOT NULL CHECK (count BETWEEN 1 AND 60)
);
CREATE INDEX IF NOT EXISTS countdown_reset_limits_minute ON countdown_reset_limits (minute);
