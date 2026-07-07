# Knowledge Team

负责把一期和二期产生的资料、Prompt、AI 日志、优秀作业、踩坑记录和评审规则沉淀成可复用的知识库。

## 当前成员

- 尹镇宇

## 核心任务（7.6 更新）

知识库不只是文档汇总，而是要成为 Agent 可引用的结构化资产。

**目标**：整理一期真实经验，把 MVP 调试过程中的每一个"怎么解决的"都沉淀为可查找的知识条目。

## 本周最小交付

### 1. 知识库结构

- [x] `knowledge-base/README.md`：知识库总览和目录结构
- [x] `knowledge-base/knowledge-cognitive-cell/design.md`：Knowledge Cognitive Cell 精简设计
- [x] `knowledge-base/schemas/knowledge-item.schema.json`：知识条目 schema
- [x] `knowledge-base/schemas/prompt.schema.json`：Prompt schema

### 2. Prompt Library

- [ ] `prompt-library/README.md`：Prompt 库总览
- [x] `prompt-library/submission-self-check.md`：学生提交前自查 Prompt
- [x] `prompt-library/aar-template.md`：AAR 复盘 Prompt
- [ ] `prompt-library/github-check.md`：GitHub 仓库检查 Prompt

### 3. Best Practices（踩坑记录）

- [x] `best-practices/github-submission.md`：GitHub 提交规范

- [x] `best-practices/feishu-setup.md`：飞书配置说明（含踩坑）

  至少包含：
  - 飞书 91403 Forbidden 如何解决
  - 飞书多维表授权步骤
  - 飞书 API 写入失败常见原因

- [x] `best-practices/deepseek-api.md`：DeepSeek API 接入说明

  至少包含：
  - DeepSeek 如何接入 OpenAI-compatible API
  - model name 正确写法
  - 常见 401 / 429 错误处理

- [ ] `best-practices/github-private-repo.md`：GitHub private repo 检查说明

  至少包含：
  - 如何通过 token 检查 private 仓库
  - GitHub token 权限配置

### 4. 真实案例

- [x] `case-studies/zhiyin-ai-navigator.md`：智引 AI 导航导师项目案例
- [ ] `case-studies/c2s-zhanghao.md`：张浩 C2S 挑战提交案例

每个案例至少包含：
- 项目背景
- GitHub 仓库链接
- 提交过程记录
- AI 评审结果
- 飞书记录截图（可选）
- 可复用的经验总结

## 知识库结构建议

```
knowledge-base/
├── README.md (总览)
├── prompt-library/
│   ├── README.md
│   ├── submission-self-check.md
│   ├── aar-template.md
│   └── github-check.md
├── best-practices/
│   ├── github-submission.md
│   ├── feishu-setup.md
│   ├── deepseek-api.md
│   └── github-private-repo.md
├── case-studies/
│   ├── zhiyin-ai-navigator.md
│   └── c2s-zhanghao.md
└── faq/
    └── README.md
```

## 知识条目格式建议

每条知识建议包含：

```markdown
## 标题（问题/场景）

**背景**：什么情况下会遇到这个问题

**解决方法**：
1. ...
2. ...

**踩坑提醒**：
- ...

**参考资料**：
- ...
```

## 知识库与 Agent 的连接

知识库要能被 Agent 引用：

- Review Task Agent 引用 Rubric 和评分标准
- Student Companion Agent 引用 Prompt Library
- Submission Task Agent 引用提交检查清单

因此，知识库条目要有结构化的标签和引用 ID，方便 Agent 按需查找。

## 与其他 Team 的接口

- **Challenge Team**：整理 Challenge 相关的踩坑记录
- **Agent Team**：为 Agent 提供可引用的 Prompt 和 Best Practice
- **Platform Team**：记录 MVP 开发过程中的配置经验

## 验收标准

- [x] 飞书 Forbidden 错误的解决方法有文档记录
- [x] DeepSeek API 接入步骤清晰
- [ ] GitHub private repo 检查方法有文档
- [ ] 至少 2 个真实案例整理完成
- [ ] Prompt Library 包含至少 3 个可用 Prompt

## Review 状态

2026-07-07 已从 PR #1 中精选合并 Knowledge Team 的核心成果：

- 保留：知识库结构、Knowledge Cognitive Cell 精简设计、schema、Prompt、Best Practices、真实案例。
- 未合入：根目录 docx 资料包、重复的 `nseap-knowledge-base/` 工程、截图、上传文件、可再生成搜索索引。

下一步应由 Knowledge Team 补齐 GitHub private repo 文档、C2S 案例和 Prompt Library README。

## 参考资料

- 任务规划：`docs/phase2-builder-task-plan.md`
- 已有 FAQ：`knowledge-base/faq.md`
- 一期案例：张浩 C2S 提交（`zhanghao-c2s-ai-x-paradigm-submission` 仓库）
- 一期案例：智引 AI 导航导师（`zhiyin-ai-navigator` 仓库）
