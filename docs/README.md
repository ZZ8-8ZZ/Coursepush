# CoursePush Admin API

> 最后更新：2026-04-30

## 1. 架构设计

- **运行环境**：Node.js 18+、Express 4、MySQL（通过 `mysql2/promise` 访问）。
- **模块划分**：`config` 负责环境与数据库配置；`models` 层封装 SQL；`services` 实现业务与校验；新增的 `controllers` 和 `routes` 将 HTTP 请求映射到服务层；`middlewares` 提供用户上下文与错误处理。
- **统一响应**：成功响应 `{ success: true, data, meta }`，失败响应 `{ success: false, error: { message, details } }`。
- **入口文件**：`src/server.js` 负责加载中间件、注册 `/api/v1` 路由并暴露 `/health` 探活。

## 2. 启动 & 配置

```bash
# 服务端
cd Admin
npm install
npm start         # 默认为 http://localhost:3100

# 用户端
npm run dev     # 默认为http://localhost:5173
```

必备环境变量（生产环境强制检查）：

| 变量 | 说明 | 默认值 |
| --- | --- | --- |
| `DB_HOST` | 数据库主机 | `127.0.0.1` |
| `DB_PORT` | 端口 | `3306` |
| `DB_USER` | 用户名 | `root` |
| `DB_PASSWORD` | 密码 | `admini` |
| `DB_NAME` | 数据库 | `coursepush_admin` |
| `PORT` / `APP_PORT` | API 监听端口 | `3100` |
| `API_PREFIX` | 路由前缀 | `/api/v1` |
| `JWT_SECRET` | JWT 签名密钥（生产环境必须设置强密钥） | `coursepush-jwt-secret-dev-only` |
| `JWT_EXPIRES_IN` | JWT 过期时间 | `7d` |
| `DB_LOG_SQL` | 是否打印 SQL | `false` |
| `ZHIPU_AI_API_KEY` | 智谱 AI API Key | (必填) |
| `ZHIPU_AI_MODEL` | 智谱 AI 模型 | `glm-4-flash` |
| `SSO_CLIENT_ID` | SSO 客户端 ID | - |
| `SSO_CLIENT_SECRET` | SSO 客户端密钥 | - |
| `SSO_AUTHORIZE_URL` | SSO 授权 URL | `http://localhost:3000/oauth/authorize` |
| `SSO_TOKEN_URL` | SSO 令牌交换 URL | `http://localhost:3000/oauth/token` |
| `SSO_USER_INFO_URL` | SSO 用户信息 URL | `http://localhost:3000/api/userinfo` |
| `SSO_REDIRECT_URI` | SSO 回调 URI | `http://localhost:3200/api/v1/auth/sso/callback` |
| `FRONTEND_URL` | 默认前端回调地址 | `http://localhost:3000` |
| `FRONTEND_URLS` | 允许的前端回调地址白名单（逗号分隔） | 同 `FRONTEND_URL` |

开发环境若缺失 `DB_*` 变量，服务器会记录警告但继续使用默认值；生产环境会直接抛错以避免误配置。

## 3. 请求契约

- **身份注入**：除 `/auth/*` 和 `/external/*` 外的所有路由都需在头部携带 `Authorization: Bearer <JWT 令牌>`，中间件会验证令牌并将 `userId` 写入 `req.userId`。
- **内容类型**：`application/json`，JSON 体默认限制为 1MB。
- **幂等性**：DELETE/POST/PUT 遵循 REST 语义；POST 创建成功返回 201。
- **日志**：`morgan` 在开发环境输出 `dev` 格式，请求-响应会配合 `X-Request-Id`？（当前未内置，可按需扩展）。

## 4. 中间件与错误处理

1. `cors()`：允许跨域访问。
2. `express.json({ limit: '1mb' })`：解析 JSON 请求体。
3. `morgan()`：请求日志。
4. `requireUser`：校验 `Authorization: Bearer <token>`，用于除 `/auth` 和 `/external` 以外的所有路由。
5. `notFoundHandler`：未命中任何路由返回 404。
6. `errorHandler`：捕获同步/异步错误，根据 `AppError` 派生类确定状态码。

常见错误码：

| HTTP | 类型 | 触发场景 |
| --- | --- | --- |
| 401 | `AuthenticationError` | 缺少或无效 JWT 令牌，登录失败 |
| 403 | `AuthorizationError` | 操作他人数据 |
| 404 | `NotFoundError` | 资源不存在或无权限 |
| 409 | `ConflictError` | 重复创建、唯一性冲突 |
| 422 | `ValidationError` | Zod 校验未通过 |
| 500 | 未捕获异常 | 服务器内部错误 |

## 5. 接口清单

### 5.0 基础端点

| 方法 | 路径 | 描述 |
| --- | --- | --- |
| `GET` | `/health` | 服务探活，返回 `{ status: "ok", timestamp }`，无需认证 |

### 5.1 认证与用户

| 方法 | 路径 | 描述 |
| --- | --- | --- |
| `POST` | `/api/v1/auth/register` | 注册账号，参数：`username`, `password`, `displayName`, `email` |
| `POST` | `/api/v1/auth/login` | 登录并返回用户 Profile |
| `GET` | `/api/v1/auth/sso/login?redirect=` | 发起 SSO 登录，`redirect` 指定回调前端地址（可选） |
| `GET` | `/api/v1/auth/sso/callback` | SSO 回调端点，自动注册/匹配用户并回跳前端 |
| `POST` | `/api/v1/auth/forgot-password` | 请求重置密码验证码 (发送至邮箱) |
| `POST` | `/api/v1/auth/reset-password` | 提交验证码重置密码 |
| `POST` | `/api/v1/auth/bind-email` | 绑定或修改邮箱 (需登录) |
| `POST` | `/api/v1/auth/change-password` | 修改登录密码 (需登录) |
| `GET` | `/api/v1/users/me` | 获取当前用户信息（需 Bearer Token） |
| `PATCH` | `/api/v1/users/me` | 更新 `displayName` 或 `email` |
| `DELETE` | `/api/v1/users/me` | 注销账号 (永久删除所有关联数据) |
| `GET` | `/api/v1/users/me/unipush` | 获取当前用户的 UniPush CID |
| `PATCH` | `/api/v1/users/me/unipush` | 更新 UniPush CID |
| `GET` | `/api/v1/users/me/api-key` | 获取 API Key |
| `POST` | `/api/v1/users/me/api-key/refresh` | 刷新 API Key |

示例：

```bash
curl -X POST http://localhost:3100/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"demo","password":"123456"}'
```

### 5.2 外部调用接口 (API Key 认证)

| 方法 | 路径 | 描述 |
| --- | --- | --- |
| `GET` | `/api/v1/external/courses` | 获取当前激活学期的课程列表 |

详情请参阅 [EXTERNAL_API.md](./EXTERNAL_API.md)。

### 5.3 用户管理 (管理员)

| 方法 | 路径 | 描述 |
| --- | --- | --- |
| `GET` | `/api/v1/users` | 列出所有用户 (支持关键词搜索、分页) |
| `GET` | `/api/v1/users/:userId` | 获取特定用户详情 |
| `PATCH` | `/api/v1/users/:userId` | 更新用户信息 (昵称、角色、状态) |
| `DELETE` | `/api/v1/users/:userId` | 删除用户 |
| `PATCH` | `/api/v1/users/:userId/status` | 快速更新用户启用状态 |

### 5.4 学期管理

| 方法 | 路径 | 描述 |
| --- | --- | --- |
| `GET` | `/api/v1/semesters` | 列出当前用户的学期 |
| `POST` | `/api/v1/semesters` | 创建学期（`semesterName`, `totalWeeks`, `currentWeek`, `isActive`, `status`） |
| `PATCH` | `/api/v1/semesters/:semesterId` | 更新学期任意字段 |
| `DELETE` | `/api/v1/semesters/:semesterId` | 删除指定学期 |
| `POST` | `/api/v1/semesters/:semesterId/activate` | 设为激活学期（会自动清理其它学期的激活状态） |

### 5.5 课程与标签

| 方法 | 路径 | 描述 |
| --- | --- | --- |
| `GET` | `/api/v1/courses?semesterId=1&weekNumber=2` | 按学期、周次、标签类型筛选课程 |
| `POST` | `/api/v1/courses` | 创建课程，支持附加 `tagTemplateIds` |
| `PATCH` | `/api/v1/courses/:courseId` | 更新课程任意字段（含标签） |
| `DELETE` | `/api/v1/courses/:courseId` | 删除课程 |
| `GET` | `/api/v1/tag-templates` | 列出标签模板 |
| `POST` | `/api/v1/tag-templates` | 新建标签模板（唯一 label 校验） |
| `PATCH` | `/api/v1/tag-templates/:tagId` | 修改模板 |
| `DELETE` | `/api/v1/tag-templates/:tagId` | 删除模板 |

### 5.6 作息、Bark 推送与通知日志

| 方法 | 路径 | 描述 |
| --- | --- | --- |
| `GET` | `/api/v1/time-slots` | 获取节次配置 |
| `POST` | `/api/v1/time-slots` | 新增节次（`periodOrder` 全局唯一） |
| `PATCH` | `/api/v1/time-slots/:slotId` | 更新节次 |
| `DELETE` | `/api/v1/time-slots/:slotId` | 删除节次 |
| `GET` | `/api/v1/bark/settings` | 获取 Bark 推送设置 |
| `PUT` | `/api/v1/bark/settings` | 更新推送设置（开启时必须携带 `barkKey`） |
| `GET` | `/api/v1/notifications/logs?limit=20` | 查看最近推送日志，默认 50 条 |
| `POST` | `/api/v1/notifications/logs` | 写入推送日志，`userId` 默认为当前用户 |

### 5.7 App 版本管理

| 方法 | 路径 | 描述 |
| --- | --- | --- |
| `GET` | `/api/v1/app-versions/latest?platform=1` | 获取最新版本信息（1:Android, 2:iOS） |
| `GET` | `/api/v1/app-versions?platform=1` | 列出版本历史 |
| `POST` | `/api/v1/app-versions` | 创建新版本 |
| `PATCH` | `/api/v1/app-versions/:versionId` | 更新版本信息 |
| `DELETE` | `/api/v1/app-versions/:versionId` | 删除版本记录 |

### 5.8 AI 学霸助手

| 方法 | 路径 | 描述 |
| --- | --- | --- |
| `POST` | `/api/v1/ai/analysis` | 获取 AI 本周课程分析与学习建议 |
| `POST` | `/api/v1/ai/chat` | 与 AI 进行通用对话 (支持课程管理指令) |

## 6. 变更与操作日志

| 日期 | 项目 | 说明 |
| --- | --- | --- |
| 2026-04-30 | SSO | SSO 回调支持动态前端地址（`redirect` 参数 + `FRONTEND_URLS` 白名单） |
| 2026-04-23 | AI 功能 | 集成智谱 AI，提供周课表分析及智能对话接口 (`/api/v1/ai/*`) |
| 2026-03-23 | 接口更新 | 同步 `API.yaml` 最新接口：新增重置密码、修改密码、注销账号、UniPush、管理员用户管理等接口 |
| 2026-04-20 | 外部 API | 新增外部调用 API 接口 (`/external/courses`) 及 API Key 认证机制 |
| 2026-02-25 | App版本 | 新增 App 版本更新 API，支持版本历史管理与最新版本查询 |
| 2025-12-02 | 控制层 | 新增所有实体的 controller，统一成功/失败返回格式 |
| 2025-12-02 | 路由层 | 拆分资源路由并聚合到 `/api/v1`，JWT Bearer 令牌认证中间件生效 |
| 2025-12-02 | 服务入口 | 落地 `src/server.js`，启用 CORS、morgan、健康检查与全局错误处理 |
| 2025-12-02 | 文档 | 撰写本 README，记录架构、接口和日志 |

## 7. 后续扩展建议

1. ~~引入基于 token 的真正鉴权逻辑，替换临时的 `X-User-Id` 头。~~ ✅ 已完成 (JWT Bearer Token)
2. 为响应增加 `requestId` 字段，方便日志追踪。
3. 配合前端编写 OpenAPI 规范或 Postman Collection 以便自动化测试。
