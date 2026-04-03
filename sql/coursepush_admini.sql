/*
 Navicat Premium Data Transfer

 Source Server         : 智能课程表
 Source Server Type    : MySQL
 Source Server Version : 80041 (8.0.41-SQLPub-0.0.1)
 Source Host           : mysql7.sqlpub.com:3312
 Source Schema         : coursepush_admini

 Target Server Type    : MySQL
 Target Server Version : 80041 (8.0.41-SQLPub-0.0.1)
 File Encoding         : 65001

 Date: 03/04/2026 13:11:25
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for app_version
-- ----------------------------
DROP TABLE IF EXISTS `app_version`;
CREATE TABLE `app_version`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `app_platform` tinyint NOT NULL COMMENT '应用平台 1:Android 2:iOS',
  `version_code` int NOT NULL COMMENT '版本编码（用于对比，如1001，数字越大版本越高）',
  `version_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '版本名称（如1.0.1，用户可见）',
  `download_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '安装包下载地址',
  `update_desc` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '更新说明（如修复XXbug、新增XX功能）',
  `is_force` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否强制更新 0:否 1:是',
  `is_current` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否当前最新版本 0:否 1:是',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_platform_version`(`app_platform` ASC, `version_code` ASC) USING BTREE,
  INDEX `idx_platform_version`(`app_platform` ASC, `version_code` ASC) USING BTREE,
  INDEX `idx_platform_current`(`app_platform` ASC, `is_current` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 18 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = 'App版本更新表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of app_version
-- ----------------------------
INSERT INTO `app_version` VALUES (9, 1, 87, '1.5.86', 'http://192.168.9.200:8881/down/dusbgd92NR9T.apk', '本次更新：\n-解决了一些已知问题。', 0, 0, '2026-02-26 01:23:29', '2026-03-01 20:35:35');
INSERT INTO `app_version` VALUES (10, 1, 90, '2.1.24', 'https://d.kstore.dev/download/8556/V2.1.24.apk', '本次更新：\n-解决了一些已知问题。', 0, 0, '2026-03-01 20:35:36', '2026-03-03 00:09:15');
INSERT INTO `app_version` VALUES (14, 1, 91, '2.1.25', 'https://d.kstore.dev/download/8556/v2.1.25.apk', '本次更新：\n-解决了一些已知问题。', 0, 0, '2026-03-03 00:09:16', '2026-03-04 14:15:07');
INSERT INTO `app_version` VALUES (15, 1, 92, '2.2.0', 'https://d.kstore.dev/download/8556/V2.2.0.apk', '本次更新：\n1、更新用户协议和隐私政策\n2、更新Bark推送配置\n3、优化一些已知问题', 0, 0, '2026-03-04 14:15:08', '2026-03-11 12:13:19');
INSERT INTO `app_version` VALUES (17, 1, 93, '2.2.1', 'https://d.kstore.dev/download/8556/V2.2.1.apk', '本次更新：\n-解决了一些已知问题。', 0, 1, '2026-03-11 12:13:20', '2026-03-11 12:13:20');

-- ----------------------------
-- Table structure for bark_settings
-- ----------------------------
DROP TABLE IF EXISTS `bark_settings`;
CREATE TABLE `bark_settings`  (
  `user_id` bigint UNSIGNED NOT NULL,
  `enabled` tinyint(1) NOT NULL DEFAULT 0,
  `bark_key` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `remind_minutes_before` int UNSIGNED NOT NULL DEFAULT 15,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`) USING BTREE,
  CONSTRAINT `fk_bark_settings_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of bark_settings
-- ----------------------------
INSERT INTO `bark_settings` VALUES (1, 0, '4KV6otysJ5Jaoc2D95DYeH', 15, '2026-03-04 13:50:34');
INSERT INTO `bark_settings` VALUES (2, 1, '4KV6otysJ5Jaoc2D95DYeH', 15, '2026-03-29 23:20:41');

-- ----------------------------
-- Table structure for course_tags
-- ----------------------------
DROP TABLE IF EXISTS `course_tags`;
CREATE TABLE `course_tags`  (
  `course_id` bigint UNSIGNED NOT NULL,
  `tag_template_id` bigint UNSIGNED NOT NULL,
  PRIMARY KEY (`course_id`, `tag_template_id`) USING BTREE,
  INDEX `fk_course_tags_template`(`tag_template_id` ASC) USING BTREE,
  CONSTRAINT `fk_course_tags_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_course_tags_template` FOREIGN KEY (`tag_template_id`) REFERENCES `tag_templates` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of course_tags
-- ----------------------------
INSERT INTO `course_tags` VALUES (1, 1);
INSERT INTO `course_tags` VALUES (2, 2);
INSERT INTO `course_tags` VALUES (46, 4);
INSERT INTO `course_tags` VALUES (47, 4);
INSERT INTO `course_tags` VALUES (531, 4);
INSERT INTO `course_tags` VALUES (18, 5);
INSERT INTO `course_tags` VALUES (32, 5);
INSERT INTO `course_tags` VALUES (39, 5);
INSERT INTO `course_tags` VALUES (41, 5);
INSERT INTO `course_tags` VALUES (565, 5);
INSERT INTO `course_tags` VALUES (573, 5);
INSERT INTO `course_tags` VALUES (575, 5);
INSERT INTO `course_tags` VALUES (19, 6);
INSERT INTO `course_tags` VALUES (21, 6);
INSERT INTO `course_tags` VALUES (23, 6);
INSERT INTO `course_tags` VALUES (27, 6);
INSERT INTO `course_tags` VALUES (30, 6);
INSERT INTO `course_tags` VALUES (35, 6);
INSERT INTO `course_tags` VALUES (38, 6);
INSERT INTO `course_tags` VALUES (40, 6);
INSERT INTO `course_tags` VALUES (42, 6);
INSERT INTO `course_tags` VALUES (44, 6);
INSERT INTO `course_tags` VALUES (4, 7);
INSERT INTO `course_tags` VALUES (6, 7);
INSERT INTO `course_tags` VALUES (7, 7);
INSERT INTO `course_tags` VALUES (8, 7);
INSERT INTO `course_tags` VALUES (9, 7);
INSERT INTO `course_tags` VALUES (10, 7);
INSERT INTO `course_tags` VALUES (11, 7);
INSERT INTO `course_tags` VALUES (13, 7);
INSERT INTO `course_tags` VALUES (14, 7);
INSERT INTO `course_tags` VALUES (15, 7);
INSERT INTO `course_tags` VALUES (16, 7);
INSERT INTO `course_tags` VALUES (17, 7);
INSERT INTO `course_tags` VALUES (24, 7);
INSERT INTO `course_tags` VALUES (25, 7);
INSERT INTO `course_tags` VALUES (28, 7);
INSERT INTO `course_tags` VALUES (29, 7);
INSERT INTO `course_tags` VALUES (31, 7);
INSERT INTO `course_tags` VALUES (33, 7);
INSERT INTO `course_tags` VALUES (36, 7);
INSERT INTO `course_tags` VALUES (43, 7);
INSERT INTO `course_tags` VALUES (45, 7);
INSERT INTO `course_tags` VALUES (50, 7);
INSERT INTO `course_tags` VALUES (51, 7);
INSERT INTO `course_tags` VALUES (68, 7);
INSERT INTO `course_tags` VALUES (529, 7);
INSERT INTO `course_tags` VALUES (530, 7);
INSERT INTO `course_tags` VALUES (532, 7);
INSERT INTO `course_tags` VALUES (533, 7);
INSERT INTO `course_tags` VALUES (534, 7);
INSERT INTO `course_tags` VALUES (535, 7);
INSERT INTO `course_tags` VALUES (536, 7);
INSERT INTO `course_tags` VALUES (539, 7);
INSERT INTO `course_tags` VALUES (542, 7);
INSERT INTO `course_tags` VALUES (543, 7);
INSERT INTO `course_tags` VALUES (544, 7);
INSERT INTO `course_tags` VALUES (545, 7);
INSERT INTO `course_tags` VALUES (546, 7);
INSERT INTO `course_tags` VALUES (547, 7);
INSERT INTO `course_tags` VALUES (548, 7);
INSERT INTO `course_tags` VALUES (549, 7);
INSERT INTO `course_tags` VALUES (550, 7);
INSERT INTO `course_tags` VALUES (551, 7);
INSERT INTO `course_tags` VALUES (552, 7);
INSERT INTO `course_tags` VALUES (553, 7);
INSERT INTO `course_tags` VALUES (554, 7);
INSERT INTO `course_tags` VALUES (555, 7);
INSERT INTO `course_tags` VALUES (556, 7);
INSERT INTO `course_tags` VALUES (557, 7);
INSERT INTO `course_tags` VALUES (558, 7);
INSERT INTO `course_tags` VALUES (559, 7);
INSERT INTO `course_tags` VALUES (564, 7);
INSERT INTO `course_tags` VALUES (567, 7);
INSERT INTO `course_tags` VALUES (569, 7);
INSERT INTO `course_tags` VALUES (570, 7);
INSERT INTO `course_tags` VALUES (572, 7);
INSERT INTO `course_tags` VALUES (574, 7);
INSERT INTO `course_tags` VALUES (576, 7);
INSERT INTO `course_tags` VALUES (579, 7);
INSERT INTO `course_tags` VALUES (580, 7);
INSERT INTO `course_tags` VALUES (581, 7);
INSERT INTO `course_tags` VALUES (583, 7);
INSERT INTO `course_tags` VALUES (585, 7);
INSERT INTO `course_tags` VALUES (587, 7);
INSERT INTO `course_tags` VALUES (589, 7);
INSERT INTO `course_tags` VALUES (22, 8);
INSERT INTO `course_tags` VALUES (48, 8);
INSERT INTO `course_tags` VALUES (49, 8);
INSERT INTO `course_tags` VALUES (566, 8);
INSERT INTO `course_tags` VALUES (577, 8);
INSERT INTO `course_tags` VALUES (578, 8);
INSERT INTO `course_tags` VALUES (5, 9);
INSERT INTO `course_tags` VALUES (12, 9);
INSERT INTO `course_tags` VALUES (20, 9);
INSERT INTO `course_tags` VALUES (26, 9);
INSERT INTO `course_tags` VALUES (34, 9);
INSERT INTO `course_tags` VALUES (52, 9);
INSERT INTO `course_tags` VALUES (568, 9);
INSERT INTO `course_tags` VALUES (571, 9);
INSERT INTO `course_tags` VALUES (560, 10);
INSERT INTO `course_tags` VALUES (561, 10);
INSERT INTO `course_tags` VALUES (562, 10);
INSERT INTO `course_tags` VALUES (582, 11);
INSERT INTO `course_tags` VALUES (584, 11);
INSERT INTO `course_tags` VALUES (586, 11);

-- ----------------------------
-- Table structure for courses
-- ----------------------------
DROP TABLE IF EXISTS `courses`;
CREATE TABLE `courses`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint UNSIGNED NOT NULL,
  `semester_id` bigint UNSIGNED NOT NULL,
  `name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `teacher` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `location` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `day_of_week` tinyint UNSIGNED NOT NULL,
  `start_period` tinyint UNSIGNED NOT NULL,
  `end_period` tinyint UNSIGNED NOT NULL,
  `week_pattern` enum('all','odd','even','custom') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'all',
  `week_start` tinyint UNSIGNED NOT NULL DEFAULT 1,
  `week_end` tinyint UNSIGNED NOT NULL DEFAULT 18,
  `tag_type` enum('normal','warning','danger','blue','amber','rose','emerald','violet','indigo','slate','neutral') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'normal',
  `tag_name` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `primary_tag_id` bigint UNSIGNED NULL DEFAULT NULL,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `fk_courses_user`(`user_id` ASC) USING BTREE,
  INDEX `fk_courses_primary_tag`(`primary_tag_id` ASC) USING BTREE,
  INDEX `idx_courses_semester_day`(`semester_id` ASC, `day_of_week` ASC, `start_period` ASC) USING BTREE,
  INDEX `idx_courses_semester_tag`(`semester_id` ASC, `tag_type` ASC) USING BTREE,
  INDEX `idx_courses_week_pattern`(`semester_id` ASC, `week_pattern` ASC, `week_start` ASC, `week_end` ASC) USING BTREE,
  CONSTRAINT `fk_courses_primary_tag` FOREIGN KEY (`primary_tag_id`) REFERENCES `tag_templates` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  CONSTRAINT `fk_courses_semester` FOREIGN KEY (`semester_id`) REFERENCES `semesters` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_courses_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 590 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of courses
-- ----------------------------
INSERT INTO `courses` VALUES (1, 1, 1, '高等数学', '李老师', '教学楼 A-201', 1, 1, 2, 'all', 1, 18, 'normal', '上课', 1, '示例课程，演示提醒扫描', '2026-01-06 16:04:31', '2026-01-06 16:04:31');
INSERT INTO `courses` VALUES (2, 1, 1, '大学英语', '王老师', '教学楼 B-309', 3, 2, 3, 'odd', 1, 17, 'warning', '调课', 2, '仅单周上课', '2026-01-06 16:04:31', '2026-01-06 16:04:31');
INSERT INTO `courses` VALUES (4, 2, 2, '思想道德与法治', '李铭伟', '兴业楼C404', 1, 3, 3, 'all', 1, 20, 'blue', '上课', NULL, NULL, '2026-01-07 00:18:21', '2026-01-07 00:18:21');
INSERT INTO `courses` VALUES (5, 2, 2, '心理健康教育', '张子昆', '兴业楼C404', 1, 5, 6, 'custom', 1, 16, 'rose', '停课', NULL, NULL, '2026-01-07 00:19:49', '2026-01-07 16:27:50');
INSERT INTO `courses` VALUES (6, 2, 2, '高等数学', '何丽琴', '兴业楼C502', 3, 3, 4, 'all', 1, 20, 'blue', '上课', NULL, NULL, '2026-01-07 16:01:09', '2026-01-07 16:01:09');
INSERT INTO `courses` VALUES (7, 2, 2, '体育1-羽毛球+跳绳', '刘嘉晟', '校内体育馆二楼', 4, 3, 4, 'custom', 1, 12, 'blue', '上课', NULL, NULL, '2026-01-07 16:02:18', '2026-01-07 16:13:24');
INSERT INTO `courses` VALUES (8, 2, 2, '程序设计基础', '王燕贞', '学训楼3#303', 4, 5, 6, 'custom', 1, 11, 'blue', '上课', NULL, NULL, '2026-01-07 16:02:52', '2026-01-07 16:11:11');
INSERT INTO `courses` VALUES (9, 2, 2, '程序设计基础', '王燕贞', '学训楼3#303', 4, 7, 8, 'custom', 1, 11, 'blue', '上课', NULL, NULL, '2026-01-07 16:03:08', '2026-01-07 16:14:53');
INSERT INTO `courses` VALUES (10, 2, 2, 'HTML5网页设计', '林洁樱', '学训楼3#301', 5, 1, 2, 'custom', 1, 11, 'blue', '上课', NULL, NULL, '2026-01-07 16:03:44', '2026-01-07 16:10:21');
INSERT INTO `courses` VALUES (11, 2, 2, 'HTML5网页设计', '林洁樱', '学训楼3#301', 5, 3, 4, 'custom', 1, 11, 'blue', '上课', NULL, NULL, '2026-01-07 16:04:02', '2026-01-07 16:17:05');
INSERT INTO `courses` VALUES (12, 2, 2, '心理健康教育', '张子昆', '兴业楼C404', 1, 9, 10, 'all', 1, 20, 'rose', '停课', NULL, NULL, '2026-01-07 16:05:03', '2026-01-07 16:05:03');
INSERT INTO `courses` VALUES (13, 2, 2, '高职公共英语1', '陈美玲', '兴业楼C504', 2, 7, 8, 'custom', 1, 19, 'blue', '上课', NULL, NULL, '2026-01-07 16:05:38', '2026-01-11 19:55:24');
INSERT INTO `courses` VALUES (14, 2, 2, '高职公共英语1', '陈美玲', '线上教室', 3, 9, 10, 'custom', 1, 19, 'blue', '上课', NULL, NULL, '2026-01-07 16:05:59', '2026-01-14 21:05:48');
INSERT INTO `courses` VALUES (15, 2, 2, '形势与政策', '兴业楼C502', '兴业楼C502', 1, 7, 8, 'custom', 14, 17, 'blue', '上课', NULL, NULL, '2026-01-07 16:07:28', '2026-01-07 16:07:28');
INSERT INTO `courses` VALUES (16, 2, 2, '国家安全教育', '林佳宬', '鑫业楼201', 2, 1, 1, 'custom', 15, 16, 'blue', '上课', NULL, NULL, '2026-01-07 16:08:24', '2026-01-07 16:08:24');
INSERT INTO `courses` VALUES (17, 2, 2, '国家安全教育', '林佳宬', '鑫业楼202', 2, 2, 2, 'custom', 15, 16, 'blue', '上课', NULL, NULL, '2026-01-07 16:08:52', '2026-01-07 16:08:52');
INSERT INTO `courses` VALUES (18, 2, 2, 'HTML5网页设计', '林洁樱', '学训楼3#301', 5, 1, 2, 'custom', 12, 12, 'emerald', '调停', NULL, NULL, '2026-01-07 16:10:21', '2026-01-07 16:10:30');
INSERT INTO `courses` VALUES (19, 2, 2, 'HTML5网页设计', '林洁樱', '学训楼3#301', 5, 1, 2, 'custom', 13, 13, 'rose', '活动停课', NULL, NULL, '2026-01-07 16:10:22', '2026-01-07 16:16:21');
INSERT INTO `courses` VALUES (20, 2, 2, '程序设计基础', '王燕贞', '学训楼3#303', 4, 5, 6, 'custom', 12, 12, 'rose', '停课', NULL, NULL, '2026-01-07 16:11:11', '2026-01-07 16:11:17');
INSERT INTO `courses` VALUES (21, 2, 2, '程序设计基础', '王燕贞', '学训楼3#303', 4, 5, 6, 'custom', 13, 13, 'rose', '活动停课', NULL, NULL, '2026-01-07 16:11:11', '2026-01-07 16:13:49');
INSERT INTO `courses` VALUES (22, 2, 2, 'HTML5网页设计', '林洁樱', '学训楼3#301', 2, 5, 6, 'custom', 13, 14, 'amber', '调课', NULL, NULL, '2026-01-07 16:12:48', '2026-01-07 16:12:48');
INSERT INTO `courses` VALUES (23, 2, 2, '体育1-羽毛球+跳绳', '刘嘉晟', '校内体育馆二楼', 4, 3, 4, 'custom', 13, 13, 'rose', '活动停课', NULL, NULL, '2026-01-07 16:13:25', '2026-01-07 16:13:29');
INSERT INTO `courses` VALUES (24, 2, 2, '体育1-羽毛球+跳绳', '刘嘉晟', '校内体育馆二楼', 4, 3, 4, 'custom', 14, 17, 'blue', '上课', NULL, NULL, '2026-01-07 16:13:25', '2026-01-07 16:21:30');
INSERT INTO `courses` VALUES (25, 2, 2, '程序设计基础', '王燕贞', '学训楼3#303', 4, 5, 6, 'custom', 14, 17, 'blue', '上课', NULL, NULL, '2026-01-07 16:13:46', '2026-01-07 16:21:51');
INSERT INTO `courses` VALUES (26, 2, 2, '程序设计基础', '王燕贞', '学训楼3#303', 4, 7, 8, 'custom', 12, 12, 'rose', '停课', NULL, NULL, '2026-01-07 16:14:54', '2026-01-07 16:15:03');
INSERT INTO `courses` VALUES (27, 2, 2, '程序设计基础', '王燕贞', '学训楼3#303', 4, 7, 8, 'custom', 13, 13, 'rose', '活动停课', NULL, NULL, '2026-01-07 16:14:54', '2026-01-07 16:15:08');
INSERT INTO `courses` VALUES (28, 2, 2, '程序设计基础', '王燕贞', '学训楼3#303', 4, 7, 8, 'custom', 14, 17, 'blue', '上课', NULL, NULL, '2026-01-07 16:14:54', '2026-01-07 16:22:34');
INSERT INTO `courses` VALUES (29, 2, 2, 'HTML5网页设计', '林洁樱', '学训楼3#301', 5, 1, 2, 'custom', 14, 17, 'blue', '上课', NULL, NULL, '2026-01-07 16:16:17', '2026-01-07 16:22:49');
INSERT INTO `courses` VALUES (30, 2, 2, 'HTML5网页设计', '林洁樱', '学训楼3#301', 5, 3, 4, 'custom', 13, 13, 'rose', '活动停课', NULL, NULL, '2026-01-07 16:16:42', '2026-01-07 16:16:45');
INSERT INTO `courses` VALUES (31, 2, 2, 'HTML5网页设计', '林洁樱', '学训楼3#301', 5, 3, 4, 'custom', 14, 17, 'blue', '上课', NULL, NULL, '2026-01-07 16:16:42', '2026-01-07 16:23:00');
INSERT INTO `courses` VALUES (32, 2, 2, 'HTML5网页设计', '林洁樱', '学训楼3#301', 5, 3, 4, 'custom', 12, 12, 'emerald', '调停', NULL, NULL, '2026-01-07 16:17:05', '2026-01-07 16:17:14');
INSERT INTO `courses` VALUES (33, 2, 2, '心理健康教育', '张子昆', '兴业楼C404', 1, 5, 6, 'custom', 17, 18, 'blue', '上课', NULL, NULL, '2026-01-07 16:20:24', '2026-01-07 16:20:31');
INSERT INTO `courses` VALUES (34, 2, 2, '心理健康教育', '张子昆', '兴业楼C404', 1, 5, 6, 'custom', 19, 20, 'rose', '停课', NULL, NULL, '2026-01-07 16:20:24', '2026-01-07 16:20:24');
INSERT INTO `courses` VALUES (35, 2, 2, '体育1-羽毛球+跳绳', '刘嘉晟', '校内体育馆二楼', 4, 3, 4, 'custom', 18, 18, 'rose', '活动停课', NULL, NULL, '2026-01-07 16:21:31', '2026-01-07 16:21:34');
INSERT INTO `courses` VALUES (36, 2, 2, '体育1-羽毛球+跳绳', '刘嘉晟', '校内体育馆二楼', 4, 3, 4, 'custom', 19, 20, 'blue', '上课', NULL, NULL, '2026-01-07 16:21:31', '2026-01-07 16:21:31');
INSERT INTO `courses` VALUES (38, 2, 2, '程序设计基础', '王燕贞', '学训楼3#303', 4, 5, 6, 'custom', 18, 18, 'rose', '活动停课', NULL, NULL, '2026-01-07 16:21:51', '2026-01-07 16:22:20');
INSERT INTO `courses` VALUES (39, 2, 2, '程序设计基础', '王燕贞', '学训楼3#303', 4, 5, 6, 'custom', 19, 19, 'emerald', '调停', NULL, NULL, '2026-01-07 16:22:17', '2026-01-07 16:26:33');
INSERT INTO `courses` VALUES (40, 2, 2, '程序设计基础', '王燕贞', '学训楼3#303', 4, 7, 8, 'custom', 18, 18, 'rose', '活动停课', NULL, NULL, '2026-01-07 16:22:34', '2026-01-07 16:22:36');
INSERT INTO `courses` VALUES (41, 2, 2, '程序设计基础', '王燕贞', '学训楼3#303', 4, 7, 8, 'custom', 19, 19, 'emerald', '调停', NULL, NULL, '2026-01-07 16:22:34', '2026-01-07 16:26:36');
INSERT INTO `courses` VALUES (42, 2, 2, 'HTML5网页设计', '林洁樱', '学训楼3#301', 5, 1, 2, 'custom', 18, 18, 'rose', '活动停课', NULL, NULL, '2026-01-07 16:22:50', '2026-01-07 16:23:03');
INSERT INTO `courses` VALUES (43, 2, 2, 'HTML5网页设计', '林洁樱', '学训楼3#301', 5, 1, 2, 'custom', 19, 20, 'blue', '上课', NULL, NULL, '2026-01-07 16:22:50', '2026-01-07 16:22:50');
INSERT INTO `courses` VALUES (44, 2, 2, 'HTML5网页设计', '林洁樱', '学训楼3#301', 5, 3, 4, 'custom', 18, 18, 'rose', '活动停课', NULL, NULL, '2026-01-07 16:23:01', '2026-01-07 16:23:05');
INSERT INTO `courses` VALUES (45, 2, 2, 'HTML5网页设计', '林洁樱', '学训楼3#301', 5, 3, 4, 'custom', 19, 20, 'blue', '上课', NULL, NULL, '2026-01-07 16:23:01', '2026-01-07 16:23:01');
INSERT INTO `courses` VALUES (46, 2, 2, 'HTML5网页设计', '林洁樱', '林洁樱', 7, 1, 2, 'custom', 18, 18, 'blue', '补课', NULL, NULL, '2026-01-07 16:23:39', '2026-01-07 16:23:39');
INSERT INTO `courses` VALUES (47, 2, 2, 'HTML5网页设计', '林洁樱', '学训楼3#301', 7, 3, 4, 'custom', 18, 18, 'blue', '补课', NULL, NULL, '2026-01-07 16:24:09', '2026-01-07 16:24:09');
INSERT INTO `courses` VALUES (48, 2, 2, '程序设计基础', '王燕贞', '学训楼3#303', 3, 5, 6, 'custom', 19, 19, 'amber', '调课', NULL, NULL, '2026-01-07 16:25:43', '2026-01-07 16:25:43');
INSERT INTO `courses` VALUES (49, 2, 2, '程序设计基础', '王燕贞', '学训楼3#303', 3, 7, 8, 'custom', 19, 19, 'amber', '调课', NULL, NULL, '2026-01-07 16:26:04', '2026-01-07 16:26:04');
INSERT INTO `courses` VALUES (50, 2, 2, '程序设计基础', '王燕贞', '学训楼3#303', 4, 5, 6, 'custom', 20, 20, 'blue', '上课', NULL, NULL, '2026-01-07 16:26:22', '2026-01-07 16:26:22');
INSERT INTO `courses` VALUES (51, 2, 2, '程序设计基础', '王燕贞', '学训楼3#303', 4, 7, 8, 'custom', 20, 20, 'blue', '上课', NULL, NULL, '2026-01-07 16:26:30', '2026-01-07 16:26:30');
INSERT INTO `courses` VALUES (52, 2, 2, '高职公共英语1', '陈美玲', '兴业楼C504', 2, 7, 8, 'custom', 20, 20, 'rose', '停课', NULL, NULL, '2026-01-11 19:55:25', '2026-01-11 19:55:32');
INSERT INTO `courses` VALUES (68, 2, 2, '思想道德与法治', '李铭伟', '兴业楼C404', 1, 1, 2, 'all', 1, 20, 'blue', '上课', NULL, NULL, '2026-01-27 22:44:14', '2026-01-27 22:44:14');
INSERT INTO `courses` VALUES (529, 2, 35, '大学数学', '张老师', '教1-200', 1, 1, 2, 'all', 1, 20, 'blue', '上课', 7, NULL, '2026-02-26 14:15:40', '2026-02-26 14:15:40');
INSERT INTO `courses` VALUES (530, 2, 35, '大学语文', '李老师', '教1-200', 2, 1, 2, 'all', 1, 20, 'blue', '上课', 7, NULL, '2026-02-26 14:16:51', '2026-02-26 14:16:51');
INSERT INTO `courses` VALUES (531, 2, 35, '大学英语', '王老师', '教1-200', 3, 3, 4, 'all', 1, 20, 'blue', '补课', 7, NULL, '2026-02-26 14:17:19', '2026-03-05 00:14:23');
INSERT INTO `courses` VALUES (532, 2, 35, '软件开发', '于老师', '教1-200', 4, 1, 2, 'all', 1, 20, 'blue', '上课', 7, NULL, '2026-02-26 14:19:10', '2026-02-26 14:19:10');
INSERT INTO `courses` VALUES (533, 2, 35, '大学物理', '黄老师', '教1-200', 4, 5, 6, 'all', 1, 20, 'blue', '上课', 7, NULL, '2026-02-26 14:20:43', '2026-03-01 03:13:00');
INSERT INTO `courses` VALUES (534, 2, 35, '大学化学', '刘老师', '教1-200', 5, 3, 4, 'all', 1, 20, 'blue', '上课', 7, NULL, '2026-02-26 14:24:34', '2026-02-26 14:24:34');
INSERT INTO `courses` VALUES (535, 2, 35, '思想道德与法治', '黄老师', '教1-200', 1, 7, 7, 'all', 1, 20, 'blue', '上课', 7, NULL, '2026-02-26 14:25:50', '2026-02-26 14:25:50');
INSERT INTO `courses` VALUES (536, 2, 35, '安全教育', '黄老师', '教1-200', 1, 4, 4, 'all', 1, 20, 'blue', '上课', 7, NULL, '2026-02-26 14:26:44', '2026-02-26 14:26:44');
INSERT INTO `courses` VALUES (539, 2, 35, '数据库设计', '徐老师', '实训楼6-509', 6, 1, 2, 'all', 1, 20, 'blue', '上课', 7, NULL, '2026-02-28 21:39:28', '2026-02-28 21:39:28');
INSERT INTO `courses` VALUES (542, 2, 35, '形势与政策', '孙老师', '教1-200', 2, 5, 6, 'all', 1, 20, 'blue', '上课', 7, NULL, '2026-03-01 03:09:51', '2026-03-01 03:09:51');
INSERT INTO `courses` VALUES (543, 2, 35, '历史', '王老师', '教1-200', 7, 5, 6, 'all', 1, 20, 'blue', '上课', 7, NULL, '2026-03-01 20:41:31', '2026-03-01 20:41:31');
INSERT INTO `courses` VALUES (544, 2, 35, 'Windows测试', '测试', '测试', 3, 9, 10, 'all', 1, 20, 'blue', '上课', 7, NULL, '2026-03-04 01:13:37', '2026-03-04 01:13:37');
INSERT INTO `courses` VALUES (545, 2, 41, '图形图像处理', '吴慧君', '学训楼3#303', 2, 1, 2, 'all', 1, 20, 'blue', '上课', 7, NULL, '2026-03-05 12:00:43', '2026-03-05 12:00:43');
INSERT INTO `courses` VALUES (546, 2, 41, '数据库管理与维护', '施玉娟', '学训楼3#301', 1, 1, 2, 'custom', 1, 5, 'blue', '上课', 7, NULL, '2026-03-05 12:00:44', '2026-03-29 21:42:02');
INSERT INTO `courses` VALUES (547, 2, 41, '习近平新时代中国特色社会主义思想概论', '黄淑贞', '兴业楼C503', 3, 1, 2, 'custom', 1, 18, 'blue', '上课', 7, NULL, '2026-03-05 12:00:45', '2026-03-05 12:00:45');
INSERT INTO `courses` VALUES (548, 2, 41, '高职公共英语2', '陈美玲', '兴业楼C404', 1, 3, 4, 'custom', 1, 5, 'blue', '上课', 7, NULL, '2026-03-05 12:00:45', '2026-03-29 21:42:27');
INSERT INTO `courses` VALUES (549, 2, 41, '习近平新时代中国特色社会主义思想概论', '黄淑贞', '兴业楼C503', 3, 3, 3, 'custom', 1, 18, 'blue', '上课', 7, NULL, '2026-03-05 12:00:49', '2026-03-05 12:00:49');
INSERT INTO `courses` VALUES (550, 2, 41, '图形图像处理', '吴慧君', '学训楼3#303', 2, 3, 4, 'all', 1, 20, 'blue', '上课', 7, NULL, '2026-03-05 12:00:49', '2026-03-05 12:00:49');
INSERT INTO `courses` VALUES (551, 2, 41, '军事理论', '王毅鸿', '兴业楼C504', 5, 3, 4, 'odd', 1, 19, 'blue', '上课', 7, NULL, '2026-03-05 12:00:51', '2026-03-13 10:19:42');
INSERT INTO `courses` VALUES (552, 2, 41, '毛泽东思想和中国特色社会主义理论体系概论', '唐秋根', '兴业楼C502', 1, 5, 6, 'custom', 1, 2, 'blue', '上课', 7, NULL, '2026-03-05 12:00:51', '2026-03-15 12:16:46');
INSERT INTO `courses` VALUES (553, 2, 41, '大学美育', '曾茜', '敬业楼B202', 2, 5, 6, 'custom', 1, 18, 'blue', '上课', 7, NULL, '2026-03-05 12:00:52', '2026-03-05 12:00:52');
INSERT INTO `courses` VALUES (554, 2, 41, '形势与政策', '李思明', '兴业楼C402', 1, 7, 8, 'custom', 14, 17, 'blue', '上课', 7, NULL, '2026-03-05 12:00:54', '2026-03-05 12:00:54');
INSERT INTO `courses` VALUES (555, 2, 41, '面向对象程序设计', '王燕贞', '学训楼3#303', 5, 5, 6, 'custom', 1, 2, 'blue', '上课', 7, NULL, '2026-03-05 12:00:54', '2026-03-20 10:58:42');
INSERT INTO `courses` VALUES (556, 2, 41, '数据库管理与维护', '施玉娟', '鑫业楼402', 2, 7, 8, 'custom', 1, 1, 'blue', '上课', 7, NULL, '2026-03-05 12:00:55', '2026-03-10 12:41:36');
INSERT INTO `courses` VALUES (557, 2, 41, '面向对象程序设计', '王燕贞', '学训楼3#303', 5, 7, 8, 'custom', 1, 2, 'blue', '上课', 7, NULL, '2026-03-05 12:00:57', '2026-03-20 10:59:10');
INSERT INTO `courses` VALUES (558, 2, 41, '高职公共英语2', '陈美玲', '线上教室9', 3, 9, 10, 'all', 1, 20, 'blue', '上课', 7, NULL, '2026-03-05 12:00:57', '2026-03-05 12:00:57');
INSERT INTO `courses` VALUES (559, 2, 41, '职业发展与就业指导', '周晓彬', '兴业楼C304', 4, 7, 8, 'custom', 1, 2, 'blue', '上课', 7, NULL, '2026-03-05 12:00:57', '2026-03-18 18:51:45');
INSERT INTO `courses` VALUES (560, 2, 41, '认识实习', '黄毅杰', '实践课', 6, 3, 4, 'all', 1, 19, 'rose', '实践课', 7, NULL, '2026-03-05 12:00:59', '2026-03-20 11:03:39');
INSERT INTO `courses` VALUES (561, 2, 41, '国家安全教育', '林佳宬', '实践课', 6, 1, 2, 'all', 1, 19, 'rose', '实践课', 7, NULL, '2026-03-05 12:00:59', '2026-03-20 11:03:28');
INSERT INTO `courses` VALUES (562, 2, 41, '劳动教育', '林佳宬', '实践课', 6, 5, 6, 'all', 1, 19, 'rose', '实践课', 7, NULL, '2026-03-05 12:01:00', '2026-03-05 20:12:49');
INSERT INTO `courses` VALUES (564, 2, 41, '数据库管理与维护', '施玉娟', '学训楼3#301', 2, 7, 8, 'custom', 3, 18, 'blue', '上课', NULL, NULL, '2026-03-10 12:40:52', '2026-03-12 11:15:06');
INSERT INTO `courses` VALUES (565, 2, 41, '数据库管理与维护', '施玉娟', '鑫业楼402', 2, 7, 8, 'custom', 2, 2, 'emerald', '调停', NULL, NULL, '2026-03-10 12:41:27', '2026-03-10 12:41:27');
INSERT INTO `courses` VALUES (566, 2, 41, '数据库管理与维护', '施玉娟', '学训楼3#301', 4, 5, 6, 'custom', 2, 2, 'amber', '调课', NULL, NULL, '2026-03-10 12:42:53', '2026-03-12 11:18:24');
INSERT INTO `courses` VALUES (567, 2, 41, '军事理论', '王毅鸿', '线上教室', 5, 3, 4, 'even', 1, 19, 'blue', '上课', NULL, NULL, '2026-03-13 10:19:27', '2026-03-13 10:20:22');
INSERT INTO `courses` VALUES (568, 2, 41, '毛泽东思想和中国特色社会主义理论体系概论', '唐秋根', '兴业楼C502', 1, 5, 6, 'custom', 3, 3, 'rose', '停课', NULL, NULL, '2026-03-15 12:16:51', '2026-03-15 12:30:15');
INSERT INTO `courses` VALUES (569, 2, 41, '毛泽东思想和中国特色社会主义理论体系概论', '唐秋根', '兴业楼C502', 1, 5, 6, 'custom', 4, 5, 'blue', '上课', NULL, NULL, '2026-03-15 12:16:54', '2026-03-29 21:43:47');
INSERT INTO `courses` VALUES (570, 2, 41, '琵琶艺术', '林雅萍', '德业楼301', 4, 5, 6, 'custom', 4, 17, 'blue', '上课', NULL, NULL, '2026-03-17 12:48:50', '2026-03-17 12:48:50');
INSERT INTO `courses` VALUES (571, 2, 41, '职业发展与就业指导', '周晓彬', '兴业楼C304', 4, 7, 8, 'custom', 3, 3, 'rose', '停课', NULL, NULL, '2026-03-18 18:51:27', '2026-03-18 18:52:19');
INSERT INTO `courses` VALUES (572, 2, 41, '职业发展与就业指导', '周晓彬', '兴业楼C304', 4, 7, 8, 'custom', 4, 18, 'blue', '上课', NULL, NULL, '2026-03-18 18:51:30', '2026-03-18 18:52:11');
INSERT INTO `courses` VALUES (573, 2, 41, '面向对象程序设计', '王燕贞', '学训楼3#303', 5, 5, 6, 'custom', 3, 3, 'emerald', '调停', NULL, NULL, '2026-03-20 10:58:45', '2026-03-20 10:59:24');
INSERT INTO `courses` VALUES (574, 2, 41, '面向对象程序设计', '王燕贞', '鑫业楼402', 5, 5, 6, 'custom', 4, 4, 'blue', '上课', NULL, NULL, '2026-03-20 10:58:48', '2026-03-26 23:45:31');
INSERT INTO `courses` VALUES (575, 2, 41, '面向对象程序设计', '王燕贞', '学训楼3#303', 5, 7, 8, 'custom', 3, 3, 'emerald', '调停', NULL, NULL, '2026-03-20 10:59:12', '2026-03-20 10:59:30');
INSERT INTO `courses` VALUES (576, 2, 41, '面向对象程序设计', '王燕贞', '鑫业楼402', 5, 7, 8, 'custom', 4, 4, 'blue', '上课', NULL, NULL, '2026-03-20 10:59:15', '2026-03-26 23:46:13');
INSERT INTO `courses` VALUES (577, 2, 41, '面向对象程序设计', '王燕贞', '学训楼3#303', 3, 5, 6, 'custom', 5, 5, 'amber', '调课', NULL, NULL, '2026-03-20 11:00:46', '2026-03-20 11:00:46');
INSERT INTO `courses` VALUES (578, 2, 41, '面向对象程序设计', '王燕贞', '线上教室', 3, 7, 8, 'custom', 5, 5, 'amber', '调课', NULL, NULL, '2026-03-20 11:01:22', '2026-04-01 15:09:21');
INSERT INTO `courses` VALUES (579, 2, 41, '体育2-羽毛球+跳绳', '刘嘉晟', '校内体育馆二楼', 4, 3, 4, 'all', 1, 19, 'blue', '上课', 7, NULL, '2026-03-20 15:09:39', '2026-03-20 15:09:39');
INSERT INTO `courses` VALUES (580, 2, 41, '面向对象程序设计', '王燕贞', '学训楼3#303', 5, 5, 6, 'custom', 5, 18, 'blue', '上课', NULL, NULL, '2026-03-26 23:44:44', '2026-03-26 23:44:44');
INSERT INTO `courses` VALUES (581, 2, 41, '面向对象程序设计', '王燕贞', '学训楼3#303', 5, 7, 8, 'custom', 5, 18, 'blue', '上课', NULL, NULL, '2026-03-26 23:45:56', '2026-03-26 23:45:56');
INSERT INTO `courses` VALUES (582, 2, 41, '数据库管理与维护', '施玉娟', '学训楼3#301', 1, 1, 2, 'custom', 6, 6, 'rose', '节假日停课', NULL, NULL, '2026-03-29 21:42:08', '2026-03-29 21:44:05');
INSERT INTO `courses` VALUES (583, 2, 41, '数据库管理与维护', '施玉娟', '学训楼3#301', 1, 1, 2, 'custom', 7, 19, 'blue', '上课', NULL, NULL, '2026-03-29 21:42:10', '2026-03-29 21:42:10');
INSERT INTO `courses` VALUES (584, 2, 41, '高职公共英语2', '陈美玲', '兴业楼C404', 1, 3, 4, 'custom', 6, 6, 'rose', '节假日停课', NULL, NULL, '2026-03-29 21:42:33', '2026-03-29 21:44:11');
INSERT INTO `courses` VALUES (585, 2, 41, '高职公共英语2', '陈美玲', '鑫业楼202（209）', 1, 3, 4, 'custom', 7, 7, 'blue', '上课', NULL, NULL, '2026-03-29 21:42:36', '2026-04-03 10:53:42');
INSERT INTO `courses` VALUES (586, 2, 41, '毛泽东思想和中国特色社会主义理论体系概论', '唐秋根', '兴业楼C502', 1, 5, 6, 'custom', 6, 6, 'rose', '节假日停课', NULL, NULL, '2026-03-29 21:43:51', '2026-03-29 21:44:18');
INSERT INTO `courses` VALUES (587, 2, 41, '毛泽东思想和中国特色社会主义理论体系概论', '唐秋根', '兴业楼C502', 1, 5, 6, 'custom', 7, 18, 'blue', '上课', NULL, NULL, '2026-03-29 21:43:54', '2026-03-29 21:43:54');
INSERT INTO `courses` VALUES (589, 2, 41, '高职公共英语2', '陈美玲', '兴业楼C404', 1, 3, 4, 'custom', 8, 19, 'blue', '上课', NULL, NULL, '2026-04-03 10:52:50', '2026-04-03 10:52:50');

-- ----------------------------
-- Table structure for notification_logs
-- ----------------------------
DROP TABLE IF EXISTS `notification_logs`;
CREATE TABLE `notification_logs`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint UNSIGNED NOT NULL,
  `course_id` bigint UNSIGNED NULL DEFAULT NULL,
  `status` enum('success','skipped','error') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `detail` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `scheduled_for` datetime NULL DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `fk_notification_logs_course`(`course_id` ASC) USING BTREE,
  INDEX `idx_notification_logs_user`(`user_id` ASC, `created_at` DESC) USING BTREE,
  CONSTRAINT `fk_notification_logs_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  CONSTRAINT `fk_notification_logs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 88 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of notification_logs
-- ----------------------------
INSERT INTO `notification_logs` VALUES (1, 2, 552, 'skipped', '当前周未安排该课程', '1970-01-01 00:00:00', '2026-03-23 23:01:53');
INSERT INTO `notification_logs` VALUES (2, 2, 552, 'skipped', '当前周未安排该课程', '1970-01-01 00:00:00', '2026-03-23 23:01:54');
INSERT INTO `notification_logs` VALUES (3, 2, 568, 'skipped', '当前周未安排该课程', '1970-01-01 00:00:00', '2026-03-23 23:01:55');
INSERT INTO `notification_logs` VALUES (4, 2, 568, 'skipped', '当前周未安排该课程', '1970-01-01 00:00:00', '2026-03-23 23:01:55');
INSERT INTO `notification_logs` VALUES (5, 2, 554, 'skipped', '当前周未安排该课程', '1970-01-01 00:00:00', '2026-03-23 23:01:56');
INSERT INTO `notification_logs` VALUES (6, 2, 554, 'skipped', '当前周未安排该课程', '1970-01-01 00:00:00', '2026-03-23 23:01:56');
INSERT INTO `notification_logs` VALUES (7, 2, 556, 'skipped', '当前周未安排该课程', '1970-01-01 00:00:00', '2026-03-23 23:01:57');
INSERT INTO `notification_logs` VALUES (8, 2, 565, 'skipped', '当前周未安排该课程', '1970-01-01 00:00:00', '2026-03-23 23:01:59');
INSERT INTO `notification_logs` VALUES (9, 2, 556, 'skipped', '当前周未安排该课程', '1970-01-01 00:00:00', '2026-03-23 23:02:00');
INSERT INTO `notification_logs` VALUES (10, 2, 577, 'skipped', '当前周未安排该课程', '1970-01-01 00:00:00', '2026-03-23 23:02:00');
INSERT INTO `notification_logs` VALUES (11, 2, 578, 'skipped', '当前周未安排该课程', '1970-01-01 00:00:00', '2026-03-23 23:02:01');
INSERT INTO `notification_logs` VALUES (12, 2, 565, 'skipped', '当前周未安排该课程', '1970-01-01 00:00:00', '2026-03-23 23:02:01');
INSERT INTO `notification_logs` VALUES (13, 2, 577, 'skipped', '当前周未安排该课程', '1970-01-01 00:00:00', '2026-03-23 23:02:02');
INSERT INTO `notification_logs` VALUES (14, 2, 566, 'skipped', '当前周未安排该课程', '1970-01-01 00:00:00', '2026-03-23 23:02:02');
INSERT INTO `notification_logs` VALUES (15, 2, 578, 'skipped', '当前周未安排该课程', '1970-01-01 00:00:00', '2026-03-23 23:02:04');
INSERT INTO `notification_logs` VALUES (16, 2, 559, 'skipped', '当前周未安排该课程', '1970-01-01 00:00:00', '2026-03-23 23:02:04');
INSERT INTO `notification_logs` VALUES (17, 2, 566, 'skipped', '当前周未安排该课程', '1970-01-01 00:00:00', '2026-03-23 23:02:05');
INSERT INTO `notification_logs` VALUES (18, 2, 571, 'skipped', '当前周未安排该课程', '1970-01-01 00:00:00', '2026-03-23 23:02:06');
INSERT INTO `notification_logs` VALUES (19, 2, 559, 'skipped', '当前周未安排该课程', '1970-01-01 00:00:00', '2026-03-23 23:02:07');
INSERT INTO `notification_logs` VALUES (20, 2, 551, 'skipped', '当前周未安排该课程', '1970-01-01 00:00:00', '2026-03-23 23:02:08');
INSERT INTO `notification_logs` VALUES (21, 2, 571, 'skipped', '当前周未安排该课程', '1970-01-01 00:00:00', '2026-03-23 23:02:08');
INSERT INTO `notification_logs` VALUES (22, 2, 555, 'skipped', '当前周未安排该课程', '1970-01-01 00:00:00', '2026-03-23 23:02:09');
INSERT INTO `notification_logs` VALUES (23, 2, 551, 'skipped', '当前周未安排该课程', '1970-01-01 00:00:00', '2026-03-23 23:02:10');
INSERT INTO `notification_logs` VALUES (24, 2, 573, 'skipped', '当前周未安排该课程', '1970-01-01 00:00:00', '2026-03-23 23:02:11');
INSERT INTO `notification_logs` VALUES (25, 2, 555, 'skipped', '当前周未安排该课程', '1970-01-01 00:00:00', '2026-03-23 23:02:12');
INSERT INTO `notification_logs` VALUES (26, 2, 573, 'skipped', '当前周未安排该课程', '1970-01-01 00:00:00', '2026-03-23 23:02:13');
INSERT INTO `notification_logs` VALUES (27, 2, 557, 'skipped', '当前周未安排该课程', '1970-01-01 00:00:00', '2026-03-23 23:02:13');
INSERT INTO `notification_logs` VALUES (28, 2, 557, 'skipped', '当前周未安排该课程', '1970-01-01 00:00:00', '2026-03-23 23:02:14');
INSERT INTO `notification_logs` VALUES (29, 2, 575, 'skipped', '当前周未安排该课程', '1970-01-01 00:00:00', '2026-03-23 23:02:14');
INSERT INTO `notification_logs` VALUES (30, 2, 575, 'skipped', '当前周未安排该课程', '1970-01-01 00:00:00', '2026-03-23 23:02:16');
INSERT INTO `notification_logs` VALUES (31, 2, 575, 'success', '已推送 16:20 开课提醒 · 学训楼3#303', '2026-03-23 15:02:22', '2026-03-23 23:02:22');
INSERT INTO `notification_logs` VALUES (32, 2, 552, 'skipped', '当前周未安排该课程', '1970-01-01 00:00:00', '2026-03-23 23:03:28');
INSERT INTO `notification_logs` VALUES (33, 2, 568, 'skipped', '当前周未安排该课程', '1970-01-01 00:00:00', '2026-03-23 23:03:29');
INSERT INTO `notification_logs` VALUES (34, 2, 554, 'skipped', '当前周未安排该课程', '1970-01-01 00:00:00', '2026-03-23 23:03:32');
INSERT INTO `notification_logs` VALUES (35, 2, 556, 'skipped', '当前周未安排该课程', '1970-01-01 00:00:00', '2026-03-23 23:03:33');
INSERT INTO `notification_logs` VALUES (36, 2, 565, 'skipped', '当前周未安排该课程', '1970-01-01 00:00:00', '2026-03-23 23:03:35');
INSERT INTO `notification_logs` VALUES (37, 2, 577, 'skipped', '当前周未安排该课程', '1970-01-01 00:00:00', '2026-03-23 23:03:36');
INSERT INTO `notification_logs` VALUES (38, 2, 578, 'skipped', '当前周未安排该课程', '1970-01-01 00:00:00', '2026-03-23 23:03:37');
INSERT INTO `notification_logs` VALUES (39, 2, 566, 'skipped', '当前周未安排该课程', '1970-01-01 00:00:00', '2026-03-23 23:03:39');
INSERT INTO `notification_logs` VALUES (40, 2, 559, 'skipped', '当前周未安排该课程', '1970-01-01 00:00:00', '2026-03-23 23:03:41');
INSERT INTO `notification_logs` VALUES (41, 2, 571, 'skipped', '当前周未安排该课程', '1970-01-01 00:00:00', '2026-03-23 23:03:42');
INSERT INTO `notification_logs` VALUES (42, 2, 551, 'skipped', '当前周未安排该课程', '1970-01-01 00:00:00', '2026-03-23 23:03:44');
INSERT INTO `notification_logs` VALUES (43, 2, 555, 'skipped', '当前周未安排该课程', '1970-01-01 00:00:00', '2026-03-23 23:03:46');
INSERT INTO `notification_logs` VALUES (44, 2, 573, 'skipped', '当前周未安排该课程', '1970-01-01 00:00:00', '2026-03-23 23:03:47');
INSERT INTO `notification_logs` VALUES (45, 2, 557, 'skipped', '当前周未安排该课程', '1970-01-01 00:00:00', '2026-03-23 23:03:48');
INSERT INTO `notification_logs` VALUES (46, 2, 575, 'skipped', '当前周未安排该课程', '1970-01-01 00:00:00', '2026-03-23 23:03:50');
INSERT INTO `notification_logs` VALUES (47, 2, NULL, 'success', '成功向 Bark 推送 [测试] 提醒', '2026-03-29 23:35:00', '2026-03-29 23:15:05');
INSERT INTO `notification_logs` VALUES (48, 2, 582, 'skipped', '当前周未安排该课程', '1970-01-01 00:00:00', '2026-03-29 23:18:41');
INSERT INTO `notification_logs` VALUES (49, 2, 583, 'skipped', '当前周未安排该课程', '1970-01-01 00:00:00', '2026-03-29 23:18:43');
INSERT INTO `notification_logs` VALUES (50, 2, 584, 'skipped', '当前周未安排该课程', '1970-01-01 00:00:00', '2026-03-29 23:18:45');
INSERT INTO `notification_logs` VALUES (51, 2, 585, 'skipped', '当前周未安排该课程', '1970-01-01 00:00:00', '2026-03-29 23:18:47');
INSERT INTO `notification_logs` VALUES (52, 2, 552, 'skipped', '当前周未安排该课程', '1970-01-01 00:00:00', '2026-03-29 23:18:48');
INSERT INTO `notification_logs` VALUES (53, 2, 568, 'skipped', '当前周未安排该课程', '1970-01-01 00:00:00', '2026-03-29 23:18:49');
INSERT INTO `notification_logs` VALUES (54, 2, 586, 'skipped', '当前周未安排该课程', '1970-01-01 00:00:00', '2026-03-29 23:18:50');
INSERT INTO `notification_logs` VALUES (55, 2, 587, 'skipped', '当前周未安排该课程', '1970-01-01 00:00:00', '2026-03-29 23:18:51');
INSERT INTO `notification_logs` VALUES (56, 2, 554, 'skipped', '当前周未安排该课程', '1970-01-01 00:00:00', '2026-03-29 23:18:52');
INSERT INTO `notification_logs` VALUES (57, 2, 556, 'skipped', '当前周未安排该课程', '1970-01-01 00:00:00', '2026-03-29 23:18:54');
INSERT INTO `notification_logs` VALUES (58, 2, 565, 'skipped', '当前周未安排该课程', '1970-01-01 00:00:00', '2026-03-29 23:18:55');
INSERT INTO `notification_logs` VALUES (59, 2, 577, 'skipped', '当前周未安排该课程', '1970-01-01 00:00:00', '2026-03-29 23:18:56');
INSERT INTO `notification_logs` VALUES (60, 2, 578, 'skipped', '当前周未安排该课程', '1970-01-01 00:00:00', '2026-03-29 23:18:59');
INSERT INTO `notification_logs` VALUES (61, 2, 566, 'skipped', '当前周未安排该课程', '1970-01-01 00:00:00', '2026-03-29 23:19:01');
INSERT INTO `notification_logs` VALUES (62, 2, 559, 'skipped', '当前周未安排该课程', '1970-01-01 00:00:00', '2026-03-29 23:19:02');
INSERT INTO `notification_logs` VALUES (63, 2, 571, 'skipped', '当前周未安排该课程', '1970-01-01 00:00:00', '2026-03-29 23:19:03');
INSERT INTO `notification_logs` VALUES (64, 2, 551, 'skipped', '当前周未安排该课程', '1970-01-01 00:00:00', '2026-03-29 23:19:05');
INSERT INTO `notification_logs` VALUES (65, 2, 555, 'skipped', '当前周未安排该课程', '1970-01-01 00:00:00', '2026-03-29 23:19:06');
INSERT INTO `notification_logs` VALUES (66, 2, 573, 'skipped', '当前周未安排该课程', '1970-01-01 00:00:00', '2026-03-29 23:19:07');
INSERT INTO `notification_logs` VALUES (67, 2, 580, 'skipped', '当前周未安排该课程', '1970-01-01 00:00:00', '2026-03-29 23:19:08');
INSERT INTO `notification_logs` VALUES (68, 2, 557, 'skipped', '当前周未安排该课程', '1970-01-01 00:00:00', '2026-03-29 23:19:10');
INSERT INTO `notification_logs` VALUES (69, 2, 575, 'skipped', '当前周未安排该课程', '1970-01-01 00:00:00', '2026-03-29 23:19:12');
INSERT INTO `notification_logs` VALUES (70, 2, 581, 'skipped', '当前周未安排该课程', '1970-01-01 00:00:00', '2026-03-29 23:19:13');
INSERT INTO `notification_logs` VALUES (71, 2, 546, 'success', '成功向 Bark 推送 [数据库管理与维护] 提醒', '2026-03-30 08:00:00', '2026-03-30 07:45:06');
INSERT INTO `notification_logs` VALUES (72, 2, 548, 'success', '成功向 Bark 推送 [高职公共英语2] 提醒', '2026-03-30 09:55:00', '2026-03-30 09:40:05');
INSERT INTO `notification_logs` VALUES (73, 2, 569, 'success', '成功向 Bark 推送 [毛泽东思想和中国特色社会主义理论体系概论] 提醒', '2026-03-30 14:30:00', '2026-03-30 14:15:05');
INSERT INTO `notification_logs` VALUES (74, 2, 545, 'success', '成功向 Bark 推送 [图形图像处理] 提醒', '2026-03-31 08:00:00', '2026-03-31 07:45:05');
INSERT INTO `notification_logs` VALUES (75, 2, 550, 'success', '成功向 Bark 推送 [图形图像处理] 提醒', '2026-03-31 09:55:00', '2026-03-31 09:40:06');
INSERT INTO `notification_logs` VALUES (76, 2, 553, 'success', '成功向 Bark 推送 [大学美育] 提醒', '2026-03-31 14:30:00', '2026-03-31 14:15:05');
INSERT INTO `notification_logs` VALUES (77, 2, 564, 'success', '成功向 Bark 推送 [数据库管理与维护] 提醒', '2026-03-31 16:20:00', '2026-03-31 16:05:08');
INSERT INTO `notification_logs` VALUES (78, 2, 547, 'success', '成功向 Bark 推送 [习近平新时代中国特色社会主义思想概论] 提醒', '2026-04-01 08:00:00', '2026-04-01 07:45:05');
INSERT INTO `notification_logs` VALUES (79, 2, 549, 'success', '成功向 Bark 推送 [习近平新时代中国特色社会主义思想概论] 提醒', '2026-04-01 09:55:00', '2026-04-01 09:40:05');
INSERT INTO `notification_logs` VALUES (80, 2, 577, 'success', '成功向 Bark 推送 [面向对象程序设计] 提醒', '2026-04-01 14:30:00', '2026-04-01 14:15:06');
INSERT INTO `notification_logs` VALUES (81, 2, 578, 'success', '成功向 Bark 推送 [面向对象程序设计] 提醒', '2026-04-01 16:20:00', '2026-04-01 16:05:06');
INSERT INTO `notification_logs` VALUES (82, 2, 558, 'success', '成功向 Bark 推送 [高职公共英语2] 提醒', '2026-04-01 19:00:00', '2026-04-01 18:45:05');
INSERT INTO `notification_logs` VALUES (83, 2, 579, 'success', '成功向 Bark 推送 [体育2-羽毛球+跳绳] 提醒', '2026-04-02 09:55:00', '2026-04-02 09:40:06');
INSERT INTO `notification_logs` VALUES (84, 2, 570, 'success', '成功向 Bark 推送 [琵琶艺术] 提醒', '2026-04-02 14:30:00', '2026-04-02 14:15:06');
INSERT INTO `notification_logs` VALUES (85, 2, 572, 'success', '成功向 Bark 推送 [职业发展与就业指导] 提醒', '2026-04-02 16:20:00', '2026-04-02 16:05:06');
INSERT INTO `notification_logs` VALUES (86, 2, 551, 'success', '成功向 Bark 推送 [军事理论] 提醒', '2026-04-03 09:55:00', '2026-04-03 09:40:05');
INSERT INTO `notification_logs` VALUES (87, 2, 551, 'success', '已推送 09:55 开课提醒 · 兴业楼C504', '2026-04-03 02:59:15', '2026-04-03 10:59:25');

-- ----------------------------
-- Table structure for password_reset_codes
-- ----------------------------
DROP TABLE IF EXISTS `password_reset_codes`;
CREATE TABLE `password_reset_codes`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` bigint UNSIGNED NOT NULL COMMENT '关联用户ID',
  `email` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用户邮箱',
  `verify_code` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '验证码',
  `expire_at` datetime NOT NULL COMMENT '验证码过期时间',
  `is_used` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否使用 0:未使用 1:已使用',
  `ip` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '生成验证码的IP地址，防刷',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '生成时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_email_code`(`email` ASC, `verify_code` ASC, `is_used` ASC) USING BTREE COMMENT '邮箱+验证码+状态，快速查询',
  INDEX `idx_expire_at`(`expire_at` ASC) USING BTREE COMMENT '过期时间索引，便于清理过期验证码',
  INDEX `idx_user_status`(`user_id` ASC, `is_used` ASC) USING BTREE,
  CONSTRAINT `fk_reset_codes_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '密码找回验证码表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of password_reset_codes
-- ----------------------------
INSERT INTO `password_reset_codes` VALUES (3, 2, 'kcb@070701.xyz', '861059', '2026-03-29 03:58:34', 0, '127.0.0.1', '2026-03-29 03:48:36', '2026-03-29 11:48:36');

-- ----------------------------
-- Table structure for semesters
-- ----------------------------
DROP TABLE IF EXISTS `semesters`;
CREATE TABLE `semesters`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint UNSIGNED NOT NULL,
  `semester_name` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_weeks` tinyint UNSIGNED NOT NULL DEFAULT 18,
  `current_week` tinyint UNSIGNED NOT NULL DEFAULT 1,
  `is_active` tinyint(1) NOT NULL DEFAULT 0,
  `status` enum('draft','published','archived') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'published',
  `school_start_date` date NOT NULL DEFAULT '2000-01-01',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_semesters_user_active`(`user_id` ASC, `is_active` DESC) USING BTREE,
  INDEX `idx_semesters_user_name`(`user_id` ASC, `semester_name` ASC) USING BTREE,
  CONSTRAINT `fk_semesters_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 42 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of semesters
-- ----------------------------
INSERT INTO `semesters` VALUES (1, 1, '2026 春季学期', 18, 18, 0, 'published', '2000-01-01', '2026-01-06 16:04:31', '2026-02-10 12:57:39');
INSERT INTO `semesters` VALUES (2, 2, '漳州职业技术学院25软件2班第一学期课程表', 21, 21, 0, 'published', '2025-09-01', '2026-01-07 00:07:28', '2026-03-23 23:00:19');
INSERT INTO `semesters` VALUES (14, 3, 'cs', 18, 1, 0, 'published', '2026-02-08', '2026-02-08 13:40:49', '2026-02-08 14:55:09');
INSERT INTO `semesters` VALUES (16, 3, '测试', 18, 18, 1, 'draft', '2000-01-01', '2026-02-08 13:42:28', '2026-02-26 16:31:29');
INSERT INTO `semesters` VALUES (17, 3, '测试11', 18, 1, 0, 'draft', '2000-01-01', '2026-02-08 13:42:31', '2026-02-08 13:42:31');
INSERT INTO `semesters` VALUES (18, 1, '测试', 20, 4, 1, 'published', '2026-02-10', '2026-02-10 12:57:32', '2026-03-04 13:43:41');
INSERT INTO `semesters` VALUES (34, 6, '2025-2026第二学期', 20, 5, 1, 'published', '2026-03-06', '2026-02-26 03:47:11', '2026-04-02 10:30:01');
INSERT INTO `semesters` VALUES (35, 2, '示例学期1', 20, 6, 0, 'published', '2026-02-25', '2026-02-26 03:49:50', '2026-04-02 00:32:24');
INSERT INTO `semesters` VALUES (36, 8, 'yyy', 20, 1, 1, 'published', '2026-02-26', '2026-02-26 14:17:45', '2026-02-26 14:17:48');
INSERT INTO `semesters` VALUES (41, 2, '第二学期课表', 19, 5, 1, 'published', '2026-03-06', '2026-03-05 11:59:24', '2026-04-03 12:21:03');

-- ----------------------------
-- Table structure for tag_templates
-- ----------------------------
DROP TABLE IF EXISTS `tag_templates`;
CREATE TABLE `tag_templates`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint UNSIGNED NOT NULL,
  `type` enum('normal','warning','danger','blue','amber','rose','emerald','violet','indigo','slate') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'normal',
  `label` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uq_tag_templates_label`(`user_id` ASC, `label` ASC) USING BTREE,
  CONSTRAINT `fk_tag_templates_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 12 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of tag_templates
-- ----------------------------
INSERT INTO `tag_templates` VALUES (1, 1, 'normal', '上课', '常规课程安排', '2026-01-06 16:04:31', '2026-01-06 16:04:31');
INSERT INTO `tag_templates` VALUES (2, 1, 'warning', '调课', '临时调整或考试', '2026-01-06 16:04:31', '2026-01-06 16:04:31');
INSERT INTO `tag_templates` VALUES (3, 1, 'danger', '停课', '停课或请假', '2026-01-06 16:04:31', '2026-01-06 16:04:31');
INSERT INTO `tag_templates` VALUES (4, 2, 'blue', '补课', '', '2026-01-07 00:12:24', '2026-01-07 00:12:24');
INSERT INTO `tag_templates` VALUES (5, 2, 'emerald', '调停', '', '2026-01-07 00:12:51', '2026-01-07 00:12:51');
INSERT INTO `tag_templates` VALUES (6, 2, 'rose', '活动停课', '', '2026-01-07 00:13:07', '2026-01-07 00:13:07');
INSERT INTO `tag_templates` VALUES (7, 2, 'blue', '上课', '', '2026-01-07 00:13:17', '2026-01-07 00:13:17');
INSERT INTO `tag_templates` VALUES (8, 2, 'amber', '调课', '', '2026-01-07 00:13:26', '2026-01-07 00:13:26');
INSERT INTO `tag_templates` VALUES (9, 2, 'rose', '停课', '', '2026-01-07 00:13:41', '2026-01-07 00:13:41');
INSERT INTO `tag_templates` VALUES (10, 2, 'rose', '实践课', '', '2026-03-05 20:11:14', '2026-03-05 20:12:14');
INSERT INTO `tag_templates` VALUES (11, 2, 'rose', '节假日停课', '', '2026-03-29 21:41:21', '2026-03-29 21:41:21');

-- ----------------------------
-- Table structure for time_slots
-- ----------------------------
DROP TABLE IF EXISTS `time_slots`;
CREATE TABLE `time_slots`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint UNSIGNED NOT NULL,
  `period_order` tinyint UNSIGNED NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uq_time_slots_order`(`user_id` ASC, `period_order` ASC) USING BTREE,
  CONSTRAINT `fk_time_slots_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 17 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of time_slots
-- ----------------------------
INSERT INTO `time_slots` VALUES (1, 1, 1, '08:00:00', '08:45:00', '2026-01-06 16:04:31', '2026-01-06 16:04:31');
INSERT INTO `time_slots` VALUES (2, 1, 2, '08:55:00', '09:40:00', '2026-01-06 16:04:31', '2026-01-06 16:04:31');
INSERT INTO `time_slots` VALUES (3, 1, 3, '10:00:00', '10:45:00', '2026-01-06 16:04:31', '2026-01-06 16:04:31');
INSERT INTO `time_slots` VALUES (4, 1, 4, '10:55:00', '11:40:00', '2026-01-06 16:04:31', '2026-01-06 16:04:31');
INSERT INTO `time_slots` VALUES (5, 2, 1, '08:00:00', '08:45:00', '2026-01-07 00:11:48', '2026-02-08 01:04:57');
INSERT INTO `time_slots` VALUES (6, 2, 2, '08:50:00', '09:35:00', '2026-01-07 00:11:48', '2026-01-07 00:11:48');
INSERT INTO `time_slots` VALUES (7, 2, 3, '09:55:00', '10:40:00', '2026-01-07 00:11:48', '2026-01-07 00:11:48');
INSERT INTO `time_slots` VALUES (8, 2, 4, '10:45:00', '11:30:00', '2026-01-07 00:11:48', '2026-01-07 00:11:48');
INSERT INTO `time_slots` VALUES (9, 2, 5, '14:30:00', '15:15:00', '2026-01-07 00:11:49', '2026-01-07 00:11:49');
INSERT INTO `time_slots` VALUES (10, 2, 6, '15:20:00', '16:05:00', '2026-01-07 00:11:49', '2026-01-07 00:11:49');
INSERT INTO `time_slots` VALUES (11, 2, 7, '16:20:00', '17:05:00', '2026-01-07 00:11:49', '2026-01-07 00:11:49');
INSERT INTO `time_slots` VALUES (12, 2, 8, '17:10:00', '17:55:00', '2026-01-07 00:11:50', '2026-01-07 00:11:50');
INSERT INTO `time_slots` VALUES (13, 2, 9, '19:00:00', '19:45:00', '2026-01-07 00:11:50', '2026-01-07 00:11:50');
INSERT INTO `time_slots` VALUES (14, 2, 10, '19:50:00', '20:35:00', '2026-01-07 00:11:50', '2026-01-07 00:11:50');

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `display_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '用户邮箱（可选），用于找回密码/接收通知',
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('user','admin') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'user',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `last_login_at` datetime NULL DEFAULT NULL,
  `uni_push` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT 'UniPush 客户端 CID，用于推送消息',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uq_users_username`(`username` ASC) USING BTREE,
  UNIQUE INDEX `uq_users_email`(`email` ASC) USING BTREE COMMENT '邮箱唯一索引，防止重复注册（NULL值不触发唯一约束）'
) ENGINE = InnoDB AUTO_INCREMENT = 19 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES (1, 'demo_user', '示例管理员', 'demo@coursepush.com', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'admin', 1, '2026-03-04 05:44:44', NULL, '2026-01-06 16:04:31', '2026-03-04 13:44:44');
INSERT INTO `users` VALUES (2, 'admin', '超级管理员', 'kcb@070701.xyz', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'admin', 1, '2026-04-03 04:56:53', 'null', '2026-01-07 00:06:16', '2026-04-03 12:56:53');
INSERT INTO `users` VALUES (3, 'btmb', '测试', NULL, '61b6ebc4e19f566038f40928b389334a2503a7a44be2e4064e0505f9ac2a376d', 'user', 1, '2026-02-26 08:31:24', NULL, '2026-01-27 21:56:22', '2026-03-02 23:32:28');
INSERT INTO `users` VALUES (6, 'Yuj', 'Yuj', NULL, '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'user', 1, '2026-02-25 19:38:18', NULL, '2026-02-26 03:38:06', '2026-03-03 09:10:04');
INSERT INTO `users` VALUES (8, 'yyy', 'yyy', NULL, '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'user', 1, '2026-02-26 06:17:01', NULL, '2026-02-26 14:16:54', '2026-02-26 14:17:01');

SET FOREIGN_KEY_CHECKS = 1;
