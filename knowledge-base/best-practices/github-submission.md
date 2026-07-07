# Best Practice：GitHub 提交规范

## 背景

GitHub 是 Elite20 / NSEAP 的正式产物和证据底座，不只是附件链接。

## 最小要求

- 仓库可访问。
- 有 `README.md`。
- README 写清项目目标、使用方式、产物说明。
- 有明确提交历史。
- 如果是 Challenge 作业，建议包含：
  - `metadata.json` 或提交说明
  - `reflection.md` / `aar.md`
  - `prompt-log.md` 或 AI 协作说明
  - 源码、文档、截图或 Demo 链接

## 常见问题

- 仓库私有但没有给平台 token 权限。
- README 只有标题，没有交代项目价值。
- 把源码仓库和作业提交仓库混在一起。
- 没有 AAR，评审无法看到学习过程。

## Agent 使用说明

Submission Task Agent 应检查仓库可访问性、README、最新 commit 和必要文件。Review Task Agent 应结合 README 与 AAR 判断过程质量。

