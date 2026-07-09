# Vercel 部署指南

版本：v1.0  
日期：2026-07-09  
用途：Platform Team 将 `ai-x-challenge-learning-mvp` 部署到 Vercel  

---

## 前置条件

- [ ] 有 `ai-x-challenge-learning-mvp` 仓库的 push 权限
- [ ] 有 Vercel 账号（用 GitHub 登录 https://vercel.com）
- [ ] 飞书应用已创建，有 APP_ID / APP_SECRET
- [ ] 飞书多维表已建好五张表（参考 `docs/feishu-table-schema.md`）
- [ ] GitHub Token 已生成（Settings → Developer settings → Personal access tokens → 勾选 `repo`）
- [ ] DeepSeek API Key 已获取（https://platform.deepseek.com）

---

## 步骤 1：推代码到 GitHub

```bash
cd /Users/zhanghao/ai-x-challenge-learning-mvp
git status
git add .
git commit -m "deploy: add .env.example and ready for Vercel"
git push origin main
```

---

## 步骤 2：Vercel 导入项目

1. 打开 https://vercel.com/new
2. 选择 "Import Git Repository"
3. 搜索并选择 `ai-x-challenge-learning-mvp`
4. Vercel 自动识别为 Next.js 项目，无需修改 Build Settings

---

## 步骤 3：配置环境变量

在 Vercel 项目 → Settings → Environment Variables，添加以下全部变量：

### 飞书（6 个）

| Key | 值来源 |
|---|---|
| `FEISHU_APP_ID` | 飞书开发者后台 → 应用 → 凭证 → App ID |
| `FEISHU_APP_SECRET` | 飞书开发者后台 → 应用 → 凭证 → App Secret |
| `FEISHU_APP_TOKEN` | 飞书多维表 URL 中 `/base/` 后面的字符串 |
| `FEISHU_STUDENTS_TABLE_ID` | 飞书多维表 → Students 表 → URL 中 `/table/` 后面的字符串 |
| `FEISHU_CHALLENGES_TABLE_ID` | 同上，Challenges 表 |
| `FEISHU_SUBMISSIONS_TABLE_ID` | 同上，Submissions 表 |
| `FEISHU_EVALUATIONS_TABLE_ID` | 同上，Evaluations 表 |
| `FEISHU_PORTFOLIO_TABLE_ID` | 同上，PortfolioItems 表 |

### GitHub（1 个）

| Key | 值来源 |
|---|---|
| `GITHUB_TOKEN` | GitHub → Settings → Developer settings → Personal access tokens |

> ⚠️ **不要用你的个人 token**。建议创建一个机器账号或 GitHub App，或者至少创建一个专用 fine-grained token。

### AI（2 个）

| Key | 值来源 |
|---|---|
| `DEEPSEEK_API_KEY` | https://platform.deepseek.com → API Keys |
| `DEEPSEEK_BASE_URL` | `https://api.deepseek.com`（默认值） |

> 可选：配 `OPENAI_API_KEY` 和 `OPENAI_BASE_URL` 作为备选 AI 后端。

---

## 步骤 4：部署

1. 点击 "Deploy"
2. 等待构建完成（通常 1-2 分钟）
3. 构建成功后 Vercel 会给你一个 URL，格式：`https://ai-x-challenge-learning-mvp.vercel.app`
4. 或绑定自定义域名：Settings → Domains

---

## 步骤 5：验证

部署完成后，依次验证：

```bash
# 健康检查
curl https://你的域名.vercel.app/api/health
# 预期返回：{"status":"ok"}

# 获取 Challenge 列表
curl https://你的域名.vercel.app/api/challenges

# 获取学生列表
curl https://你的域名.vercel.app/api/students

# 获取作品集
curl https://你的域名.vercel.app/api/portfolio

# 模拟提交（用真实数据替换）
curl -X POST https://你的域名.vercel.app/api/submit \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "s001",
    "challengeId": "C01",
    "projectTitle": "测试项目",
    "projectSummary": "Vercel 部署测试",
    "githubRepoUrl": "https://github.com/demo-user/test-project",
    "aarText": "这是测试 AAR",
    "selfEvaluationText": "测试自评",
    "isPublic": false
  }'
```

---

## 常见问题

### 飞书 91403 Forbidden

**原因**：飞书应用没有授权访问多维表。

**解决**：
1. 飞书开发者后台 → 应用 → 权限管理
2. 搜索并开启：`bitable:app`（多维表读写权限）
3. 发布新版本并让管理员审批
4. 确保你的飞书账号在多维表的协作者列表中

### GitHub API 403

**原因**：Token 权限不足或未配置。

**解决**：
1. 检查 Token 是否勾选了 `repo` 权限
2. 如果是私有仓库，必须用 `repo` 权限的 Token（不能用 `public_repo`）
3. 如果仓库在 GitHub Organization 里，Token 还需要 Org 授权

### DeepSeek API 失败

**原因**：余额不足或 Base URL 错误。

**解决**：
1. 检查 DeepSeek 账户余额
2. 确认 `DEEPSEEK_BASE_URL` 末尾不要有斜杠
3. 确认 API Key 没有过期

### 部署后页面 500 错误

**原因**：环境变量缺失或飞书表结构不匹配。

**排查**：
1. Vercel → Deployments → 查看构建日志
2. Vercel → Functions → 查看 `/api/submit` 的运行日志
3. 确认所有环境变量都已在 Vercel 中配置（非 `.env.local`）
4. 确认飞书表字段名与代码中一致（参考 `docs/feishu-table-schema.md`）

---

## Demo 数据和真实数据分离

建议做法：

1. **Demo 数据**：在飞书里创建一个 "Demo" 视图，只包含演示用的学生和 Challenge
2. **真实数据**：另外建视图或另外一套表
3. 通过不同环境变量区分：`.env.demo` vs `.env.production`

---

## 关联文档

- 飞书表结构：`docs/feishu-table-schema.md`
- MVP 架构：`ai-x-challenge-learning-mvp/docs/AI-X-Challenge-Learning-MVP-Architecture.md`
- 白皮书：`docs/technical-whitepaper-20260708.md`
- 环境变量模板：`ai-x-challenge-learning-mvp/.env.example`
