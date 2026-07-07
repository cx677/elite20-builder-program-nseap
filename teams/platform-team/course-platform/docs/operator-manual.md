# Operator Manual — Elite20 平台运维手册

> **文档状态:** 骨架
> **版本:** v0.1
> **最后更新:** 2026-06-29

---

## 1. 概述

本文档面向 Elite20 平台的运维人员（学校 IT、企业运维），说明如何部署、配置、维护课程平台。

Elite20 平台是一个静态网站 + Agent 接口的组合：
- **静态网站**：课程内容展示，GitHub Pages 部署
- **Agent 接口**：基于 P3394 标准的 Agent 通信层 [待 Team 3 实现]

---

## 2. 部署前检查清单

### 2.1 静态网站部署

- [ ] Git 已安装
- [ ] GitHub 账号已创建
- [ ] 域名已准备（可选）
- [ ] 本地能运行 `python3 -m http.server`

### 2.2 Agent 层部署 [待补充]

- [ ] Node.js / Python 运行时
- [ ] Agent 运行环境
- [ ] P3394 Channel Adapter 实现
- [ ] 身份认证系统（OAuth2 / API Key）

---

## 3. 部署步骤

### 3.1 静态网站

```bash
# 1. Clone 仓库
git clone <repo-url> elite20-course
cd elite20-course

# 2. 本地验证
python3 -m http.server 8000
# 打开 http://localhost:8000 确认正常

# 3. Push 到 GitHub
git remote add origin <your-github-repo>
git push -u origin main

# 4. 启用 GitHub Pages
#    Settings → Pages → Source: main branch → /root
#    等待 1-2 分钟，访问 https://<username>.github.io/<repo>/

# 5. 自定义域名（可选）
#    CNAME 记录指向 <username>.github.io
#    在仓库 Settings → Pages → Custom domain 填入域名
```

### 3.2 Agent 层 [待补充]

Agent 层部署依赖 Team 3 的实现。参考 [Agent 接口规范](../docs/agent-interface.md)。

---

## 4. 日常运维

### 4.1 内容更新

```bash
# 更新课程内容
# 1. 修改 curriculum/ 下的 HTML 文件
# 2. 启动静态预览并人工检查关键页面
python3 -m http.server 8000

# 3. 提交并推送
git add -A
git commit -m "content: 更新模块 XX 内容"
git push
# GitHub Pages 自动重建
```

### 4.2 添加新课程模块

1. 复制 `module-template.html` 为新文件
2. 填入课程内容
3. 在 `index.html` 添加链接
4. 更新 `search-index.json` [待实现自动化]
5. 完成人工检查
6. 提交推送

### 4.3 品牌色修改

所有页面使用 CSS 变量，修改 `:root` 中的变量即可全局换色：

```css
:root {
  --red: #e74c3c;    /* 主色 1 */
  --blue: #3498db;   /* 主色 2 */
  --grad: linear-gradient(135deg, var(--red), ...);
}
```

---

## 5. 监控与日志 [待补充]

- GitHub Pages 访问日志
- Agent 接口调用日志
- 错误监控

---

## 6. 故障排查

| 问题 | 原因 | 解决方案 |
|------|------|---------|
| 页面 404 | GitHub Pages 未启用或路径错误 | 检查 Settings → Pages 配置 |
| 样式丢失 | CSS 变量未定义 | 检查 `:root` 变量完整性 |
| 搜索不工作 | search-index.json 缺失 | 确认文件在根目录 |
| 中文路径 404 | URL 未编码 | 确认服务器支持 UTF-8 路径 |
| Agent 接口无响应 | Agent 未启动或 Channel Adapter 未配置 | 检查 Agent Manifest 和 Adapter |

---

## 7. 安全注意事项

- Agent 接口必须配置认证（参考 P3394 Security 规范）
- Semantic Block Validation 是安全门，不可关闭
- 遵循非升级不变量：关系决定能力上限
- Principal-Associated Resources 不可跨用户访问

详见 [Agent 接口规范 — Security](../docs/agent-interface.md)。

---

## 8. 备份与恢复 [待补充]

- 代码备份：Git 仓库
- 内容备份：定期 `git archive`
- Agent 数据备份 [待补充]

---

_本文档随平台演进持续更新。_
