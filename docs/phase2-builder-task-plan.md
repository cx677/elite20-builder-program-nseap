# Elite20 / NSEAP 二期建设任务、进展与分工说明（7.6 更新版）

更新时间：2026-07-09（P0 状态刷新 + 补齐飞书表结构/部署指南/Agent拆分方案文档）  
整理人：张浩  
用途：与佟博士、老师和二期 Builder 成员对齐方向、进展、问题与下一步分工  

---

## 0. 结论先行

二期现在最重要的结论是：

> 二期不应再停留在"整理一期材料"或"继续做零散 Challenge"，而应把一期探索出的课程、Challenge、Agent、GitHub 产物、飞书管理、AI 评审和 Showcase 机制，收束成一套可运行、可展示、可复制的 **AI+X Cognitive Learning OS / NSEAP Learning Operating System MVP**。

更直白地说：

**二期要交付的是一套系统，不是一堆文件。**

这套系统的最小闭环已经在过去几天完成实测：

```text
学生 / 项目
→ Web App 提交
→ GitHub 仓库证据检查
→ DeepSeek AI 初评
→ 飞书多维表沉淀
→ Web App 作品集展示
```

当前已经证明：飞书、GitHub、Web App、DeepSeek 可以组成一个真实可运行的 AI+X Challenge 提交与 Showcase MVP。

二期接下来要做的是：

1. **把当前跑通的 MVP 产品化**：让同学、老师、评委可以访问、提交、查看和评审。
2. **把一期 Challenge 体系结构化**：形成 Challenge Catalog、Rubric、提交规范和证据账本。
3. **把系统升级为 Agent-native 架构**：学生、教师、提交、评审都不是普通函数，而是有身份、有通道、有权限、有记忆、有审计的 Agent。
4. **把学生作品资产化**：每个 GitHub 项目、AAR、AI 日志、自评、Demo 都能进入作品集和飞书记录。
5. **把 Agent / Skill / Ontology 思路落地**：从硬编码工作流升级为 Companion Agent、Submission Task Agent、Review Task Agent 与 Skill 体系。
6. **把二期团队分工明确化**：七个 Builder Team 围绕课程、挑战、平台、Agent、本体、知识库、展示协同推进。

7.6 Richard 新资料进一步明确了一个关键方向：

> 二期 MVP 不能被理解成"作业提交表单"或"LMS 小工具"，而应被设计成 Agent-native 的 Challenge 发布、提交、评审和反馈路由系统。

这意味着后续开发必须遵守几条红线：

- 每个学生要有自己的 Student Companion Agent。
- 教师要有 Teacher Companion Agent。
- 学生 Companion Agent 不能直接写最终 Submission Record。
- 学生提交必须先进入 Submission Task Agent，由系统侧 Agent 校验、登记、同步和路由。
- 所有 Agent 通信应通过 Hermes / OpenClaw 的路由思路设计。
- 所有 Agent Manifest、Message、Interface 要朝 P3394-compatible 方向设计。
- 每次状态变化都要留下 audit trace，不能只有前端页面和数据库记录。

---

## 1. 二期到底要做什么

根据 Richard / 佟博士的思路，二期不是重新上一遍 Elite20，也不是简单整理课件。

二期的目标可以概括为：

```text
把一期 AI+X 实验班的真实探索
重构成一套 AI Native 课程操作系统
并做成可复制、可部署、可演示的 MVP。
```

这套系统的核心定位是：

> 以 Companion Agent 为学生和教师的前台入口，以飞书作为运营后台，以 GitHub 作为学生产物和证据底座，以 Task Agent 执行学习任务，以 Skill 执行可复用动作，以 Ontology 和 Memory 沉淀个人与课程认知资产。

一句大白话：

**学生每做一个 Challenge，不只是交作业，而是要沉淀一个可检查的作品、一个可评价的过程、一个可进化的个人能力记录。**

7.6 后要进一步说清楚：

**学生不是直接把作业交给平台，而是让自己的 Student Companion Agent 发起提交请求；平台不是普通后端接口直接收作业，而是由 Submission Task Agent 代表系统管理员身份处理提交、写入飞书、同步 GitHub 指针、路由评审并记录审计。**

因此二期的最小系统闭环应升级为：

```text
Teacher Companion Agent 发布 Challenge
→ Feishu / GitHub / Ontology Memory 同步 Challenge 状态
→ Student Companion Agent 接收并准备作业
→ Student Companion Agent 发起 submission request
→ Submission Task Agent 校验身份、文件、权限和 GitHub pointer
→ Submission Task Agent 写入 Feishu Submission Record
→ Review Task Agent / Teacher Companion Agent / Peer Review Agent 评审
→ Feedback 回流给 Student Companion Agent
→ Portfolio / Ontology Memory 更新学生能力资产
```

---

## 2. 二期应包含哪些内容

二期建议继续沿用原来的七大模块，但要结合当前 MVP 进展重新聚焦。

### 2.1 Course / Curriculum：课程体系

目标：把一期 AI+X / Vibe Coding / Agent / Skill / Ontology 等内容重构为一门可复用课程。

包括：

- Syllabus
- Learning Objectives
- Weekly Plan
- Lecture Notes
- Labs
- Assignments
- Course Ontology

当前重点：

- 不要先追求完整教材。
- 先把课程目标、阶段、Challenge 对应关系讲清楚。

### 2.2 Challenge Library：挑战库

目标：把一期 C1-C10、C2S、C8、红队挑战等机制整理成可复用 Challenge Catalog。

包括：

- Challenge Catalog
- Challenge Template
- Rubric
- Evidence Ledger 要求
- AAR 模板
- GitHub 提交规范

当前重点：

- 每个 Challenge 要能进入 Web App / 飞书。
- 每个 Challenge 要说明交什么、如何检查、如何评价、如何进入作品集。

### 2.3 Learning Platform：学习平台

目标：搭建课程运行和协作平台。

当前已跑通的最小平台包括：

- Next.js Web App
- 飞书多维表
- GitHub 项目检查
- DeepSeek AI 初评
- Portfolio 展示接口

下一步重点：

- 部署到 Vercel 或服务器，给同学和老师可访问链接。
- 增加 Challenge 详情页。
- 增加提交记录页。
- 增加教师查看页。
- 增加作品集详情页。

### 2.4 Agent Library：智能体库

目标：把课程中的重复任务变成可复用 Agent / Skill，并且让每个 Agent 都具备明确身份、通信通道、权限边界、Manifest、Memory Binding 和 Audit Trace。

优先开发：

- Student Companion Agent：学生个人学习代理，负责理解 Challenge、检查本地作业、准备提交包、接收反馈。
- Teacher Companion Agent：教师教学代理，负责发布 Challenge、查看提交状态、触发评审和汇总反馈。
- Submission Task Agent：系统提交中枢，负责校验、登记、同步、路由和审计。
- Review Task Agent：评审任务代理，负责按 Rubric 检查和生成反馈。
- Peer Review Student Agent：同伴评审代理，可以是学生 Companion Agent 的临时任务模式。
- GitHub Check Skill：仓库证据检查。
- AAR Skill：复盘生成与检查。
- Portfolio Skill：作品集生成。
- Challenge Creation Skill：挑战生成。

当前重点：

- 先把现有 Web App 的 submit workflow 拆成 Student Companion Agent 和 Submission Task Agent 两层。
- 明确 Student Companion Agent 只能发起 submission request，不能直接写最终 Submission Record。
- 所有新接口必须带 `from_agent`、`to_agent`、`message_type`、`request_id`、`audit_trace_pointer`。
- 记录每次 Agent / Skill 执行日志。

7.6 新增关键原则：

```text
Agent 不是普通函数。
Agent 必须有身份、通道、能力声明、接口边界、权限、记忆绑定和审计记录。
```

因此后续开发不能只写 `submit()`、`review()` 这种普通后台函数，而要把它们包装成可寻址、可审计、可路由的 Agent 行为。

---

## 3. 当前存在的问题

### 3.1 产品层问题

当前 MVP 证明链路可行，但还不是一个可直接交给全班使用的产品。

主要缺口：

- 还没有登录系统。
- 学生身份目前依赖表单选择。
- Challenge 详情页不完整。
- 提交后没有学生可见的完整回执页。
- 老师没有提交管理后台。
- 作品集页面还是基础卡片，缺少项目详情页。

### 3.2 Agent / Skill 层问题

当前 workflow 还是代码里的固定流程，尚未抽象成可复用 Task Agent。

缺口：

- 没有 Student Companion Agent / Teacher Companion Agent / Submission Task Agent 的正式 Manifest。
- 没有 Agent Inbox / Outbox。
- 没有 Trusted Relationship Graph。
- 没有 Message Envelope schema。
- 没有 Skill input/output schema。
- 没有 Personal Ontology 绑定。
- 没有 ResourceConfig 自动解析。
- 没有 Memory / Skill Update 记录。
- 没有 Hermes / OpenClaw 路由抽象。
- 没有 P3394-compatible 的身份、消息、接口、审计元数据。

最重要的架构红线：

**学生 Companion Agent 不能直接写最终 Submission Record。**

现有 `/api/submit` 可以保留为 MVP 入口，但内部要逐步拆成：

```text
create_submission_request()
→ submission_task_agent.validate()
→ submission_task_agent.create_record()
→ submission_task_agent.route_review()
→ submission_task_agent.write_audit_log()
→ notify_student_companion()
```

---

## 4. 二期七个 Builder Team 分工更新建议

### Team 1 Curriculum Team：课程体系组

负责人建议：张浩可继续牵头课程架构初稿，后续老师补充课程内容。

本周最小交付：

- `syllabus/README.md`
- `learning-objectives.md`
- `weekly-plan/week-01.md`
- `course-to-challenge-map.md`

重点任务：

- 定义二期课程目标。
- 说明 AI+X Cognitive Learning OS 如何支撑课程。
- 把课程知识点映射到 Challenge。

### Team 2 Challenge Team：挑战库组

成员建议：刘婷婷、史雨萱等继续推进。

本周最小交付：

- `challenge-catalog/README.md`
- `challenge-catalog/C2S.md`
- `challenge-catalog/C8.md`
- `rubrics/default-rubric.md`
- `submission-checklist.md`

重点任务：

- 把一期 Challenge 重新整理成统一模板。
- 每个 Challenge 写清楚：
  - 背景
  - 目标
  - 交付物
  - GitHub 要求
  - AAR 要求
  - Rubric
  - 是否进入作品集

### Team 3 Agent Team：智能体组

成员建议：冯静雯、张照航、陈万康等继续推进。

本周最小交付：

- `agents/manifests/student-companion-agent.schema.json`
- `agents/manifests/teacher-companion-agent.schema.json`
- `agents/manifests/submission-task-agent.schema.json`
- `agents/messages/challenge_submission_request.schema.json`
- `agents/inbox/README.md`
- `agents/audit/audit-log-schema.md`

重点任务：

- 把当前 Web App 的 submit workflow 拆成 Student Companion Agent 和 Submission Task Agent。
- 定义 Teacher Companion Agent 的 Challenge 发布接口。
- 定义 Review Task Agent 的评审接口。
- 定义 Agent Inbox / Outbox 的最小结构。
- 定义 Message Envelope：所有消息必须包含 `message_id/request_id`、`from_agent`、`to_agent`、`timestamp`、`payload`、`routing metadata`、`audit trace pointer`。
- 定义 Trusted Relationship Graph：谁能自动触发谁，谁必须人工批准。
- 明确 Agent 与 Feishu / GitHub / DeepSeek 的接口。

验收标准：

- 任意一次提交都能看出是谁发起、哪个 Agent 处理、写入了哪条飞书记录、指向哪个 GitHub commit、路由给谁评审。
- Student Companion Agent 没有直接写最终 Submission Record 的权限。
- Submission Task Agent 有独立 `agent_id` 和审计日志。

### Team 4 Ontology Team：本体组

成员建议：Richard / 佟博士方向对齐，张浩负责落地版字段草案。

本周最小交付：

- `course-ontology/README.md`
- `challenge-ontology/README.md`
- `submission-ontology/README.md`
- `agent-ontology/README.md`
- `relationship-graph-schema.md`
- `message-envelope-schema.md`
- `resource-config-schema.md`

重点任务：

- 定义 Learner、Course、Challenge、Artifact、Assessment、AAR、Portfolio 的关系。
- 定义 AgentIdentity、AgentManifest、AgentInbox、AgentOutbox、TrustedRelationship、Presence、AuditTrace 的关系。
- 定义 ResourceConfig：每个学生/老师的飞书、GitHub、课程、Rubric 配置。
- 为后续 Personalized Skill 打基础。
- 把 P3394-compatible 的方向先落成可实现字段，不做空泛概念。

### Team 5 Platform Team：平台组

成员建议：吴嘉宇、牛保康等，张浩负责当前 MVP handoff。

本周最小交付：

- `platform/current-mvp-status.md`
- `deployment/vercel-guide.md`
- `github/github-integration.md`
- `feishu/feishu-setup-guide.md`
- `platform/agent-workflow-refactor-plan.md`

重点任务：

- 把当前本地 MVP 部署到 Vercel 或服务器。
- 增加 Challenge 详情页、提交记录页、作品详情页。
- 整理飞书/GitHub/DeepSeek 环境变量配置说明。
- 明确 demo 数据和真实数据边界。
- 在现有 `/api/submit` 内部增加 submission request、Agent ID、routing status、audit log 的结构化字段。
- 为后续 Hermes / OpenClaw 路由预留 `message_router` 接口。

### Team 6 Knowledge Team：知识库组

成员建议：尹镇宇等继续推进。

本周最小交付：

- `knowledge-base/README.md`
- `prompt-library/README.md`
- `best-practices/github-submission.md`
- `case-studies/zhiyin-ai-navigator.md`
- `case-studies/c2s-zhanghao.md`

重点任务：

- 整理一期优秀作业、AI 日志、Prompt、踩坑记录。
- 把当前 MVP 调试经验沉淀成知识库：
  - 飞书 91403 Forbidden 如何解决
  - GitHub private repo 如何检查
  - DeepSeek 如何接入 OpenAI-compatible API

### Team 7 Demo Team：展示组

成员建议：暂未明确，需要尽快指定。

本周最小交付：

- `presentation/demo-script.md`
- `demo-video/storyboard.md`
- `showcase/README.md`
- `progress-update-for-group.md`

重点任务：

- 准备 3 分钟演示脚本。
- 用三张截图讲清楚：
  - 飞书后台
  - GitHub 作业仓库
  - Web App 前台
- 整理群内同步文案。
- 准备给佟博士/老师看的进展版本。

---

## 5. 当前建议的优先级

### P0：马上要做

| # | 任务 | 状态 | 说明 |
|---|---|---|---|
| 1 | 部署当前 Web App 到 Vercel / 服务器 | ⬜ 待做 | 代码在 `ai-x-challenge-learning-mvp` 独立仓库，本地 localhost:3000 可运行 |
| 2 | 整理演示脚本和截图说明 | ⬜ 待做 | `teams/demo-team/` 已建，内容待补 |
| 3 | 把 C2S 和真实项目作为演示数据 | ✅ 已做 | `ai-x-student-homework-demo` 已有真实提交，飞书已有记录 |
| 4 | 写清楚当前 MVP 的边界和下一步计划 | ✅ 已做 | 白皮书 `docs/technical-whitepaper-20260708.md` 完整覆盖 |
| 5 | 定义 4 个核心 Agent Manifest | ✅ 已做 | `agents/manifests/` 下 Student/Teacher Companion + Submission/Review Task Agent schema 齐全 |
| 6 | 定义最小 Message Envelope 和 Audit Log schema | ✅ 已做 | `agents/messages/message-envelope-schema.md` + `agents/audit/audit-log-schema.md` 完整 |
| 7 | 在飞书表中补充 Agent ID / Routing Status / Audit Pointer 字段 | ✅ 已做 | Submissions 表新增12个字段 + Challenges表新增2个字段 (2026-07-09) |
| 8 | Challenge 详情页 | ⬜ 待做 | WebApp 侧需补，白皮书 §13.2 已规划 |
| 9 | 提交详情页（含 AI 初评、状态、缺失项） | ⬜ 待做 | 白皮书 §13.2 P0 |
| 10 | Challenge Library 结构化 C01-C10 | ✅ 已做 | `challenges/Challenge-Library/` 三级 10 个 Challenge + Rubric + 模板齐全 |
| 11 | 飞书表字段中文规范化 | ✅ 已做 | Submissions表所有字段已改为中文名，AuditLogs + InboxQueue 两张新表已创建 |
| 12 | 增加提交状态流转（已提交→检查失败→待评审→需修改→已完成） | ⚠️ 字段已建 | 状态字段（系统校验结果/路由状态/评审状态）已创建，代码流转逻辑待实现 |

### P1：一周内做

1. Challenge 详情页。
2. 提交记录页。
3. 作品详情页。
4. 教师查看提交列表。
5. 飞书表结构补齐 Courses / Rubrics / AARs。
6. 把 `/api/submit` 重构为 Student Companion Agent → Submission Task Agent 的内部流程。
7. 实现轻量 Inbox Queue：先用数据库表模拟，不急着上复杂消息队列。
8. 实现 Teacher Companion Agent 的发布 Challenge 最小流程。

### P2：两到三周做

1. Personal OKF / ResourceConfig。
2. AAR Agent / Evaluation Agent / Review Task Agent。
3. 教师复评功能。
4. Showcase 门户。
5. GitHub Organization / GitHub App 方案。
6. Peer Review Agent 路由。
7. Hermes / OpenClaw 路由层抽象。
8. P3394-compatible Manifest / Message / Interface 文档化。

---

## 6. 附录 A：当前 MVP 技术状态

当前本地路径：

```text
/Users/zhanghao/Documents/Codex/2026-07-02/n-ni/重构AI+X/app
```

当前本地地址：

```text
http://localhost:3000
```

当前 API：

- `GET /api/health`
- `GET /api/students`
- `GET /api/challenges`
- `GET /api/portfolio`
- `POST /api/github/check`
- `POST /api/submit`

当前环境：

- Feishu：已接通
- GitHub：已接通
- DeepSeek：已接通
- OpenAI：未配置

当前核心限制：

- 本地运行，未上线。
- 无登录系统。
- 无教师后台。
- 无完整 Course / Rubric / AAR 表。
- Agent / Skill 还未抽象化。
- Agent Inbox / Outbox 还未实现。
- Trusted Relationship Graph 还未实现。
- Submission Task Agent 还未从 `/api/submit` 中独立出来。
- Hermes / OpenClaw 当前还只是架构方向，尚未形成路由抽象。
- P3394-compatible Manifest / Message / Interface 还未落成 schema。
