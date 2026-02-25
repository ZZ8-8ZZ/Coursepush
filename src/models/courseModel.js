import { execute, query, withTransaction } from '../config/database.js';
import { buildUpdateStatement, mapDbRowToCamelCase, mapRows } from './modelUtils.js';
import { CourseTagModel } from './courseTagModel.js';

const courseColumnMap = {
  name: 'name',
  teacher: 'teacher',
  location: 'location',
  dayOfWeek: 'day_of_week',
  startPeriod: 'start_period',
  endPeriod: 'end_period',
  weekPattern: 'week_pattern',
  weekStart: 'week_start',
  weekEnd: 'week_end',
  tagType: 'tag_type',
  tagName: 'tag_name',
  primaryTagId: 'primary_tag_id',
  notes: 'notes',
};

const buildWeekFilterClause = (weekNumber) => {
  if (typeof weekNumber !== 'number') {
    return { clause: '', params: [] };
  }
  const clause = `
    AND (
      c.week_pattern = 'all'
      OR (c.week_pattern = 'odd' AND MOD(?, 2) = 1)
      OR (c.week_pattern = 'even' AND MOD(?, 2) = 0)
      OR (c.week_pattern = 'custom' AND ? BETWEEN c.week_start AND c.week_end)
    )
  `;
  return { clause, params: [weekNumber, weekNumber, weekNumber] };
};

const attachTagIds = async (courses, options = {}) => {
  if (!courses.length) {
    return [];
  }
  const courseIds = courses.map((course) => course.id);
  const placeholders = courseIds.map(() => '?').join(', ');
  const rows = await query(
    `SELECT course_id, tag_template_id FROM course_tags WHERE course_id IN (${placeholders})`,
    courseIds,
    options,
  );
  const tagsByCourseId = rows.reduce((accumulator, row) => {
    if (!accumulator[row.course_id]) {
      accumulator[row.course_id] = [];
    }
    accumulator[row.course_id].push(row.tag_template_id);
    return accumulator;
  }, {});
  return courses.map((course) => ({
    ...course,
    tagTemplateIds: tagsByCourseId[course.id] ?? [],
  }));
};

export class CourseModel {
  static async findById(courseId, options = {}) {
    const rows = await query('SELECT * FROM courses WHERE id = ? LIMIT 1', [courseId], options);
    if (!rows.length) {
      return null;
    }
    const course = mapDbRowToCamelCase(rows[0]);
    const tagTemplateIds = await CourseTagModel.listTagIdsForCourse(courseId, options);
    return { ...course, tagTemplateIds };
  }

  static async listBySemester({ semesterId, userId, weekNumber, tagType }, options = {}) {
    const params = [semesterId];
    let whereClause = 'WHERE c.semester_id = ?';
    if (userId) {
      whereClause += ' AND c.user_id = ?';
      params.push(userId);
    }
    if (tagType && tagType !== 'all') {
      whereClause += ' AND c.tag_type = ?';
      params.push(tagType);
    }
    const { clause: weekClause, params: weekParams } = buildWeekFilterClause(weekNumber);
    const sql = `
      SELECT c.*
      FROM courses c
      ${whereClause}
      ${weekClause}
      ORDER BY c.day_of_week ASC, c.start_period ASC
    `;
    const rows = await query(sql, [...params, ...weekParams], options);
    const courses = mapRows(rows);
    return attachTagIds(courses, options);
  }

  static async createCourse(payload) {
    return withTransaction(async (connection) => {
      const sql = `
        INSERT INTO courses (
          user_id, semester_id, name, teacher, location,
          day_of_week, start_period, end_period,
          week_pattern, week_start, week_end,
          tag_type, tag_name, primary_tag_id, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const result = await execute(
        sql,
        [
          payload.userId,
          payload.semesterId,
          payload.name,
          payload.teacher ?? null,
          payload.location ?? null,
          payload.dayOfWeek,
          payload.startPeriod,
          payload.endPeriod,
          payload.weekPattern ?? 'all',
          payload.weekStart ?? 1,
          payload.weekEnd ?? payload.weekStart ?? 18,
          payload.tagType ?? 'normal',
          payload.tagName ?? null,
          payload.primaryTagId ?? null,
          payload.notes ?? null,
        ],
        { connection },
      );
      if (Array.isArray(payload.tagTemplateIds)) {
        await CourseTagModel.replaceCourseTags(result.insertId, payload.tagTemplateIds, { connection });
      }
      return this.findById(result.insertId, { connection });
    });
  }

  static async updateCourse(courseId, payload) {
    return withTransaction(async (connection) => {
      const mutablePayload = { ...payload };
      delete mutablePayload.tagTemplateIds;
      if (Object.keys(mutablePayload).length > 0) {
        const { clause, values } = buildUpdateStatement(mutablePayload, courseColumnMap);
        const sql = `UPDATE courses SET ${clause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
        await execute(sql, [...values, courseId], { connection });
      }
      if (Array.isArray(payload.tagTemplateIds)) {
        await CourseTagModel.replaceCourseTags(courseId, payload.tagTemplateIds, { connection });
      }
      return this.findById(courseId, { connection });
    });
  }

  static async deleteCourse(courseId, options = {}) {
    await execute('DELETE FROM courses WHERE id = ?', [courseId], options);
  }
}
