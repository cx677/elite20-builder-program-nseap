# Best Practice：DeepSeek API 接入

## 背景

当前 MVP 使用 DeepSeek 的 OpenAI-compatible API 做 AI 初评。

## 环境变量

```bash
AI_PROVIDER=deepseek
AI_BASE_URL=https://api.deepseek.com
AI_MODEL=deepseek-chat
DEEPSEEK_API_KEY=
```

## 常见问题

- 401：API key 错误或环境变量未加载。
- 429：请求频率或额度限制。
- 模型名错误：建议使用 `deepseek-chat` 做通用初评。
- OpenAI SDK 兼容问题：优先走 OpenAI-compatible HTTP 接口，避免写死 provider。

## Agent 使用说明

Evaluation Agent 调用模型后，应记录 provider、model、输入摘要、输出摘要和失败原因，方便后续审计。

