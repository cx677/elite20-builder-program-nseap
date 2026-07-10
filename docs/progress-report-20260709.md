# Elite20 / NSEAP 二期建设 — 项目进展报告

版本：v3.0  
日期：2026-07-09  
整理人：张浩  
用途：向 Richard、佟博士、老师和全体 Builder 成员同步进展  

---

## 0. 结论先行

二期在过去一周完成了从"概念规划"到"可运行 MVP + 完整设计文档"的实质性跨越。

**已完成的里程碑：**

1. ✅ **MVPS 代码跑通**：Next.js WebApp + 飞书多维表 + GitHub 检查 + DeepSeek AI 初评 + 作品集展示的最小闭环已在本地运行
2. ✅ **技术白皮书完成**：21 章完整系统架构文档，覆盖 Agent 架构、数据模型、通信协议、安全权限、路线图
3. ✅ **Agent 架构设计落地**：4 个核心 Agent 的 JSON Manifest/Schema、Message Envelope 协议、Inbox/Outbox 设计、Audit Log 设计全部完成
4. ✅ **Challenge Library 建成**：C01-C10 三级 10 个 Challenge + Rubric + AAR/KSTAR 模板齐全
5. ✅ **飞书基础设施就绪**：7 张表全部建好，Submissions 表 12 个 Agent 字段已补齐，AuditLogs + InboxQueue 表已创建
6. ✅ **施工文档四件套**：飞书表结构文档、Vercel 部署指南、Agent 拆分实施文档、环境变量模板全部补齐

**一句话：设计图纸画完了，施工手册写好了，飞书数据库建好了，MVP 代码跑通了。下一步是 Platform Team 接手部署和 Agent 拆分。**

---

## 1. 仓库全景

### 主设计仓库

```
https://github.com/a976xw7td/elite20-builder-program-nseap
```

当前状态：93 个 Markdown 文件，126 个总文件，7 个团队工作区，11 份核心文档。

| 目录 | 内容 | 文件数 | 状态 |
|---|---|---|---|
| `docs/` | 白皮书、路线图、部署指南、Agent 拆分方案 | 11 | ✅ 密集更新 |
| `agents/` | Agent Manifest、Message Envelope、Inbox/Outbox、Audit Log | 含 7 个 Manifest/Schema | ✅ 完整 |
| `challenges/` | Challenge Library C01-C10 + Rubric + 模板 | 14 | ✅ 完整 |
| `ontology/` | Course/Skill/Challenge/Project/Assessment/Agent Ontology | 6 | ✅ 基础完成 |
| `methodology/` | Situation-to-Agent、FDE、KSTAR、Skill 构建 | 4 | ✅ 完整 |
| `knowledge-base/` | Prompt 库、最佳实践、案例、FAQ、Schema | 10 | ⚠️ 内容可继续充实 |
| `teams/` | 7 组 README + Platform 静态课程门户 | 16 + 28 HTML | ✅ 结构完整 |
| `examples/` | Challenge → Cognitive Cell 端到端案例 | 11 | ✅ 已有一个完整案例 |
| `governance/` | 贡献和评审规则 | 2 | ✅ |

### MVP 代码仓库

```
https://github.com/a976xw7td/ai-x-challenge-learning-mvp
```

Next.js 15 + TypeScript + Tailwind CSS，飞书做数据库，GitHub 做证据底座，DeepSeek 做 AI 评审。

**已跑通的核心流程：**

```
学生选择 Challenge
→ WebApp 表单提交 GitHub 项目链接
→ 系统检查 GitHub 仓库（存在/README/commit）
→ DeepSeek AI 生成五维度初评
→ 写入飞书多维表（Submission + Evaluation + PortfolioItem）
→ WebApp 作品集展示
```

**页面（4个）**：首页 `/`、Challenge 列表 `/challenges`、提交页 `/submit`、作品集 `/portfolio`  
**API（6个）**：health、students、challenges、portfolio、submit、github/check

---

## 2. 七个 Builder Team 当前进展

### Team 1 Curriculum Team（课程体系组）

| 成员 | 张浩（牵头） |
|---|---|
| 本周交付 | 🟡 部分完成 |
| 已有 | `teams/curriculum-team/README.md` |
| 待补 | syllabus、learning-objectives、weekly-plan、course-to-challenge-map |

> 课程内容已经分散在 Challenge Library 和 Platform 静态门户中，尚未整理成独立 syllabus。

### Team 2 Challenge Team（挑战库组）✅

| 成员 | 刘婷婷、史雨萱 |
|---|---|
| 本周交付 | ✅ 超额完成 |
| 已完成 | Challenge Library 三级 10 个完整 Challenge |

```
Level 1（入门）：C01 第一个AI助手, C02 AI结对编程, C03 提示工程, C04 AI研究综述
Level 2（进阶）：C05 单Agent开发, C06 多Agent协作, C07 数据管道, C08 IM集成
Level 3（实战）：C09 真实项目, C10 平台重构
```

附带：`assessment-rubric.md`（C4A 评估体系）、`aar-template.md`、`kstar-template.md`

### Team 3 Agent Team（智能体组）✅

| 成员 | 冯静雯、张照航、陈万康 |
|---|---|
| 本周交付 | ✅ 超额完成 |

**已完成的核心设计：**

| 交付物 | 文件 | 状态 |
|---|---|---|
| Student Companion Agent Manifest | `agents/manifests/student-companion-agent.schema.json` | ✅ |
| Teacher Companion Agent Manifest | `agents/manifests/teacher-companion-agent.schema.json` | ✅ |
| Submission Task Agent Manifest | `agents/manifests/submission-task-agent.schema.json` | ✅ |
| Review Task Agent Manifest | `agents/manifests/review-task-agent.schema.json` | ✅ |
| Message Envelope Schema | `agents/messages/message-envelope-schema.md` | ✅ |
| Inbox/Outbox 设计 | `agents/inbox/README.md` | ✅ |
| Audit Log Schema | `agents/audit/audit-log-schema.md` | ✅ |
| Agent 协作流程 | `agents/agent-collaboration-flow.md` | ✅ |

每个 Agent Manifest 包含：capabilities、interfaces（input/output schema）、permissions、trusted_agents、memory_binding、constraints。

### Team 4 Ontology Team（本体组）

| 成员 | Richard（方向）、张浩（落地） |
|---|---|
| 本周交付 | 🟡 基础完成 |

已完成 6 个 Ontology 初稿：Course、Skill、Challenge、Project、Assessment、Agent。  
关系图谱 schema、消息信封 schema、资源配置 schema 待创建。

### Team 5 Platform Team（平台组）🆕

| 成员 | 吴嘉宇、牛保康、张浩（handoff） |
|---|---|
| 本周交付 | ✅ 多项完成 |

**已交付：**

| 交付物 | 说明 |
|---|---|
| 静态课程门户 | `teams/platform-team/course-platform/` 28 个文件，含 10 个课程 HTML 页面、文档中心、Agent 接口说明、部署指南 |
| 飞书表结构文档 | `docs/feishu-table-schema.md` — 7 张表完整字段对照 |
| Vercel 部署指南 | `docs/vercel-deploy-guide.md` — 逐步操作 + 验证 + FAQ |
| Agent 拆分实施文档 | `docs/agent-refactor-plan.md` — workflow.ts → 消息链完整代码示例 |
| 环境变量模板 | `ai-x-challenge-learning-mvp/.env.example` — 含 table_id |

**飞书基础设施（今日完成）：**
- Submissions 表新增 12 个 Agent 字段（提交发起Agent、处理Agent、请求ID、系统校验结果、评审模式、路由状态、评审状态、审计日志指针 等）
- Challenges 表新增 2 个字段（教师Agent ID、评分标准指针）
- 创建 AuditLogs 表（11 字段）
- 创建 InboxQueue 表（15 字段）

**待做：**
- Vercel 部署（代码已就绪，环境变量已配置）
- `/api/submit` 重构为 Agent 消息链
- Challenge 详情页、提交详情页、教师控制台

### Team 6 Knowledge Team（知识库组）

| 成员 | 尹镇宇 |
|---|---|
| 本周交付 | 🟡 基础框架完成 |

已有：Prompt 库模板、最佳实践（DeepSeek API、飞书配置、GitHub 提交）、案例研究（智引 AI 导航导师）、FAQ、Schema 定义。  
内容可继续充实。

### Team 7 Demo Team（展示组）

| 成员 | 张浩 |
|---|---|
| 本周交付 | 🟡 入口已建 |

`teams/demo-team/README.md` 已建。演示脚本、截图、群内同步文案待补充。

---

## 3. P0 任务完成情况

| # | 任务 | 状态 | 完成日期 |
|---|---|---|---|
| 1 | 部署 Web App 到 Vercel / 服务器 | ⬜ 待做 | — |
| 2 | 整理演示脚本和截图说明 | ⬜ 待做 | — |
| 3 | C2S 和真实项目作为演示数据 | ✅ | 07-03 |
| 4 | MVP 边界和下一步计划（白皮书） | ✅ | 07-08 |
| 5 | 4 个核心 Agent Manifest | ✅ | 07-06 |
| 6 | Message Envelope + Audit Log schema | ✅ | 07-06 |
| 7 | 飞书表 Agent 字段补充 | ✅ | 07-09 |
| 8 | Challenge 详情页 | ⬜ 待做 | — |
| 9 | 提交详情页 | ⬜ 待做 | — |
| 10 | Challenge Library C01-C10 | ✅ | 07-07 |
| 11 | 飞书表字段中文规范化 | ✅ | 07-09 |
| 12 | 提交状态流转 | ⚠️ | 字段已建/代码待补 |

**P0 完成率：7/12 ✅ + 1 ⚠️ = 67%**

---

## 4. 关键架构决策

### 4.1 Agent 架构红线

以下几条是 Richard 7.6 资料明确要求、已落地到设计中的核心红线：

1. **Student Companion Agent 不能直接写 Submission Record** — 已在 Manifest 中通过 `constraints.cannot_write_submission_record: true` 明确
2. **只有 Submission Task Agent 能写最终提交记录** — `submission-task-agent.schema.json` 中 `constraints.only_agent_that_can_write_submission_record: true`
3. **所有 Agent 通信必须经过 Message Envelope** — `agents/messages/message-envelope-schema.md` 定义了标准消息格式
4. **每次状态变化必须有 Audit Log** — `agents/audit/audit-log-schema.md` 定义了完整审计结构
5. **Agent 不是普通函数** — 每个 Agent 都有 identity、capabilities、interfaces、permissions、trusted_agents、memory_binding

### 4.2 四个空间同步

```
本地 Workspace：学生干活的地方
GitHub Repo：作品证据和版本证据
飞书多维表：运营后台（7 张表）
Ontology Memory：Agent 长期记忆（待实现）
```

### 4.3 技术栈

| 层 | 技术 |
|---|---|
| 前端 | Next.js 15 + React + TypeScript + Tailwind CSS |
| 后端 | Next.js API Routes |
| 数据库 | 飞书多维表（Bitable API） |
| AI | DeepSeek API（OpenAI-compatible） |
| 代码托管 | GitHub |
| Agent 设计 | JSON Schema / Manifest（朝 P3394 方向对齐） |

---

## 5. 下一步优先事项

### P0（本周必须完成）
1. Vercel 部署 — 让同学和老师能访问
2. 演示脚本 — 准备给佟博士/老师看的版本

### P1（下周）
3. Challenge 详情页 + 提交详情页 — 学生能看到任务要求和提交回执
4. 教师控制台 — 老师能查看全班提交状态
5. Agent 拆分 — 按 `docs/agent-refactor-plan.md` 改造 `/api/submit`

### P2（两周内）
6. 登录/身份认证 — 学生名单导入 + 身份匹配
7. 提交状态流转 — 已提交→检查失败→待评审→需修改→已完成
8. Peer Review Agent — 同伴评审路由

---

## 6. 附录：文件清单

### 核心文档（新产出）

| 文档 | 位置 | 用途 |
|---|---|---|
| 技术白皮书 | `docs/technical-whitepaper-20260708.md` | 完整系统架构（21章） |
| 飞书表结构 | `docs/feishu-table-schema.md` | Platform Team 建表依据 |
| Vercel 部署指南 | `docs/vercel-deploy-guide.md` | 部署操作手册 |
| Agent 拆分方案 | `docs/agent-refactor-plan.md` | workflow.ts → Agent 消息链 |
| 二期任务计划 | `docs/phase2-builder-task-plan.md` | P0-P2 任务 + 团队分工 |
| 团队路线图 | `teams/team-roadmap.md` | 7 组职责 + 交付物 |

### Agent 设计文件

| 文件 | 说明 |
|---|---|
| `agents/manifests/student-companion-agent.schema.json` | 学生 Companion Agent |
| `agents/manifests/teacher-companion-agent.schema.json` | 教师 Companion Agent |
| `agents/manifests/submission-task-agent.schema.json` | 提交中枢 Agent（架构红线） |
| `agents/manifests/review-task-agent.schema.json` | 评审执行 Agent |
| `agents/messages/message-envelope-schema.md` | 消息信封标准 |
| `agents/inbox/README.md` | Inbox/Outbox 设计 |
| `agents/audit/audit-log-schema.md` | 审计日志设计 |

### 外部仓库

| 仓库 | 说明 | 状态 |
|---|---|---|
| `ai-x-challenge-learning-mvp` | MVP 代码（Next.js） | 本地运行，待部署 |
| `ai-x-student-homework-demo` | 真实作业 Demo 数据 | 已提交飞书 |
| `raymond-agent` | Companion Agent 代码 | 架构阶段 |

---

> **报告结语**：二期已经从"七个 Team 分工规划"推进到"设计文档完整 + MVP 代码可运行 + 飞书基础设施就绪"。接下来核心是把现有 MVP 部署上线，让同学和老师能真实使用，然后按 Agent 拆分方案逐步将单体 workflow 升级为 Agent-native 架构。
