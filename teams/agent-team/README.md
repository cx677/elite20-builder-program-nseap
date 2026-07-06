# Agent Team

负责开发课程 Agent 与智能体架构。

## 当前成员

- 冯静雯
- 张照航
- 陈万康

## 核心任务（7.6 更新）

二期 Agent 架构已从"辅助工具"升级为"Agent-native 系统架构"。核心变化：

**旧方向**：Project Manager Agent、Coding Coach Agent、Evaluation Agent（3个辅助工具）

**新方向**：Student Companion Agent、Teacher Companion Agent、Submission Task Agent、Review Task Agent（基于身份和权限的系统级 Agent）

## 本周最小交付

### 1. Agent Manifest（JSON Schema）

- `agents/manifests/student-companion-agent.schema.json`
- `agents/manifests/teacher-companion-agent.schema.json`
- `agents/manifests/submission-task-agent.schema.json`
- `agents/manifests/review-task-agent.schema.json`

每个 Manifest 必须包含：
- `agent_id`、`agent_name`、`agent_type`
- `capabilities`（能力声明）
- `interfaces`（输入输出接口）
- `permissions`（权限范围）
- `trusted_relationships`（可信关系列表）
- `memory_binding`（绑定的 Ontology Memory）
- `channel_bindings`（绑定的飞书/GitHub身份）

### 2. Message Envelope Schema

- `agents/messages/message-envelope-schema.md`
- `agents/messages/challenge_submission_request.schema.json`
- `agents/messages/challenge_review_request.schema.json`

所有 Agent 消息必须包含：
- `message_id` / `request_id`
- `from_agent` / `to_agent`
- `message_type`
- `timestamp`
- `payload`
- `routing_metadata`
- `audit_trace_pointer`

### 3. Agent Inbox / Outbox 设计文档

- `agents/inbox/README.md`
- `agents/outbox/README.md`

说明：
- Inbox 如何接收、验证、排队和路由消息
- Trusted Relationship 如何校验
- Companion Online Detection 如何工作
- Offline Queue 如何处理

### 4. Audit Log Schema

- `agents/audit/audit-log-schema.md`

每次状态变化必须记录：
- `audit_id`
- `timestamp`
- `agent_id`（谁执行的）
- `action`（做了什么）
- `target_resource`（操作了哪个资源）
- `before_state` / `after_state`
- `routing_path`（消息路由路径）

### 5. Agent Collaboration Flow 更新

- `agents/agent-collaboration-flow.md`（重写）

更新为 4 个新 Agent 的协作流程：

```text
Teacher Companion Agent 发布 Challenge
→ Submission Task Agent 接收并同步到飞书/GitHub
→ Student Companion Agent 获取 Challenge
→ Student Companion Agent 发起 submission request
→ Submission Task Agent 校验身份、文件、权限
→ Submission Task Agent 创建 Submission Record
→ Submission Task Agent 路由给 Review Task Agent
→ Review Task Agent 评审并反馈
→ Submission Task Agent 回传给 Student Companion Agent
```

## 关键架构红线

1. **Student Companion Agent 不能直接写最终 Submission Record**
   - 只能发起 submission request
   - 最终写入由 Submission Task Agent 完成

2. **所有 Agent 消息必须经过 Inbox 校验**
   - 身份验证
   - Trusted Relationship 检查
   - 权限验证
   - Audit Log 记录

3. **每个 Agent 必须有独立的 agent_id**
   - Student Companion: `student-companion-{student_id}`
   - Teacher Companion: `teacher-companion-{teacher_id}`
   - Submission Task Agent: `submission-task-agent`（单例或池）
   - Review Task Agent: `review-task-agent`（单例或池）

## 与其他 Team 的接口

- **Platform Team**：提供 `/api/submit` 重构方案，把现有单体流程拆成 Agent 消息链
- **Ontology Team**：定义 AgentIdentity、AgentManifest、TrustedRelationship、MessageEnvelope 的 Ontology 结构
- **Challenge Team**：每个 Challenge 要包含 `teacher_agent_id`、`rubric_pointer` 字段

## 当前状态

- ✅ 已跑通基础 MVP（Web App + 飞书 + GitHub + DeepSeek）
- ⚠️ 当前是单体 workflow，还没有 Agent 架构
- 🔲 需要拆分 `/api/submit` 为 Agent 消息链
- 🔲 需要定义 Message Envelope 和 Audit Log
- 🔲 需要实现 Inbox / Outbox 基础设施

## 验收标准

- [ ] 任意一次提交都能看出：谁发起、哪个 Agent 处理、写入了哪条飞书记录、指向哪个 GitHub commit、路由给谁评审
- [ ] Student Companion Agent 没有直接写 Submission Record 的权限
- [ ] Submission Task Agent 有独立 agent_id 和审计日志
- [ ] 所有消息都有完整的 Message Envelope
- [ ] 每次状态变化都有 Audit Trace

## 参考资料

- `/Users/zhanghao/Documents/Codex/2026-07-02/n-ni/重构AI+X/Elite20-Phase2-Builder-Task-Plan-Updated-20260706.md`（7.6 更新版任务规划）
- `docs/phase2-builder-task-plan.md`（本仓库同步版本）
- Richard 7.6 新资料：`Elite_Education_MVP_PRD_Challenge_Agent_Workflow_CN.md`、`AGENT_CN.md`、`Agent-inbox.docx`
