# Team 3 关系抽取（Relation Extraction）

> 从 `Team3-语义模块抽取.md` §2.3 + §2.4 + §2.5 中，**抽取所有"动词性"内容**——即 R-Box 规则 / 关系 / 约束 / 状态机 / 信任 / 路由 / 能力调用。这是 Ontology Factory 7 步流水线的 **AutoRelation + AutoConstraint** 阶段。
> 
> 不抽取概念 / 类（已在 `Team3-实体概念抽取.md`）/ 事件触发条件（事件类在实体抽取中）/ 流程步骤编排（在 `Team3-语义模块抽取.md` §2.5）。

---

## 目录

- [0. 抽取范围定义](#0-抽取范围定义)
- [1. 类间关系（T-Box Relations）](#1-类间关系t-box-relations)
  - [1.1 协议核心关系（10 条）](#11-协议核心关系10-条)
  - [1.2 Agent-业务对象关系（12 条）](#12-agent-业务对象关系12-条)
  - [1.3 关系总表（22 条）](#13-关系总表22-条)
  - [1.4 关系元数据（属性）](#14-关系元数据属性)
- [2. 架构红线（Architecture Red Lines）](#2-架构红线architecture-red-lines)
  - [2.1 10 条红线详表](#21-10-条红线详表)
  - [2.2 红线分类](#22-红线分类)
  - [2.3 红线代码层映射](#23-红线代码层映射)
- [3. 能力约束（Capability Constraints）](#3-能力约束capability-constraints)
  - [3.1 Submission Task Agent 12 项能力](#31-submission-task-agent-12-项能力)
  - [3.2 能力前置条件（precondition）](#32-能力前置条件precondition)
  - [3.3 能力后置效果（effect）](#33-能力后置效果effect)
- [4. 状态机转换关系（State Transitions）](#4-状态机转换关系state-transitions)
  - [4.1 Submission 9 态状态机](#41-submission-9-态状态机)
  - [4.2 Review Status 6 态状态机](#42-review-status-6-态状态机)
  - [4.3 Challenge 5 态状态机（隐含）](#43-challenge-5-态状态机隐含)
  - [4.4 Presence 5 态状态机](#44-presence-5-态状态机)
  - [4.5 Inbox Queue 3 态状态机](#45-inbox-queue-3-态状态机)
- [5. 信任 / 路由关系（Trust & Routing）](#5-信任--路由关系trust--routing)
  - [5.1 Trusted Relationship 5 条默认规则](#51-trusted-relationship-5-条默认规则)
  - [5.2 Routing Status 转换](#52-routing-status-转换)
  - [5.3 Review Mode 决定路由](#53-review-mode-决定路由)
  - [5.4 Inbox 10 步校验链](#54-inbox-10-步校验链)
- [6. 能力调用图（Capability Invocation Graph）](#6-能力调用图capability-invocation-graph)
  - [6.1 Submission 全流程调用链](#61-submission-全流程调用链)
  - [6.2 Publish 全流程调用链](#62-publish-全流程调用链)
- [7. 抽取物索引（ID 速查）](#7-抽取物索引id-速查)
- [8. 抽取统计](#8-抽取统计)
- [附录：抽取约定](#附录抽取约定)

---

## 0. 抽取范围定义

### 0.1 抽取什么 / 不抽什么

| 抽取物 | 是否抽取 | 标记 | 来自源文件 |
|---|---|---|---|
| **类间关系** | ✅ | REL | §2.3.3（22 条核心关系）|
| **架构红线** | ✅ | RED | §2.3.1（10 条红线）|
| **能力约束** | ✅ | CAP | §2.3.2（12 项能力）|
| **状态机转换** | ✅ | STATE | §2.3.4 + 各种状态枚举 |
| **信任关系** | ✅ | TRUST | §2.3.5（5 条默认）|
| **Inbox 校验链** | ✅ | INBOX | §2.3.6（10 步）|
| **路由决策** | ✅ | ROUTE | §2.4.1（隐含）|
| 概念 / 类 | ❌ | — | 已在 `Team3-实体概念抽取.md` |
| 属性 | ❌ | — | 已在 `Team3-实体概念抽取.md` |
| 事件类 | ❌ | — | 已在 `Team3-实体概念抽取.md` |
| 流程步骤 | ❌ | — | 在 §2.5，下一份抽取 |

### 0.2 关系类型分类法

| 关系类型 | 标记 | 含义 | 示例 |
|---|---|---|---|
| **继承（is-a）** | IS-A | 类父子关系 | `CompanionAgent is-a Agent` |
| **组成（has-a）** | HAS-A | 类包含组件 | `Agent has-a AgentManifest` |
| **关联（references）** | REF | 弱引用关系 | `Submission references Challenge` |
| **依赖（depends-on）** | DEP | 行为依赖 | `TaskAgent depends-on Skill` |
| **归属（belongs-to）** | BELONG | N:1 反向关系 | `TaskAgent belongs-to CompanionAgent` |
| **触发（triggers）** | TRIGGER | 行为触发 | `Submission.triggers Notification` |
| **转换（transitions-to）** | STATE | 状态机转换 | `submitted transitions-to validating` |
| **信任（trusts）** | TRUST | 可信关系 | `StudentCompanion trusts SubmissionTaskAgent` |
| **路由（routes-to）** | ROUTE | 消息路由 | `SubmissionTaskAgent routes-to ReviewTaskAgent` |
| **约束（constrains）** | RED | 强约束规则 | `StudentCompanion NOT-allowed writes Submission` |

### 0.3 抽取约定

每条关系用统一格式：

```text
ID: 唯一标识
Name: 关系名（小写动词）
Type: 关系类型
Source: 源类
Target: 目标类
Cardinality: 基数
Direction: directed / undirected
Source-doc: 抽取来源
Status: 已有/部分/缺失
Description: 描述
```

---

## 1. 类间关系（T-Box Relations）

### 1.1 协议核心关系（10 条）

| ID | Name | Type | Source | Target | Cardinality | Source-doc | Status |
|---|---|---|---|---|---|---|---|
| REL-PROTO-001 | **hasManifest** | HAS-A | Agent | AgentManifest | 1:1 | [S5] | ✅ 已有 |
| REL-PROTO-002 | **hasIdentity** | HAS-A | Agent | AgentIdentity | 1:1 | [S5] | ✅ 已有 |
| REL-PROTO-003 | **hasCapability** | HAS-A | Agent | Capability | 1:N | [S5][S7] | ✅ 已有 |
| REL-PROTO-004 | **exposesInterface** | HAS-A | Agent | Interface | 1:N | [S5][S7] | ✅ 已有 |
| REL-PROTO-005 | **hasPermission** | HAS-A | Agent | Permission | 1:N | [S5][S7] | ✅ 已有 |
| REL-PROTO-006 | **hasConstraint** | HAS-A | Agent | Constraint | 1:N | [S5][S7] | ✅ 已有 |
| REL-PROTO-007 | **trusts** | TRUST | Agent | Agent | N:N | [S5] | ✅ 已有 |
| REL-PROTO-008 | **bindsToMemory** | HAS-A | Agent | MemoryBinding | 1:N | [S5] | ✅ 已有 |
| REL-PROTO-009 | **bindsToChannel** | HAS-A | Agent | ChannelBinding | 1:N | [S5] | ✅ 已有 |
| REL-PROTO-010 | **inbounds** | HAS-A | Agent | AgentInbox | 1:1 | [S5][S13] | ✅ 已有 |
| REL-PROTO-011 | **outbounds** | HAS-A | Agent | AgentOutbox | 1:1 | [S5] | ⚠️ Outbox 未出 |
| REL-PROTO-012 | **sends** | HAS-A | Agent | MessageEnvelope | 1:N | [S5][S11] | ✅ 已有 |
| REL-PROTO-013 | **creates** | HAS-A | Agent | AuditTrace | 1:N | [S5][S12] | ✅ 已有 |

**统计**：13 条协议关系（包含 hasConstraint/inbounds/outbounds 拆分的细粒度）

### 1.2 Agent-业务对象关系（12 条）

| ID | Name | Type | Source | Target | Cardinality | Source-doc | Status |
|---|---|---|---|---|---|---|---|
| REL-BIZ-001 | **owns** | HAS-A | CompanionAgent | PersonalOntology | 1:1 | [S2] | ⚠️ 仓库未出 |
| REL-BIZ-002 | **configures** | HAS-A | CompanionAgent | ResourceConfig | 1:1 | [S2] | ⚠️ 简版 |
| REL-BIZ-003 | **belongsTo** | BELONG | TaskAgent | CompanionAgent | N:1 | [S2] | ❌ 仓库无 |
| REL-BIZ-004 | **invokes** | DEP | TaskAgent | Skill | 1:N | [S2] | ❌ 仓库无 |
| REL-BIZ-005 | **submits** | HAS-A | Learner (Student) | Submission | 1:N | [S2] | ✅ 已有 |
| REL-BIZ-006 | **evaluates** | HAS-A | Submission | Evaluation | 1:1 | [S2] | ✅ 已有 |
| REL-BIZ-007 | **contains** | HAS-A | Course | Challenge | 1:N | [S2] | ✅ 已有 |
| REL-BIZ-008 | **produces** | HAS-A | Challenge | Artifact | 1:N | [S2] | ✅ 已有 |
| REL-BIZ-009 | **teaches** | HAS-A | Professor | Course | 1:N | [S2] | ✅ 已有 |
| REL-BIZ-010 | **enrolls** | HAS-A | Learner | Course | N:M | [S2] | ⚠️ 仓库无 |
| REL-BIZ-011 | **referencesRubric** | REF | Challenge | Rubric | 1:1 | [S3] | ✅ 已有 |
| REL-BIZ-012 | **learns** | HAS-A | Learner | Skill | N:M | [S2] | ⚠️ 仓库无 |

**统计**：12 条业务关系

### 1.3 关系总表（22 条核心 + 8 条补充 = 30 条）

#### 1.3.1 协议侧（13 条）

| ID | Name | Source → Target | Cardinality | Type |
|---|---|---|---|---|
| REL-001 | hasManifest | Agent → AgentManifest | 1:1 | HAS-A |
| REL-002 | hasIdentity | Agent → AgentIdentity | 1:1 | HAS-A |
| REL-003 | hasCapability | Agent → Capability | 1:N | HAS-A |
| REL-004 | exposesInterface | Agent → Interface | 1:N | HAS-A |
| REL-005 | hasPermission | Agent → Permission | 1:N | HAS-A |
| REL-006 | hasConstraint | Agent → Constraint | 1:N | HAS-A |
| REL-007 | trusts | Agent → Agent | N:N | TRUST |
| REL-008 | bindsToMemory | Agent → MemoryBinding | 1:N | HAS-A |
| REL-009 | bindsToChannel | Agent → ChannelBinding | 1:N | HAS-A |
| REL-010 | inbounds | Agent → AgentInbox | 1:1 | HAS-A |
| REL-011 | outbounds | Agent → AgentOutbox | 1:1 | HAS-A |
| REL-012 | sends | Agent → MessageEnvelope | 1:N | HAS-A |
| REL-013 | creates | Agent → AuditTrace | 1:N | HAS-A |

#### 1.3.2 业务侧（17 条）

| ID | Name | Source → Target | Cardinality | Type |
|---|---|---|---|---|
| REL-014 | owns | CompanionAgent → PersonalOntology | 1:1 | HAS-A |
| REL-015 | configures | CompanionAgent → ResourceConfig | 1:1 | HAS-A |
| REL-016 | belongsTo | TaskAgent → CompanionAgent | N:1 | BELONG |
| REL-017 | invokes | TaskAgent → Skill | 1:N | DEP |
| REL-018 | teaches | Professor → Course | 1:N | HAS-A |
| REL-019 | enrolls | Learner → Course | N:M | HAS-A |
| REL-020 | contains | Course → Challenge | 1:N | HAS-A |
| REL-021 | referencesRubric | Challenge → Rubric | 1:1 | REF |
| REL-022 | produces | Challenge → Artifact | 1:N | HAS-A |
| REL-023 | submits | Learner → Submission | 1:N | HAS-A |
| REL-024 | evaluates | Submission → Evaluation | 1:1 | HAS-A |
| REL-025 | learns | Learner → Skill | N:M | HAS-A |
| REL-026 | manifestsThrough | PersonalOntology → OKF | 1:1 | HAS-A |
| REL-027 | includesAAR | Submission → AAR | 1:1 | HAS-A |
| REL-028 | hasFeedback | Evaluation → Feedback | 1:1 | HAS-A |
| REL-029 | hasPortfolio | Learner → Portfolio | 1:1 | HAS-A |
| REL-030 | writesTo | SubmissionTaskAgent → Submission | 1:1 | HAS-A |
| REL-031 | routesTo | SubmissionTaskAgent → ReviewTaskAgent | 1:N | ROUTE |

**说明**：REL-030 与 REL-031 是 PRD 法定架构红线关系。

#### 1.3.3 消息流关系（9 条，对应 9 种 message_type）

| ID | Name | Source → Target | Message Type | Direction |
|---|---|---|---|---|
| REL-MSG-001 | publishesChallenge | TeacherCompanion → SubmissionTask | challenge_publish | forward |
| REL-MSG-002 | notifiesAvailable | SubmissionTask → StudentCompanion | challenge_available | broadcast |
| REL-MSG-003 | requestsSubmission | StudentCompanion → SubmissionTask | submission_request | forward |
| REL-MSG-004 | routesForReview | SubmissionTask → ReviewTask | review_request | forward |
| REL-MSG-005 | returnsReview | ReviewTask → SubmissionTask | review_result | backward |
| REL-MSG-006 | deliversFeedback | SubmissionTask → StudentCompanion | feedback | backward |
| REL-MSG-007 | updatesStatus | SubmissionTask → TeacherCompanion | status_update | forward |
| REL-MSG-008 | adjustsFinal | TeacherCompanion → SubmissionTask | final_adjustment | backward |
| REL-MSG-009 | requestsPeerReview | ReviewTask → PeerStudent | peer_review_request | broadcast |

**统计**：9 条消息流关系（每个 message_type 一条）

### 1.4 关系元数据（属性）

每条关系都可以携带元数据：

```yaml
Relationship:
  relationship_id: string        # 关系 ID
  name: string                   # 关系名（动词）
  type: enum (IS-A|HAS-A|REF|DEP|BELONG|TRIGGER|STATE|TRUST|ROUTE|RED)
  source_class: string           # 源类
  target_class: string           # 目标类
  cardinality: enum              # 1:1, 1:N, N:1, N:N
  direction: enum                # directed | undirected
  inverse_name: string           # 反向关系名（可选）
  constraints: array<Constraint> # 关系上的约束
  properties: object             # 关系本身的属性（如 role、since、expires）
  source_doc: array              # 抽取来源
  status: enum (已有|部分|缺失)
```

#### 1.4.1 关系上的属性示例

**trusts 关系**：

```yaml
trusts:
  relationship_id: TR-001
  from_agent: student-companion-s001
  to_agent: submission-task-agent
  relationship_type: task-agent
  trust_level: auto
  permissions: [validate_submission, write_submission]
  capabilities: [check_github_repo, check_deadline]
  expiration: null
  last_verified: 2026-07-07T10:00:00Z
```

**sends 关系**（消息流）：

```yaml
sends:
  relationship_id: MSG-001
  from_agent: teacher-companion-t001
  to_agent: submission-task-agent
  message_type: challenge_publish
  message_id: msg-xxxxxxxx
  timestamp: 2026-07-07T10:00:00Z
  audit_trace_pointer: audit-xxxxxxxx
```

**routesTo 关系**（架构红线）：

```yaml
routesTo:
  relationship_id: ROUTE-001
  from_agent: submission-task-agent
  to_agent: review-task-agent
  condition: submission.review_status == 'pending_review'
  routing_strategy: review_mode
  review_mode: teacher_only | peer_only | teacher_and_peer
```

---

## 2. 架构红线（Architecture Red Lines）

### 2.1 10 条红线详表

| ID | 名称 | 源类 | 目标类 | 类型 | 关系 | 违反后果 | Source |
|---|---|---|---|---|---|---|---|
| RED-001 | **提交写入唯一性** | SubmissionTaskAgent | SubmissionRecord | RED-EXCLUSIVE | writesTo (唯一) | 学生提交流程不通过 | [S3][S4] |
| RED-002 | **不可越权写记录** | StudentCompanion | SubmissionRecord | RED-DENY | NOT-writesTo | 安全告警 | [S3][S7] |
| RED-003 | **不可越权读记忆** | TeacherCompanion | PersonalOntology (Student) | RED-DENY | NOT-reads | 权限拒绝 | [S3][S8] |
| RED-004 | **不可跨学生访问** | StudentCompanion | PersonalOntology (Other) | RED-DENY | NOT-accesses | 权限拒绝 | [S3][S7] |
| RED-005 | **提交时间窗** | StudentCompanion | Challenge (active only) | RED-CONDITIONAL | submitsTo | 路由失败 | [S3][S7] |
| RED-006 | **消息必经 Inbox** | ALL Agent | AgentInbox | RED-OBLIGATORY | mustPass | 拒绝投递 | [S4][S13] |
| RED-007 | **必走 Trusted Relationship** | Agent | Agent | RED-OBLIGATORY | mustTrust | 拒绝投递 | [S5][S11] |
| RED-008 | **必留 Audit Trace** | Agent | AuditTrace | RED-OBLIGATORY | mustWrite | 不允许状态变更 | [S3][S12] |
| RED-009 | **触达不靠 Agent** | ALL Agent | Notification (push) | RED-DENY | NOT-contains | 架构违规 | [S4] |
| RED-010 | **Agent 通知边界** | Agent | Human | RED-OBLIGATORY | notifyVia | 流程图边界 | [S4][S6] |

### 2.2 红线分类

```text
RED-EXCLUSIVE   唯一性 (1)
  RED-001       Submission Task Agent 是唯一写 Submission

RED-DENY        拒绝性 (4)
  RED-002       Student 不能写 Submission
  RED-003       Teacher 不能读 Student 私有记忆
  RED-004       Student 不能访问其他学生数据
  RED-009       Agent 不能含推送通知

RED-CONDITIONAL 条件性 (1)
  RED-005       Student 只能提交到 active Challenge

RED-OBLIGATORY  强制性 (4)
  RED-006       消息必经 Inbox 校验
  RED-007       必走 Trusted Relationship
  RED-008       必留 Audit Trace
  RED-010       通知必走飞书 Bot
```

### 2.3 红线代码层映射

| Red Line | Schema 字段 | 运行时校验 | 测试 |
|---|---|---|---|
| RED-001 | `Submission.processed_by_agent_id MUST = "submission-task-*"` | Pre-write hook | ✅ 可测 |
| RED-002 | `StudentCompanion.permissions excludes "feishu.submissions.write"` | Permission check | ✅ 可测 |
| RED-003 | `TeacherCompanion.permissions excludes "ontology.student_memory.read_*"` | Permission check | ✅ 可测 |
| RED-004 | `MemoryBinding.owner_id MUST = agent.owner_id` | Access control | ✅ 可测 |
| RED-005 | `Challenge.status MUST = "active"` | Pre-submit hook | ✅ 可测 |
| RED-006 | `Inbox.process_message` 是唯一入口 | Code review | ⚠️ 需 e2e |
| RED-007 | `TrustedRelationship.required=true` in Inbox | Inbox step 3 | ✅ 可测 |
| RED-008 | `AuditLog.write` before any state change | Pre/Post hook | ✅ 可测 |
| RED-009 | `AgentManifest.capabilities excludes "notify_*"` | Lint rule | ✅ 可测 |
| RED-010 | `channel_type="feishu"` only for human | Code review | ⚠️ 需 review |

**红线代码层覆盖度：7/10 = 70%**（3 条需要 e2e 测试）

---

## 3. 能力约束（Capability Constraints）

### 3.1 Submission Task Agent 12 项能力

| ID | Capability | 类型 | 源类 | 目标类 | 前置 | 后置 |
|---|---|---|---|---|---|---|
| CAP-001 | **validate_request** | VALIDATE | SubmissionRequest | Submission | message 到达 | 校验结果 |
| CAP-002 | **check_github_repo** | VALIDATE | GitHubResource | Submission | 仓库 URL 存在 | 可访问性 |
| CAP-003 | **check_github_files** | VALIDATE | Artifact | Submission | README/AAR 必填 | 文件存在 |
| CAP-004 | **check_readme_aar** | VALIDATE | SubmissionArtifact | Submission | 文件非空 | 内容完整 |
| CAP-005 | **check_deadline** | VALIDATE | Challenge | Submission | 当前时间 ≤ due_date | 在期内 |
| CAP-006 | **get_or_create_submission** | CREATE | SubmissionRecord | Submission | 校验通过 | 创建记录 |
| CAP-007 | **write_audit_log** | WRITE | AuditTrace | Submission | 任意变更 | 审计留痕 |
| CAP-008 | **write_evaluation** | WRITE | Evaluation | Submission | 评审完成 | 分数写入 |
| CAP-009 | **write_portfolio** | WRITE | Portfolio | Submission | 提交 accepted | 作品集更新 |
| CAP-010 | **route_to_review** | ROUTE | ReviewTaskAgent | Submission | checked | 路由成功 |
| CAP-011 | **notify_student** | NOTIFY | Student | (feishu) | 状态变更 | 通知触达 |
| CAP-012 | **notify_teacher** | NOTIFY | Teacher | (feishu) | 状态变更 | 通知触达 |

### 3.2 能力前置条件（Precondition）

每项能力都有前置依赖，构成能力依赖图：

```text
CAP-001 validate_request
  PRE: MessageEnvelope.message_type = 'submission_request'
  PRE: from_agent = student-companion-*
  PRE: TrustedRelationship exists

CAP-002 check_github_repo
  PRE: github_repo URL in payload
  PRE: GitHub API token valid

CAP-003 check_github_files
  PRE: github_repo accessible (CAP-002)
  PRE: README.md exists
  PRE: AAR.md exists

CAP-004 check_readme_aar
  PRE: files non-empty (CAP-003)

CAP-005 check_deadline
  PRE: challenge_id in payload
  PRE: Challenge.due_date > now()

CAP-006 get_or_create_submission
  PRE: CAP-001..005 all passed
  PRE: Challenge.status = 'active'

CAP-007 write_audit_log
  PRE: any state change

CAP-008 write_evaluation
  PRE: review_result received

CAP-009 write_portfolio
  PRE: submission.status = 'accepted'

CAP-010 route_to_review
  PRE: submission.status = 'checked'
  PRE: review_mode in (teacher_only, teacher_and_peer, peer_only)

CAP-011 notify_student
  PRE: student_feishu_bot_id exists
  PRE: feishu Bot available

CAP-012 notify_teacher
  PRE: teacher_feishu_user_id exists
  PRE: feishu Bot available
```

### 3.3 能力后置效果（Effect）

```text
CAP-001 validate_request
  EFFECT: returns {valid: bool, reason: string}

CAP-002 check_github_repo
  EFFECT: returns {accessible: bool, repo_meta: object}

CAP-003 check_github_files
  EFFECT: returns {files_exist: bool, missing: array}

CAP-004 check_readme_aar
  EFFECT: returns {readme_valid: bool, aar_valid: bool}

CAP-005 check_deadline
  EFFECT: returns {on_time: bool, days_remaining: int}

CAP-006 get_or_create_submission
  EFFECT: Submission created/updated in feishu.submissions
  EFFECT: Submission.status transitions → 'validating' or 'checked'

CAP-007 write_audit_log
  EFFECT: AuditTrace row inserted in audit_log table

CAP-008 write_evaluation
  EFFECT: Evaluation record in feishu.evaluations

CAP-009 write_portfolio
  EFFECT: PortfolioItem added to feishu.portfolio_items

CAP-010 route_to_review
  EFFECT: MessageEnvelope sent to ReviewTaskAgent
  EFFECT: Submission.status → 'pending_review'

CAP-011 notify_student
  EFFECT: feishu Bot 私聊消息发送

CAP-012 notify_teacher
  EFFECT: feishu Bot 群通知 / 私聊消息发送
```

### 3.4 能力分组

| 组 | 能力 | 数量 |
|---|---|---:|
| **VALIDATE**（校验）| 001-005 | 5 |
| **CREATE**（创建）| 006 | 1 |
| **WRITE**（写入）| 007-009 | 3 |
| **ROUTE**（路由）| 010 | 1 |
| **NOTIFY**（通知）| 011-012 | 2 |
| **总计** | | 12 |

---

## 4. 状态机转换关系（State Transitions）

### 4.1 Submission 9 态状态机

来自 [S3] §8.2 + [S6]，**11 个状态**（draft + 9 流转 + final）：

```text
draft
  ↓ [StudentCompanion.submits]
submitted
  ↓ [SubmissionTask.validate_request passes]
validating
  ↓ [all 5 validations pass]
checked
  ↓ [SubmissionTask.route_to_review]
pending_review
  ↓ [ReviewTask accepts]
under_review
  ↓ [ReviewTask completes]
reviewed
  ↓ [SubmissionTask.deliversFeedback]
pending_teacher_review
  ↓ [Teacher.accepts]
accepted
  ↓ [final state]

  ─────────────────────── 失败分支 ───────────────────────
validating
  ↓ [check_github_repo fails]
needs_revision
  ↓ [Student fixes & resubmits]
submitted  (循环)

pending_teacher_review
  ↓ [Teacher rejects]
needs_teacher_revision
  ↓ [Student updates & resubmits]
under_review  (循环回)
```

| 转换 ID | From State | To State | Trigger | Actor |
|---|---|---|---|---|
| STATE-SUB-001 | draft | submitted | submission_request | StudentCompanion |
| STATE-SUB-002 | submitted | validating | Inbox accepts | SubmissionTask |
| STATE-SUB-003 | validating | checked | all 5 checks pass | SubmissionTask |
| STATE-SUB-004 | validating | needs_revision | any check fails | SubmissionTask |
| STATE-SUB-005 | needs_revision | submitted | student resubmits | StudentCompanion |
| STATE-SUB-006 | checked | pending_review | route_to_review | SubmissionTask |
| STATE-SUB-007 | pending_review | under_review | review_task picks up | ReviewTask |
| STATE-SUB-008 | under_review | reviewed | review complete | ReviewTask |
| STATE-SUB-009 | reviewed | pending_teacher_review | final_adjustment request | SubmissionTask |
| STATE-SUB-010 | pending_teacher_review | accepted | teacher accepts | TeacherCompanion |
| STATE-SUB-011 | pending_teacher_review | needs_teacher_revision | teacher rejects | TeacherCompanion |
| STATE-SUB-012 | needs_teacher_revision | under_review | student updates | ReviewTask |

**统计**：12 个状态转换

### 4.2 Review Status 6 态状态机

来自 [主仓-assessment-ontology.md]：

```text
submitted
  ↓ [peer reviews done]
peer-reviewed
  ↓ [agent review done]
agent-reviewed
  ↓ [if not pass]
needs-revision
  ↓ [resubmit]
peer-reviewed (循环)
  ↓ [if pass]
accepted
  ↓ [if knowledge candidate]
knowledge-candidate
```

| 转换 ID | From State | To State | Trigger |
|---|---|---|---|
| STATE-REV-001 | submitted | peer-reviewed | peer reviews complete |
| STATE-REV-002 | peer-reviewed | agent-reviewed | agent review complete |
| STATE-REV-003 | peer-reviewed | needs-revision | below threshold |
| STATE-REV-004 | needs-revision | peer-reviewed | student resubmits |
| STATE-REV-005 | agent-reviewed | accepted | above threshold |
| STATE-REV-006 | accepted | knowledge-candidate | knowledge team flag |

**统计**：6 个状态转换

### 4.3 Challenge 5 态状态机（隐含）

来自 [S3] + 隐含推理：

```text
draft
  ↓ [teacher creates]
published
  ↓ [class start, students notified]
active
  ↓ [due_date passed]
closed
  ↓ [admin review]
archived
```

| 转换 ID | From State | To State | Trigger | Source |
|---|---|---|---|---|
| STATE-CHA-001 | draft | published | teacher publishes | [S3] 隐含 |
| STATE-CHA-002 | published | active | students notified | [S3] 隐含 |
| STATE-CHA-003 | active | closed | due_date reached | [S3] 隐含 |
| STATE-CHA-004 | closed | archived | admin reviews | [S3] 隐含 |
| STATE-CHA-005 | published | active | 立即生效 | [S3] 隐含 |

**统计**：5 个状态转换

### 4.4 Presence 5 态状态机

来自 [S5]：

```text
online
  ↓ [agent busy]
busy
  ↓ [task complete]
online
  ↓ [user logs out]
offline
  ↓ [user logs in]
online
  ↓ [DND set]
do-not-disturb
  ↓ [DND clear]
online
  ↓ [pause]
paused
  ↓ [resume]
online
```

**统计**：5 态，无显式转换文档

### 4.5 Inbox Queue 3 态状态机

来自 [S5]：

```text
pending_approval
  ↓ [auto approve]
online
  ↓ [offline mode]
offline
  ↓ [back online]
online
```

**统计**：3 态

### 4.6 状态机汇总

| 状态机 | 状态数 | 转换数 | 来源 |
|---|---:|---:|---|
| Submission | 11 | 12 | [S3] §8.2 |
| Review Status | 6 | 6 | [主仓-assessment] |
| Challenge | 5 | 5 | 隐含 |
| Presence | 5 | — | [S5] |
| Inbox Queue | 3 | — | [S5] |
| **总计** | **30 态** | **23 显式转换** | |

---

## 5. 信任 / 路由关系（Trust & Routing）

### 5.1 Trusted Relationship 5 条默认规则

来自 [S5][S7][S8]：

| ID | From Agent | To Agent | Type | Trust Level | Permissions | Source |
|---|---|---|---|---|---|---|
| TRUST-001 | student-companion-* | submission-task-agent | task-agent | auto | [submit, view_own] | [S7] |
| TRUST-002 | student-companion-* | teacher-companion-* | companion | auto | [receive_feedback] | [S7] |
| TRUST-003 | teacher-companion-* | submission-task-agent | task-agent | auto | [publish, view_all] | [S8] |
| TRUST-004 | teacher-companion-* | review-task-agent | task-agent | auto | [trigger_review, confirm] | [S8] |
| TRUST-005 | teacher-companion-* | student-companion-* | companion | auto | [send_feedback] | [S8] |

**统计**：5 条默认 Trust Relationship

### 5.2 Routing Status 转换

来自 [S3] §8.2：

```text
not_routed
  ↓ [review_mode = teacher_only]
routed_to_teacher

not_routed
  ↓ [review_mode = peer_only]
routed_to_peer

not_routed
  ↓ [review_mode = teacher_and_peer]
routed_to_both

routed_to_teacher
  ↓ [peer joins late]
routed_to_both
```

| 转换 ID | From | To | Trigger |
|---|---|---|---|
| STATE-ROUTE-001 | not_routed | routed_to_teacher | review_mode = teacher_only |
| STATE-ROUTE-002 | not_routed | routed_to_peer | review_mode = peer_only |
| STATE-ROUTE-003 | not_routed | routed_to_both | review_mode = teacher_and_peer |
| STATE-ROUTE-004 | routed_to_teacher | routed_to_both | peer joins |

**统计**：4 个路由状态转换

### 5.3 Review Mode 决定路由

| Review Mode | Teacher 路由 | Peer 路由 |
|---|:---:|:---:|
| teacher_only | ✅ | ❌ |
| peer_only | ❌ | ✅ |
| teacher_and_peer | ✅ | ✅ |

### 5.4 Inbox 10 步校验链

来自 [S13]，是一组**顺序依赖的**校验关系：

| Step | Action | Type | Failure Path |
|---|---|---|---|
| INBOX-STEP-1 | **接收消息** | ACTION | n/a |
| INBOX-STEP-2 | **身份验证**（from_agent 必须存在）| VALIDATE | dead_letter_queue |
| INBOX-STEP-3 | **签名验证**（signature 必须有效）| VALIDATE | dead_letter_queue |
| INBOX-STEP-4 | **Trusted Relationship 校验** | VALIDATE | dead_letter_queue |
| INBOX-STEP-5 | **权限验证**（检查 Permission）| VALIDATE | dead_letter_queue |
| INBOX-STEP-6 | **重复检测**（message_id 去重）| DEDUPE | silently drop |
| INBOX-STEP-7 | **过期检测**（timestamp TTL）| VALIDATE | dead_letter_queue |
| INBOX-STEP-8 | **队列路由**（按 message_type 路由到处理函数）| ROUTE | dead_letter_queue |
| INBOX-STEP-9 | **处理函数执行** | EXECUTE | retry/dead_letter |
| INBOX-STEP-10 | **Audit Log 记录 + ACK 发送** | WRITE | n/a |

**统计**：10 步 Inbox 校验链

---

## 6. 能力调用图（Capability Invocation Graph）

### 6.1 Submission 全流程调用链

```text
Student 在 Web/GitHub 干活
  ↓
[UI] 用户点击"提交"
  ↓
StudentCompanion.prepare_submission_package
  ↓
StudentCompanion.send_submission_request        ← CAP-003 触发
  ↓
MessageEnvelope 发送
  ↓
[INBOX-STEP 1-10] 校验链
  ↓
SubmissionTask.validate_request                ← CAP-001
  ↓
SubmissionTask.check_github_repo               ← CAP-002
  ↓
SubmissionTask.check_github_files              ← CAP-003
  ↓
SubmissionTask.check_readme_aar                ← CAP-004
  ↓
SubmissionTask.check_deadline                  ← CAP-005
  ↓
SubmissionTask.get_or_create_submission        ← CAP-006
  ↓
SubmissionTask.write_audit_log                 ← CAP-007
  ↓
SubmissionTask.route_to_review                 ← CAP-010
  ↓
[ReviewTask 执行评审]
  ↓
ReviewTask.write_evaluation
  ↓
SubmissionTask.write_evaluation                ← CAP-008
  ↓
SubmissionTask.notify_student                  ← CAP-011
  ↓
[飞书 Bot 私聊学生]
  ↓
SubmissionTask.notify_teacher                  ← CAP-012
  ↓
[飞书 Bot 私聊教师：待复核]
  ↓
Teacher 飞书确认评分
  ↓
TeacherCompanion.final_adjustment
  ↓
SubmissionTask.write_portfolio                 ← CAP-009
  ↓
[飞书 Bot 私聊学生：最终结果]
```

**统计**：12 个能力调用 + 10 个 Inbox 校验 + 9 个状态转换

### 6.2 Publish 全流程调用链

```text
Teacher 在飞书/Web 创建 Challenge
  ↓
[UI] 教师填写 Challenge 表单
  ↓
TeacherCompanion.publish_challenge
  ↓
TeacherCompanion.create_challenge_message
  ↓
MessageEnvelope 发送 (challenge_publish)
  ↓
[INBOX-STEP 1-10]
  ↓
SubmissionTask.create_challenge_record
  ↓
SubmissionTask.write_audit_log
  ↓
SubmissionTask.notify_students (broadcast)     ← 等价 CAP-011 广播版
  ↓
[飞书 Bot 群通知学生]
  ↓
StudentCompanion.receive_challenge
  ↓
[学生可在 Web 看到]
```

---

## 7. 抽取物索引（ID 速查）

### 7.1 按 ID 前缀

| 前缀 | 含义 | 数量 |
|---|---|---:|
| **REL-PROTO-** | 协议关系 | 13 |
| **REL-BIZ-** | 业务关系 | 12 |
| **REL-MSG-** | 消息流关系 | 9 |
| **REL-001..031** | 关系总表 | 31 |
| **RED-001..010** | 架构红线 | 10 |
| **CAP-001..012** | 能力约束 | 12 |
| **STATE-SUB-001..012** | Submission 状态转换 | 12 |
| **STATE-REV-001..006** | Review 状态转换 | 6 |
| **STATE-CHA-001..005** | Challenge 状态转换 | 5 |
| **STATE-ROUTE-001..004** | Route 状态转换 | 4 |
| **TRUST-001..005** | 信任关系 | 5 |
| **INBOX-STEP-1..10** | Inbox 校验链 | 10 |
| **总计** | | **~130** |

### 7.2 按状态

| 状态 | 数量 | 占比 |
|---|---:|---:|
| ✅ 已有（仓库 / 文档） | 35 | 27% |
| ⚠️ 部分覆盖 | 18 | 14% |
| ❌ 未实现 | 50 | 38% |
| 🆕 仅在原文档 | 27 | 21% |
| **总计** | **~130** | **100%** |

### 7.3 按关系类型

| 类型 | 数量 |
|---|---:|
| HAS-A | 25 |
| TRUST | 6 |
| ROUTE | 5 |
| RED-OBLIGATORY | 4 |
| RED-DENY | 4 |
| BELONG | 2 |
| REF | 1 |
| DEP | 1 |
| STATE | 27 |
| **总计** | **~75 关系 + 30 状态 + 5 信任 + 10 Inbox** |

---

## 8. 抽取统计

### 8.1 总体统计

| 类别 | 数量 |
|---|---:|
| **类间关系（T-Box Relations）** | 31 |
| **消息流关系** | 9 |
| **架构红线** | 10 |
| **能力约束** | 12 |
| **状态机** | 30 态 / 23 显式转换 |
| **信任关系** | 5 |
| **Inbox 校验链** | 10 步 |
| **能力调用链** | 2 条完整流程 |
| **抽取物 ID** | **~130** |

### 8.2 抽取覆盖度

| 抽取类型 | 数量 | 已有 | 缺口 | 覆盖度 |
|---|---:|---:|---:|---:|
| 协议关系 | 13 | 13 | 0 | **100%** |
| 业务关系 | 18 | 8 | 10 | 44% |
| 消息流关系 | 9 | 9 | 0 | **100%** |
| 架构红线 | 10 | 10 | 0 | 100%（设计）/ 70%（代码）|
| 能力约束 | 12 | 12 | 0 | **100%** |
| 状态机 | 23 转换 | 0（无显式文档）| 23 | 0% |
| 信任关系 | 5 | 5 | 0 | **100%** |
| Inbox 校验 | 10 | 10 | 0 | **100%** |
| **总计** | **~110** | **67** | **43** | **~61%** |

### 8.3 关键缺口

#### 关系层缺口

| 缺口关系 | 类型 | 优先级 |
|---|---|---|
| `belongsTo` TaskAgent→CompanionAgent | BELONG | 🟡 P1 |
| `invokes` TaskAgent→Skill | DEP | 🟡 P1 |
| `enrolls` Learner→Course | HAS-A | 🟡 P1 |
| `learns` Learner→Skill | HAS-A | 🟡 P1 |
| `manifestsThrough` PersonalOntology→OKF | HAS-A | 🟡 P1 |
| `writesTo` SubmissionTaskAgent→Submission | HAS-A | 🔴 P0（架构红线）|
| `routesTo` SubmissionTaskAgent→ReviewTaskAgent | ROUTE | 🔴 P0（架构红线）|

#### 状态机缺口

| 缺口状态机 | 优先级 |
|---|---|
| Submission 9 态（缺正式状态机文档）| 🔴 P0 |
| Review Status 6 态 | 🟡 P1 |
| Challenge 5 态（隐含）| 🟡 P1 |
| Presence 5 态（无转换）| 🟢 P2 |
| Inbox Queue 3 态（无转换）| 🟢 P2 |

#### 红线代码层缺口

| 红线 | 代码层校验缺失 | 优先级 |
|---|---|---|
| RED-006 消息必经 Inbox | 缺 e2e 测试 | 🟡 P1 |
| RED-010 通知必走飞书 Bot | 缺 review 流程 | 🟡 P1 |

---

## 附录：抽取约定

### A.1 ID 命名规范

```text
REL-{大类}-{编号}    # 关系
  REL-PROTO-001      协议关系
  REL-BIZ-001        业务关系
  REL-MSG-001        消息流关系

RED-{编号}           # 架构红线
  RED-001..010

CAP-{编号}           # 能力约束
  CAP-001..012

STATE-{对象}-{编号}   # 状态转换
  STATE-SUB-001      Submission 状态
  STATE-REV-001      Review 状态
  STATE-CHA-001      Challenge 状态
  STATE-ROUTE-001    Route 状态

TRUST-{编号}         # 信任关系
  TRUST-001..005

INBOX-STEP-{编号}    # Inbox 校验
  INBOX-STEP-1..10
```

### A.2 关系类型标识

| 标识 | 含义 |
|---|---|
| **IS-A** | 继承 |
| **HAS-A** | 包含 |
| **REF** | 弱引用 |
| **DEP** | 依赖 |
| **BELONG** | 归属 |
| **TRIGGER** | 触发 |
| **STATE** | 状态转换 |
| **TRUST** | 信任 |
| **ROUTE** | 路由 |
| **RED** | 强约束（细分 EXCLUSIVE/DENY/CONDITIONAL/OBLIGATORY）|

### A.3 抽取流程（可重复）

```text
Step 1: 读 Team3-语义模块抽取.md §2.3（关系部分）
Step 2: 抽取 §2.3.3 类间关系（22 条核心）
Step 3: 补充 9 条消息流关系（从 §2.4.1 event 表推导）
Step 4: 抽取 §2.3.1 架构红线（10 条）
Step 5: 抽取 §2.3.2 能力约束（12 条）
Step 6: 抽取 §2.3.4 + 各状态枚举的状态机转换（23 条）
Step 7: 抽取 §2.3.5 信任关系（5 条）
Step 8: 抽取 §2.3.6 Inbox 校验链（10 步）
Step 9: 构建 §6 能力调用图（2 条全流程）
Step 10: 索引 §7 + 统计 §8
```

---

> **关系抽取方法论核心理念（一句话）**：
> 
> **从 19 份 Team 3 资料中抽出 31 条类间关系 + 9 条消息流 + 10 条红线 + 12 项能力 + 23 个状态转换 + 5 条信任 + 10 步 Inbox 校验 + 2 条全流程调用链 = 共 ~130 个关系型抽取物，按 IS-A/HAS-A/REF/DEP/BELONG/TRUST/ROUTE/STATE/RED 9 种类型分类，识别 3 个 P0 缺口（架构红线 2 条 + 状态机 1 个）和 4 个 P1 缺口（关系/状态机/RFC 校验）。**
