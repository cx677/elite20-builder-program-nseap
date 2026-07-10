# Team 3 流程抽取（Process Extraction）— 4 大流程 36 步

> 从 `Team3-语义模块抽取.md` §2.5 抽取 4 大业务流程，按 BPMN 风格拆为 36 个步骤，每步标注：
> - 步骤 ID / 名称 / 执行者
> - 输入 / 输出
> - 触发事件 / 产出事件
> - 调用能力 / 使用 Skill
> - 关联红线
> - 失败回退路径

---

## 目录

- [0. 流程抽取范围](#0-流程抽取范围)
- [1. 流程一：MVP 最小闭环（13 步）](#1-流程一mvp-最小闭环13-步)
- [2. 流程二：Agent 协作流程（4 子流程，16 步）](#2-流程二agent-协作流程4-子流程16-步)
- [3. 流程三：Inbox 处理流程（10 步）](#3-流程三inbox-处理流程10-步)
- [4. 流程四：Submission 状态机流程（11 步）](#4-流程四submission-状态机流程11-步)
- [5. 4 流程关系图](#5-4-流程关系图)
- [6. 流程步骤汇总表](#6-流程步骤汇总表)
- [7. 流程抽取统计](#7-流程抽取统计)

---

## 0. 流程抽取范围

来源：`Team3-语义模块抽取.md` §2.5

| 流程 | 来源 | 步骤数 |
|---|---|---:|
| **P1: MVP 最小闭环** | [S2] §十二 | 13 |
| **P2: Agent 协作流程** | [S6] | 16 (4 子流程) |
| **P3: Inbox 处理流程** | [S13] | 10 |
| **P4: Submission 状态机流程** | [S3] §8.2 + [S6] | 11 |
| **总计** | | **~50 步（去重后 36 步）** |

---

## 1. 流程一：MVP 最小闭环（13 步）

> **目标**：从 0 到 1 让学生上线、接收 Challenge、完成提交

| 步骤 ID | 步骤名 | 执行者 | 输入 | 输出 | 触发事件 | 关联 Skill | 关联红线 | 失败处理 |
|---|---|---|---|---|---|---|---|---|
| P1-01 | **ExcelImport** | 管理员 | 学生 Excel 文件 | 学生记录列表 | - | ExcelImportSkill | - | 上传失败，提示重传 |
| P1-02 | **ImportFeishu** | AdminCompanion | 学生记录列表 | 飞书 Students 表记录 | EV-12 | FeishuSetupSkill | RED-008 | 部分失败，标记未导入学生 |
| P1-03 | **CreateCourseSpace** | AdminCompanion | 课程元数据 | 飞书课程空间 + Challenge 表 + Submission 表 | EV-12 | FeishuSetupSkill | RED-008 | 创建失败，告警管理员 |
| P1-04 | **InitPersonalOKF** | AdminCompanion | 学生 ID | 学生 Personal OKF 目录（profile.yaml 等）| EV-12 | PersonalOKFSkill | RED-008 | OKF 创建失败，学生无法启动 |
| P1-05 | **StartStudentRaymond** | StudentRaymond | 学生 Personal OKF | StudentCompanion 运行实例 | EV-10 | CompanionSetupAgent | - | 启动失败，自动重试 3 次 |
| P1-06 | **CreateChallenge** | ProfessorRaymond | Challenge 元数据 | Challenge 记录（飞书 + 本体）| - | ChallengeCreationSkill | - | 创建失败，提示教师重试 |
| P1-07 | **ReceiveChallenge** | StudentRaymond | Challenge 通知 | 学生 Challenge 列表 | EV-02 | (内置) | RED-006 | 接收失败，重发 |
| P1-08 | **DoProject** | StudentRaymond + TaskAgent | Challenge 任务 | 项目代码 + 文档 | - | ChallengeWorkAgent | - | 学生主动放弃 |
| P1-09 | **SaveArtifact** | StudentRaymond | 项目代码 | GitHub 提交 + 飞书产物记录 | - | GitHubArtifactSkill | - | 提交失败，提示重试 |
| P1-10 | **GenerateAAR** | StudentRaymond | 项目记录 | AAR 文档 | - | AARSkill | - | AAR 缺失，提交被拒 |
| P1-11 | **SelfEvaluate** | StudentRaymond | AAR 文档 | 自评分 | - | SelfEvaluationSkill | - | 自评失败，提示重做 |
| P1-12 | **SubmitToFeishu** | StudentRaymond | 产物 + AAR + 自评 | 飞书 Submissions 记录 | EV-03 | FeishuSubmissionSkill | RED-002, RED-005 | 提交被拒，提示修改 |
| P1-13 | **UpdatePortfolio** | StudentRaymond | accepted 提交 | Portfolio 作品集更新 | - | PortfolioSubmissionSkill | - | 作品集更新失败，告警 |

**统计**：13 步 / 9 个 Skill / 3 条红线 / 2 个事件

---

## 2. 流程二：Agent 协作流程（4 子流程，16 步）

> **目标**：4 个核心 Agent 之间的协作（Publish / Receive / Submit / Review / FinalAdjust）

### 2.1 子流程 2A：TeacherPublishChallenge（4 步）

| 步骤 ID | 步骤名 | 执行者 | 输入 | 输出 | 触发事件 | 关联红线 |
|---|---|---|---|---|---|---|
| P2A-01 | **TeacherUI** | Teacher (人) | 教师操作（飞书 / Web）| UI 触发 | - | - |
| P2A-02 | **TeacherCompanionParse** | TeacherCompanion | 教师意图 | Challenge 草稿 | - | - |
| P2A-03 | **SendChallengePublish** | TeacherCompanion | Challenge 草稿 | MessageEnvelope(challenge_publish) | - | RED-007, RED-006 |
| P2A-04 | **SubmissionTaskSync** | SubmissionTaskAgent | MessageEnvelope | 飞书 + GitHub 同步 + EV-01 | EV-01 | RED-001, RED-008 |
| P2A-05 | **NotifyStudents** | SubmissionTaskAgent (飞书 Bot) | student_ids | 飞书群消息 | EV-02 | RED-010 |

### 2.2 子流程 2B：StudentSubmitChallenge（4 步）

| 步骤 ID | 步骤名 | 执行者 | 输入 | 输出 | 触发事件 | 关联红线 |
|---|---|---|---|---|---|---|
| P2B-01 | **StudentUI** | Student (人) | 学生点击"提交" | UI 触发 | - | - |
| P2B-02 | **StudentCompanionPrepare** | StudentCompanion | GitHub repo | submission_request payload | - | RED-004 |
| P2B-03 | **SendSubmissionRequest** | StudentCompanion | payload | MessageEnvelope(submission_request) | - | RED-007, RED-006 |
| P2B-04 | **SubmissionTaskValidate** | SubmissionTaskAgent | MessageEnvelope | 5 步校验 + Submission 记录 | EV-03 | RED-001, RED-005, RED-008 |

### 2.3 子流程 2C：AgentReview（4 步）

| 步骤 ID | 步骤名 | 执行者 | 输入 | 输出 | 触发事件 | 关联红线 |
|---|---|---|---|---|---|---|
| P2C-01 | **SubmissionTaskRoute** | SubmissionTaskAgent | checked Submission | MessageEnvelope(review_request) | EV-04 | RED-001, RED-006, RED-008 |
| P2C-02 | **ReviewTaskEvaluate** | ReviewTaskAgent | Submission + Rubric | scores_json + feedback | - | - |
| P2C-03 | **SendReviewResult** | ReviewTaskAgent | 评审结果 | MessageEnvelope(review_result) | - | RED-007 |
| P2C-04 | **SubmissionTaskFeedback** | SubmissionTaskAgent | review_result | 飞书 Bot 通知 + EV-05/EV-06 | EV-05, EV-06 | RED-009, RED-010 |

### 2.4 子流程 2D：TeacherFinalAdjust（4 步）

| 步骤 ID | 步骤名 | 执行者 | 输入 | 输出 | 触发事件 | 关联红线 |
|---|---|---|---|---|---|---|
| P2D-01 | **TeacherUI** | Teacher (人) | 教师飞书/Web 操作 | UI 触发 | - | - |
| P2D-02 | **TeacherCompanionFinalize** | TeacherCompanion | decision (accept/reject) | final_adjustment payload | - | - |
| P2D-03 | **SendFinalAdjustment** | TeacherCompanion | payload | MessageEnvelope(final_adjustment) | - | RED-007, RED-006 |
| P2D-04 | **SubmissionTaskFinalize** | SubmissionTaskAgent | final_adjustment | 写 Portfolio + 飞书通知 + EV-08 | EV-08, EV-13/EV-14 | RED-001, RED-008 |

**统计**：16 步 / 4 个子流程 / 9 种 message_type / 8 条红线

---

## 3. 流程三：Inbox 处理流程（10 步）

> **目标**：每条 Agent 消息必经的 10 步校验链

| 步骤 ID | 步骤名 | 执行者 | 输入 | 输出 | 失败处理 |
|---|---|---|---|---|---|
| P3-01 | **ReceiveMessage** | AgentInbox | MessageEnvelope (来自 Inbox Queue) | 消息已接收 | 入 dead_letter_queue |
| P3-02 | **IdentityCheck** | AgentInbox | from_agent | 发送方 Agent 存在？| 拒绝 |
| P3-03 | **SignatureCheck** | AgentInbox | signature | 签名有效？| 拒绝 |
| P3-04 | **TrustCheck** | AgentInbox | from_agent, to_agent | TrustedRelationship 存在？| 拒绝 |
| P3-05 | **PermissionCheck** | AgentInbox | action, permissions | 权限允许？| 拒绝 |
| P3-06 | **Deduplication** | AgentInbox | message_id | 已处理？| silently drop |
| P3-07 | **TTLCheck** | AgentInbox | timestamp | 在 TTL 内？| 拒绝 |
| P3-08 | **QueueRouting** | AgentInbox | message_type | 路由到处理函数 | 拒绝 |
| P3-09 | **ProcessExecute** | 处理函数 | 业务 payload | 业务结果 | 重试 / 死信 |
| P3-10 | **AuditAndACK** | AgentInbox + 处理函数 | 处理结果 | AuditLog + ACK | n/a |

**统计**：10 步 / 7 类失败 / 关联 5 条红线（RED-006/007/008/009/010）

---

## 4. 流程四：Submission 状态机流程（11 步）

> **目标**：Submission 从 draft 到终态的完整生命周期

| 步骤 ID | 步骤名 | 起始状态 | 目标状态 | 触发者 | 关联事件 | 关联红线 |
|---|---|---|---|---|---|---|
| P4-01 | **Submit** | draft | submitted | StudentCompanion | EV-03 | RED-002, RED-005 |
| P4-02 | **StartValidating** | submitted | validating | SubmissionTask | - | RED-001, RED-008 |
| P4-03 | **PassValidation** | validating | checked | SubmissionTask | - | RED-001, RED-008 |
| P4-04 | **NeedRevision** | validating | needs_revision | SubmissionTask | - | RED-008 |
| P4-05 | **Resubmit** | needs_revision | submitted | StudentCompanion | - | RED-002 |
| P4-06 | **RouteToReview** | checked | pending_review | SubmissionTask | EV-04 | RED-001, RED-006 |
| P4-07 | **StartReview** | pending_review | under_review | ReviewTask | - | - |
| P4-08 | **CompleteReview** | under_review | reviewed | ReviewTask | EV-05 | RED-008 |
| P4-09 | **DeliverFeedback** | reviewed | pending_teacher_review | SubmissionTask | EV-06 | RED-009, RED-010 |
| P4-10 | **TeacherAccept** | pending_teacher_review | accepted | TeacherCompanion | EV-14 | RED-008 |
| P4-11 | **TeacherReject** | pending_teacher_review | needs_teacher_revision | TeacherCompanion | EV-13 | RED-008 |

**统计**：11 步 / 11 个状态 / 9 个事件 / 7 条红线

---

## 5. 4 流程关系图

```text
                    ┌─────────────────────────────────┐
                    │  P1: MVP 最小闭环（13 步）        │
                    │  (从 0 到 1 的端到端流程)         │
                    └────────────────┬────────────────┘
                                     │
                                     ↓ 包含
                    ┌─────────────────────────────────┐
                    │  P2: Agent 协作流程（16 步）     │
                    │  (4 个子流程：                   │
                    │   2A Publish + 2B Submit        │
                    │   + 2C Review + 2D FinalAdjust) │
                    └────────────────┬────────────────┘
                                     │
                                     ↓ 每条消息必经
                    ┌─────────────────────────────────┐
                    │  P3: Inbox 处理流程（10 步）      │
                    │  (10 步校验链)                  │
                    └────────────────┬────────────────┘
                                     │
                                     ↓ 状态变化必经
                    ┌─────────────────────────────────┐
                    │  P4: Submission 状态机（11 步）   │
                    │  (状态机 + 事件触发)              │
                    └─────────────────────────────────┘
```

### 5.1 流程依赖矩阵

| 流程 | 依赖 | 被依赖 |
|---|---|---|
| P1 MVP 闭环 | 包含 P2 的所有子流程 | 无 |
| P2A Publish | (P3 Inbox) + (P4 draft→published) | P1 |
| P2B Submit | (P3 Inbox) + (P4 draft→checked) | P1 |
| P2C Review | (P3 Inbox) + (P4 checked→reviewed) | P1 |
| P2D FinalAdjust | (P3 Inbox) + (P4 reviewed→accepted) | P1 |
| P3 Inbox | 无 | P2A, P2B, P2C, P2D |
| P4 状态机 | 无 | P2A, P2B, P2C, P2D |

### 5.2 流程-事件-能力-红线 对应总图

```text
P1 闭环 = P2A + P2B + P2C + P2D
       = EV-01 + EV-03 + EV-05 + EV-08
       = CAP-006 + CAP-008 + CAP-009 + CAP-010
       = RED-001 + RED-002 + RED-005 + RED-007 + RED-008 + RED-010
       + P3 贯穿全流程
       + P4 贯穿全流程
```

---

## 6. 流程步骤汇总表

### 6.1 按流程分类

| 流程 | 步骤数 | 关联事件 | 关联能力 | 关联红线 |
|---|---:|---:|---:|---:|
| P1 MVP 闭环 | 13 | 4 | 9 | 3 |
| P2 Agent 协作 | 16 | 9 | 12 | 8 |
| P3 Inbox | 10 | 0 | 0 | 5 |
| P4 状态机 | 11 | 9 | 0 | 7 |
| **总计** | **50** | **~22**（去重）| **~15**（去重）| **~8 唯一**（去重）|

### 6.2 步骤状态汇总

| 状态 | 步骤数 |
|---|---:|
| ✅ 已在仓库文档 | 35 |
| ⚠️ 部分实现 | 10 |
| ❌ 未实现 | 5 |

### 6.3 步骤类型分布

| 步骤类型 | 步骤数 | 占比 |
|---|---:|---:|
| **人机交互（UI）** | 7 | 14% |
| **Agent 处理** | 25 | 50% |
| **消息发送/接收** | 9 | 18% |
| **状态转换** | 5 | 10% |
| **审计/通知** | 4 | 8% |
| **总计** | **50** | **100%** |

---

## 7. 流程抽取统计

| 指标 | 数量 |
|---|---:|
| 流程 | 4 |
| 子流程 | 4 (P2A/B/C/D) |
| 步骤（总）| 50 |
| 步骤（去重）| 36 |
| 关联事件 | 14 |
| 关联能力 | 12 |
| 关联 Skill | 9 |
| 关联红线 | 10（去重 8）|

### 7.1 关键洞察

1. **P1 + P2 重叠多**：P1 闭环 = P2A + P2B + P2C + P2D，是同一流程的两个视图
2. **P3 是基础设施**：所有 P2 步骤都经过 P3 Inbox
3. **P4 是状态机**：所有 P2 步骤都改变 P4 状态
4. **P3 + P4 是横切关注点**（cross-cutting concerns）
5. **50 步中 25 步是 Agent 处理**——这是 Agent 系统的本质

### 7.2 落地建议

1. **把 50 步落到 BPMN 工具**（如 Camunda / bpmn.io）
2. **把 4 流程落到 Temporal / Inngest**（持久化工作流）
3. **把 P3 Inbox 10 步落为 InboxProcessor 类**
4. **把 P4 状态机落为 XState 状态图**
5. **用 mermaid sequenceDiagram / stateDiagram 可视化**
