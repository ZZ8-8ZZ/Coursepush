# CoursePush 外部调用 API 文档

本文档介绍了如何通过 API Key 调用 CoursePush 的外部接口，用于集成到第三方应用、自动化脚本或桌面小组件中。

## 1. 基础信息

- **Base URL**: `http://<your-domain>/api/v1`
- **Content-Type**: `application/json`
- **认证方式**: API Key (通过 Header 或 Query 传递)

## 2. 认证机制

所有外部接口均需要进行身份验证。您可以选择以下两种方式之一提供 API Key：

1.  **HTTP Header (推荐)**：
    ```http
    X-API-Key: your_api_key_here
    ```
2.  **Query Parameter**：
    ```text
    GET /api/v1/external/courses?apiKey=your_api_key_here
    ```

> [!CAUTION]
> **安全警告**：API Key 等同于您的登录密码，请勿在前端代码、公开的代码库（如 GitHub 公开仓库）或不可信的环境中泄露。

## 3. API Key 管理 (需要用户登录)

管理接口需要使用传统的 `X-User-Id` 进行身份验证（通常由 CoursePush 管理后台使用）。

### 3.1 获取/初始化 API Key
获取用于外部调用的当前 API Key。如果用户尚未拥有 Key，系统将自动生成。

- **URL**: `/api/v1/users/me/api-key`
- **Method**: `GET`
- **Header**: `X-User-Id: <您的用户ID>`

### 3.2 刷新 API Key
生成并返回新的 API Key，**旧的 API Key 将立即失效**。

- **URL**: `/api/v1/users/me/api-key/refresh`
- **Method**: `POST`
- **Header**: `X-User-Id: <您的用户ID>`

---

## 4. 业务接口

### 4.1 获取当前激活学期的课程列表

获取当前用户在“激活状态”学期下的所有课程信息。

- **URL**: `/external/courses`
- **Method**: `GET`
- **查询参数**:

| 参数名 | 类型 | 必须 | 描述 | 示例 |
| :--- | :--- | :--- | :--- | :--- |
| `weekNumber` | Integer | 否 | 过滤特定周次的课程 | `1` |
| `tagType` | String | 否 | 过滤标签类型 | `danger` |

#### 请求示例 (cURL)
```bash
curl -X GET "http://localhost:3200/api/v1/external/courses?weekNumber=5" \
     -H "X-API-Key: 5f3e7...b2a1"
```

#### 响应说明
成功时返回状态码 `200` 及课程数组。包含 `meta` 对象记录当前状态。

| 字段名 | 类型 | 描述 |
| :--- | :--- | :--- |
| `id` | Number | 课程唯一 ID |
| `name` | String | 课程名称 |
| `teacher` | String | 任课教师 (可能为 null) |
| `location` | String | 上课地点 (可能为 null) |
| `dayOfWeek` | Number | 周几 (1-7) |
| `startPeriod` | Number | 开始节次 |
| `endPeriod` | Number | 结束节次 |
| `weekPattern` | String | 周次模式: `all`(全周), `odd`(单周), `even`(双周), `custom` |
| `weekStart` | Number | 起始周 |
| `weekEnd` | Number | 结束周 |
| `tagType` | String | 标签颜色/类型 |
| `tagName` | String | 标签文本内容 |
| `notes` | String | 备注信息 |

**Meta 字段说明**

| 字段名 | 类型 | 描述 |
| :--- | :--- | :--- |
| `currentWeek` | Number | 当前激活学期的当前周次 |

---

## 5. 错误代码参考

| HTTP 状态码 | 错误消息 | 建议处理方式 |
| :--- | :--- | :--- |
| **401** | `需要在 X-API-Key 请求头或 apiKey 参数中提供 API Key` | 检查请求是否携带了有效的认证信息 |
| **401** | `无效的 API Key` | 检查 API Key 是否输入正确，或是否已在后台被刷新 |
| **403** | `该账户已被禁用` | 联系管理员核实账户状态 |
| **404** | `未找到当前激活的学期` | 请先在 CoursePush 管理后台设置一个“激活中”的学期 |
| **500** | `服务器内部错误` | 请联系技术支持或查看系统日志 |

---

## 6. 集成示例 (JavaScript)

```javascript
const API_KEY = 'your_api_key';
const BASE_URL = 'http://localhost:3200/api/v1';

async function getTodayCourses() {
  try {
    const response = await fetch(`${BASE_URL}/external/courses`, {
      headers: {
        'X-API-Key': API_KEY
      }
    });
    
    const result = await response.json();
    if (result.success) {
      console.log('课程列表:', result.data);
    } else {
      console.error('获取失败:', result.error.message);
    }
  } catch (err) {
    console.error('网络请求异常:', err);
  }
}
```
