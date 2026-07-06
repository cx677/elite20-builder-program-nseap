# Platform Team

负责平台开发、部署与运维。

## 当前成员

- 吴嘉宇
- 牛保康
- 张浩（MVP handoff）

## 核心任务（7.6 更新）

**重要变化**：当前已有跑通的 Next.js MVP，任务不再是"从零规划平台"，而是"接手现有代码 + 部署 + Agent 架构重构"。

## 当前 MVP 状态

已跑通的最小闭环：

```text
学生表单提交
→ /api/submit
→ workflow.ts: submitChallengeProject()
  ├── feishu.getStudentById / getChallengeById
  ├── github.checkRepoHealth
  ├── ai.evaluateSubmission (DeepSeek)
  ├── feishu.createSubmission
  ├── feishu.createEvaluation
  └── feishu.createPortfolioItem
→ 前端展示作品集
```

**代码路径**：`/Users/zhanghao/Documents/Codex/2026-07-02/n-ni/重构AI+X/app`

**本地地址**：`http://localhost:3000`

**已接通**：飞书、GitHub、DeepSeek

**核心限制**：
- 本地运行，未上线
- 无登录系统
- 无教师后台
- Agent / Skill 还未抽象化
- Submission Task Agent 还未从 `/api/submit` 中独立出来

## 本周最小交付

### P0：立即部署

1. **Vercel 部署**
   - `deployment/vercel-guide.md`
   - 配置生产环境变量（飞书、GitHub、DeepSeek）
   - 轮换已暴露的 API key
   - 给同学和老师可访问的链接

2. **环境配置文档**
   - `feishu/feishu-setup-guide.md`
   - `github/github-integration.md`
   - `platform/current-mvp-status.md`

### P1：Agent 架构重构

3. **把 `/api/submit` 拆成 Agent 消息链**

当前单体流程：
```typescript
POST /api/submit
→ submitChallengeProject(input)
  → 直接写飞书
```

目标 Agent 流程：
```typescript
POST /api/submit
→ createSubmissionRequest(input)  // 学生 Companion Agent 发起
  → 返回 request_id

系统内部：
submissionRequestQueue.process()
→ SubmissionTaskAgent.validate()
→ SubmissionTaskAgent.createRecord()
→ SubmissionTaskAgent.routeReview()
→ SubmissionTaskAgent.writeAuditLog()
→ notifyStudentCompanion()
```

需要新增：
- `submission_request` 表（Inbox Queue）
- `audit_logs` 表
- `agent_identities` 表
- `src/lib/agents/submission-task-agent.ts`
- `src/lib/agents/message-envelope.ts`

4. **Agent 字段补充**

在飞书表中补充：
- Submission 表：`submitted_by_agent_id`、`processed_by_agent_id`、`routing_status`、`audit_log_pointer`
- Challenge 表：`teacher_agent_id`、`rubric_pointer`

### P2：功能补全

5. **Challenge 详情页** (`/challenges/[id]`)
6. **提交记录页** (`/submissions`)
7. **作品详情页** (`/portfolio/[id]`)
8. **教师查看入口** (`/teacher/submissions`)

## 技术栈

- **前端**：Next.js 15 + React + TypeScript + Tailwind CSS
- **后端**：Next.js API Routes
- **数据库**：飞书多维表（Feishu Bitable）
- **AI**：DeepSeek API（OpenAI-compatible）
- **代码托管**：GitHub
- **部署**：Vercel

## 当前代码结构

```
app/
├── src/
│   ├── app/
│   │   ├── page.tsx (首页)
│   │   ├── submit/page.tsx (提交页)
│   │   ├── challenges/page.tsx (Challenge 列表)
│   │   ├── portfolio/page.tsx (作品集)
│   │   └── api/
│   │       ├── health/route.ts
│   │       ├── students/route.ts
│   │       ├── challenges/route.ts
│   │       ├── portfolio/route.ts
│   │       ├── github/check/route.ts
│   │       └── submit/route.ts (核心提交接口)
│   └── lib/
│       ├── types.ts (类型定义)
│       ├── workflow.ts (核心工作流)
│       ├── feishu.ts (飞书集成)
│       ├── github.ts (GitHub 检查)
│       ├── ai.ts (DeepSeek 评审)
│       └── env.ts (环境变量)
├── .env.local (本地环境变量)
└── .env.example (环境变量模板)
```

## Agent 重构方案

新增目录结构：

```
src/lib/agents/
├── message-envelope.ts (消息封装)
├── audit-logger.ts (审计日志)
├── submission-task-agent.ts (提交中枢)
├── inbox-queue.ts (消息队列)
└── types.ts (Agent 类型定义)
```

## 与其他 Team 的接口

- **Agent Team**：提供 Message Envelope schema、Audit Log schema、Agent Manifest 规范
- **Ontology Team**：定义 Submission、Evaluation、PortfolioItem 的 Agent 字段
- **Challenge Team**：每个 Challenge 提供标准提交要求和 Rubric

## 环境变量清单

生产环境需要：

```bash
# 飞书
FEISHU_APP_ID=
FEISHU_APP_SECRET=
FEISHU_APP_TOKEN=
FEISHU_STUDENTS_TABLE_ID=
FEISHU_CHALLENGES_TABLE_ID=
FEISHU_SUBMISSIONS_TABLE_ID=
FEISHU_EVALUATIONS_TABLE_ID=
FEISHU_PORTFOLIO_TABLE_ID=

# GitHub
GITHUB_TOKEN=

# AI
DEEPSEEK_API_KEY=
DEEPSEEK_BASE_URL=https://api.deepseek.com
```

## 部署检查清单

- [ ] Vercel 项目创建
- [ ] 环境变量配置
- [ ] 飞书应用权限确认
- [ ] GitHub token 更新（不使用个人 token）
- [ ] DeepSeek API key 确认
- [ ] Demo 数据和真实数据分离
- [ ] 首次部署测试
- [ ] 给同学和老师发访问链接

## 验收标准

- [ ] 平台可公开访问（Vercel URL）
- [ ] 环境变量文档完整
- [ ] 提交流程可追溯（能看到 Agent ID 和 Audit Log）
- [ ] Challenge / Submission / Portfolio 三个核心页面可用
- [ ] 教师可查看所有提交

## 参考资料

- 当前 MVP 代码：`/Users/zhanghao/Documents/Codex/2026-07-02/n-ni/重构AI+X/app`
- 任务规划：`docs/phase2-builder-task-plan.md`
- Agent 架构：`agents/agent-collaboration-flow.md`（待更新）
