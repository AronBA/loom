-- Indexes to speed up filtered/sorted log queries
CREATE INDEX idx_logs_timestamp ON logs (timestamp DESC);
CREATE INDEX idx_logs_level     ON logs (level);
CREATE INDEX idx_logs_source    ON logs (source);
