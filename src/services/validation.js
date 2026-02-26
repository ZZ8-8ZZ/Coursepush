import { z } from 'zod';
import { handleZodError } from './errors.js';

const usernameSchema = z.string().trim().min(3).max(64);
const passwordSchema = z.string().min(6).max(128);
const displayNameSchema = z.string().trim().min(1).max(100);
const semesterNameSchema = z.string().trim().min(1).max(120);
const weekPatternSchema = z.enum(['all', 'odd', 'even', 'custom']);
const tagTypeSchema = z.enum(['normal', 'warning', 'danger', 'blue', 'amber', 'rose', 'emerald', 'violet', 'indigo', 'slate', 'neutral']);
const timeStringSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, '时间格式需为 HH:MM');

const toMinutes = (timeValue) => {
  const [hours, minutes] = timeValue.split(':').map((segment) => Number.parseInt(segment, 10));
  return hours * 60 + minutes;
};

const registerUserSchema = z.object({
  username: usernameSchema,
  password: passwordSchema,
  displayName: displayNameSchema,
  email: z.string().email().max(128).optional(),
});

const loginSchema = z.object({
  username: usernameSchema,
  password: passwordSchema,
});

const updateProfileSchema = z.object({
  displayName: displayNameSchema.optional(),
  email: z.string().email().max(128).optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: '至少需要提供一个更新字段',
});

const userUpdateSchema = z.object({
  displayName: displayNameSchema.optional(),
  email: z.string().email().max(128).optional(),
  role: z.enum(['user', 'admin']).optional(),
  isActive: z.boolean().optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: '至少需要提供一个更新字段',
});

const userStatusUpdateSchema = z.object({
  isActive: z.boolean(),
});

const semesterCreateSchema = z.object({
  semesterName: semesterNameSchema,
  totalWeeks: z.number().int().min(1).max(30).default(18),
  currentWeek: z.number().int().min(1).max(30).default(1),
  isActive: z.boolean().optional().default(false),
  status: z.enum(['draft', 'published', 'archived']).optional().default('published'),
  startDate: z.string().optional(),
});

const semesterUpdateSchema = z
  .object({
    semesterName: semesterNameSchema.optional(),
    totalWeeks: z.number().int().min(1).max(30).optional(),
    currentWeek: z.number().int().min(1).max(30).optional(),
    isActive: z.boolean().optional(),
    status: z.enum(['draft', 'published', 'archived']).optional(),
    startDate: z.string().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: '至少需要提供一个更新字段',
  });

const baseCourseSchema = z.object({
  name: z.string().trim().min(1).max(150),
  teacher: z.string().trim().max(120).optional().nullable(),
  location: z.string().trim().max(120).optional().nullable(),
  dayOfWeek: z.number().int().min(1).max(7),
  startPeriod: z.number().int().min(1),
  endPeriod: z.number().int().min(1),
  weekPattern: weekPatternSchema.default('all'),
  weekStart: z.number().int().min(1).max(30).optional(),
  weekEnd: z.number().int().min(1).max(30).optional(),
  tagType: tagTypeSchema.optional().default('normal'),
  tagName: z.string().trim().max(60).optional().nullable(),
  primaryTagId: z.number().int().positive().optional().nullable(),
  notes: z.string().trim().max(500).optional().nullable(),
  tagTemplateIds: z.array(z.number().int().positive()).max(10).optional(),
});

const withCourseRules = (schema) =>
  schema
    .superRefine((data, ctx) => {
      const hasStart = typeof data.startPeriod === 'number';
      const hasEnd = typeof data.endPeriod === 'number';
      if (hasStart && hasEnd && data.endPeriod < data.startPeriod) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: '结束节次需大于或等于开始节次',
          path: ['endPeriod'],
        });
      }
    })
    .superRefine((data, ctx) => {
      if (data.weekPattern === 'custom') {
        const hasValidStart = typeof data.weekStart === 'number';
        const hasValidEnd = typeof data.weekEnd === 'number';
        if (!hasValidStart || !hasValidEnd || data.weekEnd < data.weekStart) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: '自定义周次需提供合法的起止周',
            path: ['weekEnd'],
          });
        }
      }
    });

const courseCreateSchema = withCourseRules(
  baseCourseSchema.extend({
    semesterId: z.number().int().positive(),
  }),
);

const courseUpdateSchema = withCourseRules(baseCourseSchema.partial()).refine(
  (data) => Object.keys(data).length > 0,
  {
    message: '至少需要提供一个更新字段',
  },
);

const courseFilterSchema = z.object({
  semesterId: z.number().int().positive(),
  userId: z.number().int().positive().optional(),
  weekNumber: z.number().int().min(1).max(30).optional(),
  tagType: z.string().trim().optional(),
});

const timeSlotCreateSchema = z
  .object({
    periodOrder: z.number().int().min(1).max(24),
    startTime: timeStringSchema,
    endTime: timeStringSchema,
  })
  .refine((data) => toMinutes(data.endTime) > toMinutes(data.startTime), {
    message: '结束时间需晚于开始时间',
    path: ['endTime'],
  });

const timeSlotUpdateSchema = z
  .object({
    periodOrder: z.number().int().min(1).max(24).optional(),
    startTime: timeStringSchema.optional(),
    endTime: timeStringSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: '至少需要提供一个更新字段',
  })
  .refine((data) => {
    if (data.startTime && data.endTime) {
      return toMinutes(data.endTime) > toMinutes(data.startTime);
    }
    return true;
  }, {
    message: '结束时间需晚于开始时间',
    path: ['endTime'],
  });

const tagTemplateCreateSchema = z.object({
  type: tagTypeSchema.default('normal'),
  label: z.string().trim().min(1).max(50),
  description: z.string().trim().max(255).optional().nullable(),
});

const tagTemplateUpdateSchema = z
  .object({
    type: tagTypeSchema.optional(),
    label: z.string().trim().min(1).max(50).optional(),
    description: z.string().trim().max(255).optional().nullable(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: '至少需要提供一个更新字段',
  });

const barkSettingsSchema = z
  .object({
    enabled: z.boolean(),
    barkKey: z.string().trim().max(255).optional().nullable(),
    remindMinutesBefore: z.number().int().min(5).max(240),
  })
  .superRefine((data, ctx) => {
    if (data.enabled && !data.barkKey) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: '开启推送需提供 Bark Key', path: ['barkKey'] });
    }
  });

const notificationLogSchema = z.object({
  userId: z.number().int().positive(),
  courseId: z.number().int().positive().optional().nullable(),
  status: z.enum(['success', 'skipped', 'error']),
  detail: z.string().trim().min(1).max(255),
  scheduledFor: z.coerce.date().optional(),
});

const appVersionCreateSchema = z.object({
  appPlatform: z.coerce.number().int().min(1).max(2), // 1: Android, 2: iOS
  versionCode: z.coerce.number().int().positive(),
  versionName: z.string().trim().min(1).max(50),
  downloadUrl: z.string().url().max(500),
  updateDesc: z.string().trim().max(1000).optional(),
  isForce: z.boolean().optional().default(false),
  isCurrent: z.boolean().optional().default(false),
});

const appVersionUpdateSchema = z
  .object({
    appPlatform: z.coerce.number().int().min(1).max(2).optional(),
    versionCode: z.coerce.number().int().positive().optional(),
    versionName: z.string().trim().min(1).max(50).optional(),
    downloadUrl: z.string().url().max(500).optional(),
    updateDesc: z.string().trim().max(1000).optional(),
    isForce: z.boolean().optional(),
    isCurrent: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: '至少需要提供一个更新字段',
  });

const parse = (schema, payload) => {
  try {
    return schema.parse(payload);
  } catch (error) {
    handleZodError(error);
    return undefined;
  }
};

export const validateRegisterUser = (payload) => parse(registerUserSchema, payload);
export const validateLogin = (payload) => parse(loginSchema, payload);
export const validateUpdateProfile = (payload) => parse(updateProfileSchema, payload);
export const validateUserUpdate = (payload) => parse(userUpdateSchema, payload);
export const validateUserStatusUpdate = (payload) => parse(userStatusUpdateSchema, payload);
export const validateSemesterCreate = (payload) => parse(semesterCreateSchema, payload);
export const validateSemesterUpdate = (payload) => parse(semesterUpdateSchema, payload);
export const validateCourseCreate = (payload) => parse(courseCreateSchema, payload);
export const validateCourseUpdate = (payload) => parse(courseUpdateSchema, payload);
export const validateCourseFilter = (payload) => parse(courseFilterSchema, payload);
export const validateTimeSlotCreate = (payload) => parse(timeSlotCreateSchema, payload);
export const validateTimeSlotUpdate = (payload) => parse(timeSlotUpdateSchema, payload);
export const validateTagTemplateCreate = (payload) => parse(tagTemplateCreateSchema, payload);
export const validateTagTemplateUpdate = (payload) => parse(tagTemplateUpdateSchema, payload);
export const validateBarkSettings = (payload) => parse(barkSettingsSchema, payload);
export const validateNotificationLog = (payload) => parse(notificationLogSchema, payload);
export const validateAppVersionCreate = (payload) => parse(appVersionCreateSchema, payload);
export const validateAppVersionUpdate = (payload) => parse(appVersionUpdateSchema, payload);
