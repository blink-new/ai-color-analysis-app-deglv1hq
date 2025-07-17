-- AI Color Analysis App Database Schema

-- Users table (handled by Blink Auth, but we can store additional data)
CREATE TABLE IF NOT EXISTS user_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  display_name TEXT,
  email TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_admin BOOLEAN DEFAULT FALSE,
  subscription_status TEXT DEFAULT 'free', -- 'free', 'premium'
  total_analyses INTEGER DEFAULT 0
);

-- Color analysis results
CREATE TABLE IF NOT EXISTS color_analyses (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  image_url TEXT NOT NULL,
  skin_tone TEXT NOT NULL,
  season TEXT NOT NULL,
  free_colors TEXT NOT NULL, -- JSON array of ColorResult objects
  premium_colors TEXT, -- JSON array of ColorResult objects (null for free users)
  recommendations TEXT NOT NULL, -- JSON array of strings
  makeup_tips TEXT, -- JSON array of strings
  wardrobe_guide TEXT, -- JSON array of strings
  seasonal_details TEXT, -- JSON object with description, characteristics, avoidColors
  status TEXT DEFAULT 'completed', -- 'processing', 'completed', 'failed'
  processing_time_ms INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_premium_unlocked BOOLEAN DEFAULT FALSE
);

-- Payment records
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  analysis_id TEXT,
  stripe_payment_intent_id TEXT,
  amount INTEGER NOT NULL, -- in cents
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL, -- 'pending', 'succeeded', 'failed', 'canceled'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (analysis_id) REFERENCES color_analyses(id)
);

-- System analytics and monitoring
CREATE TABLE IF NOT EXISTS system_events (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL, -- 'analysis_started', 'analysis_completed', 'analysis_failed', 'payment_succeeded', etc.
  user_id TEXT,
  analysis_id TEXT,
  payment_id TEXT,
  event_data TEXT, -- JSON object with additional event data
  error_message TEXT,
  processing_time_ms INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  ip_address TEXT,
  user_agent TEXT
);

-- Error logs
CREATE TABLE IF NOT EXISTS error_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  error_type TEXT NOT NULL,
  error_message TEXT NOT NULL,
  stack_trace TEXT,
  page_url TEXT,
  user_agent TEXT,
  severity TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  additional_data TEXT, -- JSON object
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at DATETIME,
  resolved_by TEXT
);

-- Performance metrics
CREATE TABLE IF NOT EXISTS performance_metrics (
  id TEXT PRIMARY KEY,
  metric_name TEXT NOT NULL,
  metric_value REAL NOT NULL,
  metric_unit TEXT DEFAULT 'ms', -- 'ms', 'bytes', 'count', etc.
  user_id TEXT,
  session_id TEXT,
  page_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User feedback and ratings
CREATE TABLE IF NOT EXISTS user_feedback (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  analysis_id TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback_text TEXT,
  feedback_type TEXT DEFAULT 'general', -- 'general', 'bug_report', 'feature_request'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'open', -- 'open', 'reviewed', 'resolved'
  admin_response TEXT,
  responded_at DATETIME,
  responded_by TEXT
);

-- Admin settings and configuration
CREATE TABLE IF NOT EXISTS admin_settings (
  id TEXT PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  setting_type TEXT DEFAULT 'string', -- 'string', 'number', 'boolean', 'json'
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_by TEXT
);

-- Insert default admin settings
INSERT OR IGNORE INTO admin_settings (id, setting_key, setting_value, setting_type, description) VALUES
('set_001', 'analysis_enabled', 'true', 'boolean', 'Enable/disable photo analysis feature'),
('set_002', 'admin_only_mode', 'true', 'boolean', 'Restrict analysis to admin users only'),
('set_003', 'max_file_size_mb', '10', 'number', 'Maximum file size for uploads in MB'),
('set_004', 'supported_formats', '["image/jpeg", "image/jpg", "image/png", "image/webp"]', 'json', 'Supported image formats'),
('set_005', 'premium_price_cents', '999', 'number', 'Premium analysis price in cents'),
('set_006', 'rate_limit_per_hour', '10', 'number', 'Maximum analyses per user per hour'),
('set_007', 'maintenance_mode', 'false', 'boolean', 'Enable maintenance mode'),
('set_008', 'error_logging_enabled', 'true', 'boolean', 'Enable comprehensive error logging');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_color_analyses_user_id ON color_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_color_analyses_created_at ON color_analyses(created_at);
CREATE INDEX IF NOT EXISTS idx_color_analyses_status ON color_analyses(status);

CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);

CREATE INDEX IF NOT EXISTS idx_system_events_event_type ON system_events(event_type);
CREATE INDEX IF NOT EXISTS idx_system_events_user_id ON system_events(user_id);
CREATE INDEX IF NOT EXISTS idx_system_events_created_at ON system_events(created_at);

CREATE INDEX IF NOT EXISTS idx_error_logs_error_type ON error_logs(error_type);
CREATE INDEX IF NOT EXISTS idx_error_logs_severity ON error_logs(severity);
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON error_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_error_logs_resolved ON error_logs(resolved);

CREATE INDEX IF NOT EXISTS idx_performance_metrics_metric_name ON performance_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_created_at ON performance_metrics(created_at);

CREATE INDEX IF NOT EXISTS idx_user_feedback_user_id ON user_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_user_feedback_status ON user_feedback(status);
CREATE INDEX IF NOT EXISTS idx_user_feedback_created_at ON user_feedback(created_at);