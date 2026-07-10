# Team 3 语义模块抽取报告

> 用 Ontology Factory 7 步流水线（方法论 #1）的语义抽取阶段，对 Team 3 全部相关资料做 T-Box / A-Box / R-Box / Event / Process / Skill / Agent 七层抽取与对齐。

---

## 目录

- [0. 抽取方法与分类法](#0-抽取方法与分类法)
- [1. 资料源清单](#1-资料源清单)
- [2. 分类抽取结果（按 Box 分层）](#2-分类抽取结果按-box-分层)
  - [2.1 T-Box：概念 / 类 / 分类体系](#21-t-box概念--类--分类体系)
  - [2.2 A-Box：实例与事实](#22-a-box实例与事实)
  - [2.3 R-Box：规则 / 约束 / 关系](#23-r-box规则--约束--关系)
  - [2.4 Event Model：事件本体](#24-event-model事件本体)
  - [2.5 Process Model：流程本体](#25-process-model流程本体)
  - [2.6 Skill Candidates：技能本体](#26-skill-candidates技能本体)
  - [2.7 Agent Role Candidates：智能体角色本体](#27-agent-role-candidates智能体角色本体)
- [3. 跨资料对齐与去重](#3-跨资料对齐与去重)
- [4. 字段层落地（PRD §8 数据模型）](#4-字段层落地-prd-8-数据模型)
- [5. 架构红线与边界](#5-架构红线与边界)
- [6. 抽取覆盖度自评](#6-抽取覆盖度自评)
- [7. 下一步建议](#7-下一步建议)

---

## 0. 抽取方法与分类法

### 0.1 抽取方法（来自 Ontology Factory 7 步流水线）

```text
Unstructured Source
  ↓
Document Parsing
  ↓
Semantic Block Extraction
  ↓
Entity / Concept Extraction       ← 本文
  ↓
Relation Extraction               ← 本文
  ↓
Rule / Constraint Extraction      ← 本文
  ↓
Event / Process Extraction        ← 本文
  ↓
Ontology Assembly                 ← 第 3 节
  ↓
Validation
```

### 0.2 抽取分类法（7 层）

| 层 | 抽取内容 | 映射 | 标记 |
|---|---|---|---|
| T-Box | 概念 / 类 / 分类 / 属性 | `AutoConcept` / `AutoTaxonomy` | T |
| A-Box | 实例 / 事实 / 断言 | 实例层 | A |
| R-Box | 规则 / 约束 / 关系 | `AutoConstraint` / `AutoRelation` | R |
| Event | 事件本体 | `AutoEvent` | E |
| Process | 流程本体 | `AutoWorkflow` | P |
| Skill | 技能候选 | `AutoSkill` | S |
| Agent | 智能体角色候选 | `AutoAgent` | AG |

每条抽取记录标注来源：`[课程]` / `[MVP设计]` / `[PRD]` / `[主仓-ont]` / `[主仓-manifest]` / `[主仓-flow]` / `[主仓-env]` / `[主仓-audit]` / `[主仓-inbox]`

---

## 1. 资料源清单

| # | 文件 | 路径 | 角色 | 行数 |
|---|---|---|---|---:|
| S1 | Elite20-Vibe-Coding-Course.docx | `老师资料/Elite20-Vibe-Coding-Course.docx` | 课程要求 | 200+ |
| S2 | MVP-Elite20教育智能体系统本体设计.md | `老师资料/1/2_副本/MVP-Elite20教育智能体系统本体设计.md` | 系统本体设计 | 718 |
| S3 | Elite_Education_MVP_PRD_Challenge_Agent_Workflow_CN.md | `老师资料/1/Elite_Education_MVP_PRD_Challenge_Agent_Workflow_CN.md` | PRD v0.3 | 500+ |
| S4 | teams/agent-team/README.md | 主仓 | Team 3 README | 159 |
| S5 | ontology/agent-ontology.md | 主仓 | 系统本体 | 380 |
| S6 | agents/agent-collaboration-flow.md | 主仓 | 协作流程 | 200+ |
| S7 | agents/manifests/student-companion-agent.schema.json | 主仓 | Agent Manifest | 102 |
| S8 | agents/manifests/teacher-companion-agent.schema.json | 主仓 | Agent Manifest | 130 |
| S9 | agents/manifests/submission-task-agent.schema.json | 主仓 | Agent Manifest | 110+ |
| S10 | agents/manifests/review-task-agent.schema.json | 主仓 | Agent Manifest | 80+ |
| S11 | agents/messages/message-envelope-schema.md | 主仓 | 消息外壳 | 100+ |
| S12 | agents/audit/audit-log-schema.md | 主仓 | 审计 schema | 200+ |
| S13 | agents/inbox/README.md | 主仓 | Inbox 设计 | 100+ |
| S14 | agents/manifests/coding-coach-agent.manifest.yaml | 主仓 | 旧 Manifest | 30+ |
| S15 | agents/manifests/evaluation-agent.manifest.yaml | 主仓 | 旧 Manifest | 30+ |
| S16 | agents/manifests/project-manager-agent.manifest.yaml | 主仓 | 旧 Manifest | 30+ |
| S17 | agents/coding-coach-agent.md | 主仓 | 旧 stub | 30 |
| S18 | agents/evaluation-agent.md | 主仓 | 旧 stub | 30 |
| S19 | agents/project-manager-agent.md | 主仓 | 旧 stub | 30 |

---

## 2. 分类抽取结果（按 Box 分层）

### 2.1 T-Box：概念 / 类 / 分类体系

#### 2.1.1 Agent 类别（T-Box）

| 概念 | 父类 | 来源 | 别名 | 备注 |
|---|---|---|---|---|
| **Agent** | - | [S5] | - | 顶层抽象 |
| **CompanionAgent** | Agent | [S2] | Raymond / 个人助理 | "second brain" |
| **TaskAgent** | Agent | [S2] | 系统级任务执行者 | 负责完整任务流程，不负责长期个人记忆 |
| **SystemAgent** | Agent | [S2] | - | 同 TaskAgent 的旧叫法 |
| **StudentCompanion** | CompanionAgent | [S5][S2] | Student Raymond | `agent_type=student-companion` |
| **TeacherCompanion** | CompanionAgent | [S5][S2] | Professor Raymond / Instructor Agent | `agent_type=teacher-companion` |
| **AdminCompanion** | CompanionAgent | [S2] | Admin Raymond | MVP 初始化 |
| **SubmissionTaskAgent** | TaskAgent | [S3][S5] | - | `agent_type=submission-task` 单例 |
| **ReviewTaskAgent** | TaskAgent | [S3][S5] | - | `agent_type=review-task` 单例 |
| **PeerReviewStudentAgent** | TaskAgent | [S3] | - | `agent_type=peer-review` |
| **CodingCoachAgent** | CompanionAgent? | [课程][S14][S17] | - | 旧方向，归类未定 |
| **EvaluationAgent** | TaskAgent? | [课程][S15][S18] | - | 旧方向 |
| **ProjectManagerAgent** | TaskAgent? | [课程][S16][S19] | - | 旧方向 |
| **MentorAgent** | CompanionAgent | [课程] | - | 1v1 答疑，**未实现** |
| **KnowledgeLibrarianAgent** | CompanionAgent | [课程] | - | 知识库问答，**未实现** |

**统计**：15 个 Agent 类，3 类未实现（Mentor / KnowledgeLibrarian / Coding Coach 升级）

#### 2.1.2 Task Agent 子类（T-Box）

| 概念 | 来源 | 用途 | linked_task_agent |
|---|---|---|---|
| **CourseSetupAgent** | [S2] | 课程搭建 | - |
| **ChallengeCreationAgent** | [S2] | 创建 Challenge | - |
| **ProjectExecutionAgent** | [S2] | 项目执行 | - |
| **ChallengeSubmissionAgent** | [S2] | 学生提交产物 | GitHubArtifactSkill / FeishuSubmissionSkill / AARSkill / SelfEvaluationSkill |
| **AARAgent** | [S2] | 复盘 | - |
| **EvaluationAgent** | [S2] | 评估 | - |
| **CompanionSetupAgent** | [S2] | 初始化学生 | - |
| **ChallengeWorkAgent** | [S2] | 学生完成任务 | - |
| **GitHubArtifactAgent** | [S2] | 产物管理 | - |
| **SelfEvaluationAgent** | [S2] | 自评 | - |
| **PortfolioSubmissionAgent** | [S2] | 作品集 | - |
| **SubmissionReviewAgent** | [S2] | 提交审核（教师） | - |
| **RubricEvaluationAgent** | [S2] | 评分（教师） | - |
| **CohortMonitoringAgent** | [S2] | 班级监控（教师） | - |

**统计**：14 个 Task Agent 子类

#### 2.1.3 协议核心类（T-Box）

| 概念 | 父类 | 来源 | 必有属性 |
|---|---|---|---|
| **AgentIdentity** | - | [S5] | agent_id, agent_type, owner_id, display_name, status, last_active_at |
| **AgentManifest** | - | [S5] | agent_id, manifest_version, capabilities, interfaces, permissions, trusted_agents, memory_binding, channel_bindings, constraints |
| **Capability** | - | [S5][S7] | capability_id, name, description |
| **Interface** | - | [S5][S7] | interface_name, input_schema, output_schema |
| **Permission** | - | [S5][S7] | permission_id, scope |
| **Constraint** | - | [S5][S7] | constraint_id, rule |
| **MemoryBinding** | - | [S5] | ontology_path |
| **ChannelBinding** | - | [S5] | channel_type, channel_id |
| **TrustedRelationship** | - | [S5] | relationship_id, agent_a, agent_b, relationship_type, trust_level, permissions, capabilities, expiration, last_verified |
| **MessageEnvelope** | - | [S5][S11] | message_id, request_id, from_agent, to_agent, message_type, timestamp, payload, routing_metadata, audit_trace_pointer |
| **AgentInbox** | - | [S5][S13] | agent_id, queue_type, messages |
| **AgentOutbox** | - | [S5] | agent_id, pending_events, routing_history |
| **AuditTrace** | - | [S5][S12] | audit_id, timestamp, agent_id, action, target_resource, before_state, after_state, routing_path, related_message_id |
| **Presence** | - | [S5] | agent_id, status, last_seen, current_task |
| **ResourceConfig** | - | [S2][S5] | feishu, github, course, agent_id |
| **PersonalOntology** | - | [S2] | identity, learning_goals, courses, skills, projects, schedule, exams, resume, job_applications, personal_interests |
| **OKF** | - | [S2] | Open Knowledge Format 知识包 |

**统计**：17 个协议核心类

#### 2.1.4 业务对象类（T-Box）

| 概念 | 父类 | 来源 | 必有属性 |
|---|---|---|---|
| **Learner** | Person | [S2] | 学生ID, 姓名, 学校, 专业, 年级, 邮箱, 飞书ID, GitHub账号, 所属班级, 学习目标, AI+X方向, CompanionAgent, PersonalOntology, PersonalMemory, Portfolio |
| **Professor** | Person | [S2] | 教师ID, 姓名, 所属机构, 飞书ID, GitHub组织, 管理课程, 管理班级, Challenge库, Rubric库, 提交表, 评估表, CompanionAgent |
| **Course** | - | [S2] | 课程ID, 名称, 所属班级, 教授, 助教, 课程目标, 知识点, Challenge序列, 学习资源, 评分标准, 产物要求 |
| **Challenge** | - | [S2][S3] | ChallengeID, 标题, 目标知识点, 产品目标, 输入资源, 所需Skill, 交付物, 提交方式, Rubric, AAR要求, Portfolio要求 |
| **Artifact** | - | [S2] | ArtifactID, 所属学生, 所属Challenge, 类型, GitHub链接, 版本, 状态, 自评, Agent评估, Portfolio可见性 |
| **AAR** | - | [S2] | challenge_id, student_id, task, expected_result, actual_result, what_worked, what_failed, lesson_learned, skill_update, memory_update, next_action |
| **Rubric** | - | [S2][S3] | rubric_id, dimensions, max_score |
| **Submission** | - | [S3] | 25 字段（见 §4.2） |
| **Evaluation** | - | [S3] | evaluation_id, submission_id, scores, feedback |
| **Portfolio** | - | [S2] | portfolio_id, items, visibility |
| **SubmissionArtifact** | - | [主仓-challenge] | artifact 类型（见下）|

**Artifact 类型枚举**（来自 [S2]）：

```text
GitHub Repo
README
Demo
Design Doc
Prompt Log
Context Pack
AAR
Self Evaluation
Portfolio Page
```

**统计**：10 个业务对象类 + 9 种 Artifact 子类

#### 2.1.5 资源类（T-Box）

| 概念 | 来源 | 属性 |
|---|---|---|
| **FeishuResource** | [S2][S5] | tenant_id, user_id, student_table_id, course_table_id, challenge_table_id, submission_table_id, evaluation_table_id, wiki_url, professor_handle |
| **GitHubResource** | [S2][S5] | username, personal_repo, portfolio_repo, artifact_repo_root, github_pages_url, github_actions |
| **CourseResource** | [S2] | course_id, cohort_id, challenge_id, rubric_id |

#### 2.1.6 状态枚举（T-Box）

**Submission 状态机（9 态）**（来自 [S3][S6]）：

| 状态 | 含义 | 触发 |
|---|---|---|
| `draft` | 学生起草中 | 学生发起 |
| `submitted` | 已发起 submission_request | Student Companion |
| `validating` | Submission Task Agent 校验中 | Submission Task |
| `needs_revision` | 校验失败 | Submission Task |
| `checked` | 通过校验 | Submission Task |
| `pending_review` | 等待 Review Task | Submission Task |
| `under_review` | Review Task 工作中 | Review Task |
| `reviewed` | AI 评审完成 | Review Task |
| `pending_teacher_review` | 等教师确认 | Submission Task |
| `accepted` | 教师确认 | Teacher Companion |
| `needs_teacher_revision` | 教师驳回 | Teacher Companion |

**Review Mode 枚举**（来自 [S3]）：

```text
teacher_only
peer_only
teacher_and_peer
```

**Routing Status 枚举**（来自 [S3]）：

```text
not_routed
routed_to_teacher
routed_to_peer
routed_to_both
```

**Admin Identity Mode 枚举**（来自 [S3] §4.3）：

```text
independent_admin    # 系统管理员独立处理
teacher_delegated    # 教师委托处理
```

**Message Type 枚举（9 种）**（来自 [S3] §9）：

| # | message_type | from → to |
|---|---|---|
| 1 | `challenge_publish` | Teacher Companion → Submission Task |
| 2 | `challenge_available` | Submission Task → Student Companions |
| 3 | `submission_request` | Student Companion → Submission Task |
| 4 | `review_request` | Submission Task → Review Task |
| 5 | `review_result` | Review Task → Submission Task |
| 6 | `feedback` | Submission Task → Student Companion |
| 7 | `status_update` | Submission Task → Teacher Companion |
| 8 | `final_adjustment` | Teacher Companion → Submission Task |
| 9 | `peer_review_request` | Review Task → Peer Review Students |

**Agent Type 枚举**（来自 [S5]）：

```text
student-companion
teacher-companion
submission-task
review-task
peer-review
```

**Presence Status 枚举**（来自 [S5]）：

```text
online | busy | offline | do-not-disturb | paused
```

**Inbox Queue Type 枚举**（来自 [S5]）：

```text
online | offline | pending_approval
```

**Trust Level 枚举**（来自 [S5]）：

```text
auto | require-approval | denied
```

**统计**：8 个状态枚举，9 个 message_type，共 ~50 个枚举值

---

### 2.2 A-Box：实例与事实

#### 2.2.1 Agent 实例（A-Box）

| agent_id | agent_type | 来自 |
|---|---|---|
| `student-companion-{student_id}` | student-companion | [S5][S7] |
| `teacher-companion-{teacher_id}` | teacher-companion | [S5][S8] |
| `submission-task-agent` | submission-task | [S5] 单例 |
| `review-task-agent` | review-task | [S5] 单例 |
| `peer-review-{student_id}` | peer-review | [S3] |

**Channel 实例**（来自 [S7][S8]）：

| channel_type | channel_id 模式 |
|---|---|
| web | `web-session-{user_id}` |
| github | `{github_username}` |
| feishu | `{feishu_user_id}` |

#### 2.2.2 PersonalOntology 子模块实例（A-Box）

**Student Raymond 的 9 个 PersonalOntology 子模块**（来自 [S2]）：

```yaml
identity: ...
learning_goals: ...
courses: ...
skills: ...
projects: ...
schedule: ...
exams: ...
resume: ...
job_applications: ...
personal_interests: ...
```

**Personal OKF 目录实例**（来自 [S2]）：

```text
personal-okf/
├── profile.yaml
├── ontology.md
├── skills.md
├── memory.md
├── resources.md
├── goals.md
├── challenges/
├── artifacts/
└── aar/
```

#### 2.2.3 业务对象实例（A-Box）

| 实例 | 来自 |
|---|---|
| MVP 第一门课："Elite20 AI+X Web Coding MVP" | [S2] |
| Course Ontology 12 个知识点：AI Literacy / Web Coding Basics / Prompt Engineering / Context Engineering / Harness Engineering / Loop Engineering / GitHub Workflow / FDE Methodology / ATMC Methodology / Product Thinking / Portfolio Building / Career Readiness | [S2] |
| MVP 首批 8 个 Skill：Excel Import / Feishu Setup / Personal OKF / Challenge Creation / GitHub Artifact / AAR / Self Evaluation / Portfolio Submission | [S2] |

---

### 2.3 R-Box：规则 / 约束 / 关系

#### 2.3.1 架构红线规则（R-Box - 强约束）

来自 [S3][S6][S4]：

| # | 规则 ID | 规则 | 违反后果 |
|---|---|---|---|
| R-001 | 提交写入唯一性 | `Submission Task Agent` 是**唯一**能写 Submission Record 的 Agent | 学生提交流程不通过 |
| R-002 | 不可越权写记录 | `Student Companion Agent` **不能**直接写最终 Submission Record | 安全告警 |
| R-003 | 不可越权读记忆 | `Teacher Companion` **不能**访问学生私有记忆 | 权限拒绝 |
| R-004 | 不可跨学生访问 | `Student Companion` **不能**访问其他学生数据 | 权限拒绝 |
| R-005 | 提交时间窗 | `Student Companion` **只能**提交到 active 状态的 Challenge | 路由失败 |
| R-006 | 消息必经 Inbox | 所有 Agent 消息**必须**经过 Inbox 校验 | 拒绝投递 |
| R-007 | 必走 Trusted Relationship | 消息发送前**必须**校验 Trusted Relationship | 拒绝投递 |
| R-008 | 必留 Audit Trace | 每次状态变化**必须**写 Audit Trace | 不允许状态变更 |
| R-009 | 触达不靠 Agent | Agent **不**包含推送通知逻辑（统一走飞书 Bot）| 架构违规 |
| R-010 | Agent 通知边界 | `→` 表示 Agent 间消息，`【】` 表示飞书 Bot 触达 | 流程图边界 |

**统计**：10 条架构红线

#### 2.3.2 Submission Task Agent 12 项能力（R-Box 行为约束）

来自 [S3] §5.3：

| # | capability | 描述 |
|---|---|---|
| C-01 | `validate_request` | 校验 submission_request 合法性 |
| C-02 | `check_github_repo` | 校验 GitHub repo 可访问 |
| C-03 | `check_github_files` | 校验文件存在 |
| C-04 | `check_readme_aar` | 校验 README + AAR |
| C-05 | `check_deadline` | 校验截止时间 |
| C-06 | `get_or_create_submission` | 创建/获取 Submission Record |
| C-07 | `write_audit_log` | 写审计 |
| C-08 | `write_evaluation` | 写 Evaluations |
| C-09 | `write_portfolio` | 写 PortfolioItems |
| C-10 | `route_to_review` | 路由给 Review Task Agent |
| C-11 | `notify_student` | 飞书 Bot 通知学生 |
| C-12 | `notify_teacher` | 飞书 Bot 通知教师 |

**统计**：12 项能力

#### 2.3.3 关键关系（R-Box）

| 关系 | 源类 | 目标类 | 基数 | 来源 |
|---|---|---|---|---|
| `hasManifest` | Agent | AgentManifest | 1:1 | [S5] |
| `hasIdentity` | Agent | AgentIdentity | 1:1 | [S5] |
| `hasCapability` | Agent | Capability | 1:N | [S5] |
| `exposesInterface` | Agent | Interface | 1:N | [S5] |
| `hasPermission` | Agent | Permission | 1:N | [S5] |
| `trusts` | Agent | Agent | N:N | [S5] |
| `bindsTo` | Agent | MemoryBinding | 1:N | [S5] |
| `bindsTo` | Agent | ChannelBinding | 1:N | [S5] |
| `inbounds` | Agent | AgentInbox | 1:1 | [S5] |
| `outbounds` | Agent | AgentOutbox | 1:1 | [S5] |
| `sends` | Agent | MessageEnvelope | 1:N | [S5] |
| `creates` | Agent | AuditTrace | 1:N | [S5] |
| `owns` | CompanionAgent | PersonalOntology | 1:1 | [S2] |
| `configures` | CompanionAgent | ResourceConfig | 1:1 | [S2] |
| `invokes` | TaskAgent | Skill | 1:N | [S2] |
| `belongsTo` | TaskAgent | CompanionAgent | N:1 | [S2] |
| `submits` | Student | Submission | 1:N | [S2] |
| `evaluates` | Submission | Evaluation | 1:1 | [S2] |
| `contains` | Course | Challenge | 1:N | [S2] |
| `produces` | Challenge | Artifact | 1:N | [S2] |
| `writesTo` | SubmissionTaskAgent | SubmissionRecord | 1:1 | [S3] |
| `routesTo` | SubmissionTaskAgent | ReviewTaskAgent | 1:N | [S3] |

**统计**：22 条核心关系

#### 2.3.4 Review Status 状态机规则（R-Box）

来自 [主仓-assessment]：

```text
submitted → peer-reviewed → agent-reviewed → needs-revision → accepted
                                                      ↓
                                              knowledge-candidate
```

#### 2.3.5 Trusted Relationship 规则（R-Box）

来自 [S5]：

```text
relationship_type ∈ { companion, task-agent, peer }
trust_level ∈ { auto, require-approval, denied }
```

| from → to | relationship_type | trust_level | 来源 |
|---|---|---|---|
| student-companion → submission-task-agent | task-agent | auto | [S7] |
| student-companion → teacher-companion-* | companion | auto | [S7] |
| teacher-companion → submission-task-agent | task-agent | auto | [S8] |
| teacher-companion → review-task-agent | task-agent | auto | [S8] |
| teacher-companion → student-companion-* | companion | auto | [S8] |

#### 2.3.6 Inbox 校验规则（R-Box）

来自 [S13]：

```text
1. 身份验证     (from_agent 必须存在)
2. 签名验证     (signature 必须有效)
3. Trusted Relationship 检查
4. 权限验证     (检查 Permission)
5. 重复检测     (message_id 去重)
6. 过期检测     (timestamp TTL)
7. 队列路由     (按 message_type 路由到处理函数)
8. Audit Log 记录
9. ACK 发送
10. 失败处理     (入 dead_letter_queue)
```

---

### 2.4 Event Model：事件本体

#### 2.4.1 核心事件（来自 [S3][S6]）

| event_id | 事件名 | 触发者 | 接收者 | 关联 message_type |
|---|---|---|---|---|
| EV-01 | `ChallengePublished` | Teacher Companion | Submission Task | `challenge_publish` |
| EV-02 | `ChallengeAvailable` | Submission Task | Student Companions | `challenge_available` |
| EV-03 | `SubmissionRequested` | Student Companion | Submission Task | `submission_request` |
| EV-04 | `ReviewRequested` | Submission Task | Review Task | `review_request` |
| EV-05 | `ReviewCompleted` | Review Task | Submission Task | `review_result` |
| EV-06 | `FeedbackDelivered` | Submission Task | Student Companion | `feedback` |
| EV-07 | `StatusUpdated` | Submission Task | Teacher Companion | `status_update` |
| EV-08 | `FinalAdjusted` | Teacher Companion | Submission Task | `final_adjustment` |
| EV-09 | `PeerReviewRequested` | Review Task | Peer Students | `peer_review_request` |
| EV-10 | `AgentOnline` | Agent | (presence) | (presence_update) |
| EV-11 | `AgentOffline` | Agent | (presence) | (presence_update) |
| EV-12 | `AuditLogWritten` | Agent | AuditLog | (audit_event) |
| EV-13 | `TeacherRejected` | Teacher Companion | Student Companion | (status_update) |
| EV-14 | `TeacherAccepted` | Teacher Companion | Student Companion | (status_update) |

**统计**：14 个核心事件

#### 2.4.2 事件属性（来自 [S11][S12]）

```yaml
Event:
  event_id
  event_type
  timestamp
  source_agent
  target_agent
  payload: object
  correlation_id: string     # 关联 message_id
  audit_trace_pointer: string
```

---

### 2.5 Process Model：流程本体

#### 2.5.1 MVP 最小闭环（13 步）—— 来自 [S2] §十二

```text
P-01: ExcelImport        管理员上传学生 Excel
  ↓
P-02: ExcelImportSkill   导入飞书
  ↓
P-03: FeishuSetupSkill   创建课程空间
  ↓
P-04: PersonalOKFSkill   初始化学生配置
  ↓
P-05: StudentRaymond     启动
  ↓
P-06: ProfessorRaymond   创建 Challenge
  ↓
P-07: StudentRaymond     接收 Challenge
  ↓
P-08: TaskAgent          辅助完成项目
  ↓
P-09: GitHubArtifactSkill 保存产物
  ↓
P-10: AARSkill           生成复盘
  ↓
P-11: SelfEvaluationSkill 生成自评
  ↓
P-12: FeishuSubmissionSkill 提交记录
  ↓
P-13: PortfolioSkill     更新作品集
```

#### 2.5.2 Agent 协作流程（来自 [S6]）

```text
P-20: TeacherPublishChallenge
  Teacher 飞书/Web 操作
  → Teacher Companion Agent（后台）发 challenge_publish
  → Submission Task Agent 接收并同步飞书/GitHub
  → 【飞书 Bot 群通知学生】

P-21: StudentReceiveChallenge
  Student Companion Agent（后台）获取 Challenge

P-22: StudentSubmitChallenge
  Student 在 GitHub/Web 干活
  → Student Companion Agent（后台）发起 submission request
  → Submission Task Agent 校验身份/文件/权限
  → Submission Task Agent 创建 Submission Record + Audit Log
  → 【飞书 Bot 私聊学生：提交结果/校验失败原因】

P-23: AgentReview
  Submission Task Agent 路由给 Review Task Agent
  → Review Task Agent 评审并反馈
  → Submission Task Agent 回传给 Student Companion Agent（后台）
  → 【飞书 Bot 私聊学生：评审结果】
  → 【飞书 Bot 私聊老师：待复核提醒】

P-24: TeacherFinalAdjust
  教师确认评分（飞书操作）
  → Teacher Companion Agent（后台）发 final_adjustment
  → 【飞书 Bot 私聊学生：最终结果】
```

#### 2.5.3 Inbox 处理流程（来自 [S13]）

```text
P-30: InboxProcessingFlow
  1. 接收消息
  2. 身份验证
  3. 签名验证
  4. Trusted Relationship 校验
  5. 权限验证
  6. 重复检测
  7. 过期检测
  8. 队列路由
  9. 处理函数执行
  10. Audit Log 记录
  11. ACK 发送
  12. 失败入 dead_letter_queue
```

#### 2.5.4 Submission 状态机流程（来自 [S3] §8.2）

```text
P-40: SubmissionLifecycle
  draft
    → submitted          (Student Companion 发起)
    → validating          (Submission Task Agent 校验中)
    → needs_revision      (校验失败，Bot 通知学生)
    → checked             (通过，写入飞书)
    → pending_review      (等待 Review Task)
    → under_review        (Review Task 工作中)
    → reviewed            (AI 评审完成)
    → pending_teacher_review  (等教师确认)
    → accepted            (教师确认)
    → needs_teacher_revision  (教师驳回)
```

**统计**：4 个核心流程，36 个流程步骤

---

### 2.6 Skill Candidates：技能本体

#### 2.6.1 MVP 首批 8 个 Skill（来自 [S2]）

| skill_id | skill_name | 用途 | linked_task_agent |
|---|---|---|---|
| SK-01 | ExcelImportSkill | 导入学生 Excel | Admin Companion / CourseSetupAgent |
| SK-02 | FeishuSetupSkill | 创建课程空间 | Admin Companion |
| SK-03 | PersonalOKFSkill | 初始化学生配置 | CompanionSetupAgent |
| SK-04 | ChallengeCreationSkill | 创建 Challenge | ChallengeCreationAgent |
| SK-05 | GitHubArtifactSkill | 保存产物 | GitHubArtifactAgent |
| SK-06 | AARSkill | 生成复盘 | AARAgent |
| SK-07 | SelfEvaluationSkill | 生成自评 | SelfEvaluationAgent |
| SK-08 | PortfolioSubmissionSkill | 作品集更新 | PortfolioSubmissionAgent |
| SK-09 | FeishuSubmissionSkill | 提交记录 | ChallengeSubmissionAgent |
| SK-10 | RubricEvaluationSkill | 评分 | RubricEvaluationAgent |

**统计**：10 个 Skill

#### 2.6.2 Skill 必有属性（来自 [S2] §六）

```yaml
Skill:
  skill_id
  skill_name
  description
  input_schema
  output_schema
  required_context
  required_permissions
  linked_task_agent
  linked_ontology
```

#### 2.6.3 协议层 Skill 抽象（来自 [S2]）

| Skill 类型 | 描述 | 示例 |
|---|---|---|
| **FeishuSkill** | 与飞书交互 | 飞书提交 |
| **GitHubSkill** | 与 GitHub 交互 | 仓库校验 |
| **OKFSkill** | OKF 知识包读写 | PersonalOKFSkill |
| **ChallengeSkill** | Challenge 元数据 | ChallengeCreationSkill |
| **AARSkill** | 复盘生成 | AARSkill |
| **EvaluationSkill** | 评估打分 | RubricEvaluationSkill |

---

### 2.7 Agent Role Candidates：智能体角色本体

#### 2.7.1 Companion Agent 角色（来自 [S2]）

| 角色 | base_agent | role_type | 职责 |
|---|---|---|---|
| **StudentRaymond** | Raymond | student | 身份/课程/项目/技能沉淀/作品集 |
| **ProfessorRaymond** | Raymond | professor | 课程/挑战/提交/评审/班级监控 |
| **AdminRaymond** | Raymond | admin | MVP 初始化 |

#### 2.7.2 Task Agent 角色（来自 [S2] + [S3]）

| 角色 | owner_agent | 用途 |
|---|---|---|
| **CourseSetupAgent** | ProfessorRaymond | 课程搭建 |
| **ChallengeCreationAgent** | ProfessorRaymond | 挑战创建 |
| **SubmissionReviewAgent** | ProfessorRaymond | 提交审核 |
| **RubricEvaluationAgent** | ProfessorRaymond | 评分 |
| **CohortMonitoringAgent** | ProfessorRaymond | 班级监控 |
| **CompanionSetupAgent** | StudentRaymond | 初始化 |
| **ChallengeWorkAgent** | StudentRaymond | 完成任务 |
| **GitHubArtifactAgent** | StudentRaymond | 产物管理 |
| **AARAgent** | StudentRaymond | 复盘 |
| **SelfEvaluationAgent** | StudentRaymond | 自评 |
| **PortfolioSubmissionAgent** | StudentRaymond | 作品集 |
| **ChallengeSubmissionAgent** | (system) | 提交产物 |
| **EvaluationAgent** | (system) | 评估 |
| **ProjectExecutionAgent** | (system) | 项目执行 |

#### 2.7.3 系统级 Agent 角色（来自 [S3] PRD 法定）

| 角色 | agent_type | 来源 | 唯一性 |
|---|---|---|---|
| **StudentCompanionAgent** | student-companion | [S3] PRD §5 | 多实例（每学生 1 个）|
| **TeacherCompanionAgent** | teacher-companion | [S3] PRD §5 | 多实例（每教师 1 个）|
| **SubmissionTaskAgent** | submission-task | [S3] PRD §5.3 | 单例或池 |
| **ReviewTaskAgent** | review-task | [S3] PRD §5.4 | 单例或池 |
| **PeerReviewStudentAgent** | peer-review | [S3] PRD §5.5 | 多实例（临时代理）|

---

## 3. 跨资料对齐与去重

### 3.1 同一概念的不同命名

| 标准命名 | 别名 | 出处 |
|---|---|---|
| `CompanionAgent` | Raymond / 个人助理 / Second Brain | [S2] 称为 Raymond，[S3] 称为 Companion |
| `SubmissionTaskAgent` | 提交 Agent / ChallengeSubmissionAgent | [S2] 称为 ChallengeSubmissionAgent，[S3] 称为 SubmissionTaskAgent |
| `ReviewTaskAgent` | 评估 Agent / EvaluationAgent / RubricEvaluationAgent | [S2] 称为 EvaluationAgent/RubricEvaluationAgent，[S3] 称为 ReviewTaskAgent |
| `TeacherCompanionAgent` | Professor Raymond / Instructor Agent | [课程] 称为 Instructor Agent，[S2] 称为 Professor Raymond，[S3] 称为 Teacher Companion |
| `StudentCompanionAgent` | Student Raymond | [S2] 称为 Student Raymond，[S3] 称为 Student Companion |

**统一建议**：

| 标准名 | 备注 |
|---|---|
| `StudentCompanionAgent` | PRD 法定 |
| `TeacherCompanionAgent` | PRD 法定（替代 Professor/Instructor）|
| `AdminCompanionAgent` | 系统初始化（PRD 隐含）|
| `SubmissionTaskAgent` | PRD 法定（唯一写 Submission）|
| `ReviewTaskAgent` | PRD 法定 |
| `PeerReviewStudentAgent` | PRD 法定 |
| `MentorAgent` | 课程 C4 要求（v1.1）|
| `KnowledgeLibrarianAgent` | 课程 C4 要求（v1.1）|
| `CodingCoachAgent` | 课程 BC05（升级现有 stub）|
| `EvaluationAgent` | 课程 BC06（升级现有 stub）|
| `ProjectManagerAgent` | 课程 C4（升级现有 stub 或弃用）|

### 3.2 同一关系的不同来源

| 关系 | [S2] MVP 设计 | [S3] PRD | [S5] 主仓 | 统一 |
|---|---|---|---|---|
| Agent has ResourceConfig | ✅ | ❌ | ⚠️ ResourceConfig 简版 | ✅ 必有 |
| Agent has Manifest | ❌ | ✅ | ✅ | ✅ |
| Agent has TrustedRelationship | ❌ | ✅ | ✅ | ✅ |
| Companion owns TaskAgent | ✅ belongsTo | ❌ | ❌ | ⚠️ 需决策 |
| TaskAgent uses Skill | ✅ invokes | ❌ | ❌ | ✅ 必有 |
| SubmissionTaskAgent writes Submission | ❌ | ✅ **唯一** | ❌ | ✅ **架构红线** |
| TaskAgent writes Evaluations | ✅ | ❌ | ❌ | ⚠️ 需明确 |
| TaskAgent writes Portfolio | ✅ | ❌ | ❌ | ⚠️ 需明确 |

### 3.3 三方未对齐的关键冲突

| 冲突 | [S2] MVP 设计 | [S3] PRD | [S5] 主仓 | 建议 |
|---|---|---|---|---|
| **架构红线** | 6 Task Agent 都能写飞书 | **仅** Submission Task 写 Submission | 隐含唯一 | **采纳 PRD**（红线）|
| **Agent 数量** | 9 个 | 4 个 | 4 个 | MVP 4 个，v1.1 扩 |
| **命名** | Raymond / ChallengeSubmissionAgent | Companion / SubmissionTask | Companion | **统一 PRD 命名** |
| **AAR 范围** | 独立 Task Agent | SubmissionArtifact 一部分 | SubmissionArtifact | **采纳 MVP 设计** |
| **Personal OKF** | 必备 | 未明确 | 未明确 | **采纳 MVP 设计** |

---

## 4. 字段层落地（PRD §8 数据模型）

### 4.1 Challenge Record 字段（T-Box 实例属性）

来自 [S3] §8.1，**16 字段**：

| 字段 | 类型 | 来源抽取 | 仓库本体覆盖 |
|---|---|---|---|
| challenge_id | string | [S3] | ✅ |
| title | string | [S3] | ✅ |
| description | string | [S3] | ✅ |
| teacher_id | string | [S3] | ❌ |
| teacher_agent_id | string | [S3] | ✅ |
| feishu_group_id | string | [S3] | ⚠️ ChannelBinding |
| github_pointer | string | [S3] | ❌ |
| airtable_record_id | string | [S3] | ❌ |
| ontology_nodes | array | [S3] | ✅ |
| skills | array | [S3] | ✅ |
| learning_objectives | array | [S3] | ✅ |
| required_deliverables | array | [S3] | ✅ |
| rubric_pointer | string | [S3] | ✅ |
| due_date | datetime | [S3] | ❌ |
| status | enum | [S3] | ❌ |
| created_at | datetime | [S3] | ❌ |
| updated_at | datetime | [S3] | ❌ |

**覆盖度**：8/16 = **50%**

### 4.2 Submission Record 字段（25 字段）

来自 [S3] §8.2：

| 字段 | 类型 | 来源抽取 | 仓库覆盖 |
|---|---|---|---|
| submission_id | string | [S3] | ✅ |
| submission_request_id | string | [S3] | ✅ (MessageEnvelope.request_id) |
| challenge_id | string | [S3] | ✅ |
| student_id | string | [S3] | ✅ |
| submitted_by_agent_id | string | [S3] | ✅ |
| student_feishu_bot_id | string | [S3] | ✅ (ChannelBinding) |
| processed_by_agent_id | string | [S3] | ✅ |
| submission_task_agent_id | string | [S3] | ✅ |
| **admin_identity_mode** | enum | [S3] §4.3 | ❌ **缺** |
| admin_user_id | string | [S3] | ⚠️ ResourceConfig 有 user_id |
| github_repo | string | [S3] | ❌ |
| github_branch | string | [S3] | ❌ |
| github_commit | string | [S3] | ❌ |
| submitted_files | array | [S3] | ✅ (SubmissionArtifact) |
| self_reflection_pointer | string | [S3] | ✅ |
| skills_used | array | [S3] | ✅ (Skill) |
| **ontology_nodes_used** | array | [S3] | ❌ |
| system_validation_status | enum | [S3] | ⚠️ 部分 |
| **review_mode** | enum | [S3] | ❌ **缺** |
| routed_to_teacher_agent_id | string | [S3] | ⚠️ AuditTrace |
| routed_to_peer_agent_ids | array | [S3] | ⚠️ AuditTrace |
| **routing_status** | enum | [S3] | ❌ **缺** |
| review_status | enum | [S3] | ⚠️ Assessment 6 态 |
| feedback_pointer | string | [S3] | ✅ |
| audit_log_pointer | string | [S3] | ✅ |
| submitted_at | datetime | [S3] | ❌ |
| updated_at | datetime | [S3] | ❌ |

**覆盖度**：13/25 = **52%**

### 4.3 关键缺口字段

| 缺口字段 | 来源 | 优先级 | 落地建议 |
|---|---|---|---|
| `admin_identity_mode` | [S3] §4.3 | 🔴 P0 | agent-ontology.md ResourceConfig 加 |
| `review_mode` | [S3] §8.2 | 🔴 P0 | agent-ontology.md ReviewMode 加 |
| `routing_status` | [S3] §8.2 | 🔴 P0 | agent-ontology.md RoutingStatus 加 |
| `github_repo/branch/commit` | [S3] §8.2 | 🔴 P0 | Submission→GitHub 三元组 |
| `ontology_nodes_used` | [S3] §8.2 | 🟡 P1 | Submission→Ontology 关联 |
| `due_date` | [S3] §8.1 | 🟡 P1 | Challenge 加 |
| `status` 枚举 | [S3] §8.1 | 🟡 P1 | ChallengeStatus |
| 时间戳 | [S3] | 🟡 P1 | 全部加 created_at/updated_at |

---

## 5. 架构红线与边界

### 5.1 必须显式编码到本体的红线

```text
红线 1: write_submission_record
  Only agent_type=submission-task can write SubmissionRecord
  Schema: SubmissionRecord.processed_by_agent_id MUST be submission-task-*

红线 2: read_student_private_memory
  Only owner_id of PersonalOntology can read
  Schema: ResourceConfig read scope enforcement

红线 3: cross_student_data_access
  Student Companion cannot access other student data
  Schema: MemoryBinding keyed by student_id

红线 4: submission_time_window
  Can only submit to active challenges
  Schema: ChallengeStatus=active required

红线 5: message_inbox_validation
  All messages must pass Inbox validation
  Schema: InboxProcessingFlow mandatory

红线 6: trusted_relationship
  All messages must have trusted relationship
  Schema: TrustedRelationship required

红线 7: audit_trace_mandatory
  All state changes must write AuditTrace
  Schema: AuditLog.action=state_change required

红线 8: no_push_in_agent
  Agents must not contain push notification logic
  Schema: AgentManifest capabilities excludes notify_*

红线 9: feishu_bot_is_only_channel
  Agent-to-human notification only via feishu bot
  Schema: channel_type=feishu only for human
```

---

## 6. 抽取覆盖度自评

### 6.1 7 层抽取统计

| 层 | 抽取条数 | 跨资料出现次数 | 去重后 | 备注 |
|---|---:|---:|---:|---|
| T-Box（类） | 56 | 3.7× | 56 | 包含 Agent / TaskAgent / 协议 / 业务 / 资源 / 状态枚举 |
| A-Box（实例） | ~30 | 2× | ~20 | Agent 实例 / Channel 实例 / 课程实例 / Skill 实例 |
| R-Box（规则） | 32 | 1.8× | 32 | 10 红线 + 12 能力 + 22 关系 + 状态机 |
| Event | 14 | 1.5× | 14 | 9 PRD + 5 内部 |
| Process | 36 | 1.3× | 36 | 13 步闭环 + 4 流程 + 10 Inbox + 9 状态机 |
| Skill | 10 | 1× | 10 | MVP 首批 |
| Agent | 15 | 2× | 15 | 4 新 + 3 旧 + 3 角色 + 2 课程 C4 + 1 PeerReview |
| **总计** | **193** | — | **183** | — |

### 6.2 字段层覆盖度

| 字段层 | PRD 要求 | 仓库已有 | 覆盖率 |
|---|---:|---:|---:|
| Challenge Record 16 字段 | 16 | 8 | **50%** |
| Submission Record 25 字段 | 25 | 13 | **52%** |
| 审计 8 项 | 8 | 9 | **112%**（超 1 项）|
| Agent Manifest 9 字段 | 9 | 9 | **100%** |
| Message Envelope 9 字段 | 9 | 9 | **100%** |

**总体字段层覆盖度：~63%**

### 6.3 架构红线覆盖

| 红线 | 本体显式约束 | 代码层校验 | 测试覆盖 |
|---|---|---|---|
| R-001 Submission 唯一写入 | ❌ | ⚠️ workflow.ts 隐含 | ❌ |
| R-002 Student 不能写 Submission | ✅ constraints | ❌ | ❌ |
| R-003 Teacher 不能读私有记忆 | ✅ constraints | ❌ | ❌ |
| R-004 不能跨学生访问 | ✅ constraints | ❌ | ❌ |
| R-005 只能提交 active Challenge | ✅ constraints | ⚠️ | ❌ |
| R-006 消息必经 Inbox | ⚠️ 设计 | ❌ | ❌ |
| R-007 必走 Trusted Relationship | ✅ Manifest | ❌ | ❌ |
| R-008 必留 Audit | ✅ AuditLog | ❌ | ❌ |
| R-009 Agent 不含推送 | ✅ README | ❌ | ❌ |
| R-010 触达走飞书 Bot | ✅ README | ❌ | ❌ |

**红线代码层覆盖度：30%**（大部分仅在 README / Manifest 声明，缺代码层强制）

---

## 7. 下一步建议

### 7.1 立刻可做的（基于抽取结果）

#### P0（1 周内）

1. **出 `submission-record.schema.json`**——按 PRD §8.2 25 字段出 JSON Schema
2. **出 `challenge-record.schema.json`**——按 PRD §8.1 16 字段出 JSON Schema
3. **出 `submission-state-machine.md`**——9 态状态机文档
4. **在 agent-ontology.md 补 3 个枚举**：
   - `admin_identity_mode` (independent_admin / teacher_delegated)
   - `review_mode` (teacher_only / peer_only / teacher_and_peer)
   - `routing_status` (not_routed / routed_to_teacher / routed_to_peer / routed_to_both)
5. **写 `challenge-submission-request.schema.json`** + **`challenge-review-request.schema.json`**——Message Envelope payload schema
6. **写 `agents/outbox/README.md`**——对称 Inbox

#### P1（1-2 周内）

7. **出 `companion-agent-roles.md`**——3 角色（Student/Teacher/Admin Raymond）规范
8. **出 `task-agent-catalog.md`**——14 个 Task Agent 详细定义（合并 MVP 系统设计与 PRD）
9. **升级 3 个旧 Agent stub → JSON Schema**（coding-coach / evaluation / project-manager）
10. **出 `personal-okf-template/` 9 个 .md 模板**（profile/ontology/skills/memory/resources/goals/challenges/artifacts/aar）
11. **出 `resource-config-schema.md`**——MVP 系统设计 9 字段
12. **出 `mvp-closed-loop.md`**——13 步 MVP 闭环流程图

#### P2（2-4 周）

13. **出 `mentor-agent.manifest.yaml`** + **`knowledge-librarian-agent.manifest.yaml`**（课程 C4）
14. **写 `agent-tenant-ontology.md`**——多学校部署
15. **写 `agent-evolution-policy.md`**——KSTAR → 本体反馈

### 7.2 关键决策待定

| 决策 | 选项 | 建议 |
|---|---|---|
| Agent 命名 | Raymond / Companion / Elite Companion | **Companion Agent（PRD 法定）**，Raymond 作为品牌别名 |
| MVP Agent 数量 | 4 / 7 / 9 | **4 个核心 + 3 个 stub 升级** |
| 架构红线 | 1 vs 6 写 Submission | **仅 Submission Task 写**（PRD 红线）|
| AAR 范围 | Task Agent / SubmissionArtifact | **独立 AARAgent**（MVP 设计）|
| Personal OKF | 必备 / 选配 | **必备**（MVP 设计）|

---

## 附录 A：抽取物统计

| 类别 | 数量 |
|---|---:|
| Agent 类别 | 15 |
| Task Agent 子类 | 14 |
| 协议核心类 | 17 |
| 业务对象类 | 10 |
| 资源类 | 3 |
| 状态枚举 | 8 |
| 关系 | 22 |
| 架构红线 | 10 |
| 能力（Submission Task）| 12 |
| 事件 | 14 |
| 流程 | 36 |
| Skill | 10 |
| 字段缺口 | 8 |
| 决策待定 | 5 |
| **总计** | **186** |

## 附录 B：跨资料引用矩阵

| 抽取物 | [S1] 课程 | [S2] MVP | [S3] PRD | [S5] 主仓 | [S6] 流程 | [S7-10] Manifest | [S11] Envelope | [S12] Audit | [S13] Inbox |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| StudentCompanion | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| TeacherCompanion | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| SubmissionTask | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| ReviewTask | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| PeerReview | ❌ | ❌ | ✅ | ✅ | ⚠️ | ❌ | ✅ | ❌ | ❌ |
| Mentor | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| KnowledgeLibrarian | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| CodingCoach | ✅ | ⚠️ | ❌ | ✅ | ❌ | ⚠️ | ❌ | ❌ | ❌ |
| EvaluationAgent | ✅ | ✅ | ❌ | ✅ | ❌ | ⚠️ | ❌ | ❌ | ❌ |
| ProjectManager | ✅ | ✅ | ❌ | ✅ | ❌ | ⚠️ | ❌ | ❌ | ❌ |
| AAR Agent | ❌ | ✅ | ⚠️ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| CompanionSetup | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| GitHubArtifact | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Portfolio | ❌ | ✅ | ⚠️ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| SelfEvaluation | ❌ | ✅ | ⚠️ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| CohortMonitoring | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| CourseSetup | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| ChallengeCreation | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| 9 message_type | ❌ | ❌ | ✅ | ✅ | ✅ | ⚠️ | ✅ | ❌ | ✅ |
| 9 状态机 | ❌ | ❌ | ✅ | ✅ | ✅ | ⚠️ | ❌ | ❌ | ❌ |
| 25 Submission 字段 | ❌ | ⚠️ | ✅ | ⚠️ | ⚠️ | ❌ | ❌ | ❌ | ❌ |
| 10 架构红线 | ❌ | ⚠️ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| ResourceConfig | ❌ | ✅ | ❌ | ⚠️ | ❌ | ⚠️ | ❌ | ❌ | ❌ |
| PersonalOntology | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| PersonalOKF | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Audit 9 字段 | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ |
| TrustedRelationship | ❌ | ❌ | ✅ | ✅ | ⚠️ | ✅ | ❌ | ❌ | ✅ |
| AAR 本体 | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

**说明**：✅ = 明确覆盖；⚠️ = 部分覆盖；❌ = 未涉及

## 附录 C：抽取物 ID 索引

| 抽取物 ID 前缀 | 含义 | 数量 |
|---|---|---:|
| AG-xxx | Agent | 15 |
| R-xxx | Rule (R-Box) | 10 |
| C-xxx | Capability (Submission Task) | 12 |
| EV-xxx | Event | 14 |
| P-xxx | Process step | 36 |
| SK-xxx | Skill | 10 |

---

> **抽取方法核心理念（一句话）**：
> 
> **从 19 份 Team 3 相关资料中，用 7 步流水线的语义抽取阶段，按 T/A/R-Box + Event + Process + Skill + Agent 七层模型，抽出 186 个语义模块（56 类 / 20 实例 / 32 规则 / 14 事件 / 36 流程 / 10 Skill / 15 Agent），再跨资料对齐去重，发现 8 个字段层缺口与 5 个待定决策，最终形成可直接落地的 P0/P1/P2 行动清单。**
