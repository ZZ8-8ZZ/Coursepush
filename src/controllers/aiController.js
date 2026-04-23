import * as aiService from '../services/aiService.js';
import { sendSuccess } from '../utils/httpResponses.js';
import { ValidationError, AppError } from '../services/errors.js';

/**
 * Get AI weekly analysis
 * POST /api/v1/ai/analysis
 */
export const getWeeklyAnalysis = async (req, res) => {
    const { courses, weekNum } = req.body;

    if (!Array.isArray(courses)) {
        throw new ValidationError('课程数据格式不正确');
    }

    if (typeof weekNum !== 'number') {
        throw new ValidationError('周次格式不正确');
    }

    const analysis = await aiService.getWeeklyAnalysis(courses, weekNum);
    return sendSuccess(res, { analysis });
};

/**
 * Custom AI Chat
 * POST /api/v1/ai/chat
 */
export const chat = async (req, res) => {
    const { messages } = req.body;

    if (!Array.isArray(messages)) {
        throw new ValidationError('消息格式不正确');
    }

    const response = await aiService.fetchAIResponse(messages);
    return sendSuccess(res, { response });
};
