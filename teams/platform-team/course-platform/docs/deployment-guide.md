# Elite20 Builder Program — 部署指南

> 最后更新：2026-06

---

## 1. 概览

Elite20 Builder Program 课程平台是一个**纯静态 HTML 站点**，由 `elite20-course` 仓库维护。当前形态不需要后端服务器或数据库，因此部署方式灵活，适合直接托管在静态站点服务上。

### 部署选项

| 方式 | 适用场景 | 复杂度 |
|---|---|---|
| **GitHub Pages** | 正式发布、团队演示 | 低 |
| `python -m http.server` | 本地预览、开发调试 | 极低 |
| `npx serve` | 本地预览（Node 环境） | 极低 |
| Docker + Nginx / Caddy | 自托管服务器 | 中 |
| Vercel / Netlify | 高级静态托管（可选） | 低 |

> **推荐**：开发阶段使用本地静态服务器，发布阶段使用 GitHub Pages。

---

## 2. 本地开发

### 2.1 使用 Python（内置，无需安装额外依赖）

```bash
cd elite20-course

# Python 3
python3 -m http.server 8080

# Python 2（已废弃，不推荐）
python -m SimpleHTTPServer 8080
```

打开浏览器访问 `http://localhost:8080`。

### 2.2 使用 npx serve（Node.js 生态）

```bash
cd elite20-course
npx serve .
```

默认启动在 `http://localhost:3000`。

### 2.3 使用 VS Code Live Server

在 VS Code 中安装 **Live Server** 插件，右键 `index.html` → **Open with Live Server**，自动打开浏览器预览。

### 2.4 热重载开发建议

当前为纯静态站点，修改 HTML/CSS/JS 后手动刷新浏览器即可。如需更完善的开发体验，后续可引入 Vite 或类似工具支持 HMR（参见第 6 节扩展方向）。

---

## 3. GitHub Pages 部署

### 3.1 前置条件

- 拥有 GitHub 账号
- 已将 `elite20-course` 目录初始化为 Git 仓库并推送到 GitHub
- 推送命令示例（如尚未操作）：

```bash
cd /path/to/elite20-course

# 如果尚未初始化 git
git init
git add .
git commit -m "Initial commit: Elite20 course platform"

# 关联远程仓库（替换为你的仓库地址）
git remote add origin https://github.com/你的用户名/elite20-course.git
git branch -M main
git push -u origin main
```

### 3.2 启用 GitHub Pages

1. 在浏览器中打开 GitHub 仓库页面：`https://github.com/你的用户名/elite20-course`
2. 点击 **Settings** → 左侧 **Pages**
3. 在 **Branch** 下拉菜单中选择 `main`，文件夹选择 `/ (root)`
4. 点击 **Save**

等待 1-2 分钟后，你的站点将在以下地址发布：

```
https://你的用户名.github.io/elite20-course/
```

> 若仓库名为 `你的用户名.github.io`，则根路径即为 `https://你的用户名.github.io/`。

### 3.3 自定义域名（可选）

1. 在 GitHub Pages 设置页面填入你的域名（如 `course.elite20.org`）
2. 在域名的 DNS 管理中添加对应的 CNAME 记录或 A 记录
3. 可选：在仓库根目录创建 `CNAME` 文件（内容为你的域名），确保每次部署后设置不丢失

方法一（在 GitHub Pages 设置中填写域名后自动生成 CNAME 文件），方法二（手动创建）：

```bash
echo "course.elite20.org" > CNAME
git add CNAME
git commit -m "Add custom domain CNAME"
git push
```

### 3.4 验证部署

访问你的 GitHub Pages URL，页面应正确显示 Elite20 课程首页。如果出现 404，请检查：
- GitHub Pages 是否已启用
- 是否选择了正确的 Branch（`main`）和路径（`/ (root)`）
- 仓库是否为 **Public**（Private 仓库需要 GitHub Pro 才能使用 Pages）

### 3.5 后续更新

对 `main` 分支的每次 `git push` 都会自动触发 GitHub Pages 重新构建和部署。无需额外操作。

---

## 4. 目录结构说明

```
elite20-course/
├── index.html          # 首页入口（课程概览、模块导航、Agent 展示）
├── CONTRIBUTING.md     # 贡献指南
│
├── curriculum/         # [待补充] 课程模块详情
│   ├── week-01/        # Vibe Coding 入门
│   ├── week-02/        # Agent 与工具链
│   └── ...             # Week 3-6
│
├── challenges/         # [待补充] 挑战库（C1 - C10）
│   ├── c1-first-agent/
│   ├── c2-rag-pipeline/
│   └── ...
│
├── agents/             # [待补充] Agent 配置与文档
│   ├── student-companion/
│   ├── instructor-agent/
│   ├── mentor-agent/
│   ├── coding-coach/
│   └── ...
│
├── ontology/           # [待补充] 课程本体与知识图谱
│
├── platform/           # [待补充] 平台工程相关内容
│
├── deploy/             # [待补充] 部署脚本与配置
│
└── docs/               # 文档
    └── deployment-guide.md   ← 你正在阅读的本文
```

---

## 5. 内容更新

### 5.1 添加新的课程模块

1. 在 `curriculum/` 下创建以周为单位的文件夹，如 `week-04/`
2. 在文件夹内创建 `index.html`（或模块入口页面）
3. 在 `index.html` 首页的课程模块网格中添加对应的卡片链接，指向新建的 HTML 文件

### 5.2 添加新的挑战

1. 在 `challenges/` 下创建挑战文件夹，如 `c8-deploy-infra/`
2. 创建挑战说明页面 `index.html`
3. 在首页 Challenge Library 网格中添加对应卡片

### 5.3 添加新的 Agent 页面

1. 在 `agents/` 下创建 Agent 文件夹，如 `evaluation-agent/`
2. 创建 Agent 详情页面
3. 在首页 Agent Library 网格中添加对应卡片

### 5.4 更新首页样式

所有样式目前内联在 `index.html` 的 `<style>` 块中。如需统一管理，后续可提取为单独的 `assets/css/style.css` 并通过 `<link>` 引入。

> 提示：随着页面数量增多，建议引入一致的导航栏组件（如顶部导航、面包屑），避免各页面样式不一致。

---

## 6. 后续扩展方向

以下功能在当前阶段尚未实现，可作为后续开发参考：

### 6.1 后端集成 [待补充]

- 引入 Node.js / Python 后端（如 Express、FastAPI）
- 用户认证（OAuth / JWT）
- 学习进度追踪与持久化存储

### 6.2 LMS 功能 [待补充]

- 课程注册与选课系统
- 作业提交与自动评分
- 学生 Dashboard 与学习分析

### 6.3 Agent Runtime 集成 [待补充]

- 在课程页面中嵌入 AI Agent（Student Companion）
- 使用 RAG 提供课程知识库问答
- Agent 对话历史持久化

### 6.4 构建工具化 [待补充]

- 引入 Vite / Next.js 等构建工具
- Markdown → HTML 自动转换（课程内容用 Markdown 维护）
- 自动生成导航和侧边栏

### 6.5 CI/CD 流水线 [待补充]

- GitHub Actions 自动化部署
- 构建时检查（断链检查、HTML 校验）
- 自动发布 Release Notes

---

> **Elite20 Builder Program** — 不学习，而是建设。
