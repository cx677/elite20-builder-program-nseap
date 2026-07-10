# Team 3 事件抽取（Event Extraction）— 14 事件 + 触发 + 因果链

> 从 `Team3-语义模块抽取.md` §2.4 抽取 14 个事件类，补充：
> - 事件元数据（class / ID / 触发 / 接收 / payload）
> - 触发条件（trigger conditions）
> - 因果链（causal chains，前驱 + 后继）
> - 关联状态机转换
> - 关联消息类型
> - 关联 Agent Capability
> - Audit Log 关联

---

## 目录

- [0. 事件抽取范围](#0-事件抽取范围)
- [1. 14 个事件详表](#1-14-个事件详表)
- [2. 事件元数据模式](#2-事件元数据模式)
- [3. 因果链总图](#3-因果链总图)
- [4. 事件到状态机的映射](#4-事件到状态机的映射)
- [5. 事件到消息类型的映射](#5-事件到消息类型的映射)
- [6. 事件到能力调用的映射](#6-事件到能力调用的映射)
- [7. 事件与审计的关联](#7-事件与审计的关联)
- [8. 抽取统计](#8-抽取统计)

---

## 0. 事件抽取范围

来源：`Team3-语义模块抽取.md` §2.4.1 + `Team3-关系抽取.md` §5

抽取的 14 个事件：

| 类别 | 事件数 | 说明 |
|---|---:|---|
| 业务事件（9）| 9 | 与 Challenge / Submission / Review 流转直接相关 |
| 系统事件（3）| 3 | Agent 上线/离线、Audit 写入 |
| 决策事件（2）| 2 | 教师驳回 / 接受 |

---

## 1. 14 个事件详表

### 1.1 EV-01 ChallengePublished

```yaml
event_id: EV-01
event_name: ChallengePublished
event_class: owl:Class rdfs:subClassOf :Event
中文标签: 挑战已发布
触发者: TeacherCompanion
接收者: SubmissionTaskAgent
关联消息类型: challenge_publish
关联能力: CAP-N/A (Teacher Companion.publish_challenge)
关联状态转换: ChallengeStatus: draft → published

触发条件:
  preconditions:
    - TeacherCompanion.hasPermission("challenge.create")
    - Challenge.status = "draft"
    - Teacher.feishu_user_id exists
    - Teacher.github_org exists
  trigger:
    - 教师在飞书/Web 点击"发布 Challenge"
    - 或 Teacher Companion Agent 自动发布

事件载荷 (payload):
  required:
    - challenge_id
    - title
    - description
    - teacher_id
    - teacher_agent_id
    - ontology_nodes[]
    - skills[]
    - learning_objectives[]
    - required_deliverables[]
    - rubric_pointer
    - due_date
  optional:
    - github_pointer
    - feishu_group_id
    - airtable_record_id
    - admin_identity_mode

后继事件 (causal chain):
  - EV-02 ChallengeAvailable (同步)
  - AuditLogWritten (action=publish_challenge)

关联红线:
  - RED-007 必走 Trusted Relationship
  - RED-008 必留 Audit Trace

来源: [S3] §9 + [S6] flow
```

### 1.2 EV-02 ChallengeAvailable

```yaml
event_id: EV-02
event_name: ChallengeAvailable
event_class: owl:Class rdfs:subClassOf :Event
中文标签: 挑战可接收（广播给学生）
触发者: SubmissionTaskAgent
接收者: StudentCompanion（所有该 Challenge 范围内的）
关联消息类型: challenge_available
关联状态转换: ChallengeStatus: published → active

触发条件:
  preconditions:
    - EV-01 ChallengePublished 发生
    - SubmissionTaskAgent.create_challenge_record 成功
    - 同步到飞书 + GitHub 成功
  trigger:
    - SubmissionTaskAgent 在 EV-01 后自动触发广播

事件载荷 (payload):
  required:
    - challenge_id
    - title
    - teacher_id
    - due_date
    - student_ids[] (广播目标)
  optional:
    - github_repo_url
    - feishu_group_id
    - rubric_summary

后继事件 (causal chain):
  - AuditLogWritten (action=notify_students)

关联红线:
  - RED-006 消息必经 Inbox
  - RED-008 必留 Audit Trace
```

### 1.3 EV-03 SubmissionRequested

```yaml
event_id: EV-03
event_name: SubmissionRequested
event_class: owl:Class rdfs:subClassOf :Event
中文标签: 提交已请求
触发者: StudentCompanion
接收者: SubmissionTaskAgent
关联消息类型: submission_request
关联状态转换: SubmissionStatus: draft → submitted

触发条件:
  preconditions:
    - Student.feishu_user_id exists
    - Student.github_username exists
    - Challenge.status = "active"
    - 当前时间 ≤ Challenge.due_date
    - TrustedRelationship(student_companion, submission_task) 存在
  trigger:
    - Student 在 Web/GitHub 点击"提交"
    - StudentCompanion.prepare_submission_package
    - StudentCompanion.send_submission_request

事件载荷 (payload):
  required:
    - challenge_id
    - student_id
    - github_repo_url
    - github_branch
    - submitted_files[]
    - self_reflection_pointer
    - skills_used[]
    - ontology_nodes_used[]
  optional:
    - admin_identity_mode
    - admin_user_id

后继事件 (causal chain):
  - EV-04 ReviewRequested (验证通过后)

关联红线:
  - RED-002 不可越权写记录 (StudentCompanion 不能直接写 Submission)
  - RED-004 不可跨学生访问
  - RED-005 提交时间窗
  - RED-006 消息必经 Inbox
  - RED-007 必走 Trusted Relationship
  - RED-008 必留 Audit Trace

关联能力: CAP-001 validate_request, CAP-002 check_github_repo, CAP-003 check_github_files
```

### 1.4 EV-04 ReviewRequested

```yaml
event_id: EV-04
event_name: ReviewRequested
event_class: owl:Class rdfs:subClassOf :Event
中文标签: 评审已请求
触发者: SubmissionTaskAgent
接收者: ReviewTaskAgent
关联消息类型: review_request
关联状态转换: SubmissionStatus: checked → pending_review

触发条件:
  preconditions:
    - EV-03 SubmissionRequested 成功
    - SubmissionStatus = "checked"
    - review_mode 字段已设置
  trigger:
    - SubmissionTaskAgent.route_to_review (CAP-010)

事件载荷 (payload):
  required:
    - submission_id
    - challenge_id
    - student_id
    - review_mode
    - submission_artifact_pointers
    - rubric_pointer
  optional:
    - routing_path
    - admin_identity_mode

后继事件 (causal chain):
  - EV-05 ReviewCompleted (评审完成)
  - EV-09 PeerReviewRequested (if review_mode = peer_only or teacher_and_peer)

关联红线:
  - RED-006 消息必经 Inbox
  - RED-007 必走 Trusted Relationship
  - RED-008 必留 Audit Trace
```

### 1.5 EV-05 ReviewCompleted

```yaml
event_id: EV-05
event_name: ReviewCompleted
event_class: owl:Class rdfs:subClassOf :Event
中文标签: 评审完成
触发者: ReviewTaskAgent
接收者: SubmissionTaskAgent
关联消息类型: review_result
关联状态转换: SubmissionStatus: under_review → reviewed

触发条件:
  preconditions:
    - EV-04 ReviewRequested 已被 ReviewTask 接收
    - ReviewTask 已完成 Rubric 评审
    - 已生成 scores_json / strengths / weaknesses / suggestions
  trigger:
    - ReviewTask.write_evaluation
    - ReviewTask.send review_result

事件载荷 (payload):
  required:
    - submission_id
    - scores_json
    - feedback
    - strengths[]
    - weaknesses[]
    - suggestions[]
  optional:
    - knowledge_candidate (boolean)
    - peer_review_summaries[]

后继事件 (causal chain):
  - EV-06 FeedbackDelivered
  - EV-07 StatusUpdated
  - EV-08 FinalAdjusted (if teacher_pending)
  - AuditLogWritten (action=review_completed)

关联红线:
  - RED-008 必留 Audit Trace
```

### 1.6 EV-06 FeedbackDelivered

```yaml
event_id: EV-06
event_name: FeedbackDelivered
event_class: owl:Class rdfs:subClassOf :Event
中文标签: 反馈已送达
触发者: SubmissionTaskAgent
接收者: StudentCompanion
关联消息类型: feedback
关联状态转换: SubmissionStatus: reviewed → pending_teacher_review

触发条件:
  preconditions:
    - EV-05 ReviewCompleted 发生
    - Evaluation 记录已写入
  trigger:
    - SubmissionTaskAgent.deliver_feedback
    - SubmissionTaskAgent.notify_student (CAP-011)

事件载荷 (payload):
  required:
    - submission_id
    - student_id
    - scores
    - feedback_summary
    - detail_url
  optional:
    - strengths[]
    - suggestions[]

后继事件 (causal chain):
  - 飞书 Bot 私聊学生 (非 Agent 事件，是 Bot 触达)
  - AuditLogWritten (action=feedback_delivered)

关联红线:
  - RED-008 必留 Audit Trace
  - RED-009 触达不靠 Agent (由飞书 Bot 负责)
  - RED-010 Agent 通知边界
```

### 1.7 EV-07 StatusUpdated

```yaml
event_id: EV-07
event_name: StatusUpdated
event_class: owl:Class rdfs:subClassOf :Event
中文标签: 状态已更新
触发者: SubmissionTaskAgent
接收者: TeacherCompanion
关联消息类型: status_update
关联状态转换: 多种 (depends on source)

触发条件:
  preconditions:
    - Submission 状态发生变化
    - SubmissionTaskAgent 触发同步
  trigger:
    - 任何 Submission 状态变化

事件载荷 (payload):
  required:
    - submission_id
    - old_status
    - new_status
    - teacher_id
  optional:
    - reason
    - auto_notify_teacher (boolean)

后继事件 (causal chain):
  - 飞书 Bot 私聊教师
  - AuditLogWritten (action=status_update)

关联红线:
  - RED-008 必留 Audit Trace
  - RED-009 触达不靠 Agent
  - RED-010 Agent 通知边界
```

### 1.8 EV-08 FinalAdjusted

```yaml
event_id: EV-08
event_name: FinalAdjusted
event_class: owl:Class rdfs:subClassOf :Event
中文标签: 最终调整
触发者: TeacherCompanion
接收者: SubmissionTaskAgent
关联消息类型: final_adjustment
关联状态转换: SubmissionStatus: pending_teacher_review → accepted / needs_teacher_revision

触发条件:
  preconditions:
    - SubmissionStatus = "pending_teacher_review"
    - Teacher 已在飞书操作
  trigger:
    - Teacher 点击"接受"或"驳回"
    - TeacherCompanion 解析教师意图

事件载荷 (payload):
  required:
    - submission_id
    - decision (accept | reject)
    - teacher_id
    - teacher_agent_id
  optional:
    - final_score (override review score)
    - rejection_reason
    - suggestions_for_revision

后继事件 (causal chain):
  - EV-13 TeacherRejected (if reject)
  - EV-14 TeacherAccepted (if accept)
  - CAP-009 write_portfolio (if accept)
  - AuditLogWritten (action=final_adjusted)

关联红线:
  - RED-007 必走 Trusted Relationship
  - RED-008 必留 Audit Trace
```

### 1.9 EV-09 PeerReviewRequested

```yaml
event_id: EV-09
event_name: PeerReviewRequested
event_class: owl:Class rdfs:subClassOf :Event
中文标签: 同伴评审请求
触发者: ReviewTaskAgent
接收者: PeerReviewStudentAgent
关联消息类型: peer_review_request
关联状态转换: SubmissionStatus: pending_review (peer 分支) → under_review (peer 分支)

触发条件:
  preconditions:
    - EV-04 ReviewRequested 发生
    - review_mode = "peer_only" OR "teacher_and_peer"
    - 至少 2 名 peer student 被分配
  trigger:
    - ReviewTaskAgent.request_peer_review

事件载荷 (payload):
  required:
    - submission_id
    - peer_student_ids[]
    - rubric_pointer
  optional:
    - deadline_for_peer_review

后继事件 (causal chain):
  - PeerReviewStudentAgent.submits_review
  - ReviewTaskAgent.aggregates_reviews
  - AuditLogWritten (action=peer_review_requested)
```

### 1.10 EV-10 AgentOnline

```yaml
event_id: EV-10
event_name: AgentOnline
event_class: owl:Class rdfs:subClassOf :Event
中文标签: 智能体上线
触发者: Agent（自己）
接收者: Presence 服务
关联消息类型: (内部事件，不走 9 种 message_type)
关联状态转换: PresenceStatus: offline → online

触发条件:
  preconditions:
    - Agent 启动完成
    - Agent 注册到 Inbox/Outbox
    - Presence 服务可用
  trigger:
    - Agent 启动
    - Agent 心跳恢复
    - Agent 从 paused 恢复

事件载荷 (payload):
  required:
    - agent_id
    - agent_type
    - timestamp
    - last_seen
  optional:
    - current_task

后继事件 (causal chain):
  - (无业务后继)

关联红线: 无
```

### 1.11 EV-11 AgentOffline

```yaml
event_id: EV-11
event_name: AgentOffline
event_class: owl:Class rdfs:subClassOf :Event
中文标签: 智能体离线
触发者: Agent（自己）
接收者: Presence 服务
关联消息类型: (内部事件)
关联状态转换: PresenceStatus: online → offline

触发条件:
  preconditions:
    - Agent 主动关闭
    - 或心跳超时（默认 30s）
  trigger:
    - Agent 关闭
    - 心跳超时
    - 系统重启

事件载荷 (payload):
  required:
    - agent_id
    - last_seen
  optional:
    - reason (shutdown | timeout | error)

后继事件 (causal chain):
  - 飞书 Bot 通知管理员（如持续离线）

关联红线: 无
```

### 1.12 EV-12 AuditLogWritten

```yaml
event_id: EV-12
event_name: AuditLogWritten
event_class: owl:Class rdfs:subClassOf :Event
中文标签: 审计日志写入
触发者: Agent
接收者: AuditLog
关联消息类型: (内部事件)
关联状态转换: 任何状态变化都触发

触发条件:
  preconditions:
    - 任何状态变化发生
    - 或任何红线违规检测
    - 或任何 Agent 启动/关闭
  trigger:
    - 状态变化 hook
    - redline violation hook
    - agent lifecycle hook

事件载荷 (payload):
  required:
    - audit_id
    - agent_id
    - action
    - timestamp
    - target_resource
    - before_state
    - after_state
  optional:
    - routing_path[]
    - related_message_id
    - error_trace

后继事件 (causal chain):
  - (无业务后继)

关联红线:
  - RED-008 必留 Audit Trace
```

### 1.13 EV-13 TeacherRejected

```yaml
event_id: EV-13
event_name: TeacherRejected
event_class: owl:Class rdfs:subClassOf :Event
中文标签: 教师驳回
触发者: TeacherCompanion
接收者: StudentCompanion
关联消息类型: status_update（payload 含 decision=reject）
关联状态转换: SubmissionStatus: pending_teacher_review → needs_teacher_revision

触发条件:
  preconditions:
    - EV-08 FinalAdjusted 发生
    - decision = "reject"
  trigger:
    - TeacherCompanion 处理 EV-08 的 reject 分支

事件载荷 (payload):
  required:
    - submission_id
    - student_id
    - teacher_id
    - rejection_reason
  optional:
    - suggestions_for_revision
    - deadline_for_resubmit

后继事件 (causal chain):
  - 飞书 Bot 私聊学生
  - AuditLogWritten (action=teacher_rejected)

关联红线:
  - RED-008 必留 Audit Trace
  - RED-010 Agent 通知边界
```

### 1.14 EV-14 TeacherAccepted

```yaml
event_id: EV-14
event_name: TeacherAccepted
event_class: owl:Class rdfs:subClassOf :Event
中文标签: 教师接受
触发者: TeacherCompanion
接收者: StudentCompanion
关联消息类型: status_update（payload 含 decision=accept）
关联状态转换: SubmissionStatus: pending_teacher_review → accepted

触发条件:
  preconditions:
    - EV-08 FinalAdjusted 发生
    - decision = "accept"
  trigger:
    - TeacherCompanion 处理 EV-08 的 accept 分支

事件载荷 (payload):
  required:
    - submission_id
    - student_id
    - teacher_id
    - final_score
  optional:
    - knowledge_candidate (boolean)
    - portfolio_visibility (public | private)

后继事件 (causal chain):
  - CAP-009 write_portfolio
  - 飞书 Bot 私聊学生
  - AuditLogWritten (action=teacher_accepted)
  - (可选) Knowledge Base 触发抓取

关联红线:
  - RED-008 必留 Audit Trace
  - RED-010 Agent 通知边界
```

---

## 2. 事件元数据模式

每个事件都遵循统一模式：

```yaml
Event:
  event_id: string                # 唯一 ID
  event_name: string              # 英文名（CamelCase）
  event_class: string             # OWL Class 引用
  中文标签: string                # 中文标签
  触发者: string (agent_id)        # 触发 Agent
  接收者: string (agent_id | service) # 接收者
  关联消息类型: string | null     # 9 种 message_type 之一
  关联能力: string[]              # CAP-001..012
  关联状态转换: string            # 状态名

  触发条件:
    preconditions: string[]       # 前置条件列表
    trigger: string[]             # 触发动作列表

  事件载荷:
    required: string[]            # 必有字段
    optional: string[]            # 可选字段

  后继事件:
    - event_id (causal successor) # 因果后继

  关联红线: string[]              # RED-001..010

  来源: string                   # [S3] §9 + [S6] flow
```

---

## 3. 因果链总图

### 3.1 主流程因果链

```text
[Teacher UI 操作]
    │
    ↓ (教师点击发布)
[EV-01] ChallengePublished
    │ TeacherCompanion → SubmissionTaskAgent
    ↓ (提交任务同步飞书/GitHub)
[EV-02] ChallengeAvailable
    │ SubmissionTaskAgent → StudentCompanion (广播)
    ↓ (学生开始做项目)
    │ ⏰ (时间流逝)
[Student UI 操作]
    │
    ↓ (学生点击提交)
[EV-03] SubmissionRequested
    │ StudentCompanion → SubmissionTaskAgent
    ↓ (5 步校验全过)
[EV-04] ReviewRequested
    │ SubmissionTaskAgent → ReviewTaskAgent
    ↓ (可能分支)         ↓ (可能分支)
[EV-09] PeerReviewReq   [ReviewTask 立即开始]
    │
    ↓ (评审完成)
[EV-05] ReviewCompleted
    │ ReviewTask → SubmissionTask
    ↓
[EV-06] FeedbackDelivered
    │ SubmissionTask → StudentCompanion
    ↓ (学生收到飞书通知，非 Agent 事件)
[EV-07] StatusUpdated
    │ SubmissionTask → TeacherCompanion
    ↓ (教师在飞书确认)
[EV-08] FinalAdjusted
    │ TeacherCompanion → SubmissionTask
    ↓ (分支)
[EV-14] TeacherAccepted   [EV-13] TeacherRejected
    │ 状态: accepted           │ 状态: needs_teacher_revision
    ↓
[CAP-009] write_portfolio
    ↓
[AuditLogWritten] (action=teacher_accepted)
    ↓
[END]
```

### 3.2 旁路事件因果链

```text
[系统启动]
    ↓
[EV-10] AgentOnline (每个 Agent)
    ↓
[正常业务流程]
    ↓
[状态变化]
    ↓
[EV-12] AuditLogWritten
    ↓
[正常业务流程]
    ↓
[系统关闭]
    ↓
[EV-11] AgentOffline
```

### 3.3 完整事件依赖图（节点 + 边）

```text
节点:
  EV-01 ChallengePublished
  EV-02 ChallengeAvailable
  EV-03 SubmissionRequested
  EV-04 ReviewRequested
  EV-05 ReviewCompleted
  EV-06 FeedbackDelivered
  EV-07 StatusUpdated
  EV-08 FinalAdjusted
  EV-09 PeerReviewRequested
  EV-10 AgentOnline
  EV-11 AgentOffline
  EV-12 AuditLogWritten
  EV-13 TeacherRejected
  EV-14 TeacherAccepted

边（因果关系）:
  EV-01 → EV-02            (挑战发布后广播)
  EV-01 → EV-12            (审计)
  EV-02 → EV-12            (审计)
  EV-03 → EV-04            (提交通过后路由)
  EV-03 → EV-12            (审计)
  EV-04 → EV-05            (评审完成)
  EV-04 → EV-09            (peer 分支)
  EV-05 → EV-06            (评审后反馈)
  EV-05 → EV-12            (审计)
  EV-06 → EV-12            (审计)
  EV-07 → EV-12            (审计)
  EV-08 → EV-13            (reject 分支)
  EV-08 → EV-14            (accept 分支)
  EV-08 → EV-12            (审计)
  EV-09 → EV-05            (peer 评审汇入)
  EV-13 → EV-12            (审计)
  EV-14 → EV-12            (审计)
  EV-10 → (业务流程)        (agent 上线后才能跑业务)
  EV-11 → (业务流程)        (agent 离线后业务暂停)
  (任意) → EV-12           (所有事件都触发审计)
```

---

## 4. 事件到状态机的映射

| 事件 | 触发的状态转换 | 目标对象 |
|---|---|---|
| EV-01 ChallengePublished | ChallengeStatus: draft → published | Challenge |
| EV-02 ChallengeAvailable | ChallengeStatus: published → active | Challenge |
| EV-03 SubmissionRequested | SubmissionStatus: draft → submitted | Submission |
| EV-04 ReviewRequested | SubmissionStatus: checked → pending_review | Submission |
| EV-05 ReviewCompleted | SubmissionStatus: under_review → reviewed | Submission |
| EV-06 FeedbackDelivered | SubmissionStatus: reviewed → pending_teacher_review | Submission |
| EV-07 StatusUpdated | (任意) | Submission |
| EV-08 FinalAdjusted | SubmissionStatus: pending_teacher_review → (accept/reject) | Submission |
| EV-09 PeerReviewRequested | (peer 分支 pending_review) | Submission |
| EV-10 AgentOnline | PresenceStatus: offline → online | Agent |
| EV-11 AgentOffline | PresenceStatus: online → offline | Agent |
| EV-12 AuditLogWritten | (不改变状态) | (任意) |
| EV-13 TeacherRejected | SubmissionStatus: pending_teacher_review → needs_teacher_revision | Submission |
| EV-14 TeacherAccepted | SubmissionStatus: pending_teacher_review → accepted | Submission |

---

## 5. 事件到消息类型的映射

| 事件 | 关联消息类型 | 方向 |
|---|---|---|
| EV-01 ChallengePublished | `challenge_publish` | Teacher → Submission Task |
| EV-02 ChallengeAvailable | `challenge_available` | Submission Task → Student (广播) |
| EV-03 SubmissionRequested | `submission_request` | Student → Submission Task |
| EV-04 ReviewRequested | `review_request` | Submission Task → Review Task |
| EV-05 ReviewCompleted | `review_result` | Review Task → Submission Task |
| EV-06 FeedbackDelivered | `feedback` | Submission Task → Student |
| EV-07 StatusUpdated | `status_update` | Submission Task → Teacher |
| EV-08 FinalAdjusted | `final_adjustment` | Teacher → Submission Task |
| EV-09 PeerReviewRequested | `peer_review_request` | Review Task → Peer Student |
| EV-10/11 AgentOnline/Offline | (内部事件) | - |
| EV-12 AuditLogWritten | (内部事件) | - |
| EV-13 TeacherRejected | (status_update with decision=reject) | Teacher → Student |
| EV-14 TeacherAccepted | (status_update with decision=accept) | Teacher → Student |

**统计**：14 个事件中，9 个走 9 种 message_type，3 个是内部事件，2 个共享 status_update

---

## 6. 事件到能力调用的映射

| 事件 | 触发的能力 | 触发 Agent |
|---|---|---|
| EV-01 ChallengePublished | Teacher Companion.publish_challenge | TeacherCompanion |
| EV-02 ChallengeAvailable | SubmissionTaskAgent.create_challenge_record | SubmissionTaskAgent |
| EV-03 SubmissionRequested | CAP-001 validate_request + StudentCompanion.send_submission_request | StudentCompanion + SubmissionTask |
| EV-04 ReviewRequested | CAP-006 get_or_create_submission + CAP-010 route_to_review | SubmissionTask |
| EV-05 ReviewCompleted | CAP-008 write_evaluation | SubmissionTask |
| EV-06 FeedbackDelivered | CAP-011 notify_student | SubmissionTask |
| EV-07 StatusUpdated | (状态同步) | SubmissionTask |
| EV-08 FinalAdjusted | TeacherCompanion.send_final_adjustment | TeacherCompanion |
| EV-09 PeerReviewRequested | ReviewTask.request_peer_review | ReviewTask |
| EV-14 TeacherAccepted | CAP-009 write_portfolio + CAP-012 notify_teacher | SubmissionTask |
| EV-12 AuditLogWritten | CAP-007 write_audit_log | 任意 Agent |
| (校验事件) | CAP-002 check_github_repo, CAP-003 check_github_files, CAP-004 check_readme_aar, CAP-005 check_deadline | SubmissionTask |

**统计**：12 项 Submission Task 能力（CAP-001..012）+ 3 项 Companion 能力

---

## 7. 事件与审计的关联

### 7.1 每个事件都触发审计

```text
EV-01 → AuditLogWritten (action=publish_challenge)
EV-02 → AuditLogWritten (action=notify_students)
EV-03 → AuditLogWritten (action=submission_request)
EV-04 → AuditLogWritten (action=route_to_review)
EV-05 → AuditLogWritten (action=review_completed)
EV-06 → AuditLogWritten (action=feedback_delivered)
EV-07 → AuditLogWritten (action=status_update)
EV-08 → AuditLogWritten (action=final_adjusted)
EV-09 → AuditLogWritten (action=peer_review_requested)
EV-10 → AuditLogWritten (action=agent_online)
EV-11 → AuditLogWritten (action=agent_offline)
EV-12 → AuditLogWritten (action=audit_log_written)  # 自指
EV-13 → AuditLogWritten (action=teacher_rejected)
EV-14 → AuditLogWritten (action=teacher_accepted)
```

### 7.2 Audit Log action 枚举

```yaml
AuditAction:
  - publish_challenge
  - notify_students
  - submission_request
  - route_to_review
  - review_completed
  - feedback_delivered
  - status_update
  - final_adjusted
  - peer_review_requested
  - agent_online
  - agent_offline
  - audit_log_written
  - teacher_rejected
  - teacher_accepted
  - state_change  # 通用
  - create  # 通用
  - update  # 通用
  - delete  # 通用
```

**统计**：14 个事件动作 + 4 个通用动作 = 18 种 action

### 7.3 审计日志记录样板

```json
{
  "audit_id": "audit-20260708-001",
  "timestamp": "2026-07-08T10:00:00Z",
  "agent_id": "submission-task-agent",
  "action": "publish_challenge",
  "target_resource": "feishu.challenges.challenge-C2-2026-07-08",
  "before_state": null,
  "after_state": {
    "challenge_id": "C2-2026-07-08",
    "status": "published"
  },
  "routing_path": [
    "teacher-companion-t001",
    "submission-task-agent"
  ],
  "related_message_id": "msg-20260708-001"
}
```

---

## 8. 抽取统计

| 类别 | 数量 |
|---|---:|
| 业务事件 | 9 |
| 系统事件 | 3 |
| 决策事件 | 2 |
| **事件总计** | **14** |
| 因果链边 | 22 |
| 触发的状态转换 | 12 |
| 触发的能力调用 | 15 |
| Audit Action 枚举 | 18 |
| 关联红线（累计） | 28 次 |

### 8.1 关键洞察

1. **EV-12 AuditLogWritten 是最常见事件**——14 个事件都触发它（除自身）
2. **EV-08 FinalAdjusted 是关键决策点**——分支为 EV-13/EV-14
3. **EV-04 ReviewRequested 是路由点**——分支为 EV-09（peer）和 EV-05（直接）
4. **业务事件都是双向的**——9 个事件成 4 对双向消息流
5. **系统事件不进入业务流**——EV-10/11/12 是基础设施

### 8.2 与 9 种 message_type 的对应

| 序号 | message_type | 事件 | 业务流位置 |
|---|---|---|---|
| 1 | challenge_publish | EV-01 | 教师 → 提交 |
| 2 | challenge_available | EV-02 | 提交 → 学生 |
| 3 | submission_request | EV-03 | 学生 → 提交 |
| 4 | review_request | EV-04 | 提交 → 评审 |
| 5 | review_result | EV-05 | 评审 → 提交 |
| 6 | feedback | EV-06 | 提交 → 学生 |
| 7 | status_update | EV-07 | 提交 → 教师 |
| 8 | final_adjustment | EV-08 | 教师 → 提交 |
| 9 | peer_review_request | EV-09 | 评审 → 同伴 |
| (扩展) | (status_update) | EV-13, EV-14 | 教师 → 学生 |

**统计**：9 种 message_type 完整覆盖，2 个事件共享 status_update（payload 区分 decision）
