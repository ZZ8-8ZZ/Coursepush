import { appConfig } from '../config/env.js';

const AI_CONFIG = {
    apiKey: appConfig.zhipuApiKey,
    model: appConfig.zhipuModel,
    endpoint: 'https://open.bigmodel.cn/api/paas/v4/chat/completions'
};

/**
 * Fetch response from Zhipu AI
 * @param {Array} messages - Array of message objects {role: 'user'|'assistant'|'system', content: string}
 * @returns {Promise<string>} - The AI's response text
 */
export async function fetchAIResponse(messages) {
    try {
        const response = await fetch(AI_CONFIG.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${AI_CONFIG.apiKey}`
            },
            body: JSON.stringify({
                model: AI_CONFIG.model,
                messages: messages,
                max_tokens: 4096,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'AI 请求失败');
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('AI Service Error:', error);
        throw error;
    }
}

/**
 * Generate a summary of the current week's courses for the AI
 * @param {Array} courses - The current week's courses
 * @param {number} weekNum - Current week number
 * @returns {string} - Formatted summary
 */
export function generateCourseContext(courses, weekNum) {
    if (!courses || courses.length === 0) {
        return `当前是第 ${weekNum} 周，目前没有安排任何课程。`;
    }

    const dayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    let context = `当前是第 ${weekNum} 周的课程安排：\n`;

    // Group courses by day
    const coursesByDay = {};
    courses.forEach(c => {
        const day = c.dayOfWeek || c.day;
        if (!coursesByDay[day]) coursesByDay[day] = [];
        coursesByDay[day].push(c);
    });

    for (let day = 1; day <= 7; day++) {
        if (coursesByDay[day]) {
            context += `${dayNames[day - 1]}:\n`;
            coursesByDay[day]
                .sort((a, b) => (a.startPeriod || a.start) - (b.startPeriod || b.start))
                .forEach(c => {
                    const name = c.courseName || c.name;
                    const room = c.roomName || c.location || '未知教室';
                    const start = c.startPeriod || c.start;
                    const end = c.endPeriod || c.end;
                    context += `- 第 ${start}-${end} 节: ${name} (${room})\n`;
                });
        }
    }

    return context;
}

/**
 * Ask AI for a weekly analysis/advice
 */
export async function getWeeklyAnalysis(courses, weekNum) {
    const context = generateCourseContext(courses, weekNum);
    const systemPrompt = `你是一个贴心的学霸小助手。请根据用户提供的本周课表，给出一个简短的分析（如哪天课多、哪天比较闲）以及一些学习建议。语言要活泼、鼓励性。
    
    你还可以通过发送指令来帮助用户管理课程：
    1. 添加课程：[ACTION:ADD {"name": "课程名", "dayOfWeek": 1-7, "startPeriod": 1-12, "endPeriod": 1-12, "location": "教室", "teacher": "老师", "weekStart": 1, "weekEnd": 16, "weekPattern": "all", "tagName": "上课"}]
    2. 修改课程：[ACTION:UPDATE {"name": "原课程名", "tagName": "停课", ...}]
    3. 删除课程：[ACTION:DELETE {"name": "课程名"}]
    
    特别说明：
    - 标签颜色映射：'上课' -> blue, '调课' -> amber, '停课' -> rose。程序会自动处理颜色，你只需传正确的 tagName。
    - 当用户提到某门课“停课”、“取消”或“不上了”时，请优先使用 UPDATE 指令将 tagName 设置为“停课”。
    
    请在回复中包含这些指令（如果用户要求的话）。`;
    const userPrompt = `这是我本周的课表：\n${context}\n请帮我分析一下这一周的情况。`;

    return await fetchAIResponse([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
    ]);
}
