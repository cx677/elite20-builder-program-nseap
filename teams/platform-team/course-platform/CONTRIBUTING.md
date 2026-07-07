# 贡献指南 — Elite20 Builder Program

欢迎加入 Elite20 Builder Program！这里是 SIAS University Vibe Coding 课程的重构项目，目标是把一门课程变成一套**可部署、可复制的 Agent Native Learning Operating System**。

你不是来上课的——你是来 **Build** 的。

---

## 目录

- [Builder Workflow](#builder-workflow)
- [环境搭建](#环境搭建)
- [分支命名规范](#分支命名规范)
- [Commit 规范](#commit-规范)
- [PR 指南](#pr-指南)
- [Code Review Checklist](#code-review-checklist)

---

## Builder Workflow

每个贡献遵循 8 步工作流：

```
🔍 发现问题 → 💡 提出方案 → 🤖 AI 辅助开发 → 📦 提交 PR
→ 👥 Peer Review → 🤖 Agent Review → 🔀 Merge → 📖 归档发布
```

| 步骤 | 说明 |
|------|------|
| **🔍 发现** | 识别真实教育场景中的痛点。课前/课中/课后有哪些问题？学生在哪卡住？老师在哪重复劳动？ |
| **💡 方案** | 设计解决方案。不一定要完美——在白板上画思路、写 ADR（架构决策记录）、建原型都算。 |
| **🤖 AI 辅助开发** | 用 Cursor、GitHub Copilot、Claude、ChatGPT 等 AI 工具加速编码。AI 是协作者，不是背锅侠——你自己的理解才是核心。 |
| **📦 提交 PR** | 按照下方 PR 规范创建 Pull Request。 |
| **👥 Peer Review** | 至少邀请一位团队成员 Review。重点看逻辑、可读性、边界情况。 |
| **🤖 Agent Review** | Evaluation Agent 自动检查代码质量、测试覆盖、规范遵循情况。 |
| **🔀 Merge** | Review 通过后合入 `main` 分支。保持线性历史。 |
| **📖 归档发布** | 更新文档，必要时创建 GitHub Release。 |

---

## 环境搭建

### 前置要求

- **Python 3.11+**（用于本地静态预览）
- **Git** >= 2.30
- **Node.js** >= 18.x（可选，用于 npx serve）
- （可选）一个 AI 编码助手（Cursor / Copilot / Claude Code）

### 本地运行

```bash
# 1. 克隆仓库
git clone https://github.com/a976xw7td/elite20-builder-program-nseap.git
cd elite20-builder-program-nseap/teams/platform-team/course-platform

# 启动静态预览
python3 -m http.server 8000
```

项目目前是纯前端静态站点，无需后端即可在本地运行。后续 Agent 模块需要各自的环境变量，详见各模块 README。

---

## 分支命名规范

| 类型 | 格式 | 示例 |
|------|------|------|
| 课程周任务 | `feature/week<N>-<desc>` | `feature/week1-vibe-intro` |
| 挑战 | `challenge/c<N>` | `challenge/c2-vector-pipeline` |
| Bug 修复 | `fix/<short-desc>` | `fix/hero-typo` |
| 文档 | `docs/<short-desc>` | `docs/workflow-readme` |
| 重构 | `refactor/<scope>` | `refactor/agent-prompt` |

规则：
- 分支名全部小写，单词间用连字符 `-`
- 从 `main` 拉分支，PR 合回 `main`
- 完成后及时删除远程分支

---

## Commit 规范

使用 **Conventional Commits** 格式：

```
<type>(<scope>): <简短描述>

[可选正文]
[可选脚注]
```

### 常用类型

| Type | 含义 |
|------|------|
| `feat` | 新功能 |
| `fix` | Bug 修复 |
| `docs` | 文档变更 |
| `refactor` | 重构（不涉及功能/修复） |
| `chore` | 构建/工具/配置变更 |
| `test` | 测试相关 |
| `style` | 代码格式（非逻辑变更） |

### 示例

```
feat(course): 新增 Week 2 Agent 入门模块

- 添加 Agent 生命周期教程
- 包含一个可运行的 Demo Agent
- 更新课程导航栏
```

```
fix(deploy): 修复 Nginx 静态资源缓存策略
```

```
docs(contributing): 补充 PR 检查清单
```

---

## PR 指南

### 创建 PR 前

- 从 `main` 拉出最新的分支
- Commit 遵循 Conventional Commits 格式
- 本地静态预览通过，关键页面和链接已人工检查
- 不要在同一个 PR 里塞多个不相关的内容

### PR 标题格式

```
[类型] 简短描述
```

示例：`[feat] 添加课程知识库 RAG 管道`、`[fix] 修复首页导航响应式布局`

### PR 描述模板

```markdown
## 关联 Issue

Closes #（如有）

## 改动内容

简要说明改了什么、为什么改。

## 改动类型

- [ ] 新功能
- [ ] Bug 修复
- [ ] 文档更新
- [ ] 重构
- [ ] 其他

## 自测清单

- [ ] 本地运行正常
- [ ] 无新增 Console 报错
- [ ] 相关文档已更新
```

> 以上模板会在 GitHub 新建 PR 时自动加载（`.github/PULL_REQUEST_TEMPLATE.md`）。

---

## Code Review Checklist

Reviewer 看 PR 时重点关注：

### 逻辑与设计
- [ ] 方案能解决它要解决的问题吗？
- [ ] 边界情况是否考虑到？（空状态、加载中、异常）
- [ ] 有硬编码吗？配置是否抽离？

### 代码质量
- [ ] 命名清晰，不费解
- [ ] 函数/组件职责单一
- [ ] 无死代码、无过度抽象
- [ ] Diff 量合理——一个 PR 不要太大

### AI 辅助代码
- [ ] AI 生成的代码你**理解**了吗？不理解别合。
- [ ] 有潜在幻觉吗？（不存在的 API、错误的文档链接）
- [ ] 安全与权限控制是否到位？

### 测试与文档
- [ ] 关键路径有测试覆盖
- [ ] README 或相关文档已更新
- [ ] 如果有 Breaking Change，有说明

---

## 行为准则

- 尊重每个 Builder，**建设性的反馈**而不是指责
- 没有愚蠢的问题，只有还没搞懂的东西——问出来
- 我们做的是教育产品，以学生体验为第一优先级
- **Build with AI, not rely on AI** — 永远理解你在干什么

---

*Elite20 Builder Program · NSEAP AI Learning Operating System — Reference Implementation*
