-- ------------------------------------------------------------
-- Coursepush Admin 数据库初始化脚本
-- 功能：建库、建表、创建约束与示例数据
-- 说明：执行前请根据环境调整数据库名/用户权限
-- ------------------------------------------------------------

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP DATABASE IF EXISTS coursepush_admin;
CREATE DATABASE coursepush_admin
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE coursepush_admin;
SET FOREIGN_KEY_CHECKS = 1;
SET time_zone = '+00:00';

-- ------------------------------------------------------------
-- users：系统账号，按用户隔离所有数据
-- ------------------------------------------------------------
CREATE TABLE users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  username VARCHAR(64) NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  last_login_at DATETIME NULL,
  uni_push VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT 'UniPush 客户端 CID，用于推送消息' ,
  api_key VARCHAR(64) NULL DEFAULT NULL COMMENT '外部调用 API Key',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_username (username),
  UNIQUE KEY uq_users_api_key (api_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- semesters：学期配置，与用户一对多
-- ------------------------------------------------------------
CREATE TABLE semesters (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  semester_name VARCHAR(120) NOT NULL,
  total_weeks TINYINT UNSIGNED NOT NULL DEFAULT 18,
  current_week TINYINT UNSIGNED NOT NULL DEFAULT 1,
  is_active TINYINT(1) NOT NULL DEFAULT 0,
  status ENUM('draft','published','archived') NOT NULL DEFAULT 'published',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_semesters_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT chk_semesters_total_weeks CHECK (total_weeks BETWEEN 1 AND 30),
  CONSTRAINT chk_semesters_current_week CHECK (current_week BETWEEN 1 AND total_weeks)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE INDEX idx_semesters_user_active ON semesters(user_id, is_active DESC);
CREATE INDEX idx_semesters_user_name ON semesters(user_id, semester_name);

-- ------------------------------------------------------------
-- time_slots：节次配置，每个用户自定义
-- ------------------------------------------------------------
CREATE TABLE time_slots (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  period_order TINYINT UNSIGNED NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_time_slots_order (user_id, period_order),
  CONSTRAINT fk_time_slots_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT chk_time_slots_duration CHECK (start_time < end_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- tag_templates：课程标签模板
-- ------------------------------------------------------------
CREATE TABLE tag_templates (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  type ENUM('normal','warning','danger','blue','amber','rose','emerald','violet','indigo','slate') NOT NULL DEFAULT 'normal',
  label VARCHAR(50) NOT NULL,
  description VARCHAR(255) DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_tag_templates_label (user_id, label),
  CONSTRAINT fk_tag_templates_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- courses：课程信息，挂在学期与用户下
-- ------------------------------------------------------------
CREATE TABLE courses (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  semester_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(150) NOT NULL,
  teacher VARCHAR(120) DEFAULT NULL,
  location VARCHAR(120) DEFAULT NULL,
  day_of_week TINYINT UNSIGNED NOT NULL,
  start_period TINYINT UNSIGNED NOT NULL,
  end_period TINYINT UNSIGNED NOT NULL,
  week_pattern ENUM('all','odd','even','custom') NOT NULL DEFAULT 'all',
  week_start TINYINT UNSIGNED NOT NULL DEFAULT 1,
  week_end TINYINT UNSIGNED NOT NULL DEFAULT 18,
  tag_type ENUM('normal','warning','danger','blue','amber','rose','emerald','violet','indigo','slate','neutral') NOT NULL DEFAULT 'normal',
  tag_name VARCHAR(60) DEFAULT NULL,
  primary_tag_id BIGINT UNSIGNED DEFAULT NULL,
  notes TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_courses_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_courses_semester FOREIGN KEY (semester_id)
    REFERENCES semesters(id) ON DELETE CASCADE,
  CONSTRAINT fk_courses_primary_tag FOREIGN KEY (primary_tag_id)
    REFERENCES tag_templates(id) ON DELETE SET NULL,
  CONSTRAINT chk_courses_period CHECK (start_period >= 1 AND start_period <= end_period),
  CONSTRAINT chk_courses_week CHECK (week_start >= 1 AND week_start <= week_end)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE INDEX idx_courses_semester_day ON courses(semester_id, day_of_week, start_period);
CREATE INDEX idx_courses_semester_tag ON courses(semester_id, tag_type);
CREATE INDEX idx_courses_week_pattern ON courses(semester_id, week_pattern, week_start, week_end);

-- ------------------------------------------------------------
-- course_tags：课程-标签多对多关联
-- ------------------------------------------------------------
CREATE TABLE course_tags (
  course_id BIGINT UNSIGNED NOT NULL,
  tag_template_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (course_id, tag_template_id),
  CONSTRAINT fk_course_tags_course FOREIGN KEY (course_id)
    REFERENCES courses(id) ON DELETE CASCADE,
  CONSTRAINT fk_course_tags_template FOREIGN KEY (tag_template_id)
    REFERENCES tag_templates(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- bark_settings：Bark 推送配置（用户一对一）
-- ------------------------------------------------------------
CREATE TABLE bark_settings (
  user_id BIGINT UNSIGNED NOT NULL,
  enabled TINYINT(1) NOT NULL DEFAULT 0,
  bark_key VARCHAR(255) DEFAULT NULL,
  remind_minutes_before INT UNSIGNED NOT NULL DEFAULT 15,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),
  CONSTRAINT fk_bark_settings_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT chk_bark_remind CHECK (remind_minutes_before >= 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- notification_logs：提醒日志
-- ------------------------------------------------------------
CREATE TABLE notification_logs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  course_id BIGINT UNSIGNED NULL,
  status ENUM('success','skipped','error') NOT NULL,
  detail VARCHAR(255) NOT NULL,
  scheduled_for DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_notification_logs_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_notification_logs_course FOREIGN KEY (course_id)
    REFERENCES courses(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE INDEX idx_notification_logs_user ON notification_logs(user_id, created_at DESC);

-- ------------------------------------------------------------
-- app_version：App版本更新表
-- ------------------------------------------------------------
CREATE TABLE `app_version` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `app_platform` tinyint(4) NOT NULL COMMENT '应用平台 1:Android 2:iOS',
  `version_code` int(11) NOT NULL COMMENT '版本编码（用于对比，如1001，数字越大版本越高）',
  `version_name` varchar(50) NOT NULL COMMENT '版本名称（如1.0.1，用户可见）',
  `download_url` varchar(500) NOT NULL COMMENT '安装包下载地址',
  `update_desc` text COMMENT '更新说明（如修复XXbug、新增XX功能）',
  `is_force` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否强制更新 0:否 1:是',
  `is_current` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否当前最新版本 0:否 1:是',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  -- 联合索引：用于加速 getLatestVersion 查询 (不再使用 UNIQUE 约束，防止无法存储多个历史版本)
  INDEX `idx_platform_current` (`app_platform`, `is_current`) USING BTREE,
  -- 唯一索引：防止同一平台录入重复的版本号
  UNIQUE KEY `uk_platform_version` (`app_platform`, `version_code`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='App版本更新表';

-- ------------------------------------------------------------
-- 示例数据：便于前端快速联调
-- ------------------------------------------------------------
START TRANSACTION;

INSERT INTO users (username, display_name, password_hash, last_login_at)
VALUES ('demo_user', '示例管理员', '$2a$10$abcdefghijklmnopqrstuv', NOW());

-- 默认节次
INSERT INTO time_slots (user_id, period_order, start_time, end_time)
VALUES
  (1, 1, '08:00', '08:45'),
  (1, 2, '08:55', '09:40'),
  (1, 3, '10:00', '10:45'),
  (1, 4, '10:55', '11:40');

-- 标签模板
INSERT INTO tag_templates (user_id, type, label, description)
VALUES
  (1, 'normal', '上课', '常规课程安排'),
  (1, 'warning', '调课', '临时调整或考试'),
  (1, 'danger', '停课', '停课或请假');

-- 学期
INSERT INTO semesters (user_id, semester_name, total_weeks, current_week, is_active)
VALUES (1, CONCAT(YEAR(CURDATE()), ' 春季学期'), 18, 5, 1);

-- Bark 配置
INSERT INTO bark_settings (user_id, enabled, bark_key, remind_minutes_before)
VALUES (1, 1, 'BARK_KEY_SAMPLE', 15);

-- 课程
INSERT INTO courses (
  user_id, semester_id, name, teacher, location, day_of_week,
  start_period, end_period, week_pattern, week_start, week_end,
  tag_type, tag_name, primary_tag_id, notes
) VALUES (
  1, 1, '高等数学', '李老师', '教学楼 A-201', 1,
  1, 2, 'all', 1, 18,
  'normal', '上课', 1, '示例课程，演示提醒扫描'
);

INSERT INTO courses (
  user_id, semester_id, name, teacher, location, day_of_week,
  start_period, end_period, week_pattern, week_start, week_end,
  tag_type, tag_name, primary_tag_id, notes
) VALUES (
  1, 1, '大学英语', '王老师', '教学楼 B-309', 3,
  2, 3, 'odd', 1, 17,
  'warning', '调课', 2, '仅单周上课'
);

-- 课程标签关联
INSERT INTO course_tags (course_id, tag_template_id) VALUES
  (1, 1),
  (2, 2);

-- 提醒日志
INSERT INTO notification_logs (user_id, course_id, status, detail, scheduled_for)
VALUES
  (1, 1, 'success', '已向 Bark 推送高等数学提醒', DATE_ADD(NOW(), INTERVAL 15 MINUTE)),
  (1, 2, 'skipped', '单周课程，本周无需推送', NULL);

-- App版本更新表示例数据
-- 插入Android最新版本（1.0.1）
INSERT INTO `app_version` (app_platform, version_code, version_name, download_url, update_desc, is_force, is_current)
VALUES (1, 1001, '1.0.1', 'https://coursepush.com/app/android/1.0.1.apk', '1. 修复登录异常；2. 优化消息推送', 0, 1);
-- 插入iOS最新版本（1.0.0）
INSERT INTO `app_version` (app_platform, version_code, version_name, download_url, update_desc, is_force, is_current)
VALUES (2, 1000, '1.0.0', 'https://apps.apple.com/cn/app/coursepush/id123456789', '初始版本', 0, 1);

COMMIT;

-- ------------------------------------------------------------
-- 视图/额外索引可在后续需求中追加
-- ------------------------------------------------------------
