# CoursePush 外部调用 API 文档

本文档介绍了如何通过 API Key 调用 CoursePush 的外部接口，用于集成到第三方应用或脚本中。

## 1. 认证方式

所有外部接口均需要进行身份验证。您可以选择以下两种方式之一提供 API Key：

1.  **HTTP Header (推荐)**：在请求头中添加 `X-API-Key` 字段。
2.  **Query Parameter**：在 URL 后面添加 `apiKey` 参数。

> **注意**：请妥善保管您的 API Key，不要泄露给他人。如果发现 Key 泄露，请及时在管理后台刷新。

## 2. 获取 API Key

API Key 会在您注册账号时自动生成。如果您是老用户，在第一次调用获取接口时也会自动为您生成。

您可以通过管理后台的以下接口查看或刷新您的 API Key：

-   **获取/初始化 Key**: `GET /api/v1/users/me/api-key` (需要 `X-User-Id` 认证)
-   **刷新 Key**: `POST /api/v1/users/me/api-key/refresh` (需要 `X-User-Id` 认证)

## 3. 接口列表

### 3.1 获取当前学期课程

获取当前用户激活学期的所有课程。

-   **URL**: `/api/v1/external/courses`
-   **Method**: `GET`
-   **参数**:

| 参数名 | 类型 | 必须 | 描述 |
| :--- | :--- | :--- | :--- |
| `weekNumber` | Integer | 否 | 过滤指定周数的课程 |
| `tagType` | String | 否 | 过滤指定类型的课程 (如 `normal`, `warning`, `danger`) |

-   **响应示例**:

```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "name": "高等数学",
      "teacher": "张老师",
      "location": "教1-101",
      "dayOfWeek": 1,
      "startPeriod": 1,
      "endPeriod": 2,
      "weekPattern": "all",
      "weekStart": 1,
      "weekEnd": 18,
      "tagType": "normal",
      "tagName": "必修",
      "notes": "带好课本"
    }
  ]
}
```

## 4. 错误处理

| HTTP 状态码 | 描述 |
| :--- | :--- |
| 401 | API Key 无效或未提供 |
| 403 | 账户已被禁用 |
| 404 | 未找到激活的学期 |
| 500 | 服务器内部错误 |

响应体格式：
```json
{
  "success": false,
  "error": {
    "message": "错误描述信息"
  }
}
```
