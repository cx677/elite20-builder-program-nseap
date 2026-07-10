# Team 3 MVP：Mock → 真实迁移方案

> 把 5 个 mock 组件逐个替换为真实 API，让 Demo 变成真人可用的 Alpha 版。

---

## 目录

- [1. 迁移全景](#1-迁移全景)
- [2. 飞书群 → 飞书 Bot API](#2-飞书群--飞书-bot-api)
- [3. Student Companion → DeepSeek AI](#3-student-companion--deepseek-ai)
- [4. Hermes → Redis + BullMQ](#4-hermes--redis--bullmq)
- [5. 飞书 Bitable → 飞书 OpenAPI](#5-飞书-bitable--飞书-openapi)
- [6. GitHub Repo → GitHub App](#6-github-repo--github-app)
- [7. 迁移代码示例](#7-迁移代码示例)
- [8. 时间线](#8-时间线)

---

## 1. 迁移全景

```mermaid
flowchart TB
    subgraph NOW[现在 - 全部 Mock]
        M1[飞书群<br/>console.log]
        M2[Student Companion<br/>mock 对象]
        M3[Hermes<br/>setTimeout]
        M4[飞书 Bitable<br/>JSON 文件]
        M5[GitHub Repo<br/>本地文件]
    end

    subgraph REAL[目标 - 全部真实]
        R1[飞书 Bot API<br/>Webhook 推送]
        R2[DeepSeek API<br/>AI 评分+对话]
        R3[Redis + BullMQ<br/>消息队列]
        R4[飞书 Bitable API<br/>多维表 CRUD]
        R5[GitHub App<br/>Webhook + PR]
    end

    M1 -->|3-5 天| R1
    M2 -->|1-2 天| R2
    M3 -->|2-3 天| R3
    M4 -->|2-3 天| R4
    M5 -->|1-2 天| R5

    style NOW fill:#ffcdd2
    style REAL fill:#c8e6c9
```

| 组件 | 现在 | 目标 | 工期 | 依赖 |
|---|---|---|---:|---|
| 飞书群 | console.log | 飞书 Bot API | 3-5 天 | 飞书开放平台应用 |
| Student Companion | mock 对象 | DeepSeek API | 1-2 天 | DeepSeek API Key |
| Hermes | setTimeout | Redis + BullMQ | 2-3 天 | Redis 实例 |
| 飞书 Bitable | JSON 文件 | 飞书 Bitable API | 2-3 天 | tenant_access_token |
| GitHub Repo | 本地文件 | GitHub App | 1-2 天 | GitHub App 注册 |

---

## 2. 飞书群 → 飞书 Bot API

### 2.1 现在（Mock）

```javascript
// demo.mjs 里现在的实现
const sendMessage = (from, text) => {
  console.log(`[飞书群] ${from}: ${text}`);
  chat.push({ time: new Date().toISOString(), from, text });
};
```

### 2.2 目标（真实）

```javascript
// src/feishu/bot.js
import axios from 'axios';

const FEISHU_APP_ID = process.env.FEISHU_APP_ID;
const FEISHU_APP_SECRET = process.env.FEISHU_APP_SECRET;

// 获取 tenant_access_token
async function getToken() {
  const res = await axios.post(
    'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal',
    { app_id: FEISHU_APP_ID, app_secret: FEISHU_APP_SECRET }
  );
  return res.data.tenant_access_token;
}

// 发送群消息
export async function sendGroupMessage(groupId, content) {
  const token = await getToken();
  await axios.post(
    `https://open.feishu.cn/open-apis/im/v1/messages?receive_id_type=chat_id`,
    {
      receive_id: groupId,
      msg_type: 'text',
      content: JSON.stringify({ text: content }),
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

// 发送卡片消息（Rich Card）
export async function sendCardMessage(groupId, card) {
  const token = await getToken();
  await axios.post(
    `https://open.feishu.cn/open-apis/im/v1/messages?receive_id_type=chat_id`,
    {
      receive_id: groupId,
      msg_type: 'interactive',
      content: JSON.stringify(card),
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );
}
```

### 2.3 前置条件

| 步骤 | 操作 | 链接 |
|---|---|---|
| 1 | 创建飞书开放平台应用 | https://open.feishu.cn/app |
| 2 | 获取 App ID + App Secret | 应用凭证页面 |
| 3 | 开通权限 | im:message, im:message:send_as_bot |
| 4 | 创建机器人 | 应用功能 → 机器人 |
| 5 | 把机器人拉入群 | 群设置 → 机器人 |

---

## 3. Student Companion → DeepSeek AI

### 3.1 现在（Mock）

```javascript
// demo.mjs 里现在的实现
const studentCompanion = {
  handle(envelope) {
    if (envelope.message_type === 'challenge_available') {
      sendMessage('Student Raymond', '📚 新作业已发布...');
    }
  },
  async submitToHermes(challengeId, repoFiles) {
    // mock 5 步校验
    const package_ = { /* ... */ };
    hermesRoute(package_);
  },
};
```

### 3.2 目标（真实）

```javascript
// src/agents/student-companion.js
import axios from 'axios';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

export async function handleChallengeAvailable(challenge) {
  const prompt = `
    你是一个 AI 学习助手。老师刚发布了新作业：
    标题: ${challenge.title}
    描述: ${challenge.description}
    截止: ${challenge.due_date}
    请用 3 句话告诉学生这个作业要做什么、怎么开始。
  `;
  const reply = await callDeepSeek(prompt);
  return reply;
}

export async function validateSubmission(challengeId, files) {
  const prompt = `
    你是一个作业校验器。学生提交了以下文件：${files.join(', ')}
    请检查：
    1. README.md 是否存在且内容完整
    2. AAR 复盘是否包含 6 个 section
    3. 代码是否能运行（看 import 是否正确）
    返回 JSON: { valid: boolean, reason: string }
  `;
  const result = await callDeepSeek(prompt);
  return JSON.parse(result);
}

async function callDeepSeek(prompt) {
  const res = await axios.post(
    'https://api.deepseek.com/v1/chat/completions',
    {
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    },
    { headers: { Authorization: `Bearer ${DEEPSEEK_API_KEY}` } }
  );
  return res.data.choices[0].message.content;
}
```

### 3.3 前置条件

| 步骤 | 操作 | 链接 |
|---|---|---|
| 1 | 注册 DeepSeek | https://platform.deepseek.com |
| 2 | 获取 API Key | API Keys 页面 |
| 3 | 充值（可选）| 费用中心 |

---

## 4. Hermes → Redis + BullMQ

### 4.1 现在（Mock）

```javascript
// demo.mjs 里现在的实现
const hermesOutbox = [];
const hermesInbox = [];
const hermesRoute = (envelope) => {
  hermesOutbox.push(envelope);
  setTimeout(() => {
    hermesInbox.push(envelope);
    deliverToAgent(envelope);
  }, 100);
};
```

### 4.2 目标（真实）

```javascript
// src/hermes/queue.js
import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';

const redis = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379');

// 消息队列
export const messageQueue = new Queue('hermes-messages', { connection: redis });

// 投递消息
export async function hermesRoute(envelope) {
  await messageQueue.add(envelope.message_type, envelope, {
    priority: envelope.routing_metadata?.priority === 'critical' ? 1 : 5,
    attempts: envelope.routing_metadata?.max_retries || 3,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: true,
  });
}

// 消费消息
export function startHermesWorker() {
  const worker = new Worker('hermes-messages', async (job) => {
    const envelope = job.data;
    // 10 步 Inbox 校验
    await validateInbox(envelope);
    // 路由到目标 Agent
    await deliverToAgent(envelope);
  }, { connection: redis });

  worker.on('failed', (job, err) => {
    console.error(`❌ Hermes delivery failed: ${job.id}`, err);
  });
}

// 10 步 Inbox 校验
async function validateInbox(envelope) {
  // 1. 身份验证
  if (!envelope.from_agent) throw new Error('Missing from_agent');
  // 2. 签名验证
  // 3. Trusted Relationship
  // 4. 权限验证
  // 5. 重复检测
  // 6. 过期检测
  // 7. 队列路由
  // 8. 处理函数
  // 9. Audit Log
  // 10. ACK
}
```

### 4.3 前置条件

| 步骤 | 操作 | 链接 |
|---|---|---|
| 1 | 安装 Redis | `docker run -d -p 6379:6379 redis` |
| 2 | 安装 BullMQ | `npm install bullmq ioredis` |
| 3 | 配置 REDIS_URL | 环境变量 |

---

## 5. 飞书 Bitable → 飞书 OpenAPI

### 5.1 现在（Mock）

```javascript
// demo.mjs 里现在的实现
const db = { Students: [], Challenges: [], Submissions: [] };
const dbInsert = (table, row) => {
  db[table].push(row);
  writeFileSync(`output/bitable/${table}.json`, JSON.stringify(db[table]));
};
```

### 5.2 目标（真实）

```javascript
// src/feishu/bitable.js
import axios from 'axios';

const FEISHU_APP_ID = process.env.FEISHU_APP_ID;
const FEISHU_APP_SECRET = process.env.FEISHU_APP_SECRET;
const BITABLE_APP_TOKEN = process.env.BITABLE_APP_TOKEN; // 多维表 ID

// 5 张表的 table_id（首次创建后获得）
const TABLE_IDS = {
  Students: 'tblxxxxx',
  Challenges: 'tblxxxxx',
  Submissions: 'tblxxxxx',
  Evaluations: 'tblxxxxx',
  PortfolioItems: 'tblxxxxx',
};

async function getToken() {
  const res = await axios.post(
    'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal',
    { app_id: FEISHU_APP_ID, app_secret: FEISHU_APP_SECRET }
  );
  return res.data.tenant_access_token;
}

// 写入一行
export async function bitableInsert(tableName, fields) {
  const token = await getToken();
  const res = await axios.post(
    `https://open.feishu.cn/open-apis/bitable/v1/apps/${BITABLE_APP_TOKEN}/tables/${TABLE_IDS[tableName]}/records`,
    { fields },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data.data.record.record_id;
}

// 读取全部
export async function bitableList(tableName) {
  const token = await getToken();
  const res = await axios.get(
    `https://open.feishu.cn/open-apis/bitable/v1/apps/${BITABLE_APP_TOKEN}/tables/${TABLE_IDS[tableName]}/records?page_size=500`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data.data.items;
}
```

### 5.3 前置条件

| 步骤 | 操作 | 链接 |
|---|---|---|
| 1 | 创建多维表 | 飞书文档 → 多维表格 |
| 2 | 创建 5 张表 | Students / Challenges / Submissions / Evaluations / PortfolioItems |
| 3 | 配置字段 | 按 PRD §8.1/§8.2 字段设计 |
| 4 | 获取 App Token | URL 中的 `app_token` 参数 |
| 5 | 开通权限 | bitable:app, bitable:app:table |

---

## 6. GitHub Repo → GitHub App

### 6.1 现在（Mock）

```javascript
// demo.mjs 里现在的实现
const gitCommit = (file, content, message) => {
  writeFileSync(`output/github/${file}`, content);
};
```

### 6.2 目标（真实）

```javascript
// src/github/app.js
import { createAppAuth } from '@octokit/auth-app';
import { Octokit } from '@octokit/rest';

const APP_ID = process.env.GITHUB_APP_ID;
const PRIVATE_KEY = process.env.GITHUB_PRIVATE_KEY;
const INSTALLATION_ID = process.env.GITHUB_INSTALLATION_ID;

const octokit = new Octokit({
  authStrategy: createAppAuth,
  auth: { appId: APP_ID, privateKey: PRIVATE_KEY, installationId: INSTALLATION_ID },
});

// 创建提交
export async function githubCommit(owner, repo, path, content, message) {
  // 1. 获取文件 sha（如果存在）
  let sha;
  try {
    const { data } = await octokit.repos.getContent({ owner, repo, path });
    sha = data.sha;
  } catch { /* 文件不存在 */ }

  // 2. 创建/更新文件
  await octokit.repos.createOrUpdateFileContents({
    owner, repo, path, message,
    content: Buffer.from(content).toString('base64'),
    sha,
  });
}

// 创建 PR
export async function githubCreatePR(owner, repo, title, head, base = 'main') {
  const { data } = await octokit.pulls.create({
    owner, repo, title, head, base,
  });
  return data.number;
}

// 注册 Webhook
export async function githubRegisterWebhook(owner, repo, callbackUrl) {
  await octokit.repos.createWebhook({
    owner, repo,
    config: { url: callbackUrl, content_type: 'json' },
    events: ['push', 'pull_request'],
  });
}
```

### 6.3 前置条件

| 步骤 | 操作 | 链接 |
|---|---|---|
| 1 | 注册 GitHub App | Settings → Developer settings → GitHub Apps |
| 2 | 获取 App ID + Private Key | App 设置页面 |
| 3 | 安装 App 到组织 | App 页面 → Install |
| 4 | 获取 Installation ID | 组织设置 → GitHub Apps |
| 5 | 配置 Webhook | 指向你的服务器 URL |

---

## 7. 迁移代码示例

### 7.1 迁移后的 demo-real.mjs 骨架

```javascript
// demo-real.mjs - 真实 API 版
import { sendGroupMessage } from './src/feishu/bot.js';
import { bitableInsert, bitableList } from './src/feishu/bitable.js';
import { handleChallengeAvailable, validateSubmission } from './src/agents/student-companion.js';
import { hermesRoute, startHermesWorker } from './src/hermes/queue.js';
import { githubCommit } from './src/github/app.js';

// 启动 Hermes Worker
startHermesWorker();

// Step 1: 学生加入飞书群
await sendGroupMessage('oc-elite20-c01', '大家好！我是小明 👋');

// Step 2: 老师发布挑战
await hermesRoute({
  from_agent: 'teacher-companion-t001',
  to_agent: 'submission-task-agent',
  message_type: 'challenge_publish',
  payload: { challenge_id: 'C01', title: 'Build AI Assistant', /* ... */ },
});

// Step 3: 学生写代码
await githubCommit('zhanghao', 'elite20-challenge-C01', 'README.md', '# AI Assistant', '[init] README');
await githubCommit('zhanghao', 'elite20-challenge-C01', 'ai-assistant.py', 'import anthropic...', '[feat] code');
await githubCommit('zhanghao', 'elite20-challenge-C01', 'aar.md', '# AAR\n...', '[docs] AAR');

// Step 4: 学生提交
const validation = await validateSubmission('C01', ['README.md', 'ai-assistant.py', 'aar.md']);
if (validation.valid) {
  await hermesRoute({
    from_agent: 'student-companion-zhanghao',
    to_agent: 'submission-task-agent',
    message_type: 'submission_request',
    payload: { challenge_id: 'C01', /* ... */ },
  });
}

// Step 5-7: Hermes Worker 自动处理 → 写 Bitable → 通知学生
```

### 7.2 环境变量模板

```bash
# .env
# 飞书
FEISHU_APP_ID=cli_xxxxx
FEISHU_APP_SECRET=xxxxx
BITABLE_APP_TOKEN=xxxxx

# DeepSeek
DEEPSEEK_API_KEY=sk-xxxxx

# Redis
REDIS_URL=redis://localhost:6379

# GitHub
GITHUB_APP_ID=xxxxx
GITHUB_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"
GITHUB_INSTALLATION_ID=xxxxx
```

---

## 8. 时间线

```mermaid
gantt
    title Mock → 真实 迁移时间线
    dateFormat YYYY-MM-DD
    section Week 1: 基础设施
    Redis + BullMQ 搭建           :w1a, 2026-07-14, 2d
    飞书 Bot 应用注册              :w1b, 2026-07-14, 1d
    GitHub App 注册               :w1c, 2026-07-15, 1d
    DeepSeek API 配置             :w1d, 2026-07-14, 0.5d
    section Week 2: 核心替换
    Hermes → Redis+BullMQ         :w2a, 2026-07-16, 3d
    飞书 Bitable API 集成         :w2b, 2026-07-16, 3d
    section Week 3: 智能 + 通知
    Student Companion → DeepSeek   :w3a, 2026-07-19, 2d
    飞书 Bot 通知集成             :w3b, 2026-07-19, 3d
    GitHub App Webhook            :w3c, 2026-07-21, 2d
    section Week 4: 联调
    端到端联调                    :w4a, 2026-07-23, 3d
    2 个种子学生试用               :w4b, 2026-07-26, 3d
```

### 每周交付

| 周 | 交付 | 验证 |
|---|---|---|
| **Week 1** | Redis 跑起来 + 飞书 Bot 能发消息 + GitHub App 注册 | `node demo-real.mjs` 不报错 |
| **Week 2** | Hermes 用 Redis 路由 + Bitable 能读写 | 提交后 Bitable 多 1 行 |
| **Week 3** | AI 能评分 + 飞书群收到通知 + GitHub 能 commit | 学生收到飞书 Bot 消息 |
| **Week 4** | 端到端跑通 + 2 个学生试用 | 学生完整走一遍流程 |

---

## 9. 风险与缓解

| 风险 | 影响 | 缓解 |
|---|---|---|
| 飞书应用审核慢 | 3-5 天 | 提前注册，用测试组织 |
| DeepSeek 评分不准 | 学生投诉 | 加人工复核（教师确认）|
| Redis 宕机 | 消息丢失 | 用 Redis Cloud（免运维）|
| GitHub App 权限不足 | 提交失败 | 先只读 + 创建 Issue |
| 学生不会用 | 体验差 | 写 1 页 PDF 指南 |

---

## 10. 成本估算

| 服务 | 免费额度 | 超出费用 |
|---|---|---|
| 飞书 Bot | 免费 | 免费 |
| DeepSeek | 10 元体验金 | ~0.001 元/次 |
| Redis (Upstash) | 10K 命令/天 | $0.2/10K |
| GitHub App | 免费 | 免费 |
| Vercel (部署) | 免费 | 免费 |

**总计**：前 3 个月 **< 50 元**。

---

## 11. 一句话总结

> **把 5 个 mock 换成真实 API，需要 4 周、5 个服务注册、~3000 行新代码。**
>
> **Week 1 搭基础 → Week 2 换核心 → Week 3 加智能 → Week 4 联调 + 种子学生。**
>
> **成本 < 50 元/月，风险可控。**

---

> **最后更新**: 2026-07-08
> **版本**: 1.0.0
> **状态**: ✅ 方案完成，待执行
