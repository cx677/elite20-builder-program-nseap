# Builder Team Roadmap（7.6 更新版）

更新时间：2026-07-06  
本文档与 `docs/phase2-builder-task-plan.md` 配套，说明七个 Builder Team 的职责划分、交付物、当前进展和协作接口。

---

## 核心背景变化（7.6 更新）

**旧方向**（7.3 前）：从零规划 7 个模块，分头整理材料。

**新方向**（7.6 后）：当前 Next.js + 飞书 + GitHub + DeepSeek 的 MVP 已跑通，下一步是把它升级为 Agent-native 架构。

七个 Team 的核心目标：

| Team | 核心目标 |
|---|---|
| Team 1 Curriculum | 定义课程目标和 Challenge 对应关系 |
| Team 2 Challenge | 整理 Challenge Catalog，升级 GitHub/AAR/Rubric 要求 |
| Team 3 Agent | 设计 4 个核心 Agent 的 Manifest、Inbox/Outbox、消息协议和审计链路 |
| Team 4 Ontology | 扩展 Ontology 覆盖 Agent 运行要素 |
| Team 5 Platform | 接手 MVP 代码，部署 Vercel，重构为 Agent-native 工作流 |
| Team 6 Knowledge | 沉淀 MVP 调试经验和真实案例 |
| Team 7 Demo | 制作 3 分钟演示脚本和群内同步文案 |

---

## 七个 Builder Team

| Team | 职责 | 主要文件夹 | 当前成员 | 本周最小交付 |
|---|---|---|---|---|
| Team 1 Curriculum | 重新设计课程 | `teams/curriculum-team/` | 张浩（牵头） | syllabus/README.md, learning-objectives.md, weekly-plan/week-01.md, course-to-challenge-map.md |
| Team 2 Challenge | 设计所有 Challenge | `teams/challenge-team/` | 刘婷婷、史雨萱 | challenge-catalog/C2S.md, C8.md, rubrics/default-rubric.md, submission-checklist.md |
| Team 3 Agent | 开发课程 Agent 架构 | `teams/agent-team/` | 冯静雯、张照航、陈万康 | 4 个 Agent Manifest, Message Envelope, Inbox/Outbox 设计, Audit Log Schema |
| Team 4 Ontology | 建立本体和知识图谱 | `teams/ontology-team/` | Richard（方向），张浩（落地） | agent-ontology.md, relationship-graph-schema.md, message-envelope-schema.md, resource-config-schema.md |
| Team 5 Platform | 平台开发与部署 | `teams/platform-team/` | 吴嘉宇、牛保康，张浩（handoff） | Vercel 部署，feishu-setup-guide.md，github-integration.md，agent-workflow-refactor-plan.md |
| Team 6 Knowledge | 整理可复用知识 | `teams/knowledge-team/` | 尹镇宇 | prompt-library/README.md, best-practices/feishu-setup.md, case-studies/c2s-zhanghao.md |
| Team 7 Demo | 准备演示与传播 | `teams/demo-team/` | 张浩 | demo-script.md, progress-update-for-group.md |

---

## 各 Team 文件夹说明

### teams/curriculum-team/

课程体系相关材料。

```
curriculum-team/
├── README.md (本文档，含当前任务和进展)
├── syllabus/
│   ├── README.md (课程总览)
│   └── design-principles.md
├── weekly-plan/
│   └── week-01.md
├── learning-objectives.md
└── course-to-challenge-map.md
```

### teams/challenge-team/

Challenge 设计和 Rubric。

```
challenge-team/
├── README.md (本文档，含当前任务和进展)
├── challenge-catalog/
│   ├── README.md
│   ├── C2S.md
│   └── C8.md
├── rubrics/
│   └── default-rubric.md
└── submission-checklist.md
```

### teams/agent-team/

Agent 架构和实现。

```
agent-team/
├── README.md (本文档，含当前任务和进展)
└── (与 agents/ 顶级目录协同使用)

agents/ (顶级目录，共享 Agent 设计文档)
├── agent-collaboration-flow.md (更新为7.6版本)
├── manifests/
│   ├── student-companion-agent.schema.json
│   ├── teacher-companion-agent.schema.json
│   ├── submission-task-agent.schema.json
│   └── review-task-agent.schema.json
├── messages/
│   ├── message-envelope-schema.md
│   └── challenge_submission_request.schema.json
├── inbox/
│   └── README.md
└── audit/
    └── audit-log-schema.md
```

### teams/ontology-team/

Ontology 文档。

```
ontology-team/
├── README.md (本文档，含当前任务和进展)
└── (与 ontology/ 顶级目录协同使用)

ontology/ (顶级目录，共享 Ontology 文档)
├── course-ontology.md
├── skill-ontology.md
├── challenge-ontology.md
├── project-ontology.md
├── assessment-ontology.md
├── agent-ontology.md (新增，7.6版本)
├── relationship-graph-schema.md (待创建)
├── message-envelope-schema.md (待创建)
└── resource-config-schema.md (待创建)
```

### teams/platform-team/

平台开发文档。

```
platform-team/
├── README.md (本文档，含当前任务和进展，已更新为7.6版本)
├── current-mvp-status.md (待创建)
├── deployment/
│   └── vercel-guide.md (待创建)
├── feishu/
│   └── feishu-setup-guide.md (待创建)
├── github/
│   └── github-integration.md (待创建)
└── agent-workflow-refactor-plan.md (待创建)
```

### teams/knowledge-team/

知识库文档。

```
knowledge-team/
├── README.md (本文档，含当前任务和进展)
└── (与 knowledge-base/ 顶级目录协同使用)

knowledge-base/
├── README.md (待创建)
├── prompt-library/ (待创建)
├── best-practices/ (待创建)
├── case-studies/ (待创建)
└── faq/
    └── README.md (已有)
```

### teams/demo-team/

Demo 和演示材料。

```
demo-team/
├── README.md (本文档，含当前任务和进展)
├── presentation/
│   └── demo-script.md (待创建)
├── demo-video/
│   └── storyboard.md (待创建)
└── progress-update-for-group.md (待创建)
```

---

## 如何连接 Team 工作与主仓库

```text
Team 产出
→ Challenge / Skill / Agent / Ontology / Knowledge
→ GitHub PR 提交
→ Peer Review（其他 Team 交叉 Review）
→ 合并到主分支
→ 进入知识库沉淀
→ 通过 Release 展示
```

---

## 最小 Team README 要求

每个 Team 目录必须维护一个 `README.md`，包含：

1. Team 目标（一句话）
2. 当前成员列表
3. 本周最小交付清单（打勾状态）
4. 提交链接（PR 或文件路径）
5. Review 状态
6. 下一步计划

---

## GitHub 提交规范

### 文档/模板/方案类

直接提交到主仓库对应 Team 文件夹：

```text
teams/challenge-team/challenge-catalog/C2S.md
teams/ontology-team/agent-ontology/README.md
teams/knowledge-team/prompt-library/aar-template.md
```

### 独立可运行项目

可以自己建工作仓库，但必须在主仓库登记：

```markdown
## 外部项目登记

| 字段 | 内容 |
|---|---|
| 项目名称 | ... |
| 负责人 / 成员 | ... |
| 仓库链接 | ... |
| Demo 链接 | ... |
| 当前状态 | ... |
| 和 NSEAP 的关系 | ... |
| Review 状态 | ... |
| 下一步计划 | ... |
```

---

## 当前已外部项目（需登记）

| 项目 | 仓库 | 状态 | 负责人 |
|---|---|---|---|
| AI+X Challenge Learning MVP | `ai-x-challenge-learning-mvp` | 本地运行，待部署 | 张浩 |
| 智引 AI 导航导师 | `zhiyin-ai-navigator` | 已测试，已写入飞书 | 张浩 |
| 张浩 C2S 提交 | `zhanghao-c2s-ai-x-paradigm-submission` | 已提交，已写入飞书 | 张浩 |

---

## 参考资料

- 任务规划（7.6 版）：`docs/phase2-builder-task-plan.md`
- GitHub 提交指南：`teams/github-submission-guide.md`
- Agent 协作流程：`agents/agent-collaboration-flow.md`
- Agent Ontology：`ontology/agent-ontology.md`
