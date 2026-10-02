-- One shared row per environment; preview button presses never affect the live countdown.
CREATE TABLE IF NOT EXISTS countdown (
  id TEXT PRIMARY KEY CHECK (id IN ('live', 'preview')),
  deadline INTEGER NOT NULL,
  count INTEGER NOT NULL DEFAULT 0 CHECK (count >= 0)
);
