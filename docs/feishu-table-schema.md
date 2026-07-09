# 飞书多维表结构文档

版本：v1.1  
日期：2026-07-09  
用途：Platform Team 建表和接入依据  

> 本文档对齐白皮书 §11 数据模型、Agent Manifest 字段定义和当前 MVP 代码 `feishu.ts` 的实际读写字段。

---

## 总览：五张核心表

| 表名 | 飞书 table_id 环境变量 | 用途 | 当前状态 |
|---|---|---|---|
| Students | `FEISHU_STUDENTS_TABLE_ID` | 学生身份、班级、飞书、GitHub | ✅ 已建 |
| Challenges | `FEISHU_CHALLENGES_TABLE_ID` | 任务标题、描述、交付物、Rubric | ✅ 已建 |
| Submissions | `FEISHU_SUBMISSIONS_TABLE_ID` | 学生提交记录 | ✅ 已建（字段待补） |
| Evaluations | `FEISHU_EVALUATIONS_TABLE_ID` | AI/教师/同伴评审结果 | ✅ 已建 |
| PortfolioItems | `FEISHU_PORTFOLIO_TABLE_ID` | 可展示作品集条目 | ✅ 已建 |

---

## 1. Students 表

| 飞书字段名（英文） | 飞书显示名（中文） | 类型 | 必填 | 说明 | 示例 |
|---|---|---|---|---|---|
| `student_id` | 学号/ID | 文本 | ✅ | 唯一标识 | `s001` |
| `name` | 姓名 | 文本 | ✅ | 学生真实姓名 | `张三` |
| `email` | 邮箱 | 文本 | | | `zhangsan@example.com` |
| `github_username` | GitHub 用户名 | 文本 | | 不含 @ | `demo-user` |
| `github_profile_url` | GitHub 主页 | URL | | | `https://github.com/demo-user` |
| `school` | 学校 | 文本 | | | `清华大学` |
| `major` | 专业 | 文本 | | | `计算机科学` |
| `grade` | 年级 | 文本 | | | `2024级` |
| `cohort` | 班级/批次 | 文本 | | | `Elite20` |
| `ai_x_direction` | AI+X 方向 | 文本 | | | `Agent 开发` |
| `status` | 状态 | 单选 | | active / inactive | `active` |
| `portfolio_url` | 作品集链接 | URL | | | |

**代码读取位置**：`feishu.ts → normalizeStudent()`（第 100 行）

---

## 2. Challenges 表

| 飞书字段名（英文） | 飞书显示名（中文） | 类型 | 必填 | 说明 | 示例 |
|---|---|---|---|---|---|
| `challenge_id` | Challenge ID | 文本 | ✅ | 唯一标识 | `C01` |
| `title` | 标题 | 文本 | ✅ | Challenge 名称 | `我的第一个 AI 助手` |
| `brief` | 简介 | 多行文本 | | 一句话描述 | |
| `objective` | 目标 | 多行文本 | | 学习目标 | |
| `deliverables` | 交付物 | 多行文本 | | 需要交什么 | |
| `rubric` | 评分标准 | 多行文本 | | Rubric 说明或链接 | |
| `deadline` | 截止时间 | 日期 | | ISO 格式 | `2026-07-20` |
| `status` | 状态 | 单选 | | draft / published / closed | `published` |
| `created_by` | 创建者 | 文本 | | 老师姓名或 ID | |

**代码读取位置**：`feishu.ts → normalizeChallenge()`（第 119 行）  
**前端过滤**：只展示 `status === "published"` 的 Challenge  
**下一版新增字段**：见 §6 扩展字段

---

## 3. Submissions 表

### 当前已有字段

| 飞书字段名（英文） | 飞书显示名（中文） | 类型 | 必填 | 说明 |
|---|---|---|---|---|
| `submission_id` | 提交 ID | 文本 | ✅ | 自动生成，格式 `sub-{nanoid}` |
| `student_id` | 学生 ID | 文本 | ✅ | 外键 → Students |
| `student_name` | 学生姓名 | 文本 | ✅ | 冗余，方便飞书内查看 |
| `challenge_id` | Challenge ID | 文本 | ✅ | 外键 → Challenges |
| `project_title` | 项目名称 | 文本 | ✅ | |
| `project_summary` | 项目简介 | 多行文本 | | |
| `github_repo_url` | GitHub 仓库 | URL | ✅ | |
| `readme_url` | README 链接 | URL | | |
| `demo_url` | Demo 链接 | URL | | |
| `aar_text` | AAR 复盘 | 多行文本 | ✅ | 学生对过程的复盘 |
| `self_evaluation_text` | 自评 | 多行文本 | | |
| `github_check_result` | GitHub 检查结果 | 多行文本 | | JSON 字符串 |
| `status` | 状态 | 单选 | | checked / needs_revision |
| `is_public` | 是否公开 | 复选框 | | |
| `submitted_at` | 提交时间 | 日期 | | ISO 格式 |

### 🚨 下一版必须新增的 Agent 字段

| 飞书字段名（英文） | 飞书显示名（中文） | 类型 | 说明 |
|---|---|---|---|
| `submitted_by_agent_id` | 提交发起 Agent | 文本 | 哪个 Student Companion Agent 发起的，格式 `student-companion-{student_id}` |
| `processed_by_agent_id` | 处理 Agent | 文本 | 固定 `submission-task-agent` |
| `submission_request_id` | 请求 ID | 文本 | 关联 Message Envelope 的 `request_id` |
| `system_validation_status` | 系统校验结果 | 单选 | pending / passed / failed / needs_revision |
| `review_mode` | 评审模式 | 单选 | ai_first / teacher_first / peer_first |
| `routing_status` | 路由状态 | 单选 | pending_review / routed / review_complete |
| `review_status` | 评审状态 | 单选 | pending / in_progress / completed |
| `audit_log_pointer` | 审计日志指针 | 文本 | 关联 Audit Log，格式 `audit-{nanoid}` |
| `github_branch` | GitHub 分支 | 文本 | 默认为 `main` |
| `github_commit` | 提交 commit SHA | 文本 | 提交时的最新 commit |
| `submitted_files` | 提交文件清单 | 多行文本 | 逗号分隔或 JSON |
| `feedback_pointer` | 反馈指针 | 文本 | 指向最终反馈记录 |

**代码写入位置**：`feishu.ts → createSubmission()` + `workflow.ts → submitChallengeProject()`

---

## 4. Evaluations 表

| 飞书字段名（英文） | 飞书显示名（中文） | 类型 | 必填 | 说明 |
|---|---|---|---|---|
| `evaluation_id` | 评审 ID | 文本 | ✅ | 自动生成，格式 `eval-{nanoid}` |
| `submission_id` | 提交 ID | 文本 | ✅ | 外键 → Submissions |
| `student_id` | 学生 ID | 文本 | ✅ | 冗余 |
| `challenge_id` | Challenge ID | 文本 | ✅ | 冗余 |
| `evaluator_type` | 评审者类型 | 单选 | | ai / teacher / peer |
| `score_total` | 总分 | 数字 | | |
| `scores_json` | 分项得分 | 多行文本 | | JSON 字符串：{problemUnderstanding, aiUsage, artifactCompleteness, technicalExecution, reflectionQuality} |
| `strengths` | 优点 | 多行文本 | | |
| `weaknesses` | 缺点 | 多行文本 | | |
| `suggestions` | 改进建议 | 多行文本 | | |
| `feedback` | 综合反馈 | 多行文本 | | |
| `created_at` | 评审时间 | 日期 | | ISO 格式 |

**代码写入位置**：`feishu.ts → createEvaluation()` + `workflow.ts → submitChallengeProject()`

---

## 5. PortfolioItems 表

| 飞书字段名（英文） | 飞书显示名（中文） | 类型 | 必填 | 说明 |
|---|---|---|---|---|
| `portfolio_item_id` | 作品 ID | 文本 | ✅ | 自动生成，格式 `pf-{nanoid}` |
| `student_id` | 学生 ID | 文本 | ✅ | |
| `student_name` | 学生姓名 | 文本 | ✅ | 冗余 |
| `submission_id` | 提交 ID | 文本 | | 外键 → Submissions |
| `title` | 作品标题 | 文本 | ✅ | |
| `type` | 类型 | 文本 | | project / challenge / demo |
| `summary` | 摘要 | 多行文本 | | |
| `public_description` | 公开描述 | 多行文本 | | AI 生成的展示文案 |
| `github_url` | GitHub 链接 | URL | | |
| `demo_url` | Demo 链接 | URL | | |
| `cover_image_url` | 封面图 | URL | | |
| `skills` | 技能标签 | 文本 | | 逗号分隔 |
| `ai_feedback_summary` | AI 反馈摘要 | 多行文本 | | |
| `is_public` | 是否公开 | 复选框 | | 决定是否在 `/portfolio` 展示 |
| `created_at` | 创建时间 | 日期 | | |

**代码写入位置**：`feishu.ts → createPortfolioItem()` + `workflow.ts → submitChallengeProject()`  
**前端过滤**：只展示 `is_public === true` 的条目

---

## 6. 下一版扩展表（Agent-native 阶段）

### 6.1 AuditLogs 表

| 飞书字段名（英文） | 类型 | 说明 |
|---|---|---|
| `audit_id` | 文本 | 格式 `audit-{nanoid}` |
| `timestamp` | 日期 | 操作时间 |
| `agent_id` | 文本 | 执行操作的 Agent ID |
| `action` | 单选 | create_submission_record / update_submission_status / create_evaluation_record / ... |
| `target_resource` | 文本 | 格式 `{系统}.{表}.{ID}` |
| `before_state_json` | 多行文本 | 操作前状态（JSON） |
| `after_state_json` | 多行文本 | 操作后状态（JSON） |
| `routing_path` | 多行文本 | 消息路由路径（逗号分隔） |
| `related_message_id` | 文本 | 关联消息 ID |
| `related_request_id` | 文本 | 关联请求 ID |
| `metadata_json` | 多行文本 | 附加元数据 |

设计来源：`agents/audit/audit-log-schema.md`

### 6.2 InboxQueue 表

| 飞书字段名（英文） | 类型 | 说明 |
|---|---|---|
| `queue_id` | 文本 | 格式 `q-{nanoid}` |
| `message_id` | 文本 | 消息 ID |
| `request_id` | 文本 | 请求链路 ID |
| `from_agent` | 文本 | 发送方 |
| `to_agent` | 文本 | 接收方 |
| `message_type` | 单选 | challenge_publish / submission_request / ... |
| `status` | 单选 | pending / processing / done / failed / rejected |
| `priority` | 单选 | urgent / high / normal / low |
| `payload_json` | 多行文本 | 消息体 |
| `received_at` | 日期 | |
| `processed_at` | 日期 | |
| `retry_count` | 数字 | |
| `error_message` | 多行文本 | |
| `audit_trace_pointer` | 文本 | |

设计来源：`agents/inbox/README.md`

---

## 7. 建表操作清单

### Platform Team 接到这份文档后要做的：

- [ ] 1. 确认现有五张表字段是否与本文档一致（对照 §1-5）
- [ ] 2. **在 Submissions 表中新增 12 个 Agent 字段**（对照 §3 扩展字段表）
- [ ] 3. 创建 `AuditLogs` 表（对照 §6.1）
- [ ] 4. 创建 `InboxQueue` 表（对照 §6.2）
- [ ] 5. 更新 `FEISHU_AUDITLOGS_TABLE_ID` 和 `FEISHU_INBOX_TABLE_ID` 环境变量

### 关联文档

- 白皮书 §11 数据模型：`docs/technical-whitepaper-20260708.md`
- Agent Manifest：`agents/manifests/submission-task-agent.schema.json`
- Audit Log Schema：`agents/audit/audit-log-schema.md`
- Inbox 设计：`agents/inbox/README.md`
