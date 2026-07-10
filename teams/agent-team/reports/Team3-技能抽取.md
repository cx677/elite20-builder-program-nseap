# Team 3 技能抽取（Skill Extraction）— 10 Skill + I/O + 调用图

> 从 `Team3-语义模块抽取.md` §2.6 抽取 10 个 MVP 首批 Skill，补充：
> - 完整 I/O Schema（JSON Schema 形式）
> - 关联 Task Agent
> - 关联 Ontology 概念
> - 关联流程步骤
> - 关联红线
> - 调用图（Skill 之间如何串联）

---

## 目录

- [0. Skill 抽取范围](#0-skill-抽取范围)
- [1. Skill 抽取元数据模式](#1-skill-抽取元数据模式)
- [2. 10 个 Skill 详表](#2-10-个-skill-详表)
  - [2.1 SK-01 ExcelImportSkill](#21-sk-01-excelimportskill)
  - [2.2 SK-02 FeishuSetupSkill](#22-sk-02-feishusetupskill)
  - [2.3 SK-03 PersonalOKFSkill](#23-sk-03-personalokfskill)
  - [2.4 SK-04 ChallengeCreationSkill](#24-sk-04-challengecreationskill)
  - [2.5 SK-05 GitHubArtifactSkill](#25-sk-05-githubartifactskill)
  - [2.6 SK-06 AARSkill](#26-sk-06-aarskill)
  - [2.7 SK-07 SelfEvaluationSkill](#27-sk-07-selfevaluationskill)
  - [2.8 SK-08 PortfolioSubmissionSkill](#28-sk-08-portfoliosubmissionskill)
  - [2.9 SK-09 FeishuSubmissionSkill](#29-sk-09-feishusubmissionskill)
  - [2.10 SK-10 RubricEvaluationSkill](#210-sk-10-rubricevaluationskill)
- [3. Skill 调用图](#3-skill-调用图)
- [4. Skill 与 Task Agent 绑定](#4-skill-与-task-agent-绑定)
- [5. Skill 与 Ontology 概念绑定](#5-skill-与-ontology-概念绑定)
- [6. Skill 抽取统计](#6-skill-抽取统计)

---

## 0. Skill 抽取范围

来源：`Team3-语义模块抽取.md` §2.6.1 + `Team3-语义模块抽取.md` §2.1.7

| 抽象类型 | 具体 Skill | 数量 |
|---|---|---:|
| FeishuSkill | ExcelImport, FeishuSetup, PortfolioSubmission, FeishuSubmission | 4 |
| GitHubSkill | GitHubArtifact | 1 |
| OKFSkill | PersonalOKF | 1 |
| ChallengeSkill | ChallengeCreation | 1 |
| AARSkill | AAR | 1 |
| EvaluationSkill | SelfEvaluation, RubricEvaluation | 2 |
| **总计** | | **10** |

---

## 1. Skill 抽取元数据模式

```yaml
Skill:
  skill_id: SK-{NN}              # 唯一 ID
  skill_name: string             # PascalCase
  中文标签: string                # 中文标签
  abstract_type: string          # 6 大抽象类型之一
  description: string            # 描述

  input_schema: object           # JSON Schema 形式
  output_schema: object          # JSON Schema 形式
  required_context: string[]     # 所需上下文（如 student_id）
  required_permissions: string[] # 所需权限
  linked_task_agent: string      # 关联 Task Agent
  linked_ontology: string[]      # 关联本体概念

  evaluation_rubric: string      # 评价 Rubric
  action_plan: string            # 行动方案
  constraints: object            # 约束
  learning_signals: object       # 学习信号

  关联流程步骤: string[]          # P1/P2/P3/P4 中
  关联红线: string[]              # RED-001..010
  来源: string                   # [S2] §六
```

---

## 2. 10 个 Skill 详表

### 2.1 SK-01 ExcelImportSkill

```yaml
skill_id: SK-01
skill_name: ExcelImportSkill
中文标签: Excel 导入技能
abstract_type: FeishuSkill
description: 管理员上传学生 Excel，解析后导入飞书 Students 表

input_schema:
  type: object
  properties:
    file_path:
      type: string
      description: 学生 Excel 文件路径（feishu 共享盘 URL）
    cohort_id:
      type: string
      description: 班级 ID
    admin_user_id:
      type: string
      description: 管理员飞书 ID
  required: [file_path, cohort_id, admin_user_id]

output_schema:
  type: object
  properties:
    imported_students:
      type: array
      items:
        type: object
        properties:
          student_id: string
          name: string
          school: string
          major: string
          feishu_id: string
          github_username: string
    failed_rows:
      type: array
      items: integer
    feishu_record_ids:
      type: array
      items: string

required_context:
  - admin_user_id
  - cohort_id
  - FeishuResource (tenant_id, student_table_id)

required_permissions:
  - feishu.students.read
  - feishu.students.write
  - file.read

linked_task_agent: CourseSetupAgent
linked_ontology:
  - :Learner
  - :Cohort
  - :FeishuResource

evaluation_rubric: |
  数据完整性 0-30：
    - 所有必填字段非空
    - email/github/feishu 格式正确
  导入成功率 0-40：
    - 成功行数 / 总行数 ≥ 95%
  性能 0-30：
    - 1000 行数据 ≤ 30 秒

action_plan: |
  1. 读取 Excel 文件
  2. 解析为 JSON 数组
  3. 数据校验（格式、必填项）
  4. 批量调用飞书 API 写入
  5. 返回导入结果

constraints:
  max_file_size: 10MB
  max_rows: 1000
  retry_on_failure: 3
  atomicity: all_or_nothing

learning_signals:
  ΔR_failure_rate: 失败行数 / 总行数
  ΔR_speed: rows/sec
  ΔR_format_issues: 每 1000 行格式错误数

关联流程步骤: P1-01, P1-02
关联红线: (无)
来源: [S2] §六
```

### 2.2 SK-02 FeishuSetupSkill

```yaml
skill_id: SK-02
skill_name: FeishuSetupSkill
中文标签: 飞书初始化技能
abstract_type: FeishuSkill
description: 为新班级创建飞书课程空间，包括 5 张表（Students/Courses/Challenges/Submissions/Evaluations）

input_schema:
  type: object
  properties:
    course_id: string
    cohort_id: string
    teacher_id: string
    admin_user_id: string
  required: [course_id, cohort_id, teacher_id, admin_user_id]

output_schema:
  type: object
  properties:
    course_table_id: string
    challenge_table_id: string
    submission_table_id: string
    evaluation_table_id: string
    portfolio_table_id: string
    wiki_url: string
    feishu_group_id: string

required_context:
  - FeishuResource (tenant_id, user_id)
  - 管理员权限
  - 飞书应用 App ID/Secret

required_permissions:
  - feishu.app.create
  - feishu.tables.create
  - feishu.wiki.create
  - feishu.group.create

linked_task_agent: CourseSetupAgent
linked_ontology:
  - :Course
  - :Challenge
  - :Submission
  - :Evaluation
  - :Portfolio
  - :FeishuResource

evaluation_rubric: |
  完整性 0-50：5 张表都创建成功
  一致性 0-30：表之间外键关系正确
  权限 0-20：教师有读写权限，学生有相应权限

action_plan: |
  1. 飞书应用创建课程空间
  2. 创建 5 张表结构（带 schema）
  3. 创建 Wiki 主页
  4. 创建班级群
  5. 设置权限矩阵

constraints:
  tables_must_have_audit_columns: [created_at, updated_at, created_by]
  wiki_must_have_navigation: true

learning_signals:
  ΔR_setup_time: 总耗时
  ΔR_table_count: 成功创建的表数
  ΔR_permission_issues: 权限配置错误数

关联流程步骤: P1-02, P1-03
关联红线: RED-008 (审计字段)
来源: [S2] §六
```

### 2.3 SK-03 PersonalOKFSkill

```yaml
skill_id: SK-03
skill_name: PersonalOKFSkill
中文标签: 个人 OKF 初始化技能
abstract_type: OKFSkill
description: 为每个学生初始化个人 OKF（Open Knowledge Format）目录

input_schema:
  type: object
  properties:
    student_id: string
    feishu_id: string
    github_username: string
    cohort_id: string
    template_path: string
  required: [student_id, feishu_id, github_username, cohort_id]

output_schema:
  type: object
  properties:
    okf_path: string
    okf_files:
      type: array
      items: string
    commit_sha: string

required_context:
  - GitHubResource (personal_repo)
  - OKF 模板路径
  - 学生班级信息

required_permissions:
  - github.repo.write
  - github.contents.write

linked_task_agent: CompanionSetupAgent
linked_ontology:
  - :PersonalOntology
  - :OKF
  - :Learner

evaluation_rubric: |
  完整性 0-40：9 个 .md 文件全部生成
  内容 0-30：profile.yaml 字段 ≥ 8 个
  一致性 0-30：与飞书 Students 表字段一致

action_plan: |
  1. 从模板复制 9 个文件
  2. 用学生信息填充 profile.yaml
  3. 提交到 GitHub personal_repo
  4. 触发初始 commit
  5. 返回 OKF 路径

constraints:
  template_version: "1.0"
  min_files: 9
  commit_message: "[init] Personal OKF for {student_id}"

learning_signals:
  ΔR_init_time: 单个学生初始化耗时
  ΔR_template_drift: 与模板偏差
  ΔR_subsequent_updates: 后续更新次数

关联流程步骤: P1-04
关联红线: (无)
来源: [S2] §六
```

### 2.4 SK-04 ChallengeCreationSkill

```yaml
skill_id: SK-04
skill_name: ChallengeCreationSkill
中文标签: 挑战创建技能
abstract_type: ChallengeSkill
description: 教师创建 Challenge 记录，同步到飞书 + GitHub

input_schema:
  type: object
  properties:
    teacher_id: string
    course_id: string
    title: string
    description: string
    learning_objectives: array (string)
    skills: array (string)
    required_deliverables: array (string)
    rubric_id: string
    due_date: datetime
  required: [teacher_id, course_id, title, rubric_id, due_date]

output_schema:
  type: object
  properties:
    challenge_id: string
    feishu_record_id: string
    github_issue_url: string
    status: string  # draft

required_context:
  - 飞书 Courses 表
  - 教师 GitHub org
  - Rubric Library

required_permissions:
  - feishu.challenges.write
  - github.issues.write

linked_task_agent: ChallengeCreationAgent
linked_ontology:
  - :Challenge
  - :Course
  - :Rubric
  - :LearningObjective
  - :Skill

evaluation_rubric: |
  完整性 0-50：所有字段填写
  关联性 0-30：rubric + skills + objectives 关联正确
  可读性 0-20：description 结构清晰

action_plan: |
  1. 校验所有必填字段
  2. 写入飞书 Challenges 表
  3. 在 GitHub 创建 issue
  4. 返回 challenge_id + status=draft

constraints:
  rubric_must_exist: true
  due_date_must_be_future: true
  max_skills_per_challenge: 5

learning_signals:
  ΔR_creation_time: 单个 Challenge 创建耗时
  ΔR_revision_count: 教师修改次数
  ΔR_completion_rate: 学生完成率

关联流程步骤: P1-06, P2A-02, P2A-03
关联红线: RED-008
来源: [S2] §六
```

### 2.5 SK-05 GitHubArtifactSkill

```yaml
skill_id: SK-05
skill_name: GitHubArtifactSkill
中文标签: GitHub 产物管理技能
abstract_type: GitHubSkill
description: 把学生的项目代码、README、AAR 等产物提交到 GitHub 仓库

input_schema:
  type: object
  properties:
    student_id: string
    challenge_id: string
    artifact_type: string  # GitHubRepo, README, Demo, etc.
    files: array (object)
    commit_message: string
  required: [student_id, challenge_id, artifact_type, files, commit_message]

output_schema:
  type: object
  properties:
    repo_url: string
    branch: string
    commit_sha: string
    files_committed: array (string)

required_context:
  - GitHubResource (username, personal_repo, artifact_repo_root)
  - Student Companion Agent

required_permissions:
  - github.repo.write
  - github.contents.write
  - github.actions.trigger

linked_task_agent: GitHubArtifactAgent
linked_ontology:
  - :Artifact
  - :SubmissionArtifact
  - :GitHubResource
  - :Learner
  - :Challenge

evaluation_rubric: |
  完整性 0-40：所有文件成功提交
  一致性 0-30：commit message 规范
  性能 0-30：单次 commit 耗时 ≤ 5s

action_plan: |
  1. 校验文件存在 + 格式
  2. 创建/切换 branch
  3. 提交文件
  4. 创建 commit
  5. 返回 commit info

constraints:
  max_files_per_commit: 50
  max_file_size: 5MB
  commit_message_format: "[{challenge_id}] {action}: {description}"

learning_signals:
  ΔR_commit_time: 单次 commit 耗时
  ΔR_commit_frequency: 学生每天 commit 次数
  ΔR_file_quality: 文件格式错误数

关联流程步骤: P1-09
关联红线: (无)
来源: [S2] §六
```

### 2.6 SK-06 AARSkill

```yaml
skill_id: SK-06
skill_name: AARSkill
中文标签: 复盘生成技能
abstract_type: AARSkill
description: 基于 Challenge 完成情况自动生成 After Action Review 文档

input_schema:
  type: object
  properties:
    student_id: string
    challenge_id: string
    task: string  # Challenge 任务描述
    expected_result: string
    actual_result: string
    commit_log: array (object)  # GitHub commit 历史
  required: [student_id, challenge_id, task, expected_result, actual_result]

output_schema:
  type: object
  properties:
    aar_id: string
    aar_path: string  # OKF 下的 aar/ 路径
    sections:
      type: object
      properties:
        what_worked: string
        what_failed: string
        lesson_learned: string
        skill_update: string
        memory_update: string
        next_action: string
    confidence_score: float  # AI 对生成内容的确信度

required_context:
  - 飞书 Challenge 元数据
  - GitHub commit log
  - Student 过去的 AAR

required_permissions:
  - feishu.aar.write
  - github.contents.write
  - okf.write

linked_task_agent: AARAgent
linked_ontology:
  - :AAR
  - :Challenge
  - :Learner
  - :Skill

evaluation_rubric: |
  内容质量 0-40：6 个 section 都有内容且具体
  反思深度 0-30：lesson_learned 有可迁移性
  可读性 0-20：结构清晰
  自动化 0-10：人工修改 ≤ 30%

action_plan: |
  1. 收集 commit log + 飞书 metadata
  2. 调用 LLM 生成 6 个 section
  3. 写入 aar/{challenge_id}.md
  4. 更新 PersonalOntology
  5. 返回 aar_path

constraints:
  min_sections: 6
  max_length: 2000字
  min_confidence: 0.6

learning_signals:
  ΔR_aar_quality: 人工评分（1-5）
  ΔR_aar_action_rate: next_action 后续执行率
  ΔR_skill_update: skill_update 触发的本体节点更新数

关联流程步骤: P1-10
关联红线: (无)
来源: [S2] §六
```

### 2.7 SK-07 SelfEvaluationSkill

```yaml
skill_id: SK-07
skill_name: SelfEvaluationSkill
中文标签: 自评技能
abstract_type: EvaluationSkill
description: 学生根据 Rubric 对自己的提交进行自评

input_schema:
  type: object
  properties:
    student_id: string
    submission_id: string
    rubric_id: string
    self_assessment:
      type: object
      description: 每维度的学生自评
  required: [student_id, submission_id, rubric_id, self_assessment]

output_schema:
  type: object
  properties:
    self_evaluation_id: string
    scores:
      type: object
      description: 每维度分数
    total_score: float
    confidence: float
    reflection: string

required_context:
  - Rubric 元数据
  - 学生提交内容
  - 过去自评历史

required_permissions:
  - feishu.evaluations.write
  - ai.evaluate

linked_task_agent: SelfEvaluationAgent
linked_ontology:
  - :Rubric
  - :Evaluation
  - :Submission
  - :Learner

evaluation_rubric: |
  评分准确度 0-50：自评分 vs AI 评分的 Pearson 相关系数 ≥ 0.6
  反思深度 0-30：reflection 体现自我认知
  行动性 0-20：包含后续改进计划

action_plan: |
  1. 读取 Rubric 维度
  2. 让学生填写每维度分数
  3. AI 给出参考分
  4. 学生确认或调整
  5. 写入飞书 Evaluations 表

constraints:
  min_confidence: 0.5
  auto_grade_threshold: 0.9  # AI 确信度 ≥ 90% 时自动评分

learning_signals:
  ΔR_self_ai_correlation: 自评 vs AI 相关性
  ΔR_confidence_calibration: AI 置信度校准
  ΔR_reflection_depth: 反思深度评分

关联流程步骤: P1-11
关联红线: (无)
来源: [S2] §六
```

### 2.8 SK-08 PortfolioSubmissionSkill

```yaml
skill_id: SK-08
skill_name: PortfolioSubmissionSkill
中文标签: 作品集提交技能
abstract_type: FeishuSkill
description: 把学生的 accepted 提交更新到作品集

input_schema:
  type: object
  properties:
    student_id: string
    submission_id: string
    visibility: string  # public | private
  required: [student_id, submission_id]

output_schema:
  type: object
  properties:
    portfolio_id: string
    portfolio_item_id: string
    portfolio_url: string

required_context:
  - 飞书 PortfolioItems 表
  - Submission = accepted

required_permissions:
  - feishu.portfolio_items.write
  - github.pages.deploy  # 可选

linked_task_agent: PortfolioSubmissionAgent
linked_ontology:
  - :Portfolio
  - :Submission
  - :Learner

evaluation_rubric: |
  完整性 0-50：包含所有 accepted 提交
  性能 0-30：单次更新 ≤ 2s
  可用性 0-20：portfolio_url 可访问

action_plan: |
  1. 校验 submission.status = accepted
  2. 写入飞书 PortfolioItems 表
  3. （可选）部署 GitHub Pages
  4. 返回 portfolio_url

constraints:
  submission_must_be_accepted: true
  max_items_per_student: 100

learning_signals:
  ΔR_portfolio_visits: 作品集访问量
  ΔR_showcase_rate: 公开率
  ΔR_refresh_rate: 更新频率

关联流程步骤: P1-13, P2D-04
关联红线: RED-001 (仅 Submission Task 调用)
来源: [S2] §六
```

### 2.9 SK-09 FeishuSubmissionSkill

```yaml
skill_id: SK-09
skill_name: FeishuSubmissionSkill
中文标签: 飞书提交技能
abstract_type: FeishuSkill
description: 把学生提交的所有数据写入飞书 Submissions 表

input_schema:
  type: object
  properties:
    challenge_id: string
    student_id: string
    submitted_files: array (string)
    github_repo: string
    github_branch: string
    github_commit: string
    self_reflection: string
    skills_used: array (string)
  required: [challenge_id, student_id, submitted_files, github_repo]

output_schema:
  type: object
  properties:
    submission_id: string
    feishu_record_id: string
    status: string  # submitted

required_context:
  - FeishuResource (submission_table_id)
  - 飞书 Submissions 表

required_permissions:
  - feishu.submissions.write

linked_task_agent: ChallengeSubmissionAgent
linked_ontology:
  - :Submission
  - :Challenge
  - :Learner
  - :FeishuResource

evaluation_rubric: |
  完整性 0-50：所有字段写入
  性能 0-30：单次提交 ≤ 1s
  一致性 0-20：与 GitHub commit 关联

action_plan: |
  1. 校验输入
  2. 写入飞书 Submissions 表
  3. 返回 submission_id

constraints:
  atomicity: all_or_nothing
  max_files: 50
  status_default: submitted

learning_signals:
  ΔR_submission_speed: 提交耗时
  ΔR_submission_quality: 提交物完整度
  ΔR_resubmission_rate: 重新提交率

关联流程步骤: P1-12, P2B-04
关联红线: RED-002 (Student Companion 不能直接调用，必须经 Submission Task), RED-005
来源: [S2] §六
```

### 2.10 SK-10 RubricEvaluationSkill

```yaml
skill_id: SK-10
skill_name: RubricEvaluationSkill
中文标签: 评分技能
abstract_type: EvaluationSkill
description: 根据 Rubric 对提交进行自动评分

input_schema:
  type: object
  properties:
    submission_id: string
    rubric_id: string
    submission_artifact: object
  required: [submission_id, rubric_id, submission_artifact]

output_schema:
  type: object
  properties:
    evaluation_id: string
    scores:
      type: object
      description: 每维度分数
    total_score: float
    feedback: string
    strengths: array (string)
    weaknesses: array (string)
    suggestions: array (string)
    confidence: float

required_context:
  - Rubric 元数据
  - 提交物全文
  - 飞书 Evaluations 表

required_permissions:
  - feishu.evaluations.write
  - ai.evaluate

linked_task_agent: RubricEvaluationAgent
linked_ontology:
  - :Rubric
  - :Evaluation
  - :Submission
  - :Artifact

evaluation_rubric: |
  评分一致性 0-50：与人工评分的相关系数 ≥ 0.7
  反馈质量 0-30：可操作性 + 建设性
  性能 0-20：单次评分 ≤ 10s

action_plan: |
  1. 读取 Rubric 维度
  2. 读取 Submission 产物
  3. LLM 评分（每维度）
  4. 生成 strengths/weaknesses/suggestions
  5. 写入飞书 Evaluations 表

constraints:
  max_score_per_dimension: 100
  min_confidence: 0.6
  human_review_threshold: 0.7  # 评分 < 70% 需人工复核

learning_signals:
  ΔR_eval_accuracy: 评分准确度
  ΔR_human_ai_correlation: 人机评分相关性
  ΔR_feedback_actionability: 反馈可操作性评分

关联流程步骤: P2C-02
关联红线: (无)
来源: [S2] §六
```

---

## 3. Skill 调用图

### 3.1 MVP 闭环 Skill 调用链

```text
P1-01 ExcelImport
   │
   └→ SK-01 ExcelImportSkill
   │
   ↓ (输出: imported_students)
P1-02 ImportFeishu
   │
   └→ SK-02 FeishuSetupSkill
   │
   ↓ (输出: 飞书 5 张表)
P1-03 CreateCourseSpace
   │ (与 P1-02 共享 SK-02)
P1-04 InitPersonalOKF
   │
   └→ SK-03 PersonalOKFSkill
   │
   ↓ (输出: OKF 目录)
P1-05 StartStudentRaymond
   │ (无需 Skill)
P1-06 CreateChallenge
   │
   └→ SK-04 ChallengeCreationSkill
   │
   ↓ (输出: challenge_id)
P1-07 ReceiveChallenge
   │ (无需 Skill)
P1-08 DoProject
   │ (无需 Skill)
P1-09 SaveArtifact
   │
   └→ SK-05 GitHubArtifactSkill
   │
   ↓ (输出: commit_sha)
P1-10 GenerateAAR
   │
   └→ SK-06 AARSkill
   │
   ↓ (输出: aar_path)
P1-11 SelfEvaluate
   │
   └→ SK-07 SelfEvaluationSkill
   │
   ↓ (输出: self_evaluation_id)
P1-12 SubmitToFeishu
   │
   └→ SK-09 FeishuSubmissionSkill
   │
   ↓ (输出: submission_id)
P1-13 UpdatePortfolio
   │
   └→ SK-08 PortfolioSubmissionSkill
   │
   ↓ (输出: portfolio_url)
```

### 3.2 评审流程 Skill 调用链

```text
P2C-01 SubmissionTaskRoute
   │ (无需 Skill)
P2C-02 ReviewTaskEvaluate
   │
   └→ SK-10 RubricEvaluationSkill
   │
   ↓ (输出: scores + feedback)
P2C-03 SendReviewResult
   │ (无需 Skill)
P2C-04 SubmissionTaskFeedback
   │ (无需 Skill)
```

### 3.3 完整 Skill 调用图（节点 + 边）

```text
节点（10 个 Skill）:
  SK-01 ExcelImportSkill
  SK-02 FeishuSetupSkill
  SK-03 PersonalOKFSkill
  SK-04 ChallengeCreationSkill
  SK-05 GitHubArtifactSkill
  SK-06 AARSkill
  SK-07 SelfEvaluationSkill
  SK-08 PortfolioSubmissionSkill
  SK-09 FeishuSubmissionSkill
  SK-10 RubricEvaluationSkill

边（调用关系）:
  SK-01 → SK-02
  SK-02 → SK-03
  SK-04 → SK-09      (创建 Challenge 后才能提交)
  SK-05 → SK-06      (提交代码后才能做 AAR)
  SK-06 → SK-07      (AAR 完成后才能自评)
  SK-07 → SK-09      (自评完成后才能提交)
  SK-09 → SK-08      (accepted 后才能更新作品集)
  SK-10 → (Feedback)  (独立，分支路径)

调用顺序:
  ExcelImport → FeishuSetup → PersonalOKF
  ChallengeCreation
  → GitHubArtifact → AAR → SelfEvaluate → FeishuSubmit → Portfolio
  → RubricEvaluate (并行/分支)
```

---

## 4. Skill 与 Task Agent 绑定

| Skill | 关联 Task Agent | 优先级 |
|---|---|---|
| SK-01 ExcelImportSkill | CourseSetupAgent | P1 |
| SK-02 FeishuSetupSkill | CourseSetupAgent | P1 |
| SK-03 PersonalOKFSkill | CompanionSetupAgent | P1 |
| SK-04 ChallengeCreationSkill | ChallengeCreationAgent | P1 |
| SK-05 GitHubArtifactSkill | GitHubArtifactAgent | P1 |
| SK-06 AARSkill | AARAgent | P1 |
| SK-07 SelfEvaluationSkill | SelfEvaluationAgent | P1 |
| SK-08 PortfolioSubmissionSkill | PortfolioSubmissionAgent | P1 |
| SK-09 FeishuSubmissionSkill | ChallengeSubmissionAgent | P1 |
| SK-10 RubricEvaluationSkill | RubricEvaluationAgent | P1 |

**统计**：10 个 Skill 1:1 绑定 10 个 Task Agent（虽然仓库还未出这些 Task Agent 的 Manifest）

---

## 5. Skill 与 Ontology 概念绑定

| Skill | 关联 Ontology 概念 | 数量 |
|---|---|---:|
| SK-01 | :Learner, :Cohort, :FeishuResource | 3 |
| SK-02 | :Course, :Challenge, :Submission, :Evaluation, :Portfolio, :FeishuResource | 6 |
| SK-03 | :PersonalOntology, :OKF, :Learner | 3 |
| SK-04 | :Challenge, :Course, :Rubric, :LearningObjective, :Skill | 5 |
| SK-05 | :Artifact, :SubmissionArtifact, :GitHubResource, :Learner, :Challenge | 5 |
| SK-06 | :AAR, :Challenge, :Learner, :Skill | 4 |
| SK-07 | :Rubric, :Evaluation, :Submission, :Learner | 4 |
| SK-08 | :Portfolio, :Submission, :Learner | 3 |
| SK-09 | :Submission, :Challenge, :Learner, :FeishuResource | 4 |
| SK-10 | :Rubric, :Evaluation, :Submission, :Artifact | 4 |

**统计**：10 个 Skill 共引用 14 个 Ontology 概念

---

## 6. Skill 抽取统计

| 指标 | 数量 |
|---|---:|
| Skill 总数 | 10 |
| 抽象类型 | 6 |
| 必做 P0 | 10（全部 MVP 必需）|
| ✅ 已实现 | 0 |
| ⚠️ 部分实现 | 0 |
| ❌ 未实现 | 10（**全部未出 Manifest**）|

### 6.1 关键洞察

1. **10 个 Skill 全部未实现 Manifest**——这是 Team 3 的 P0 缺口
2. **6 个抽象类型 vs 10 个具体 Skill**——可以先生成抽象类型
3. **Skill 调用图呈线性**（除 RubricEvaluation 独立）
4. **3 条红线涉及 Skill**（RED-001/002/005）
5. **每个 Skill 都有 1:1 的 Task Agent 绑定**——但 10 个 Task Agent 也都未出

### 6.2 Skill 模板生成

10 个 Skill 都可以用以下模板批量生成：

```typescript
// packages/skills/src/{skill_name}/index.ts
import { Skill, SkillInput, SkillOutput } from '@team3/skill-sdk';

export interface {SkillName}Input extends SkillInput {
  // 从 input_schema 字段
}

export interface {SkillName}Output extends SkillOutput {
  // 从 output_schema 字段
}

export const {skillName}Skill: Skill<{SkillName}Input, {SkillName}Output> = {
  skillId: 'SK-{NN}',
  skillName: '{SkillName}',
  abstractType: '{AbstractType}',
  description: '{description}',

  requiredContext: [...],
  requiredPermissions: [...],

  async execute(input: {SkillName}Input, context): Promise<{SkillName}Output> {
    // action_plan 实现
  },

  evaluationRubric: {...},
  constraints: {...},
};
```

### 6.3 落地建议

1. **先出 6 个抽象类型**（FeishuSkill / GitHubSkill / OKFSkill / ChallengeSkill / AARSkill / EvaluationSkill）的 Manifest
2. **再批量出 10 个具体 Skill**（每个调用抽象类型）
3. **每个 Skill 落到 TypeScript Zod schema**（用 input_schema / output_schema 自动生成）
4. **每个 Skill 配 e2e 测试**（用 evaluation_rubric）
5. **10 个 Skill 落到 packages/skills/src/**（monorepo 模式）
