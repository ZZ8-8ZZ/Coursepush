-- 忽略错误，确保旧的唯一约束被删掉
ALTER TABLE password_reset_codes DROP INDEX IF EXISTS uq_user_unused_code;
-- 确保新的普通索引存在
ALTER TABLE password_reset_codes DROP INDEX IF EXISTS idx_user_status;
ALTER TABLE password_reset_codes ADD INDEX idx_user_status (user_id, is_used);