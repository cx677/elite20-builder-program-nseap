# Challenge Team

负责设计和整理所有 Builder Challenge，形成可复用的 Challenge Catalog。

## 当前成员

- 刘婷婷
- 史雨萱

## 核心任务（7.6 更新）

**重要变化**：Challenge 不只是"作业题"，还要包含 GitHub 提交规范、AAR 模板、Evidence Ledger 要求，以及 `teacher_agent_id`、`rubric_pointer` 等 Agent-native 字段。

每个 Challenge 要能：
1. 进入 Web App 和飞书
2. 说明交什么（交付物）、如何检查（GitHub 要求）、如何评价（Rubric）、如何进入作品集（Portfolio 条件）

## 本周最小交付

### 1. Challenge Catalog

- `challenge-catalog/README.md`（总览）
- `challenge-catalog/C2S.md`（C2S 挑战）
- `challenge-catalog/C8.md`（C8 挑战）
- 参考已有模板 `challenges/challenge-template.md`

每个 Challenge 文档必须包含以下内容：

```markdown
## 基本信息
- challenge_id
- title
- type (individual / team / red-team)
- difficulty (beginner / intermediate / advanced)
- estimated_hours
- teacher_agent_id （发布老师的 Agent ID，例如 teacher-companion-richard）
- status (draft / published / archived)

## 背景与目标
- 这个挑战来自什么真实场景
- 学习目标是什么
- 完成后学生能获得什么能力

## 交付物
- 必须提交的内容清单
- 每项内容的格式要求
- GitHub 目录结构要求

## GitHub 提交要求
- 仓库结构（必须有哪些文件）
- README.md 要求
- AI 使用日志要求
- 最新 commit 要求

## AAR（After Action Review）
- AAR 必须回答的问题
- AAR 格式要求

## Evidence Ledger
- 提交前检查清单（学生自查）
- 必须提供的证据文件

## Rubric（评分标准）
- rubric_pointer（指向 rubrics/ 目录下的具体文件）
- 各维度评分范围和标准

## 是否进入作品集
- 进入作品集的条件
- 作品集展示要求

## 与 Submission Task Agent 的接口
- 提交时必须包含的字段
- Submission Task Agent 如何校验本 Challenge 的提交
```

### 2. 默认 Rubric

- `rubrics/default-rubric.md`（更新为包含 Agent-native 要求）

默认 Rubric 维度：
- 问题理解（0-20）
- AI 使用（0-20）
- 产物完整性（0-20）
- 技术执行（0-20）
- 复盘质量（0-20）

### 3. 提交检查清单

- `submission-checklist.md`

学生提交前必须确认：
- [ ] GitHub 仓库存在且可访问
- [ ] README.md 存在且完整
- [ ] 有最近 24 小时内的 commit
- [ ] AAR 文档存在
- [ ] AI 使用日志存在
- [ ] 所有必须交付物已上传

## Challenge 与 Agent 的连接关系

```text
Challenge 发布
→ Teacher Companion Agent 发布（teacher_agent_id）
→ 飞书同步 Challenge Record
→ Student Companion Agent 获取 Challenge 信息

Challenge 提交
→ Student Companion Agent 发起 submission request
→ Submission Task Agent 按 Challenge 的 rubric_pointer 路由评审
→ Review Task Agent 按 Rubric 打分
```

这意味着每个 Challenge 文档要写清楚：
- `rubric_pointer`：指向哪个 Rubric 文件
- `teacher_agent_id`：哪位老师发布了这个 Challenge
- 哪些字段 Submission Task Agent 需要校验

## 一期 Challenge 整理范围

根据一期资料，需要整理的 Challenge 包括：

| Challenge ID | 名称 | 优先级 | 状态 |
|---|---|---|---|
| C2S | AI+X 范式精读、建言与复盘 | P0 | 已有真实案例（张浩） |
| C8 | 班级管理与工具链 | P0 | 需整理 |
| C1 | 课程资料翻译与整理 | P1 | 需整理 |
| C4 | Skill / Agent / 工具链 | P1 | 需整理 |
| C10 | 综合项目 | P1 | 需整理 |

## 与其他 Team 的接口

- **Agent Team**：提供每个 Challenge 的 `teacher_agent_id`、`rubric_pointer`
- **Platform Team**：Challenge 字段要与飞书表结构匹配（`teacher_agent_id`、`rubric_pointer` 字段）
- **Ontology Team**：Challenge Ontology 结构要能覆盖所有 Challenge 必要字段

## 验收标准

- [ ] C2S 和 C8 完整文档（含 Rubric、GitHub 要求、AAR 模板）
- [ ] 每个 Challenge 有 `teacher_agent_id` 和 `rubric_pointer`
- [ ] 提交检查清单可直接发给学生
- [ ] 默认 Rubric 可以被 Review Task Agent 直接引用

## 参考资料

- 已有模板：`challenges/challenge-template.md`
- 已有 Rubric 模板：`challenges/rubric-template.md`
- 已有示例：`challenges/sample-challenge-01.md`
- 任务规划：`docs/phase2-builder-task-plan.md`
