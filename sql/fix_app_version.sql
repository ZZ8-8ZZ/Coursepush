-- 修复 app_version 表的索引问题
-- 1. 删除错误的唯一索引 uk_platform_current
-- 该索引错误地限制了每个平台只能有一条 is_current=0 的记录
ALTER TABLE `app_version` DROP INDEX `uk_platform_current`;

-- 2. 添加普通的平台与状态联合索引，用于加速 getLatestVersion 查询
ALTER TABLE `app_version` ADD INDEX `idx_platform_current` (`app_platform`, `is_current`);

-- 3. (可选但推荐) 为平台和版本号添加唯一索引，防止重复录入同一版本
ALTER TABLE `app_version` ADD UNIQUE KEY `uk_platform_version` (`app_platform`, `version_code`);
