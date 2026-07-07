# Best Practice：飞书多维表配置

## 背景

当前 MVP 使用飞书多维表作为轻量业务后台，保存学生、挑战、提交、评价和作品集记录。

## 配置要点

1. 在飞书开放平台创建自建应用。
2. 给应用开通多维表相关权限。
3. 在目标多维表里添加该应用为文档应用。
4. 权限建议设置为可管理，至少要能读写记录。
5. 配置环境变量：
   - `FEISHU_APP_ID`
   - `FEISHU_APP_SECRET`
   - `FEISHU_APP_TOKEN`
   - 各业务表 table id

## 常见错误

### 91403 Forbidden

通常表示应用没有当前多维表的访问权限。处理方式：

- 确认应用已添加到多维表文档。
- 确认权限不是只读。
- 确认 `APP_TOKEN` 指向正确多维表。
- 确认 API 使用的是 tenant access token。

### 字段名不匹配

飞书 API 按字段名写入。字段改名后，代码必须同步映射，否则会出现读不到字段或创建记录失败。

## Agent 使用说明

Submission Task Agent 写入记录前，应先检查 Feishu ResourceConfig 是否完整，并把写入 record id 写入 audit log。

