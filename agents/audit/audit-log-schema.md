# Audit Log Schema

每次 Agent 状态变化都必须记录审计日志。Audit Log 是系统可追溯性的核心。

---

## 为什么需要 Audit Log

没有 Audit Log 时：

```text
飞书 Submission 表有一条记录
→ 不知道谁写入的
→ 不知道什么时候写入的
→ 不知道为什么写入的
→ 不知道之前是什么状态
→ 不知道消息是从哪条路径路由来的
```

有 Audit Log 后：

```text
任意一次提交都能追溯：
→ 谁发起（student-companion-s001）
→ 谁处理（submission-task-agent）
→ 什么时候处理（2026-07-06T10:05:00Z）
→ 写入了哪条飞书记录（submission_id=sub-xxx）
→ 路由给谁评审（review-task-agent）
→ 评审结果是什么（score=85）
→ 整个消息链路是什么（req-xxx → msg-aaa → msg-bbb → msg-ccc）
```

---

## Audit Log 字段定义

```json
{
  "audit_id": "audit-xxxxxxxxxxxxxxxx",
  "timestamp": "2026-07-06T10:05:23.456Z",
  "agent_id": "submission-task-agent",
  "action": "create_submission_record",
  "target_resource": "feishu.submissions.sub-20260706-001",
  "before_state": null,
  "after_state": {
    "submission_id": "sub-20260706-001",
    "student_id": "s001",
    "challenge_id": "C2S",
    "status": "checked"
  },
  "routing_path": [
    "student-companion-s001",
    "submission-task-agent"
  ],
  "related_message_id": "msg-xxxxxxxxxxxxxxxx",
  "related_request_id": "req-xxxxxxxxxxxxxxxx",
  "metadata": {
    "github_check_score": 100,
    "ai_evaluation_score": 85
  }
}
```

### 字段说明

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `audit_id` | string | ✅ | 审计记录 ID，格式 `audit-{nanoid}` |
| `timestamp` | string (ISO 8601) | ✅ | 操作发生时间 |
| `agent_id` | string | ✅ | 执行操作的 Agent ID |
| `action` | string | ✅ | 操作类型（见下方枚举） |
| `target_resource` | string | ✅ | 被操作的资源（格式：`{系统}.{表/对象}.{ID}`） |
| `before_state` | object \| null | ⚠️ | 操作前的状态（创建时为 null） |
| `after_state` | object \| null | ⚠️ | 操作后的状态（删除时为 null） |
| `routing_path` | string[] | ✅ | 消息路由路径（Agent ID 列表） |
| `related_message_id` | string | ✅ | 触发本次操作的消息 ID |
| `related_request_id` | string | ✅ | 请求链路 ID（用于追踪完整交互） |
| `metadata` | object | ⚠️ | 附加元数据（可选，如评分、检查结果） |

---

## action 枚举

| action | 说明 | agent_id 通常值 |
|---|---|---|
| `create_submission_record` | 创建提交记录 | `submission-task-agent` |
| `update_submission_status` | 更新提交状态 | `submission-task-agent` |
| `create_evaluation_record` | 创建评审记录 | `review-task-agent` |
| `update_evaluation_score` | 更新评审分数 | `review-task-agent` |
| `create_portfolio_item` | 创建作品集条目 | `submission-task-agent` |
| `route_to_review` | 路由给评审 Agent | `submission-task-agent` |
| `send_feedback` | 发送反馈给学生 | `submission-task-agent` |
| `publish_challenge` | 发布 Challenge | `teacher-companion-{id}` |
| `accept_submission` | 教师确认提交 | `teacher-companion-{id}` |
| `require_revision` | 要求学生修改 | `submission-task-agent` |

---

## target_resource 格式

格式：`{system}.{table_or_object}.{id}`

示例：

- `feishu.submissions.sub-20260706-001`
- `feishu.evaluations.eval-20260706-001`
- `feishu.challenges.C2S`
- `github.repo.zhanghao/c2s-submission`
- `ontology.student_memory.s001`

---

## routing_path 说明

记录完整的消息路由链路：

```json
{
  "routing_path": [
    "student-companion-s001",
    "submission-task-agent",
    "review-task-agent",
    "submission-task-agent"
  ]
}
```

这表示：
1. 学生 Companion Agent 发起
2. Submission Task Agent 接收并处理
3. Submission Task Agent 路由给 Review Task Agent
4. Review Task Agent 完成后回传给 Submission Task Agent

---

## before_state / after_state 设计

### 创建操作

```json
{
  "action": "create_submission_record",
  "before_state": null,
  "after_state": {
    "submission_id": "sub-xxx",
    "status": "checked"
  }
}
```

### 更新操作

```json
{
  "action": "update_submission_status",
  "before_state": {
    "status": "pending_review"
  },
  "after_state": {
    "status": "reviewed"
  }
}
```

### 删除操作（少见）

```json
{
  "action": "delete_draft_submission",
  "before_state": {
    "submission_id": "sub-xxx",
    "status": "draft"
  },
  "after_state": null
}
```

---

## MVP 实现方案

### 飞书表设计（或本地数据库）

**AuditLogs 表字段**：

| 字段 | 类型 | 说明 |
|---|---|---|
| `audit_id` | string | 审计记录 ID |
| `timestamp` | datetime | 操作时间 |
| `agent_id` | string | 执行 Agent ID |
| `action` | string | 操作类型 |
| `target_resource` | string | 被操作资源 |
| `before_state_json` | text | 操作前状态（JSON） |
| `after_state_json` | text | 操作后状态（JSON） |
| `routing_path` | text | 路由路径（逗号分隔或 JSON） |
| `related_message_id` | string | 相关消息 ID |
| `related_request_id` | string | 请求链路 ID |
| `metadata_json` | text | 附加元数据（JSON） |

### TypeScript 实现示意

```typescript
// src/lib/agents/audit-logger.ts
import { makeId } from "@/lib/ids";

export type AuditLog = {
  audit_id: string;
  timestamp: string;
  agent_id: string;
  action: string;
  target_resource: string;
  before_state: object | null;
  after_state: object | null;
  routing_path: string[];
  related_message_id: string;
  related_request_id: string;
  metadata?: object;
};

export async function writeAuditLog(log: Omit<AuditLog, "audit_id" | "timestamp">): Promise<string> {
  const audit_id = makeId("audit");
  const timestamp = new Date().toISOString();
  
  // 写入 AuditLogs 表（飞书表或本地数据库）
  // ...
  
  return audit_id;
}
```

---

## 查询与追溯

### 按 request_id 查询完整交互链路

```sql
SELECT * FROM AuditLogs
WHERE related_request_id = 'req-xxx'
ORDER BY timestamp ASC
```

这能还原一次完整的提交→评审→反馈流程。

### 按 agent_id 查询某个 Agent 的所有操作

```sql
SELECT * FROM AuditLogs
WHERE agent_id = 'submission-task-agent'
ORDER BY timestamp DESC
LIMIT 100
```

### 按 target_resource 查询某条记录的所有变更

```sql
SELECT * FROM AuditLogs
WHERE target_resource = 'feishu.submissions.sub-20260706-001'
ORDER BY timestamp ASC
```

---

## 验收标准

- [ ] 每次 Submission Task Agent 写入飞书，都有对应 Audit Log
- [ ] Audit Log 包含完整 routing_path
- [ ] 可以按 request_id 追溯完整交互链路
- [ ] before_state / after_state 能反映状态变化

---

## 相关文档

- `agents/messages/message-envelope-schema.md` — 消息格式
- `agents/inbox/README.md` — Inbox 如何触发 Audit Log
- `agents/agent-collaboration-flow.md` — 完整协作流程
