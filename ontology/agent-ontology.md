# Agent Ontology

本文档定义 Agent 运行要素的语义结构。这是 7.6 更新后新增的 Ontology 层，用于覆盖 Agent 身份、通信、权限、审计等概念。

---

## 核心概念关系图

```text
AgentIdentity (谁)
  ├── AgentManifest (能做什么)
  ├── ChannelBinding (绑定哪些外部身份)
  ├── TrustedRelationship (信任谁)
  ├── Presence (当前状态)
  └── MemoryBinding (绑定哪些 Ontology Memory)

MessageEnvelope (通信协议)
  ├── from_agent → AgentIdentity
  ├── to_agent → AgentIdentity
  └── audit_trace_pointer → AuditTrace

AgentInbox (接收消息)
  ├── 验证 TrustedRelationship
  ├── 验证 Presence
  └── 写入 AuditTrace

AgentOutbox (发出消息)
  └── 记录 RoutingHistory

AuditTrace (审计记录)
  ├── agent_id → AgentIdentity
  ├── target_resource
  └── routing_path
```

---

## 1. AgentIdentity（Agent 身份）

定义一个 Agent 是谁。

```json
{
  "agent_id": "student-companion-s001",
  "agent_type": "student-companion",
  "owner_id": "s001",
  "display_name": "张浩的学习助手",
  "created_at": "2026-07-01T00:00:00Z",
  "status": "active"
}
```

### 字段说明

| 字段 | 类型 | 说明 |
|---|---|---|
| `agent_id` | string | Agent 唯一标识，格式 `{type}-{owner_id}` 或系统分配 |
| `agent_type` | enum | `student-companion` \| `teacher-companion` \| `submission-task` \| `review-task` \| `peer-review` |
| `owner_id` | string | 所属用户 ID（系统 Agent 为 `system`） |
| `display_name` | string | 展示名称 |
| `created_at` | datetime | 创建时间 |
| `status` | enum | `active` \| `suspended` \| `archived` |

---

## 2. AgentManifest（Agent 能力清单）

定义一个 Agent 能做什么、有什么接口、有什么权限。

```json
{
  "agent_id": "submission-task-agent",
  "manifest_version": "1.0",
  "capabilities": [
    "validate_submission",
    "create_feishu_record",
    "route_to_review",
    "write_audit_log"
  ],
  "interfaces": [
    {
      "interface_name": "submission_request",
      "input_schema": {
        "type": "object",
        "required": ["student_id", "challenge_id", "github_repo_url"],
        "properties": {
          "student_id": {"type": "string"},
          "challenge_id": {"type": "string"},
          "github_repo_url": {"type": "string"}
        }
      },
      "output_schema": {
        "type": "object",
        "properties": {
          "submission_id": {"type": "string"},
          "status": {"type": "string"}
        }
      }
    }
  ],
  "permissions": [
    "feishu.submissions.create",
    "feishu.submissions.read",
    "feishu.evaluations.create",
    "feishu.portfolio.create",
    "github.repo.read"
  ],
  "trusted_agents": [
    "student-companion-*",
    "teacher-companion-*"
  ],
  "memory_binding": [
    "ontology.submission_memory"
  ],
  "channel_bindings": [
    {
      "channel_type": "feishu",
      "channel_id": "bot-submission-task"
    }
  ]
}
```

### 字段说明

| 字段 | 说明 |
|---|---|
| `capabilities` | Agent 声明的能力列表 |
| `interfaces` | Agent 对外提供的接口及其输入输出 Schema |
| `permissions` | Agent 拥有的权限列表（格式 `{system}.{resource}.{action}`） |
| `trusted_agents` | 可信 Agent 列表（支持通配符） |
| `memory_binding` | 绑定的 Ontology Memory 节点 |
| `channel_bindings` | 绑定的外部通道（飞书 Bot、GitHub App 等） |

---

## 3. TrustedRelationship（可信关系）

定义两个 Agent 之间的信任关系。

```json
{
  "relationship_id": "rel-xxxxxxxxxxxxxxxx",
  "agent_a": "student-companion-s001",
  "agent_b": "submission-task-agent",
  "relationship_type": "companion-to-task-agent",
  "trust_level": "auto",
  "permissions": [
    "send_submission_request",
    "receive_feedback"
  ],
  "capabilities": [
    "submission_request"
  ],
  "expiration": null,
  "last_verified": "2026-07-06T00:00:00Z",
  "status": "active"
}
```

### 字段说明

| 字段 | 说明 |
|---|---|
| `relationship_id` | 关系唯一 ID |
| `agent_a` | 发起方 Agent ID |
| `agent_b` | 接收方 Agent ID |
| `relationship_type` | 关系类型（描述性） |
| `trust_level` | `auto`（自动执行） \| `require-approval`（需人工批准） \| `denied`（拒绝） |
| `permissions` | A 对 B 有哪些权限 |
| `capabilities` | A 可以调用 B 的哪些 capability |
| `expiration` | 过期时间（null 表示永久） |
| `last_verified` | 最后验证时间 |
| `status` | `active` \| `expired` \| `revoked` |

---

## 4. ChannelBinding（通道绑定）

Agent 绑定的外部身份。

```json
{
  "binding_id": "bind-xxxxxxxxxxxxxxxx",
  "agent_id": "teacher-companion-richard",
  "channel_type": "feishu",
  "channel_id": "ou-xxxxxxxxxxxx",
  "channel_name": "Richard（飞书用户）",
  "status": "active"
}
```

### 常见 channel_type

| channel_type | channel_id 示例 | 说明 |
|---|---|---|
| `feishu` | `ou-xxxxxxxxxxxx` | 飞书用户 ID 或 Bot ID |
| `github` | `zhanghao` | GitHub username |
| `web` | `session-xxxxxxxx` | Web 会话 ID |

---

## 5. AgentInbox（接收队列）

每个 Agent 的消息接收队列状态。

```json
{
  "agent_id": "submission-task-agent",
  "queue_type": "online",
  "pending_messages": [
    {
      "message_id": "msg-xxx",
      "from_agent": "student-companion-s001",
      "message_type": "submission_request",
      "received_at": "2026-07-06T10:00:00Z",
      "status": "pending"
    }
  ]
}
```

---

## 6. AgentOutbox（发送队列）

每个 Agent 的消息发送历史。

```json
{
  "agent_id": "submission-task-agent",
  "pending_events": [],
  "routing_history": [
    {
      "message_id": "msg-yyy",
      "to_agent": "review-task-agent",
      "sent_at": "2026-07-06T10:05:00Z",
      "status": "delivered"
    }
  ]
}
```

---

## 7. MessageEnvelope（消息封装）

见 `agents/messages/message-envelope-schema.md`。

核心字段：
- `message_id`
- `from_agent` → AgentIdentity
- `to_agent` → AgentIdentity
- `message_type`
- `payload`
- `routing_metadata`
- `audit_trace_pointer` → AuditTrace

---

## 8. AuditTrace（审计记录）

见 `agents/audit/audit-log-schema.md`。

核心字段：
- `audit_id`
- `agent_id` → AgentIdentity
- `action`
- `target_resource`
- `before_state` / `after_state`
- `routing_path`
- `related_message_id`

---

## 9. Presence（在线状态）

Agent 的实时状态。

```json
{
  "agent_id": "student-companion-s001",
  "status": "online",
  "last_seen": "2026-07-06T10:10:00Z",
  "current_task": "preparing_submission",
  "available_capabilities": [
    "submit_challenge",
    "check_github"
  ]
}
```

### status 枚举

| status | 说明 |
|---|---|
| `online` | 在线，可立即处理消息 |
| `busy` | 忙碌，消息进入队列 |
| `offline` | 离线，消息进入 Offline Queue |
| `do-not-disturb` | 免打扰，只接收高优先级消息 |
| `paused` | 暂停，不接收任何消息 |

---

## 10. ResourceConfig（资源配置）

每个学生/教师的个人配置。

```json
{
  "user_id": "s001",
  "user_type": "student",
  "agent_id": "student-companion-s001",
  "feishu_user_id": "ou-xxxxxxxxxxxx",
  "github_username": "zhanghao",
  "github_profile_url": "https://github.com/zhanghao",
  "current_challenges": ["C2S", "C8"],
  "rubric_pointers": {
    "default": "challenges/rubrics/default-rubric.md"
  },
  "notification_preferences": {
    "feishu": true,
    "email": false
  }
}
```

---

## 与其他 Ontology 的关系

### AgentIdentity → Student / Teacher

```text
Student
  ├── student_id
  └── agent_id → AgentIdentity (student-companion-{student_id})

Teacher
  ├── teacher_id
  └── agent_id → AgentIdentity (teacher-companion-{teacher_id})
```

### Challenge → AgentIdentity

```text
Challenge
  ├── challenge_id
  ├── teacher_agent_id → AgentIdentity
  └── rubric_pointer
```

### Submission → AgentIdentity

```text
Submission
  ├── submission_id
  ├── submitted_by_agent_id → AgentIdentity (student-companion-xxx)
  ├── processed_by_agent_id → AgentIdentity (submission-task-agent)
  └── audit_log_pointer → AuditTrace
```

---

## 验收标准

- [ ] AgentIdentity、AgentManifest、TrustedRelationship、MessageEnvelope、AuditTrace 的语义定义清晰
- [ ] 说明了 Agent 与 Student / Teacher / Challenge / Submission 的关系
- [ ] ResourceConfig 结构可用于学生和教师的个人配置

---

## 相关文档

- `ontology/course-ontology.md` — 课程本体
- `ontology/challenge-ontology.md` — Challenge 本体
- `ontology/assessment-ontology.md` — 评估本体
- `agents/agent-collaboration-flow.md` — Agent 协作流程
- `agents/messages/message-envelope-schema.md` — 消息格式
- `agents/audit/audit-log-schema.md` — 审计记录
