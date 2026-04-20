import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { BarkService } from '../services/barkService.js';
import { NotificationLogModel } from '../models/notificationLogModel.js';

/**
 * CoursePush 课程提醒脚本 (适配青龙面板)
 * 
 * 功能：
 * 1. 自动扫描所有开启了 Bark 提醒的用户
 * 2. 根据用户设定的“提前提醒分钟数”进行精准推送
 * 3. 自动识别单双周、课程节次时间
 * 
 * 建议 Cron 配置: * * * * * (每分钟执行一次)
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 优先加载 .env 文件（本地测试）
dotenv.config({ path: path.join(__dirname, '../../.env') });

// 如果环境中没有 DB_NAME，说明 .env 未加载且系统环境也没配，这里再次打印调试
if (!process.env.DB_NAME) {
  console.log('[DEBUG] 环境变量 DB_NAME 未检测到，将使用默认配置。');
}

import { query, getPool } from '../config/database.js';

async function checkAndSendReminders() {
  const now = new Date();
  // 转换为北京时间 (UTC+8)
  const nowBeijing = new Date(now.getTime() + (8 * 60 * 60 * 1000));
  const dateStr = nowBeijing.toLocaleString('zh-CN', { timeZone: 'UTC' });
  
  console.log(`[${dateStr}] 开始课程提醒扫描...`);

  try {
    // 1. 获取所有开启了提醒的用户
    const activeUsers = await query(`
      SELECT u.id, u.display_name, b.bark_key, b.remind_minutes_before
      FROM users u
      JOIN bark_settings b ON u.id = b.user_id
      WHERE b.enabled = 1 AND b.bark_key IS NOT NULL
    `);

    if (activeUsers.length === 0) {
      console.log('当前没有需要处理的活跃用户。');
      return;
    }

    const dayOfWeek = nowBeijing.getUTCDay() === 0 ? 7 : nowBeijing.getUTCDay(); // 1-7
    const currentTimeStr = nowBeijing.getUTCHours().toString().padStart(2, '0') + ':' + 
                         nowBeijing.getUTCMinutes().toString().padStart(2, '0');
    const todayDateStr = nowBeijing.toISOString().split('T')[0];

    for (const user of activeUsers) {
      // 2. 获取该用户当前激活的学期
      const semesters = await query(`
        SELECT id, current_week 
        FROM semesters 
        WHERE user_id = ? AND is_active = 1 
        LIMIT 1
      `, [user.id]);

      if (semesters.length === 0) continue;
      const { id: semesterId, current_week: currentWeek } = semesters[0];

      // 3. 查找该用户今天的课程及对应的开始时间 (仅推送上课、调课、补课)
        // 4. 查询该用户今天的课程（上课、调课、补课）
        const courses = await query(`
        SELECT c.id, c.name, c.location, c.teacher, ts.start_time, ts.end_time
        FROM courses c
        JOIN time_slots ts ON c.user_id = ts.user_id AND c.start_period = ts.period_order
        WHERE c.user_id = ? 
          AND c.semester_id = ? 
          AND c.day_of_week = ?
          AND c.tag_name IN ('上课', '调课', '补课')
          AND (
            c.week_pattern = 'all'
            OR (c.week_pattern = 'odd' AND MOD(?, 2) = 1)
            OR (c.week_pattern = 'even' AND MOD(?, 2) = 0)
            OR (c.week_pattern = 'custom' AND ? BETWEEN c.week_start AND c.week_end)
          )
      `, [user.id, semesterId, dayOfWeek, currentWeek, currentWeek, currentWeek]);

      for (const course of courses) {
        // 4. 计算并匹配提醒时间
        const [startHour, startMin] = course.start_time.split(':').map(Number);
        const courseStartTime = new Date(nowBeijing);
        courseStartTime.setUTCHours(startHour, startMin, 0, 0);

        // 计算用户设定的提醒时间点
        const remindTime = new Date(courseStartTime.getTime() - (user.remind_minutes_before * 60 * 1000));
        const remindTimeStr = remindTime.getUTCHours().toString().padStart(2, '0') + ':' + 
                            remindTime.getUTCMinutes().toString().padStart(2, '0');

        if (currentTimeStr === remindTimeStr) {
          // 5. 防重复检查：确保今天此课程未发送过成功提醒
          const sentLogs = await query(`
            SELECT id FROM notification_logs 
            WHERE user_id = ? AND course_id = ? AND DATE(created_at) = ? AND status = 'success'
            LIMIT 1
          `, [user.id, course.id, todayDateStr]);

          if (sentLogs.length === 0) {
            console.log(`命中提醒：用户 [${user.display_name}] 的课程 [${course.name}]`);
            
            const title = `即将开始：${course.name}`;
            const startTimeNoSec = course.start_time.slice(0, 5);
            const endTimeNoSec = course.end_time.slice(0, 5);
            const body = `时间：${startTimeNoSec}-${endTimeNoSec}\n地点：${course.location || '见详情'}\n教师：${course.teacher || '未填'}`;
            
            try {
              // 发送 Bark 推送
              await BarkService.sendPush(user.bark_key, title, body, {
                group: 'CoursePush',
                icon: 'https://kcbty.070701.xyz/unpackage/res/icons/1024x1024.png',
                sound: 'calypso'
              });

              // 记录日志
              await NotificationLogModel.createLog({
                userId: user.id,
                courseId: course.id,
                status: 'success',
                detail: `成功向 Bark 推送 [${course.name}] 提醒`,
                scheduledFor: courseStartTime.toISOString().replace('T', ' ').substring(0, 19)
              });
              console.log(`[SUCCESS] 已发送提醒至用户 ${user.display_name}`);
            } catch (err) {
              await NotificationLogModel.createLog({
                userId: user.id,
                courseId: course.id,
                status: 'error',
                detail: `推送失败: ${err.message}`,
                scheduledFor: courseStartTime.toISOString().replace('T', ' ').substring(0, 19)
              });
              console.error(`[ERROR] 发送提醒失败: ${course.name}`, err);
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('[FATAL ERROR] 提醒脚本执行异常:', error);
  } finally {
    // 释放数据库连接池
    const pool = getPool();
    await pool.end();
  }
}

// 执行脚本
checkAndSendReminders();
