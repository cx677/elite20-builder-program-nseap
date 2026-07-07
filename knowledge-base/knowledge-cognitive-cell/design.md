# Knowledge Cognitive Cell 精简设计

本文件提炼 PR #1 的 Knowledge Cognitive Cell 思路，形成适合主仓库合并的轻量版本。

## 一句话定义

Knowledge Cognitive Cell 是一个可被 Agent 调用的最小知识单元。它不是普通 Markdown 文档，而是带有 metadata、关系、使用场景和 Agent notes 的结构化知识资产。

## Cell 结构

```text
Knowledge Cognitive Cell
├── identity
├── content
├── metadata
├── relationships
├── retrieval hints
├── agent notes
├── review status
└── source evidence
```

## 最小字段

- `id`：稳定 ID，例如 `kb.feishu.forbidden.91403`
- `title`：标题
- `type`：知识类型
- `summary`：简短摘要
- `content`：正文
- `tags`：标签
- `source`：来源
- `related_challenges`：关联 Challenge
- `related_agents`：关联 Agent
- `review_status`：draft / reviewed / published / deprecated
- `agent_notes`：Agent 使用说明

## 工作流

```text
真实问题
→ 人工/Agent 记录解决过程
→ 生成 Knowledge Item
→ 补 metadata 和 tags
→ Peer Review
→ 发布到 Knowledge Base
→ Agent 检索调用
→ 新案例反哺更新
```

## 在 Elite20 中的用途

- 把飞书、GitHub、DeepSeek、Vercel 的踩坑变成可复用经验。
- 把优秀 C2S、C8、真实项目案例变成后续学生参考样例。
- 把 Prompt、Rubric、AAR 模板变成 Student Companion Agent 和 Review Task Agent 可调用资源。
- 把一次性项目经验沉淀为课程 OS 的长期资产。

