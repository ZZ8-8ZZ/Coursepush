import { execute, query } from '../config/database.js';

export class CourseTagModel {
  static async listTagIdsForCourse(courseId, options = {}) {
    const rows = await query('SELECT tag_template_id FROM course_tags WHERE course_id = ?', [courseId], options);
    return rows.map((row) => row.tag_template_id);
  }

  static async replaceCourseTags(courseId, tagIds = [], options = {}) {
    await execute('DELETE FROM course_tags WHERE course_id = ?', [courseId], options);
    if (!tagIds.length) {
      return [];
    }
    const rows = tagIds.map((tagId) => [courseId, tagId]);
    const placeholders = rows.map(() => '(?, ?)').join(', ');
    const flatValues = rows.flat();
    await execute(
      `INSERT INTO course_tags (course_id, tag_template_id) VALUES ${placeholders}`,
      flatValues,
      options,
    );
    return [...tagIds];
  }
}
