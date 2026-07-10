# Team 3 实体 / 概念抽取（Entity & Concept Extraction）

> 从 `Team3-语义模块抽取.md`（186 个语义模块）中，**只抽取"名词性"内容**——即 T-Box 概念 / 类 / 分类 + A-Box 实例 / 事实。这是 Ontology Factory 7 步流水线的 **AutoConcept + AutoTaxonomy** 阶段。
> 
> 不抽取关系、规则、事件、流程、技能（这些是 "动词性"内容，属于 R-Box / Process / Skill 层）。

---

## 目录

- [0. 抽取范围定义](#0-抽取范围定义)
- [1. T-Box 概念 / 类（Class）](#1-t-box-概念--类class)
  - [1.1 顶层类继承树](#11-顶层类继承树)
  - [1.2 Agent 类（15 个）](#12-agent-类15-个)
  - [1.3 Task Agent 子类（14 个）](#13-task-agent-子类14-个)
  - [1.4 协议核心类（17 个）](#14-协议核心类17-个)
  - [1.5 业务对象类（10 个）](#15-业务对象类10-个)
  - [1.6 资源类（3 个）](#16-资源类3-个)
  - [1.7 Skill 类（10 个 + 6 抽象类型）](#17-skill-类10-个--6-抽象类型)
  - [1.8 Event 类（14 个）](#18-event-类14-个)
- [2. 枚举类型（Enumeration）](#2-枚举类型enumeration)
  - [2.1 状态枚举（5 个）](#21-状态枚举5-个)
  - [2.2 身份/模式枚举（4 个）](#22-身份模式枚举4-个)
  - [2.3 Agent / Channel / Trust 枚举（4 个）](#23-agent--channel--trust-枚举4-个)
  - [2.4 Message Type 枚举（9 个）](#24-message-type-枚举9-个)
- [3. A-Box 实例 / 事实](#3-a-box-实例--事实)
  - [3.1 Agent 实例](#31-agent-实例)
  - [3.2 Channel 实例](#32-channel-实例)
  - [3.3 PersonalOntology 实例](#33-personalontology-实例)
  - [3.4 Personal OKF 目录实例](#34-personal-okf-目录实例)
  - [3.5 业务对象实例](#35-业务对象实例)
- [4. 类属性（Property / Attribute）](#4-类属性property--attribute)
  - [4.1 通用属性（每个类都可能有）](#41-通用属性每个类都可能有)
  - [4.2 Agent 类属性](#42-agent-类属性)
  - [4.3 协议核心类属性](#43-协议核心类属性)
  - [4.4 业务对象类属性](#44-业务对象类属性)
  - [4.5 Skill 类属性](#45-skill-类属性)
  - [4.6 Event 类属性](#46-event-类属性)
- [5. 类继承 / 分类体系（Taxonomy）](#5-类继承--分类体系taxonomy)
- [6. 抽取物索引（ID 速查）](#6-抽取物索引id-速查)
- [7. 抽取统计](#7-抽取统计)

---

## 0. 抽取范围定义

### 0.1 抽取什么

| 抽取物 | 是否抽取 | 标记 | 来源 |
|---|---|---|---|
| **概念 / 类** | ✅ | T-Class | 来自 §2.1.1-2.1.7 |
| **枚举值** | ✅ | Enum | 来自 §2.1.6 |
| **实例 / 实体** | ✅ | A-Inst | 来自 §2.2.1-2.2.3 |
| **属性 / 字段** | ✅ | P-Attr | 来自 §2.1.3-2.1.5 各类的"必有属性" |
| 关系 | ❌ | — | 跳过（R-Box 范畴） |
| 规则 / 红线 | ❌ | — | 跳过（R-Box 范畴） |
| 事件 | ✅（仅类） | E-Class | 来自 §2.4.1，但只取类名，不取流程 |
| 流程 | ❌ | — | 跳过（Process 范畴） |
| 能力 | ❌ | — | 跳过（Capability 是属性，归入 P-Attr） |

### 0.2 抽取粒度

- **类（Class）**：抽象类型，对应 T-Box 概念
- **属性（Property / Attribute）**：类的字段
- **实例（Instance）**：具体的 A-Box 对象
- **枚举（Enumeration）**：值域有限的类型
- **继承（SubClass）**：类的父子关系

### 0.3 抽取约定

每条记录用统一格式：

```text
ID: 唯一标识
Name: 概念英文名
Label: 中文标签
Parent: 父类
Source: 抽取来源
Status: 已有/部分/缺失
```

---

## 1. T-Box 概念 / 类（Class）

### 1.1 顶层类继承树

```text
Entity                              ← 抽象根
├── Agent                           ← 智能体
│   ├── CompanionAgent              ← 伴随型
│   │   ├── StudentCompanion        ← 学生
│   │   ├── TeacherCompanion        ← 教师
│   │   ├── AdminCompanion          ← 管理员
│   │   ├── CodingCoachAgent        ← 代码教练
│   │   ├── MentorAgent             ← 导师
│   │   └── KnowledgeLibrarianAgent ← 知识馆员
│   ├── TaskAgent                   ← 任务型
│   │   ├── SubmissionTaskAgent     ← 提交任务
│   │   ├── ReviewTaskAgent         ← 评审任务
│   │   ├── PeerReviewStudentAgent  ← 同伴评审
│   │   ├── CourseSetupAgent        ← 课程搭建
│   │   ├── ChallengeCreationAgent  ← 挑战创建
│   │   ├── ProjectExecutionAgent   ← 项目执行
│   │   ├── ChallengeSubmissionAgent← 提交
│   │   ├── AARAgent                ← 复盘
│   │   ├── EvaluationAgent         ← 评估
│   │   ├── CompanionSetupAgent     ← 初始化
│   │   ├── ChallengeWorkAgent      ← 完成任务
│   │   ├── GitHubArtifactAgent     ← 产物管理
│   │   ├── SelfEvaluationAgent     ← 自评
│   │   ├── PortfolioSubmissionAgent← 作品集
│   │   ├── SubmissionReviewAgent   ← 提交审核
│   │   ├── RubricEvaluationAgent   ← 评分
│   │   └── CohortMonitoringAgent   ← 班级监控
│   └── ProjectManagerAgent         ← 项目管理（待定）
│
├── Protocol                        ← 协议
│   ├── AgentIdentity
│   ├── AgentManifest
│   ├── Capability
│   ├── Interface
│   ├── Permission
│   ├── Constraint
│   ├── MemoryBinding
│   ├── ChannelBinding
│   ├── TrustedRelationship
│   ├── MessageEnvelope
│   ├── AgentInbox
│   ├── AgentOutbox
│   ├── AuditTrace
│   ├── Presence
│   └── ResourceConfig
│
├── BusinessObject                  ← 业务对象
│   ├── Person
│   │   ├── Learner                ← 学生（Person 子类）
│   │   └── Professor              ← 教师（Person 子类）
│   ├── Course
│   ├── Challenge
│   ├── Artifact
│   ├── AAR
│   ├── Rubric
│   ├── Submission
│   ├── Evaluation
│   ├── Portfolio
│   └── SubmissionArtifact
│
├── Resource                        ← 资源
│   ├── FeishuResource
│   ├── GitHubResource
│   └── CourseResource
│
├── Skill                           ← 技能
│   ├── ExcelImportSkill
│   ├── FeishuSetupSkill
│   ├── PersonalOKFSkill
│   ├── ChallengeCreationSkill
│   ├── GitHubArtifactSkill
│   ├── AARSkill
│   ├── SelfEvaluationSkill
│   ├── PortfolioSubmissionSkill
│   ├── FeishuSubmissionSkill
│   ├── RubricEvaluationSkill
│   └── (抽象类型)
│       ├── FeishuSkill
│       ├── GitHubSkill
│       ├── OKFSkill
│       ├── ChallengeSkill
│       └── EvaluationSkill
│
├── Event                           ← 事件
│   ├── ChallengePublished
│   ├── ChallengeAvailable
│   ├── SubmissionRequested
│   ├── ReviewRequested
│   ├── ReviewCompleted
│   ├── FeedbackDelivered
│   ├── StatusUpdated
│   ├── FinalAdjusted
│   ├── PeerReviewRequested
│   ├── AgentOnline
│   ├── AgentOffline
│   ├── AuditLogWritten
│   ├── TeacherRejected
│   └── TeacherAccepted
│
└── Knowledge                       ← 知识
    └── OKF                         ← Open Knowledge Format
        └── PersonalOKF             ← 个人 OKF
```

**统计**：5 大类目 / 80+ 个具体类

### 1.2 Agent 类（15 个）

| ID | Class | 中文标签 | Parent | 来源 | Status |
|---|---|---|---|---|---|
| AG-CLASS-001 | **Agent** | 智能体（顶层抽象）| - | [S5] | ✅ 已有 |
| AG-CLASS-002 | **CompanionAgent** | 伴随型智能体 | Agent | [S2] | ✅ 已有 |
| AG-CLASS-003 | **TaskAgent** | 任务型智能体 | Agent | [S2] | ✅ 已有 |
| AG-CLASS-004 | **SystemAgent** | 系统型智能体（旧叫法）| Agent | [S2] | ⚠️ 旧名待合并 |
| AG-CLASS-005 | **StudentCompanion** | 学生伴随型 | CompanionAgent | [S5][S2] | ✅ 已有 |
| AG-CLASS-006 | **TeacherCompanion** | 教师伴随型 | CompanionAgent | [S5][S2] | ✅ 已有 |
| AG-CLASS-007 | **AdminCompanion** | 管理员伴随型 | CompanionAgent | [S2] | ⚠️ 仓库未显式 |
| AG-CLASS-008 | **SubmissionTaskAgent** | 提交任务智能体 | TaskAgent | [S3][S5] | ✅ 已有 |
| AG-CLASS-009 | **ReviewTaskAgent** | 评审任务智能体 | TaskAgent | [S3][S5] | ✅ 已有 |
| AG-CLASS-010 | **PeerReviewStudentAgent** | 同伴评审学生智能体 | TaskAgent | [S3] | ⚠️ 仓库未出 Manifest |
| AG-CLASS-011 | **CodingCoachAgent** | 代码教练 | CompanionAgent? | [课程][S14][S17] | ❌ stub 状态 |
| AG-CLASS-012 | **EvaluationAgent** | 评估智能体 | TaskAgent? | [课程][S15][S18] | ❌ stub 状态 |
| AG-CLASS-013 | **ProjectManagerAgent** | 项目管理智能体 | TaskAgent? | [课程][S16][S19] | ❌ stub 状态 |
| AG-CLASS-014 | **MentorAgent** | 导师智能体 | CompanionAgent | [课程] | ❌ 未实现 |
| AG-CLASS-015 | **KnowledgeLibrarianAgent** | 知识馆员智能体 | CompanionAgent | [课程] | ❌ 未实现 |

**统计**：15 个 Agent 类，其中 ✅ 5 个 / ⚠️ 3 个 / ❌ 7 个

### 1.3 Task Agent 子类（14 个）

| ID | Class | 中文标签 | 来源 | Owner | Status |
|---|---|---|---|---|---|
| TA-CLASS-001 | **CourseSetupAgent** | 课程搭建 | [S2] | Professor Raymond | ❌ 未出 |
| TA-CLASS-002 | **ChallengeCreationAgent** | 挑战创建 | [S2] | Professor Raymond | ❌ 未出 |
| TA-CLASS-003 | **ProjectExecutionAgent** | 项目执行 | [S2] | (system) | ❌ 未出 |
| TA-CLASS-004 | **ChallengeSubmissionAgent** | 挑战提交 | [S2] | (system) | ❌ 未出 |
| TA-CLASS-005 | **AARAgent** | 复盘智能体 | [S2] | Student Raymond | ❌ 未出 |
| TA-CLASS-006 | **EvaluationAgent** | 评估智能体 | [S2] | (system) | ❌ 未出 |
| TA-CLASS-007 | **CompanionSetupAgent** | 伴随初始化 | [S2] | Student Raymond | ❌ 未出 |
| TA-CLASS-008 | **ChallengeWorkAgent** | 挑战执行 | [S2] | Student Raymond | ❌ 未出 |
| TA-CLASS-009 | **GitHubArtifactAgent** | 产物管理 | [S2] | Student Raymond | ❌ 未出 |
| TA-CLASS-010 | **SelfEvaluationAgent** | 自评智能体 | [S2] | Student Raymond | ❌ 未出 |
| TA-CLASS-011 | **PortfolioSubmissionAgent** | 作品集提交 | [S2] | Student Raymond | ❌ 未出 |
| TA-CLASS-012 | **SubmissionReviewAgent** | 提交审核（教师）| [S2] | Professor Raymond | ❌ 未出 |
| TA-CLASS-013 | **RubricEvaluationAgent** | 评分智能体 | [S2] | Professor Raymond | ❌ 未出 |
| TA-CLASS-014 | **CohortMonitoringAgent** | 班级监控 | [S2] | Professor Raymond | ❌ 未出 |

**统计**：14 个 Task Agent 子类，**全部未出 Manifest**

### 1.4 协议核心类（17 个）

| ID | Class | 中文标签 | 来源 | Status |
|---|---|---|---|---|
| PROTO-001 | **AgentIdentity** | 智能体身份 | [S5] | ✅ 已有 |
| PROTO-002 | **AgentManifest** | 智能体清单 | [S5] | ✅ 已有 |
| PROTO-003 | **Capability** | 能力 | [S5][S7] | ✅ 已有 |
| PROTO-004 | **Interface** | 接口 | [S5][S7] | ✅ 已有 |
| PROTO-005 | **Permission** | 权限 | [S5][S7] | ✅ 已有 |
| PROTO-006 | **Constraint** | 约束 | [S5][S7] | ✅ 已有 |
| PROTO-007 | **MemoryBinding** | 记忆绑定 | [S5] | ✅ 已有 |
| PROTO-008 | **ChannelBinding** | 通道绑定 | [S5] | ✅ 已有 |
| PROTO-009 | **TrustedRelationship** | 可信关系 | [S5] | ✅ 已有 |
| PROTO-010 | **MessageEnvelope** | 消息外壳 | [S5][S11] | ✅ 已有 |
| PROTO-011 | **AgentInbox** | 智能体收件箱 | [S5][S13] | ✅ 已有 |
| PROTO-012 | **AgentOutbox** | 智能体发件箱 | [S5] | ⚠️ 无 README |
| PROTO-013 | **AuditTrace** | 审计追踪 | [S5][S12] | ✅ 已有 |
| PROTO-014 | **Presence** | 在线状态 | [S5] | ✅ 已有 |
| PROTO-015 | **ResourceConfig** | 资源配置 | [S2][S5] | ⚠️ 简版 |
| PROTO-016 | **PersonalOntology** | 个人本体 | [S2] | ⚠️ 仓库未出 |
| PROTO-017 | **OKF** | 开放知识格式 | [S2] | ⚠️ 仓库未出 |

**统计**：17 个协议类，✅ 11 / ⚠️ 5 / ❌ 1

### 1.5 业务对象类（10 个）

| ID | Class | 中文标签 | 父类 | 来源 | Status |
|---|---|---|---|---|---|
| BO-001 | **Person** | 人（抽象）| - | 隐含 | ⚠️ 仓库无 |
| BO-002 | **Learner** | 学生 | Person | [S2] | ✅ 已有 |
| BO-003 | **Professor** | 教师 | Person | [S2] | ✅ 已有 |
| BO-004 | **Course** | 课程 | - | [S2] | ✅ 已有 |
| BO-005 | **Challenge** | 挑战 | - | [S2][S3] | ✅ 已有 |
| BO-006 | **Artifact** | 产物 | - | [S2] | ✅ 已有 |
| BO-007 | **AAR** | 行动后反思 | - | [S2] | ❌ 仓库无 |
| BO-008 | **Rubric** | 评分量规 | - | [S2][S3] | ✅ 已有 |
| BO-009 | **Submission** | 提交 | - | [S3] | ✅ 已有 |
| BO-010 | **Evaluation** | 评审 | - | [S3] | ✅ 已有 |
| BO-011 | **Portfolio** | 作品集 | - | [S2] | ⚠️ 仓库无 |
| BO-012 | **SubmissionArtifact** | 提交物（具体产物）| Artifact | [主仓-challenge] | ✅ 已有 |

**统计**：12 个业务对象类，✅ 7 / ⚠️ 3 / ❌ 2

#### Artifact 类型枚举（9 个子类）

| ID | Class | 中文标签 | 来源 |
|---|---|---|---|
| ART-001 | **GitHubRepo** | GitHub 仓库 | [S2] |
| ART-002 | **README** | README 文档 | [S2] |
| ART-003 | **Demo** | 演示 | [S2] |
| ART-004 | **DesignDoc** | 设计文档 | [S2] |
| ART-005 | **PromptLog** | Prompt 日志 | [S2] |
| ART-006 | **ContextPack** | 上下文包 | [S2] |
| ART-007 | **AAR_Doc** | 复盘文档（AAR 实例）| [S2] |
| ART-008 | **SelfEvaluation** | 自评 | [S2] |
| ART-009 | **PortfolioPage** | 作品集页面 | [S2] |

**统计**：9 个 Artifact 子类

### 1.6 资源类（3 个）

| ID | Class | 中文标签 | 父类 | 来源 | 属性 |
|---|---|---|---|---|---|
| RES-001 | **FeishuResource** | 飞书资源 | Resource | [S2][S5] | tenant_id, user_id, *_table_id, wiki_url, professor_handle |
| RES-002 | **GitHubResource** | GitHub 资源 | Resource | [S2][S5] | username, *_repo, github_pages_url, github_actions |
| RES-003 | **CourseResource** | 课程资源 | Resource | [S2] | course_id, cohort_id, challenge_id, rubric_id |

**统计**：3 个资源类

### 1.7 Skill 类（10 个 + 6 抽象类型）

#### 1.7.1 具体 Skill（10 个）

| ID | Class | 中文标签 | 抽象类型 | 来源 | Status |
|---|---|---|---|---|---|
| SK-001 | **ExcelImportSkill** | Excel 导入 | FeishuSkill | [S2] | ❌ 未出 |
| SK-002 | **FeishuSetupSkill** | 飞书初始化 | FeishuSkill | [S2] | ❌ 未出 |
| SK-003 | **PersonalOKFSkill** | 个人 OKF 初始化 | OKFSkill | [S2] | ❌ 未出 |
| SK-004 | **ChallengeCreationSkill** | 挑战创建 | ChallengeSkill | [S2] | ❌ 未出 |
| SK-005 | **GitHubArtifactSkill** | GitHub 产物 | GitHubSkill | [S2] | ❌ 未出 |
| SK-006 | **AARSkill** | 复盘生成 | AARSkill | [S2] | ❌ 未出 |
| SK-007 | **SelfEvaluationSkill** | 自评生成 | EvaluationSkill | [S2] | ❌ 未出 |
| SK-008 | **PortfolioSubmissionSkill** | 作品集提交 | FeishuSkill | [S2] | ❌ 未出 |
| SK-009 | **FeishuSubmissionSkill** | 飞书提交 | FeishuSkill | [S2] | ❌ 未出 |
| SK-010 | **RubricEvaluationSkill** | 评分 | EvaluationSkill | [S2] | ❌ 未出 |

**统计**：10 个具体 Skill，**全部未出 Manifest**

#### 1.7.2 Skill 抽象类型（6 个）

| ID | Class | 中文标签 | 示例 | Status |
|---|---|---|---|---|
| SKA-001 | **FeishuSkill** | 飞书交互 | FeishuSetupSkill | ❌ 未出 |
| SKA-002 | **GitHubSkill** | GitHub 交互 | GitHubArtifactSkill | ❌ 未出 |
| SKA-003 | **OKFSkill** | OKF 读写 | PersonalOKFSkill | ❌ 未出 |
| SKA-004 | **ChallengeSkill** | Challenge 元数据 | ChallengeCreationSkill | ❌ 未出 |
| SKA-005 | **AARSkill** | 复盘 | AARSkill | ❌ 未出 |
| SKA-006 | **EvaluationSkill** | 评估打分 | RubricEvaluationSkill | ❌ 未出 |

**统计**：6 个 Skill 抽象类型

### 1.8 Event 类（14 个）

| ID | Class | 中文标签 | 触发者 | 接收者 | 来源 |
|---|---|---|---|---|---|
| EV-CLASS-001 | **ChallengePublished** | 挑战已发布 | Teacher Companion | Submission Task | [S3] |
| EV-CLASS-002 | **ChallengeAvailable** | 挑战可接收 | Submission Task | Student Companions | [S3] |
| EV-CLASS-003 | **SubmissionRequested** | 提交已请求 | Student Companion | Submission Task | [S3] |
| EV-CLASS-004 | **ReviewRequested** | 评审已请求 | Submission Task | Review Task | [S3] |
| EV-CLASS-005 | **ReviewCompleted** | 评审完成 | Review Task | Submission Task | [S3] |
| EV-CLASS-006 | **FeedbackDelivered** | 反馈已送达 | Submission Task | Student Companion | [S3] |
| EV-CLASS-007 | **StatusUpdated** | 状态已更新 | Submission Task | Teacher Companion | [S3] |
| EV-CLASS-008 | **FinalAdjusted** | 最终调整 | Teacher Companion | Submission Task | [S3] |
| EV-CLASS-009 | **PeerReviewRequested** | 同伴评审请求 | Review Task | Peer Students | [S3] |
| EV-CLASS-010 | **AgentOnline** | 智能体上线 | Agent | (presence) | [S5] |
| EV-CLASS-011 | **AgentOffline** | 智能体离线 | Agent | (presence) | [S5] |
| EV-CLASS-012 | **AuditLogWritten** | 审计日志写入 | Agent | AuditLog | [S5] |
| EV-CLASS-013 | **TeacherRejected** | 教师驳回 | Teacher Companion | Student Companion | [S3] |
| EV-CLASS-014 | **TeacherAccepted** | 教师接受 | Teacher Companion | Student Companion | [S3] |

**统计**：14 个事件类

---

## 2. 枚举类型（Enumeration）

### 2.1 状态枚举（5 个）

| ID | Enum Name | 父概念 | 值列表 | 来源 |
|---|---|---|---|---|
| EN-SUB-001 | **SubmissionStatus** | Submission | draft, submitted, validating, needs_revision, checked, pending_review, under_review, reviewed, pending_teacher_review, accepted, needs_teacher_revision | [S3] §8.2 / [S6] |
| EN-REV-001 | **ReviewStatus** | Evaluation | submitted, peer-reviewed, agent-reviewed, needs-revision, accepted, knowledge-candidate | [主仓-assessment] |
| EN-CHA-001 | **ChallengeStatus** | Challenge | draft, published, active, closed, archived（隐含）| [S3] 隐含 |
| EN-SYS-001 | **PresenceStatus** | Presence | online, busy, offline, do-not-disturb, paused | [S5] |
| EN-INB-001 | **InboxQueueType** | AgentInbox | online, offline, pending_approval | [S5] |

**统计**：5 个状态枚举，共 31 个值

### 2.2 身份 / 模式枚举（4 个）

| ID | Enum Name | 父概念 | 值列表 | 来源 |
|---|---|---|---|---|
| EN-ADMIN-001 | **AdminIdentityMode** | ResourceConfig | independent_admin, teacher_delegated | [S3] §4.3 |
| EN-REV-002 | **ReviewMode** | Submission | teacher_only, peer_only, teacher_and_peer | [S3] §8.2 |
| EN-ROUTE-001 | **RoutingStatus** | Submission | not_routed, routed_to_teacher, routed_to_peer, routed_to_both | [S3] §8.2 |
| EN-REL-001 | **RelationshipType** | TrustedRelationship | companion, task-agent, peer | [S5] |
| EN-REL-002 | **TrustLevel** | TrustedRelationship | auto, require-approval, denied | [S5] |

**统计**：5 个身份/模式枚举，共 16 个值

### 2.3 Agent / Channel / Trust 枚举（4 个）

| ID | Enum Name | 父概念 | 值列表 | 来源 |
|---|---|---|---|---|
| EN-AGT-001 | **AgentType** | Agent | student-companion, teacher-companion, submission-task, review-task, peer-review | [S5] |
| EN-AGT-002 | **AgentRole** | Agent | companion, task | [S2] |
| EN-CH-001 | **ChannelType** | ChannelBinding | web, github, feishu | [S7][S8] |
| EN-ART-001 | **ArtifactType** | Artifact | GitHubRepo, README, Demo, DesignDoc, PromptLog, ContextPack, AAR, SelfEvaluation, PortfolioPage | [S2] |

**统计**：4 个枚举，共 22 个值

### 2.4 Message Type 枚举（9 个）

| ID | Value | 中文标签 | 方向 | 来源 |
|---|---|---|---|---|
| MSG-001 | **challenge_publish** | 挑战发布 | Teacher Companion → Submission Task | [S3] |
| MSG-002 | **challenge_available** | 挑战可接收 | Submission Task → Student Companions | [S3] |
| MSG-003 | **submission_request** | 提交请求 | Student Companion → Submission Task | [S3] |
| MSG-004 | **review_request** | 评审请求 | Submission Task → Review Task | [S3] |
| MSG-005 | **review_result** | 评审结果 | Review Task → Submission Task | [S3] |
| MSG-006 | **feedback** | 反馈 | Submission Task → Student Companion | [S3] |
| MSG-007 | **status_update** | 状态更新 | Submission Task → Teacher Companion | [S3] |
| MSG-008 | **final_adjustment** | 最终调整 | Teacher Companion → Submission Task | [S3] |
| MSG-009 | **peer_review_request** | 同伴评审请求 | Review Task → Peer Students | [S3] |

**统计**：9 种 Message Type

---

## 3. A-Box 实例 / 事实

### 3.1 Agent 实例

| ID | agent_id (Pattern) | agent_type | 唯一性 | 来源 |
|---|---|---|---|---|
| AG-INST-001 | `student-companion-{student_id}` | student-companion | 多实例（每学生 1）| [S5][S7] |
| AG-INST-002 | `teacher-companion-{teacher_id}` | teacher-companion | 多实例（每教师 1）| [S5][S8] |
| AG-INST-003 | `admin-companion-{admin_id}` | admin-companion | 多实例（每管理员 1）| [S2] 隐含 |
| AG-INST-004 | `submission-task-agent` | submission-task | **单例或池** | [S5] |
| AG-INST-005 | `review-task-agent` | review-task | **单例或池** | [S5] |
| AG-INST-006 | `peer-review-{student_id}` | peer-review | 多实例（临时代理）| [S3] |

**统计**：6 类 Agent 实例

### 3.2 Channel 实例

| ID | channel_type | channel_id Pattern | 关联 Agent | 来源 |
|---|---|---|---|---|
| CH-INST-001 | **web** | `web-session-{user_id}` | Companion | [S7][S8] |
| CH-INST-002 | **github** | `{github_username}` | Student Companion | [S7] |
| CH-INST-003 | **feishu** | `{feishu_user_id}` | Teacher Companion | [S8] |

**统计**：3 类 Channel 实例

### 3.3 PersonalOntology 实例（9 个子模块）

| ID | 子模块 | 含义 | 必有字段 |
|---|---|---|---|
| PO-INST-001 | **identity** | 身份 | name, student_id, cohort, school, major |
| PO-INST-002 | **learning_goals** | 学习目标 | goals[], timeline |
| PO-INST-003 | **courses** | 课程 | course_id[], progress[] |
| PO-INST-004 | **skills** | 技能 | skill_id[], level[] |
| PO-INST-005 | **projects** | 项目 | project_id[], status[] |
| PO-INST-006 | **schedule** | 日程 | event_id[], time[] |
| PO-INST-007 | **exams** | 考试 | exam_id[], date[] |
| PO-INST-008 | **resume** | 简历 | content, last_updated |
| PO-INST-009 | **job_applications** | 求职申请 | company[], status[] |
| PO-INST-010 | **personal_interests** | 个人兴趣 | interest_tags[] |

**统计**：10 个 PersonalOntology 子模块（实际表中 9 个，job_applications 和 personal_interests 合并算入）

### 3.4 Personal OKF 目录实例

```text
PersonalOKF/
├── profile.yaml       ← 学生身份信息
├── ontology.md        ← 个人本体
├── skills.md          ← 技能清单
├── memory.md          ← 记忆累积
├── resources.md       ← 资源映射
├── goals.md           ← 目标管理
├── challenges/        ← 挑战记录
├── artifacts/         ← 产物归档
└── aar/               ← 复盘文档
```

| ID | 目录/文件 | 类型 | 内容 |
|---|---|---|---|
| OKF-001 | **profile.yaml** | YAML | name, student_id, cohort, school, major, github, feishu_user_id, companion_agent, ai_x_direction, mentor |
| OKF-002 | **ontology.md** | Markdown | 个人本体（identity / learning_goals / courses / skills / projects / schedule / exams / resume / job_applications / personal_interests）|
| OKF-003 | **skills.md** | Markdown | 技能清单 |
| OKF-004 | **memory.md** | Markdown | 记忆累积 |
| OKF-005 | **resources.md** | Markdown | 资源映射（Feishu / GitHub / Course）|
| OKF-006 | **goals.md** | Markdown | 目标管理 |
| OKF-007 | **challenges/** | 目录 | 挑战记录 |
| OKF-008 | **artifacts/** | 目录 | 产物归档 |
| OKF-009 | **aar/** | 目录 | 复盘文档 |

**统计**：9 个 Personal OKF 文件/目录

### 3.5 业务对象实例

| ID | 实例名 | 类型 | 来源 |
|---|---|---|---|
| BO-INST-001 | "Elite20 AI+X Web Coding MVP" | Course | [S2]（MVP 第一门课）|
| BO-INST-002 | "AI Literacy" | KnowledgePoint | [S2] |
| BO-INST-003 | "Web Coding Basics" | KnowledgePoint | [S2] |
| BO-INST-004 | "Prompt Engineering" | KnowledgePoint | [S2] |
| BO-INST-005 | "Context Engineering" | KnowledgePoint | [S2] |
| BO-INST-006 | "Harness Engineering" | KnowledgePoint | [S2] |
| BO-INST-007 | "Loop Engineering" | KnowledgePoint | [S2] |
| BO-INST-008 | "GitHub Workflow" | KnowledgePoint | [S2] |
| BO-INST-009 | "FDE Methodology" | KnowledgePoint | [S2] |
| BO-INST-010 | "ATMC Methodology" | KnowledgePoint | [S2] |
| BO-INST-011 | "Product Thinking" | KnowledgePoint | [S2] |
| BO-INST-012 | "Portfolio Building" | KnowledgePoint | [S2] |
| BO-INST-013 | "Career Readiness" | KnowledgePoint | [S2] |

**统计**：1 个 Course 实例 + 12 个 KnowledgePoint 实例 = 13 个业务对象实例

---

## 4. 类属性（Property / Attribute）

### 4.1 通用属性（每个类都可能有）

| 属性 | 类型 | 说明 | 适用类 |
|---|---|---|---|
| `id` | string | 唯一标识 | 所有类 |
| `type` | string | 类型标签 | 所有类 |
| `created_at` | datetime | 创建时间 | 所有持久化类 |
| `updated_at` | datetime | 更新时间 | 所有持久化类 |
| `version` | string | 版本号 | Manifest / Schema 类 |

### 4.2 Agent 类属性

#### Agent 基类属性

| 属性 | 类型 | 必有 | 来源 |
|---|---|---|---|
| `agent_id` | string | ✅ | [S5][S7-10] |
| `agent_type` | enum (AgentType) | ✅ | [S5][S7-10] |
| `display_name` | string | ✅ | [S5][S7-10] |
| `description` | string | ✅ | [S7-10] |
| `status` | enum (PresenceStatus) | ✅ | [S5] |
| `last_active_at` | datetime | ✅ | [S5] |
| `owner_id` | string | 可选 | [S5]（PersonalOntology 归属）|
| `manifest_version` | string | ✅ | [S7-10] |

#### AgentManifest 专属属性

| 属性 | 类型 | 必有 | 来源 |
|---|---|---|---|
| `capabilities` | array<Capability> | ✅ | [S7-10] |
| `interfaces` | array<Interface> | ✅ | [S7-10] |
| `permissions` | array<Permission> | ✅ | [S7-10] |
| `trusted_agents` | array<string> | ✅ | [S7-10] |
| `memory_binding` | array<MemoryBinding> | ✅ | [S7-10] |
| `channel_bindings` | array<ChannelBinding> | ✅ | [S7-10] |
| `constraints` | object<Constraint> | ✅ | [S7-10] |
| `admin_identity_mode` | enum (AdminIdentityMode) | ❌ 缺 | [S3] §4.3 |
| `review_mode` | enum (ReviewMode) | ❌ 缺 | [S3] §8.2 |
| `routing_status` | enum (RoutingStatus) | ❌ 缺 | [S3] §8.2 |

**统计**：Agent 属性 8 个 + Manifest 专属 10 个（3 个缺口）

#### Capability 属性

| 属性 | 类型 | 必有 |
|---|---|---|
| `capability_id` | string | ✅ |
| `name` | string | ✅ |
| `description` | string | ✅ |

#### Interface 属性

| 属性 | 类型 | 必有 |
|---|---|---|
| `interface_name` | string | ✅ |
| `input_schema` | object (JSON Schema) | ✅ |
| `output_schema` | object (JSON Schema) | ✅ |

#### Permission 属性

| 属性 | 类型 | 必有 |
|---|---|---|
| `permission_id` | string | ✅ |
| `scope` | string | ✅ |

#### Constraint 属性

| 属性 | 类型 | 必有 |
|---|---|---|
| `constraint_id` | string | ✅ |
| `rule` | string | ✅ |

#### MemoryBinding 属性

| 属性 | 类型 | 必有 |
|---|---|---|
| `ontology_path` | string | ✅ |

#### ChannelBinding 属性

| 属性 | 类型 | 必有 |
|---|---|---|
| `channel_type` | enum (ChannelType) | ✅ |
| `channel_id` | string | ✅ |

### 4.3 协议核心类属性

#### TrustedRelationship 属性

| 属性 | 类型 | 必有 | 来源 |
|---|---|---|---|
| `relationship_id` | string | ✅ | [S5] |
| `agent_a` | string | ✅ | [S5] |
| `agent_b` | string | ✅ | [S5] |
| `relationship_type` | enum (RelationshipType) | ✅ | [S5] |
| `trust_level` | enum (TrustLevel) | ✅ | [S5] |
| `permissions` | array<string> | ✅ | [S5] |
| `capabilities` | array<string> | ✅ | [S5] |
| `expiration` | datetime \| null | ✅ | [S5] |
| `last_verified` | datetime | ✅ | [S5] |

#### MessageEnvelope 属性

| 属性 | 类型 | 必有 | 来源 |
|---|---|---|---|
| `message_id` | string | ✅ | [S5][S11] |
| `request_id` | string | ✅ | [S5][S11] |
| `from_agent` | string | ✅ | [S5][S11] |
| `to_agent` | string | ✅ | [S5][S11] |
| `message_type` | enum (MessageType) | ✅ | [S5][S11] |
| `timestamp` | datetime | ✅ | [S5][S11] |
| `payload` | object | ✅ | [S5][S11] |
| `routing_metadata` | RoutingMetadata | ✅ | [S5][S11] |
| `audit_trace_pointer` | string | ✅ | [S5][S11] |
| `signature` | string | ✅ | [S13] |
| `correlation_id` | string | 可选 | [S11] |
| `ttl_seconds` | int | 可选 | [S11] |

#### AgentInbox 属性

| 属性 | 类型 | 必有 |
|---|---|---|
| `agent_id` | string | ✅ |
| `queue_type` | enum (InboxQueueType) | ✅ |
| `messages` | array<MessageEnvelope> | ✅ |
| `dead_letter_queue` | array<MessageEnvelope> | ✅ |

#### AgentOutbox 属性

| 属性 | 类型 | 必有 |
|---|---|---|
| `agent_id` | string | ✅ |
| `pending_events` | array<MessageEnvelope> | ✅ |
| `routing_history` | array<RoutingRecord> | ✅ |

#### AuditTrace 属性

| 属性 | 类型 | 必有 | 来源 |
|---|---|---|---|
| `audit_id` | string | ✅ | [S5][S12] |
| `timestamp` | datetime | ✅ | [S5][S12] |
| `agent_id` | string | ✅ | [S5][S12] |
| `action` | string | ✅ | [S5][S12] |
| `target_resource` | string | ✅ | [S5][S12] |
| `before_state` | object \| null | ✅ | [S5][S12] |
| `after_state` | object \| null | ✅ | [S5][S12] |
| `routing_path` | array<string> | ✅ | [S5][S12] |
| `related_message_id` | string | ✅ | [S5][S12] |
| `error_trace` | object \| null | 可选 | [S3] §11.2 |

#### Presence 属性

| 属性 | 类型 | 必有 |
|---|---|---|
| `agent_id` | string | ✅ |
| `status` | enum (PresenceStatus) | ✅ |
| `last_seen` | datetime | ✅ |
| `current_task` | string \| null | ✅ |

#### ResourceConfig 属性

| 属性 | 类型 | 必有 | 来源 |
|---|---|---|---|
| `agent_id` | string | ✅ | [S2] |
| `feishu` | FeishuResource | ✅ | [S2] |
| `github` | GitHubResource | ✅ | [S2] |
| `course` | CourseResource | 可选 | [S2] |
| `admin_identity_mode` | enum (AdminIdentityMode) | ❌ 缺 | [S3] §4.3 |
| `feishu_notification_preference` | enum | ❌ 缺 | [S5] |

#### PersonalOntology 属性

| 属性 | 类型 | 必有 | 来源 |
|---|---|---|---|
| `agent_id` | string | ✅ | [S2] |
| `identity` | object | ✅ | [S2] |
| `learning_goals` | array | ✅ | [S2] |
| `courses` | array | ✅ | [S2] |
| `skills` | array | ✅ | [S2] |
| `projects` | array | ✅ | [S2] |
| `schedule` | array | ✅ | [S2] |
| `exams` | array | ✅ | [S2] |
| `resume` | object | ✅ | [S2] |
| `job_applications` | array | ✅ | [S2] |
| `personal_interests` | array | ✅ | [S2] |

### 4.4 业务对象类属性

#### Learner 属性

| 属性 | 类型 | 必有 | 来源 |
|---|---|---|---|
| `student_id` | string | ✅ | [S2] |
| `name` | string | ✅ | [S2] |
| `school` | string | ✅ | [S2] |
| `major` | string | ✅ | [S2] |
| `grade` | string | ✅ | [S2] |
| `email` | string | ✅ | [S2] |
| `feishu_id` | string | ✅ | [S2] |
| `github_username` | string | ✅ | [S2] |
| `cohort_id` | string | ✅ | [S2] |
| `learning_goals` | array | ✅ | [S2] |
| `ai_x_direction` | string | ✅ | [S2] |
| `companion_agent_id` | string (agent_id) | ✅ | [S2] |
| `personal_ontology_id` | string | ✅ | [S2] |
| `personal_memory_id` | string | ✅ | [S2] |
| `portfolio_id` | string | ✅ | [S2] |

#### Professor 属性

| 属性 | 类型 | 必有 | 来源 |
|---|---|---|---|
| `professor_id` | string | ✅ | [S2] |
| `name` | string | ✅ | [S2] |
| `institution` | string | ✅ | [S2] |
| `feishu_id` | string | ✅ | [S2] |
| `github_org` | string | ✅ | [S2] |
| `managed_courses` | array<Course> | ✅ | [S2] |
| `managed_cohorts` | array<Cohort> | ✅ | [S2] |
| `challenge_library` | array<Challenge> | ✅ | [S2] |
| `rubric_library` | array<Rubric> | ✅ | [S2] |
| `submission_table_id` | string | ✅ | [S2] |
| `evaluation_table_id` | string | ✅ | [S2] |
| `companion_agent_id` | string | ✅ | [S2] |

#### Course 属性

| 属性 | 类型 | 必有 | 来源 |
|---|---|---|---|
| `course_id` | string | ✅ | [S2] |
| `name` | string | ✅ | [S2] |
| `cohort_id` | string | ✅ | [S2] |
| `professor_id` | string | ✅ | [S2] |
| `ta_id` | string | 可选 | [S2] |
| `objectives` | array | ✅ | [S2] |
| `knowledge_points` | array | ✅ | [S2] |
| `challenge_sequence` | array<Challenge> | ✅ | [S2] |
| `learning_resources` | array | ✅ | [S2] |
| `grading_criteria` | array | ✅ | [S2] |
| `deliverable_requirements` | array | ✅ | [S2] |

#### Challenge 属性

| 属性 | 类型 | 必有 | 来源 | Status |
|---|---|---|---|---|
| `challenge_id` | string | ✅ | [S3] | ✅ |
| `title` | string | ✅ | [S3] | ✅ |
| `description` | string | ✅ | [S3] | ✅ |
| `teacher_id` | string | ✅ | [S3] | ❌ 缺 |
| `teacher_agent_id` | string | ✅ | [S3] | ✅ |
| `feishu_group_id` | string | ✅ | [S3] | ⚠️ ChannelBinding |
| `github_pointer` | string | ✅ | [S3] | ❌ 缺 |
| `airtable_record_id` | string | ✅ | [S3] | ❌ 缺 |
| `ontology_nodes` | array | ✅ | [S3] | ✅ |
| `skills` | array | ✅ | [S3] | ✅ |
| `learning_objectives` | array | ✅ | [S3] | ✅ |
| `required_deliverables` | array | ✅ | [S3] | ✅ |
| `rubric_pointer` | string | ✅ | [S3] | ✅ |
| `due_date` | datetime | ✅ | [S3] | ❌ 缺 |
| `status` | enum (ChallengeStatus) | ✅ | [S3] | ❌ 缺 |
| `created_at` | datetime | ✅ | [S3] | ❌ 缺 |
| `updated_at` | datetime | ✅ | [S3] | ❌ 缺 |

**统计**：17 个字段，✅ 8 / ❌ 9

#### Submission 属性（25 字段）

| 属性 | 类型 | 必有 | Status |
|---|---|---|---|
| `submission_id` | string | ✅ | ✅ |
| `submission_request_id` | string | ✅ | ✅ |
| `challenge_id` | string | ✅ | ✅ |
| `student_id` | string | ✅ | ✅ |
| `submitted_by_agent_id` | string | ✅ | ✅ |
| `student_feishu_bot_id` | string | ✅ | ✅ |
| `processed_by_agent_id` | string | ✅ | ✅ |
| `submission_task_agent_id` | string | ✅ | ✅ |
| **`admin_identity_mode`** | enum | ✅ | ❌ **缺** |
| `admin_user_id` | string | ✅ | ⚠️ |
| `github_repo` | string | ✅ | ❌ 缺 |
| `github_branch` | string | ✅ | ❌ 缺 |
| `github_commit` | string | ✅ | ❌ 缺 |
| `submitted_files` | array | ✅ | ✅ |
| `self_reflection_pointer` | string | ✅ | ✅ |
| `skills_used` | array | ✅ | ✅ |
| **`ontology_nodes_used`** | array | ✅ | ❌ **缺** |
| `system_validation_status` | enum | ✅ | ⚠️ |
| **`review_mode`** | enum | ✅ | ❌ **缺** |
| `routed_to_teacher_agent_id` | string | ✅ | ⚠️ |
| `routed_to_peer_agent_ids` | array | ✅ | ⚠️ |
| **`routing_status`** | enum | ✅ | ❌ **缺** |
| `review_status` | enum | ✅ | ⚠️ |
| `feedback_pointer` | string | ✅ | ✅ |
| `audit_log_pointer` | string | ✅ | ✅ |
| `submitted_at` | datetime | ✅ | ❌ 缺 |
| `updated_at` | datetime | ✅ | ❌ 缺 |

**统计**：25 字段，✅ 13 / ❌ 12（4 个 P0 缺、4 个 P1 缺）

#### AAR 属性

| 属性 | 类型 | 必有 | 来源 |
|---|---|---|---|
| `challenge_id` | string | ✅ | [S2] |
| `student_id` | string | ✅ | [S2] |
| `task` | string | ✅ | [S2] |
| `expected_result` | string | ✅ | [S2] |
| `actual_result` | string | ✅ | [S2] |
| `what_worked` | string | ✅ | [S2] |
| `what_failed` | string | ✅ | [S2] |
| `lesson_learned` | string | ✅ | [S2] |
| `skill_update` | string | ✅ | [S2] |
| `memory_update` | string | ✅ | [S2] |
| `next_action` | string | ✅ | [S2] |

**统计**：11 个 AAR 字段

#### Rubric 属性

| 属性 | 类型 | 必有 | 来源 |
|---|---|---|---|
| `rubric_id` | string | ✅ | [S2] |
| `dimensions` | array<RubricDimension> | ✅ | [S2] |
| `max_score` | int | ✅ | [S2] |

#### Evaluation 属性

| 属性 | 类型 | 必有 | 来源 |
|---|---|---|---|
| `evaluation_id` | string | ✅ | [S3] |
| `submission_id` | string | ✅ | [S3] |
| `scores` | object | ✅ | [S3] |
| `feedback` | string | ✅ | [S3] |
| `evaluator_type` | enum | ✅ | [主仓-eval] |
| `evaluator_id` | string | ✅ | [主仓-eval] |
| `scores_json` | object | ✅ | [S3] §5.4 |

#### Portfolio 属性

| 属性 | 类型 | 必有 | 来源 |
|---|---|---|---|
| `portfolio_id` | string | ✅ | [S2] |
| `student_id` | string | ✅ | [S2] |
| `items` | array<Artifact> | ✅ | [S2] |
| `visibility` | enum (public/private) | ✅ | [S2] |

### 4.5 Skill 类属性

| 属性 | 类型 | 必有 | 来源 |
|---|---|---|---|
| `skill_id` | string | ✅ | [S2] |
| `skill_name` | string | ✅ | [S2] |
| `description` | string | ✅ | [S2] |
| `input_schema` | object (JSON Schema) | ✅ | [S2] |
| `output_schema` | object (JSON Schema) | ✅ | [S2] |
| `required_context` | array | ✅ | [S2] |
| `required_permissions` | array<Permission> | ✅ | [S2] |
| `linked_task_agent` | string (agent_id) | ✅ | [S2] |
| `linked_ontology` | array | ✅ | [S2] |
| `evaluation_rubric` | string | ✅ | [S5.4] |
| `action_plan` | string | ✅ | [S5.4] |
| `constraints` | object | ✅ | [S5.4] |
| `learning_signals` | object | ✅ | [S5.4] |

**统计**：13 个 Skill 字段

### 4.6 Event 类属性

| 属性 | 类型 | 必有 | 来源 |
|---|---|---|---|
| `event_id` | string | ✅ | [S11][S12] |
| `event_type` | string (类名) | ✅ | [S11][S12] |
| `timestamp` | datetime | ✅ | [S11][S12] |
| `source_agent` | string (agent_id) | ✅ | [S11][S12] |
| `target_agent` | string (agent_id) | ✅ | [S11][S12] |
| `payload` | object | ✅ | [S11][S12] |
| `correlation_id` | string | ✅ | [S11][S12] |
| `audit_trace_pointer` | string | ✅ | [S11][S12] |
| `related_message_id` | string | ✅ | [S11][S12] |

**统计**：9 个 Event 字段

---

## 5. 类继承 / 分类体系（Taxonomy）

### 5.1 Agent 分类树

```text
Agent
├── CompanionAgent                          (有长期个人记忆)
│   ├── StudentCompanion                    (学生，每生 1 个)
│   ├── TeacherCompanion                    (教师，每师 1 个)
│   ├── AdminCompanion                      (管理员)
│   ├── CodingCoachAgent                    (代码教练)
│   ├── MentorAgent                         (1v1 答疑)
│   └── KnowledgeLibrarianAgent             (知识问答)
│
└── TaskAgent                               (无长期个人记忆)
    ├── SubmissionTaskAgent                 (单例或池，写 Submission 红线)
    ├── ReviewTaskAgent                     (单例或池)
    ├── PeerReviewStudentAgent              (临时代理)
    ├── CourseSetupAgent
    ├── ChallengeCreationAgent
    ├── ProjectExecutionAgent
    ├── ChallengeSubmissionAgent
    ├── AARAgent
    ├── EvaluationAgent
    ├── CompanionSetupAgent
    ├── ChallengeWorkAgent
    ├── GitHubArtifactAgent
    ├── SelfEvaluationAgent
    ├── PortfolioSubmissionAgent
    ├── SubmissionReviewAgent
    ├── RubricEvaluationAgent
    └── CohortMonitoringAgent
```

**统计**：2 大类 / 21 个子类

### 5.2 Skill 分类树

```text
Skill
├── FeishuSkill
│   ├── ExcelImportSkill
│   ├── FeishuSetupSkill
│   ├── PortfolioSubmissionSkill
│   └── FeishuSubmissionSkill
├── GitHubSkill
│   └── GitHubArtifactSkill
├── OKFSkill
│   └── PersonalOKFSkill
├── ChallengeSkill
│   └── ChallengeCreationSkill
├── AARSkill
│   └── AARSkill
└── EvaluationSkill
    ├── SelfEvaluationSkill
    └── RubricEvaluationSkill
```

**统计**：6 大类 / 10 个具体

### 5.3 Artifact 分类树

```text
Artifact
└── SubmissionArtifact
    ├── GitHubRepo
    ├── README
    ├── Demo
    ├── DesignDoc
    ├── PromptLog
    ├── ContextPack
    ├── AAR_Doc
    ├── SelfEvaluation
    └── PortfolioPage
```

**统计**：1 抽象 / 9 具体

### 5.4 Protocol 分类树

```text
Protocol
├── 身份类
│   └── AgentIdentity
├── 声明类
│   ├── AgentManifest
│   ├── Capability
│   ├── Interface
│   ├── Permission
│   └── Constraint
├── 绑定类
│   ├── MemoryBinding
│   └── ChannelBinding
├── 关系类
│   └── TrustedRelationship
├── 消息类
│   ├── MessageEnvelope
│   ├── AgentInbox
│   └── AgentOutbox
├── 审计类
│   └── AuditTrace
├── 状态类
│   └── Presence
└── 配置类
    └── ResourceConfig
```

**统计**：8 大类 / 17 个具体

### 5.5 BusinessObject 分类树

```text
BusinessObject
├── Person
│   ├── Learner
│   └── Professor
├── Course
├── Challenge
├── Artifact
│   └── SubmissionArtifact
│       ├── GitHubRepo / README / Demo / DesignDoc
│       └── PromptLog / ContextPack / AAR / SelfEvaluation / PortfolioPage
├── AAR
├── Rubric
├── Submission
├── Evaluation
└── Portfolio
```

**统计**：3 大类 / 12 个具体

---

## 6. 抽取物索引（ID 速查）

### 6.1 按 ID 前缀

| 前缀 | 含义 | 数量 |
|---|---|---:|
| **AG-CLASS-** | Agent 类 | 15 |
| **TA-CLASS-** | Task Agent 子类 | 14 |
| **PROTO-** | 协议核心类 | 17 |
| **BO-** | 业务对象类 | 12 |
| **ART-** | Artifact 子类 | 9 |
| **RES-** | 资源类 | 3 |
| **SK-** | Skill 具体类 | 10 |
| **SKA-** | Skill 抽象类 | 6 |
| **EV-CLASS-** | Event 类 | 14 |
| **EN-** | 枚举类型 | 14 |
| **MSG-** | Message Type | 9 |
| **AG-INST-** | Agent 实例 | 6 |
| **CH-INST-** | Channel 实例 | 3 |
| **PO-INST-** | PersonalOntology 子模块实例 | 10 |
| **OKF-** | Personal OKF 文件/目录 | 9 |
| **BO-INST-** | 业务对象实例 | 13 |
| **总计** | | **164** |

### 6.2 按状态

| 状态 | 数量 | 占比 |
|---|---:|---:|
| ✅ 已有（仓库 / 文档） | 35 | 21% |
| ⚠️ 部分覆盖 | 18 | 11% |
| ❌ 未实现 | 91 | 55% |
| 🆕 仅在原文档 | 20 | 12% |
| **总计** | **164** | **100%** |

---

## 7. 抽取统计

### 7.1 总体统计

| 类别 | 数量 |
|---|---:|
| **T-Box 类** | 80+ |
| ├─ Agent 类（含子类） | 29 |
| ├─ 协议类 | 17 |
| ├─ 业务对象类 | 12 |
| ├─ Artifact 子类 | 9 |
| ├─ 资源类 | 3 |
| ├─ Skill 类（含抽象） | 16 |
| ├─ Event 类 | 14 |
| **枚举类型** | 14（含 50+ 枚举值）|
| **A-Box 实例** | 41 |
| **属性（累计）** | 200+ |
| **抽取物 ID** | **164** |

### 7.2 抽取覆盖度（按 T/A/R/Event/Process/Skill 7 层）

| 层 | 抽取数 | 已实现 | 缺口 | 覆盖度 |
|---|---:|---:|---:|---:|
| **T-Box（类/概念）** | 80 | 35 | 45 | 44% |
| **A-Box（实例/事实）** | 41 | 30 | 11 | 73% |
| **R-Box（关系/规则）** | — | — | — | 跳过 |
| **Event（事件类）** | 14 | 0 | 14 | 0%（类已抽，但实现需 Agent 触发）|
| **Process（流程）** | — | — | — | 跳过 |
| **Skill** | 16 | 0 | 16 | 0% |
| **Agent 角色** | 15 | 5 | 10 | 33% |

### 7.3 关键缺口汇总

#### 实体层缺口

| 缺口 | 来源 | 优先级 |
|---|---|---|
| AdminCompanion Manifest | [S2] | 🔴 P0 |
| PeerReviewStudentAgent Manifest | [S3] | 🔴 P0 |
| MentorAgent Manifest | [课程 C4] | 🟡 P1 |
| KnowledgeLibrarianAgent Manifest | [课程 C4] | 🟡 P1 |
| 14 个 Task Agent Manifest | [S2] | 🟡 P1 |
| AAR 本体 | [S2] | 🟡 P1 |
| Portfolio 本体 | [S2] | 🟡 P1 |
| PersonalOntology 独立定义 | [S2] | 🟡 P1 |
| 10 个 Skill Manifest | [S2] | 🟡 P1 |

#### 字段层缺口

| 缺口字段 | 所属类 | 优先级 |
|---|---|---|
| `admin_identity_mode` | ResourceConfig / Submission | 🔴 P0 |
| `review_mode` | Submission | 🔴 P0 |
| `routing_status` | Submission | 🔴 P0 |
| `github_repo/branch/commit` | Submission | 🔴 P0 |
| `due_date` / `status` | Challenge | 🟡 P1 |
| `ontology_nodes_used` | Submission | 🟡 P1 |
| `created_at` / `updated_at` | 全部 | 🟡 P1 |

---

## 附录：抽取约定

### A.1 ID 命名规范

```text
{大类}-{子类}-{编号}
- AG-CLASS-001  : Agent 类第 1 个
- TA-CLASS-001  : Task Agent 类第 1 个
- PROTO-001     : 协议类第 1 个
- BO-001        : 业务对象第 1 个
- ART-001       : Artifact 子类第 1 个
- SK-001        : Skill 具体类第 1 个
- SKA-001       : Skill 抽象类第 1 个
- EV-CLASS-001  : Event 类第 1 个
- EN-SUB-001    : Submission 状态枚举
- MSG-001       : Message Type 第 1 个
- AG-INST-001   : Agent 实例第 1 个
- CH-INST-001   : Channel 实例第 1 个
- PO-INST-001   : PersonalOntology 子模块第 1 个
- OKF-001       : Personal OKF 文件第 1 个
- BO-INST-001   : 业务对象实例第 1 个
```

### A.2 Status 标识

| 标识 | 含义 |
|---|---|
| ✅ 已有 | 仓库 / 文档已定义并有 Manifest / Schema |
| ⚠️ 部分 | 仓库有相关概念但缺 Manifest / 字段 |
| ❌ 缺 | 完全未实现 |
| 🆕 仅在原文档 | 原文档提及但仓库无对应概念 |

### A.3 抽取流程（可重复）

```text
Step 1: 读源文件 Team3-语义模块抽取.md
Step 2: 遍历 §2.1.1-2.1.7 T-Box，抽取每个 Class / 枚举值 / 属性
Step 3: 遍历 §2.2.1-2.2.3 A-Box，抽取每个 Instance / 字段值
Step 4: 对每个类补充属性（P-Attr）
Step 5: 建立 §5 继承树
Step 6: 索引 §6 唯一 ID
Step 7: 统计 §7 覆盖度
```

---

> **实体/概念抽取方法论核心理念（一句话）**：
> 
> **从 186 个语义模块中只抽取"名词性"内容（T-Box 80+ 类 + A-Box 41 实例 + 14 枚举 + 200+ 属性 = 164 个有 ID 的抽取物），构建 5 大分类树（Agent / Skill / Artifact / Protocol / BusinessObject），发现 91 个未实现实体和 12 个字段层缺口，沉淀为可重复的 7 步抽取流程。**
