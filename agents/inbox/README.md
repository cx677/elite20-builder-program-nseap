# Agent Inbox / Outbox 设计

每个 Agent 必须有标准化 Inbox。Inbox 不是普通消息队列，而是 Agent Gateway，是外部消息进入 Agent 的唯一入口。

---

## 为什么需要 Inbox

没有 Inbox 时：

```text
Student Companion Agent
→ 直接调用 feishu.createSubmission()
→ 直接调用 github.checkRepo()
→ 没有身份验证、没有权限检查、没有审计记录
```

有 Inbox 后：

```text
Student Companion Agent
→ 发出 submission_request 消息（有身份、有签名）
→ Submission Task Agent Inbox 接收
  → 验证身份
  → 验证 Trusted Relationship
  → 验证权限
  → 写入 Audit Log
  → 处理消息
```

---

## Inbox 职责

| 职责 | 说明 |
|---|---|
| 接收消息 | 接收符合 Message Envelope 格式的消息 |
| 身份认证 | 验证 from_agent 的身份是否有效 |
| 签名验证 | 防止消息伪造 |
| Trusted Relationship 校验 | 发送方是否在接收方的可信关系列表中 |
| Policy Check | 消息类型是否被允许 |
| Priority 排序 | 按 routing_metadata.priority 排队 |
| 去重 | 防止重复处理同一条消息 |
| Companion Online Detection | 检查接收方 Agent 是否在线 |
| Offline Queue | 接收方离线时暂存消息 |
| Retry | 处理失败时按 max_retries 重试 |
| Pending Queue | 不可信消息等待人工批准 |
| 审计日志 | 每条消息都写入 Audit Log |
| 转发 | 按路由规则转发给其他 Agent |

---

## Inbox 处理流程

```text
收到 MessageEnvelope
→ 1. 验证 message_id 格式合法
→ 2. 验证 from_agent 在 AgentIdentity 表中存在
→ 3. 验证消息签名（MVP 可跳过，但字段预留）
→ 4. 查找 TrustedRelationship(from=from_agent, to=this.agent_id)
    ├── 找到且 trust_level=auto → 进入处理队列
    ├── 找到且 trust_level=require-approval → 进入 Pending Queue
    └── 未找到或 trust_level=denied → 拒绝，写 Audit Log，返回拒绝通知
→ 5. Policy Check：message_type 被允许？
→ 6. Companion Online Detection：
    ├── 在线 → 立即处理
    └── 离线 → 放入 Offline Queue（按 ttl_seconds 保留）
→ 7. 写入 Audit Log（收到时刻）
→ 8. 执行对应的 Handler
→ 9. 写入 Audit Log（处理完成时刻）
→ 10. 如果 requires_ack=true，发出 ACK 消息
```

---

## MVP 实现方案

MVP 阶段用数据库表模拟 Inbox Queue，不需要复杂消息中间件。

### 飞书表设计（或本地数据库）

**InboxQueue 表字段**：

| 字段 | 类型 | 说明 |
|---|---|---|
| `queue_id` | string | 队列记录 ID |
| `message_id` | string | 消息 ID |
| `request_id` | string | 请求链路 ID |
| `from_agent` | string | 发送方 Agent ID |
| `to_agent` | string | 接收方 Agent ID |
| `message_type` | string | 消息类型 |
| `status` | string | `pending` \| `processing` \| `done` \| `failed` \| `rejected` |
| `priority` | string | `urgent` \| `high` \| `normal` \| `low` |
| `payload_json` | text | 消息 payload（JSON 字符串） |
| `received_at` | datetime | 收到时间 |
| `processed_at` | datetime | 处理完成时间 |
| `retry_count` | number | 重试次数 |
| `error_message` | string | 失败原因（如有） |
| `audit_trace_pointer` | string | 指向 Audit Log |

### TypeScript 实现示意

```typescript
// src/lib/agents/inbox-queue.ts
import { makeId } from "@/lib/ids";
import type { MessageEnvelope } from "@/lib/agents/message-envelope";

export async function enqueueMessage(envelope: MessageEnvelope): Promise<string> {
  const queueId = makeId("q");
  // 写入 InboxQueue 表（飞书表或本地数据库）
  // 返回 queue_id
  return queueId;
}

export async function processNextMessage(agentId: string): Promise<void> {
  // 取出最高优先级的 pending 消息
  // 执行对应 Handler
  // 更新状态为 done 或 failed
}
```

---

## Outbox 职责

Outbox 负责 Agent 发出消息：

- 发出响应（对收到消息的回复）
- 发布状态事件
- 通知其他 Agent
- 写入 routing history
- 触发后续任务

Outbox 在 MVP 阶段可以直接调用 `enqueueMessage()` 发出消息，不需要独立服务。

---

## Trusted Relationship 与 Inbox 的关系

Inbox 每次处理消息前，必须检查：

```text
TrustedRelationship.find({
  agent_a: envelope.from_agent,
  agent_b: this.agent_id,
  status: active
})
```

如果关系不存在或已过期：
- `required-approval`：放入 Pending Queue
- `denied`：直接拒绝

---

## 相关文档

- `agents/messages/message-envelope-schema.md` — 消息格式
- `agents/audit/audit-log-schema.md` — 审计记录结构
- `agents/agent-collaboration-flow.md` — 完整协作流程
