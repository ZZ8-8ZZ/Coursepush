USE coursepush_admin;
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. 给users表新增邮箱字段（改为可选，NULL）
ALTER TABLE users
ADD COLUMN email VARCHAR(128) NULL COMMENT '用户邮箱（可选），用于找回密码/接收通知' AFTER display_name,
ADD UNIQUE KEY uq_users_email (email) COMMENT '邮箱唯一索引，防止重复注册（NULL值不触发唯一约束）';

-- 2. 新建密码找回验证码表（适配邮箱可选场景）
CREATE TABLE IF NOT EXISTS password_reset_codes (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  user_id BIGINT UNSIGNED NOT NULL COMMENT '关联用户ID',
  email VARCHAR(128) NOT NULL COMMENT '用户邮箱',
  verify_code VARCHAR(16) NOT NULL COMMENT '验证码',
  expire_at DATETIME NOT NULL COMMENT '验证码过期时间',
  is_used TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否使用 0:未使用 1:已使用',
  ip VARCHAR(64) DEFAULT NULL COMMENT '生成验证码的IP地址，防刷',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '生成时间',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (id),
  UNIQUE KEY uq_user_unused_code (user_id, is_used) COMMENT '同一用户只能有一个未使用的验证码',
  KEY idx_email_code (email, verify_code, is_used) COMMENT '邮箱+验证码+状态，快速查询',
  KEY idx_expire_at (expire_at) COMMENT '过期时间索引，便于清理过期验证码',
  CONSTRAINT fk_reset_codes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT '密码找回验证码表';

-- 3. 更新原有示例数据的邮箱（可选，也可设为NULL）
UPDATE users SET email = 'demo@coursepush.com' WHERE username = 'demo_user';

SET FOREIGN_KEY_CHECKS = 1;