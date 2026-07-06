# Agent Collaboration Flow（7.6 更新版）

## 架构变化说明

7.6 前的旧方向（3 个辅助工具型 Agent）：

- Project Manager Agent（进度跟踪工具）
- Coding Coach Agent（开发辅助工具）
- Evaluation Agent（评审工具）

7.6 新方向（4 个系统级 Agent，有身份、有通道、有权限、有审计）：

- Student Companion Agent — 每个学生一个，是学生的学习代理人
- Teacher Companion Agent — 每位教师一个，是教师的教学代理人
- Submission Task Agent — 系统侧提交中枢，是系统管理员身份
- Review Task Agent — 评审任务代理，按 Rubric 执行评审

这不只是改名，而是从"工具"到"Agent"的根本转变：

```text
工具：被调用，完成一个函数
Agent：有身份、有 Inbox/Outbox、有 Trusted Relationship、有审计记录、有持久记忆
```

---

## 核心协作流程

### 场景一：教师发布 Challenge

```text
Teacher Companion Agent
→ 编写 Challenge 内容（标题、目标、Rubric、截止时间）
→ Outbox 发出 challenge_publish 消息
→ Submission Task Agent Inbox 接收
  ├── 验证 Teacher Identity
  ├── 验证 Challenge 字段完整性
  └── 写入 Feishu Challenge Record
→ 所有 Student Companion Agent 收到 challenge_available 通知
```

### 场景二：学生提交作业（核心流程）

```text
Student Companion Agent
→ 理解 Challenge 要求
→ 检查本地 GitHub 仓库（README、最新 commit、必须文件）
→ 准备 submission_request（含 student_id、challenge_id、github_repo_url、aar_text 等）
→ Outbox 发出 submission_request 消息

Submission Task Agent Inbox 接收
├── 验证 from_agent 身份（必须是已知 Student Companion Agent）
├── 验证 Trusted Relationship（该学生是否在本 Challenge 的学生列表）
├── 验证 student_id、challenge_id 有效
├── 验证 Challenge 状态为 active
├── 验证 GitHub repo 存在且可访问
├── 验证文件完整性（README、AAR）
├── 生成 submission_id
├── 写入 Feishu Submission Record
├── 写入 Feishu Evaluation（AI 初评）
├── 写入 Feishu PortfolioItem
├── 写入 Audit Log
├── 更新 submission routing_status → "pending_review"
└── 根据 review_mode 路由

路由到 Review Task Agent
→ 按 rubric_pointer 读取 Rubric
→ 生成评审报告（strengths、weaknesses、suggestions、score）
→ 写入 Feishu Evaluation 更新
→ Audit Log 记录评审完成

Submission Task Agent 回传
→ 更新 routing_status → "reviewed"
→ Outbox 发出 feedback 消息
→ Student Companion Agent Inbox 接收反馈
→ Portfolio / Ontology Memory 更新
```

### 场景三：教师查看提交状态

```text
Teacher Companion Agent
→ 查询 Feishu Submission 表（按 challenge_id 过滤）
→ 查看 routing_status、review_status
→ 触发人工复评（发送 manual_review_request 给 Review Task Agent）
→ 确认最终评分
→ Outbox 发出 final_feedback 消息
→ Student Companion Agent 接收最终反馈
```

---

## 各 Agent 职责边界

### Student Companion Agent

**能做的**：
- 理解 Challenge 要求
- 检查学生本地 GitHub 仓库
- 准备提交包（submission request）
- 接收反馈和通知
- 更新学生个人 Ontology Memory

**不能做的**：
- 直接写最终 Submission Record（这是架构红线）
- 修改 Feishu 中其他学生的记录
- 直接访问 Review Task Agent

---

### Teacher Companion Agent

**能做的**：
- 发布 Challenge
- 查看所有学生提交状态
- 触发评审
- 确认最终评分
- 汇总班级学习情况

**不能做的**：
- 直接写 Submission Record（由 Submission Task Agent 负责）
- 访问学生个人 Ontology Memory（隐私保护）

---

### Submission Task Agent

**能做的**：
- 接收和处理 submission_request
- 校验所有提交条件
- 写入 Feishu Submission / Evaluation / PortfolioItem
- 路由给 Review Task Agent
- 写入 Audit Log
- 回传反馈给 Student Companion Agent

**是系统管理员身份**：代表系统执行写入，不代表任何个人。

---

### Review Task Agent

**能做的**：
- 读取 Submission Record
- 按 rubric_pointer 加载 Rubric
- 生成评审报告（分维度打分）
- 生成学生可读和教师可审阅的两份反馈

**不能做的**：
- 直接写最终分数到 Submission（需要通过 Submission Task Agent）

---

## Inbox 处理原则

每个 Agent 的 Inbox 在接收消息时执行：

```text
Incoming Message
→ 1. 验证发送方身份（from_agent 存在？）
→ 2. 验证签名（防伪造）
→ 3. 验证 Trusted Relationship（发送方在接收方的可信列表中？）
→ 4. Policy Check（消息类型被允许？）
→ 5. Companion Online Detection（接收方在线？）
→ 6a. 在线且可信 → 直接处理
→ 6b. 离线且可信 → 放入 Offline Queue
→ 6c. 不可信 → 放入 Pending Queue，等待人工批准
→ 6d. 拒绝 → 写入 Audit Log，返回拒绝通知
```

---

## Submission 状态机

```text
draft
→ submitted（Student Companion Agent 发起 request）
→ validating（Submission Task Agent 校验中）
→ needs_revision（校验失败，通知学生）
→ checked（校验通过，写入飞书）
→ pending_review（等待评审）
→ under_review（Review Task Agent 评审中）
→ reviewed（AI 评审完成）
→ pending_teacher_review（等待教师确认）
→ accepted（教师确认）
→ needs_teacher_revision（教师要求修改）
```

---

## MVP 简化方案

当前阶段不要求完整实现分布式 Agent 平台，按以下顺序逐步落地：

1. **当前（已完成）**：单体 workflow，端到端跑通
2. **P0（本周）**：
   - 拆分 `/api/submit` 为 submission_request + SubmissionTaskAgent 两段
   - 加入 agent_id 和 audit_log 字段
   - 用数据库表模拟 Inbox Queue
3. **P1（一周内）**：
   - Teacher Companion Agent 发布 Challenge 最小流程
   - 教师查看提交列表
   - Review Task Agent 评审接口
4. **P2（两三周）**：
   - Trusted Relationship 校验
   - Hermes / OpenClaw 路由层抽象
   - P3394-compatible 完整对齐

---

## 相关文档

- `agents/manifests/` — 各 Agent 的 Manifest Schema
- `agents/messages/message-envelope-schema.md` — Message Envelope 定义
- `agents/inbox/README.md` — Inbox 基础设施设计
- `agents/audit/audit-log-schema.md` — Audit Log 结构
- `ontology/agent-ontology.md` — Agent 运行要素的语义定义
