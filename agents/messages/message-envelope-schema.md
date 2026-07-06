# Message Envelope Schema

所有 Agent 之间的通信必须使用标准 Message Envelope 包装。

不允许 Agent 直接调用另一个 Agent 的内部函数。所有通信必须通过消息路由。

---

## Envelope 字段定义

```json
{
  "message_id": "msg-xxxxxxxxxxxxxxxx",
  "request_id": "req-xxxxxxxxxxxxxxxx",
  "from_agent": "student-companion-s001",
  "to_agent": "submission-task-agent",
  "message_type": "submission_request",
  "timestamp": "2026-07-06T10:00:00.000Z",
  "payload": { ... },
  "routing_metadata": {
    "priority": "normal",
    "retry_count": 0,
    "max_retries": 3,
    "ttl_seconds": 3600,
    "requires_ack": true
  },
  "audit_trace_pointer": "audit-xxxxxxxxxxxxxxxx"
}
```

### 字段说明

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `message_id` | string | ✅ | 消息唯一 ID，格式 `msg-{nanoid}` |
| `request_id` | string | ✅ | 请求 ID，用于追踪一次完整交互链路，格式 `req-{nanoid}` |
| `from_agent` | string | ✅ | 发送方 Agent ID |
| `to_agent` | string | ✅ | 接收方 Agent ID |
| `message_type` | string | ✅ | 消息类型（见下方枚举） |
| `timestamp` | string (ISO 8601) | ✅ | 消息生成时间 |
| `payload` | object | ✅ | 消息体，格式由 message_type 决定 |
| `routing_metadata` | object | ✅ | 路由控制元数据 |
| `audit_trace_pointer` | string | ✅ | 指向 Audit Log 中对应记录的 ID |

---

## message_type 枚举

| type | 发送方 | 接收方 | 说明 |
|---|---|---|---|
| `challenge_publish` | Teacher Companion Agent | Submission Task Agent | 发布新 Challenge |
| `challenge_available` | Submission Task Agent | Student Companion Agent | 通知学生有新 Challenge |
| `submission_request` | Student Companion Agent | Submission Task Agent | 发起作业提交请求 |
| `submission_accepted` | Submission Task Agent | Review Task Agent | 提交校验通过，路由评审 |
| `review_result` | Review Task Agent | Submission Task Agent | 评审完成，返回结果 |
| `feedback` | Submission Task Agent | Student Companion Agent | 向学生发送反馈 |
| `manual_review_request` | Teacher Companion Agent | Review Task Agent | 教师触发人工复评 |
| `status_update` | Submission Task Agent | Teacher Companion Agent | 更新提交状态 |
| `revision_required` | Submission Task Agent | Student Companion Agent | 校验失败，要求修改 |

---

## submission_request payload 示例

```json
{
  "message_type": "submission_request",
  "payload": {
    "student_id": "s001",
    "challenge_id": "C2S",
    "project_title": "AI+X 范式精读与复盘",
    "project_summary": "对 C2S 论文的精读、建言和复盘",
    "github_repo_url": "https://github.com/zhanghao/c2s-submission",
    "readme_url": "https://github.com/zhanghao/c2s-submission/blob/main/README.md",
    "aar_text": "本次 Challenge 我学到了...",
    "self_evaluation_text": "我认为完成了以下目标...",
    "is_public": true
  }
}
```

## challenge_publish payload 示例

```json
{
  "message_type": "challenge_publish",
  "payload": {
    "challenge_id": "C8",
    "title": "班级管理工具链",
    "brief": "...",
    "objective": "...",
    "deliverables": "...",
    "rubric_pointer": "challenges/rubrics/C8-rubric.md",
    "teacher_agent_id": "teacher-companion-richard",
    "deadline": "2026-07-20T23:59:59Z",
    "review_mode": "teacher_first"
  }
}
```

---

## routing_metadata 字段说明

| 字段 | 类型 | 说明 |
|---|---|---|
| `priority` | `urgent` \| `high` \| `normal` \| `low` | 处理优先级 |
| `retry_count` | number | 当前重试次数 |
| `max_retries` | number | 最大重试次数，默认 3 |
| `ttl_seconds` | number | 消息有效期（秒），默认 3600 |
| `requires_ack` | boolean | 是否要求接收方确认 |

---

## TypeScript 类型定义

```typescript
export type MessageType =
  | "challenge_publish"
  | "challenge_available"
  | "submission_request"
  | "submission_accepted"
  | "review_result"
  | "feedback"
  | "manual_review_request"
  | "status_update"
  | "revision_required";

export type RoutingMetadata = {
  priority: "urgent" | "high" | "normal" | "low";
  retry_count: number;
  max_retries: number;
  ttl_seconds: number;
  requires_ack: boolean;
};

export type MessageEnvelope<T = unknown> = {
  message_id: string;
  request_id: string;
  from_agent: string;
  to_agent: string;
  message_type: MessageType;
  timestamp: string;
  payload: T;
  routing_metadata: RoutingMetadata;
  audit_trace_pointer: string;
};
```

---

## 相关文档

- `agents/inbox/README.md` — Inbox 如何处理 Envelope
- `agents/audit/audit-log-schema.md` — audit_trace_pointer 指向的记录结构
- `agents/agent-collaboration-flow.md` — Agent 协作流程
