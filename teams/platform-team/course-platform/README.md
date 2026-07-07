# Elite20 — Vibe Coding 课程平台

> NSEAP AI Learning Operating System · Reference Implementation

Elite20 Builder Program 的课程平台核心仓库。将 SIAS University Vibe Coding 课程重构为可部署、可复制的智能教育平台。

## 快速开始

```bash
# 用任意静态服务器预览
python3 -m http.server 8000
# 或
npx serve .
```

## 目录结构

```
elite20-course/
├── index.html              ← 课程首页（Landing Page）
├── CONTRIBUTING.md         ← 贡献指南（Builder Workflow）
├── module-template.html    ← 课程模块页模板
├── docs/                   ← 文档站
│   ├── index.md            ← 文档中心入口
│   ├── deployment-guide.md ← 部署指南
│   └── agent-interface.md  ← Agent 接口规范
├── platform/               ← 平台代码 [待补充]
├── curriculum/             ← Curriculum Team 内容 [待补充]
├── challenges/             ← Challenge Team 内容 [待补充]
├── agents/                 ← Agent Team 内容 [待补充]
├── ontology/               ← Ontology 内容 [待补充]
└── deploy/                 ← 部署脚本 [待补充]
```

## 品牌色

红蓝渐变相间（Red → Blue gradient），当前为初期版本，后续可调整。
