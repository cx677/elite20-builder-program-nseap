# Elite20 Platform 开发指南

> 面向所有 Builder Team 的本地开发入门

---

## 环境要求

- **Python 3.11+**（用于测试和搜索索引重建）
- **Git**（版本控制）
- 任意现代浏览器
- 文本编辑器（推荐 VS Code）

不需要 Node.js、不需要数据库、不需要后端服务。Elite20 Platform 是纯静态网站。

---

## 第一次拉取项目

```bash
git clone <repo-url> Elite20-Builder-Program
cd Elite20-Builder-Program
```

---

## 本地预览

```bash
cd teams/platform-team/course-platform

# 方式 1: Python 内置服务器
python3 -m http.server 8000

# 方式 2: Node.js serve
npx serve .

# 方式 3: VS Code Live Server 扩展
# 右键 index.html → Open with Live Server
```

打开 http://localhost:8000

---

## 运行检查

当前提交的是纯静态课程门户，尚未包含自动化测试脚本。每次改动后至少完成：

```bash
cd teams/platform-team/course-platform
python3 -m http.server 8000
```

然后人工检查：

- 首页能打开。
- 课程模块链接能打开。
- 文档页链接不指向仓库外不存在路径。
- 搜索索引与课程模块数量一致。

后续如果补充 `scripts/test_platform.py` / `scripts/test_e2e.py`，再把本节升级为自动化测试。

---

## 重建搜索索引

当前 PR 已包含 `search-index.json`。后续如果课程内容变化，建议补充 `scripts/rebuild_search_index.py` 后再自动重建；在脚本补齐前，请人工同步更新搜索索引。

---

## 目录结构

```
elite20-course/
├── index.html              ← 课程首页（含搜索功能）
├── module-template.html    ← 新建模块页的模板
├── search-index.json       ← 搜索索引（自动生成，勿手改）
├── CONTRIBUTING.md         ← 贡献指南
├── README.md               ← 平台说明
├── .nojekyll               ← 禁用 GitHub Pages Jekyll
├── _config.yml             ← GitHub Pages 配置
├── robots.txt              ← 爬虫协议
├── sitemap.txt             ← 站点地图
├── docs/                   ← 文档中心
│   ├── index.md
│   ├── deployment-guide.md
│   ├── agent-interface.md  ← P3394 对齐的 Agent 接口规范
│   └── operator-manual.md
├── curriculum/             ← 课程内容（Team 1 维护）
├── challenges/             ← 挑战内容（Team 2 维护）
├── agents/                 ← Agent 内容（Team 3 维护）
├── ontology/               ← 本体内容（Team 4 维护）
└── deploy/                 ← 部署脚本（Team 5 维护）
```

---

## 各 Team 工作流

### Team 1 — Curriculum

1. 复制 `module-template.html` 创建新模块
2. 填入课程内容
3. 在 `index.html` 添加链接
4. 运行 `python3 scripts/rebuild_search_index.py`
5. 运行测试
6. 提交 PR

### Team 2 — Challenge

1. 在 `challenges/` 目录创建挑战文档
2. 每个挑战一个 HTML 或 Markdown 文件
3. 在 `index.html` 的 Challenge 区块添加链接
4. 运行测试
5. 提交 PR

### Team 3 — Agent

1. 阅读 `docs/agent-interface.md`（P3394 对齐）
2. 在 `agents/` 目录创建 Agent Manifest
3. 实现 handle_message 入口
4. 遵循 P3394 五大模块规范
5. 提交 PR

### Team 4 — Ontology

1. 在 `ontology/` 目录创建本体文件
2. 参考主仓库 `ontology/` 与 `standards/` 目录
3. 提交 PR

### Team 6 — Knowledge

1. 文档直接提交到 `docs/`
2. 教程、Prompt Library 提交到 `docs/` 或独立目录
3. 提交 PR

---

## 品牌色修改

所有页面使用 CSS 变量，修改 `:root` 即可全局换色：

```css
:root {
  --red: #e74c3c;    /* 主色 1 */
  --blue: #3498db;   /* 主色 2 */
  --grad: linear-gradient(135deg, var(--red), ...);
}
```

**注意**：迁移的课程页面（`curriculum/` 下）有大量内联样式，换色时需要批量替换。

---

## 提交规范

参考 [CONTRIBUTING.md](../CONTRIBUTING.md)。

简要：
- 分支命名：`feature/week1-lab`、`challenge/c2`、`fix/search-bug`
- Commit：`feat: 添加 Week 1 课程内容`、`fix: 修复搜索弹窗样式`
- PR 标题清晰，描述完整
- 测试必须通过

---

## 常见问题

### Q: 中文文件名在 GitHub Pages 上能正常访问吗？
A: 可以，但 URL 需要编码。浏览器和 GitHub Pages 都支持 UTF-8 文件名。

### Q: 搜索功能不工作？
A: 检查 `search-index.json` 是否存在，路径是否正确。首页引用 `search-index.json`，课程页引用 `../search-index.json`。

### Q: 如何添加新的 Agent？
A: 参考 `docs/agent-interface.md` 的 Agent Manifest 规范，在 `agents/` 目录创建 JSON/YAML 文件。

### Q: GitHub Pages 部署后样式丢失？
A: 确认 `.nojekyll` 文件存在（已包含在仓库中），它会禁用 Jekyll 对 `_` 开头文件的处理。
