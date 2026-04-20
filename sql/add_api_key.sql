-- 为 users 表添加 api_key 字段，支持外部 API 调用
ALTER TABLE users ADD COLUMN api_key VARCHAR(64) NULL DEFAULT NULL COMMENT '外部调用 API Key' AFTER uni_push;
ALTER TABLE users ADD UNIQUE KEY uq_users_api_key (api_key);
