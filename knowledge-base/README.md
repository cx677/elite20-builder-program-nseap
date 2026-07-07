# Knowledge Base

Team 6 负责把一期和二期产生的资料、Prompt、AI 日志、优秀作业、踩坑记录和评审规则沉淀成可复用知识资产。

本目录吸收 PR #1 中 Knowledge Cognitive Cell MVP 的核心思路，但只保留主仓库需要的精华结构，不合入重复工程目录、根目录资料包、截图、上传文件和可再生成产物。

## 目标

知识库不是文件堆，而是 Agent 可引用的结构化资产。

```text
Question / Situation
→ Knowledge Item
→ Metadata
→ Prompt / Best Practice / Case
→ Agent Retrieval
→ Workflow Improvement
```

## 目录

```text
knowledge-base/
├── README.md
├── prompt-library/
├── best-practices/
├── case-studies/
├── knowledge-cognitive-cell/
├── schemas/
└── templates/
```

## 最小知识条目要求

每条知识建议包含：

- `id`：稳定 ID
- `title`：标题
- `type`：faq / prompt / best_practice / case_study / rubric / agent_note
- `summary`：一句话说明
- `tags`：检索标签
- `source`：来自哪个 Challenge、PR、会议或实际调试
- `agent_notes`：Agent 使用时要注意什么
- `related_assets`：相关 GitHub、飞书、文档或作品链接

## 与 Agent 的连接

- Student Companion Agent：读取 Prompt Library 和 FAQ。
- Submission Task Agent：读取提交检查清单和 GitHub 最佳实践。
- Review Task Agent：读取 Rubric、案例和评价样例。
- Knowledge Librarian Agent：负责把知识条目转成可检索索引。

## 当前精选交付

- `knowledge-cognitive-cell/design.md`：Knowledge Cognitive Cell 精简设计。
- `schemas/knowledge-item.schema.json`：知识条目 schema。
- `schemas/prompt.schema.json`：Prompt schema。
- `prompt-library/submission-self-check.md`：提交前自查 Prompt。
- `prompt-library/aar-template.md`：AAR 复盘 Prompt。
- `best-practices/github-submission.md`：GitHub 提交规范。
- `best-practices/feishu-setup.md`：飞书配置踩坑。
- `best-practices/deepseek-api.md`：DeepSeek 接入说明。
- `case-studies/zhiyin-ai-navigator.md`：真实项目案例。

