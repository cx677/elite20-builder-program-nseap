# Ontology Team

负责建立课程、学生、挑战、技能、产物、评价和 Agent 之间的语义关系。

## 当前成员

- Richard（方向对齐）
- 张浩（落地版字段草案）

## 核心任务（7.6 更新）

**重要变化**：Ontology 层必须扩展为覆盖 **Agent 运行要素**，不能只停留在课程学习层面。

目前已有的 5 个 Ontology（Course / Skill / Challenge / Project / Assessment）是好的起点，但必须加入以下 Agent-native 结构。

## 本周最小交付

### 1. 现有 Ontology 更新

- `ontology/challenge-ontology.md`（补充 teacher_agent_id、rubric_pointer、submission_schema 字段）
- `ontology/course-ontology.md`（补充 Course 与 Agent 关系）
- `ontology/assessment-ontology.md`（补充 Review Task Agent 关系）

### 2. 新增 Agent Ontology

- `ontology/agent-ontology.md`（核心新文档）

必须定义以下概念和关系：

```text
AgentIdentity
  - agent_id: string (唯一标识)
  - agent_type: student-companion | teacher-companion | submission-task | review-task | peer-review
  - owner_id: string (绑定的学生或教师 ID)
  - display_name: string

AgentManifest
  - agent_id
  - capabilities: string[] (能力声明，如 submit_challenge、check_github)
  - interfaces: Interface[] (输入输出接口)
  - permissions: Permission[] (权限边界)
  - trusted_agents: string[] (可信 Agent 列表)
  - memory_binding: MemoryRef[] (绑定的 Ontology Memory)
  - channel_bindings: ChannelBinding[] (飞书/GitHub 绑定)

ChannelIdentity
  - agent_id
  - channel_type: feishu | github | web
  - channel_id: string (飞书 bot ID / GitHub username 等)

AgentInbox
  - agent_id
  - queue_type: online | offline | pending_approval
  - messages: MessageEnvelope[]

AgentOutbox
  - agent_id
  - pending_events: MessageEnvelope[]
  - routing_history: RoutingRecord[]

TrustedRelationship
  - relationship_id
  - agent_a: string
  - agent_b: string
  - relationship_type: companion | task-agent | peer
  - trust_level: auto | require-approval | denied
  - permissions: string[]
  - capabilities: string[]
  - expiration: datetime | null
  - last_verified: datetime

MessageEnvelope
  - message_id: string
  - request_id: string
  - from_agent: string
  - to_agent: string
  - message_type: submission_request | review_request | feedback | status_update | challenge_publish
  - timestamp: datetime
  - payload: object
  - routing_metadata: RoutingMeta
  - audit_trace_pointer: string

AuditTrace
  - audit_id: string
  - timestamp: datetime
  - agent_id: string (谁执行)
  - action: string (做了什么)
  - target_resource: string (操作了什么)
  - before_state: object | null
  - after_state: object | null
  - routing_path: string[]
  - related_message_id: string

Presence
  - agent_id
  - status: online | busy | offline | do-not-disturb | paused
  - last_seen: datetime
  - current_task: string | null
```

### 3. 关系图 Schema

- `ontology/relationship-graph-schema.md`

描述以下关系：

```text
Teacher Companion Agent
├── Student Companion Agent (1:N)
├── Submission Task Agent (has-access-to)
├── Review Task Agent (delegates-to)
└── Course (manages)

Student Companion Agent
├── Submission Task Agent (sends-to)
├── Teacher Companion Agent (receives-from)
└── Portfolio (owns)

Submission Task Agent
├── Student Companion Agent (receives-from, sends-feedback-to)
├── Review Task Agent (routes-to)
├── Feishu Bitable (writes-to)
└── GitHub (validates)
```

### 4. Message Envelope Schema

- `ontology/message-envelope-schema.md`

与 Agent Team 合作，定义所有 Agent 消息的标准外壳。

### 5. ResourceConfig Schema

- `ontology/resource-config-schema.md`

每个学生/老师的个人配置：
```json
{
  "user_id": "...",
  "feishu_user_id": "...",
  "github_username": "...",
  "agent_id": "student-companion-xxx",
  "current_challenges": ["C2S", "C8"],
  "rubric_pointers": {"default": "rubrics/default-rubric.md"},
  "feishu_notification_preference": "all | mentions | none"
}
```

## 核心原则

Ontology 的目标是：

> 让任何 Agent 在任何时刻都能查到"谁是谁、谁能做什么、谁信任谁、发生了什么"——不依赖上下文猜测，只依赖结构化记录。

## 与其他 Team 的接口

- **Agent Team**：Ontology 定义 Agent 运行要素的语义结构，Agent Team 实现具体代码
- **Challenge Team**：Ontology 定义 Challenge 的字段关系
- **Platform Team**：Ontology 字段最终映射到飞书表字段和 TypeScript 类型

## P3394-compatible 方向

当前阶段可以先落到以下结构上，不做空泛概念：

- AgentManifest（能力声明）
- MessageEnvelope（消息标准外壳）
- TrustedRelationship（关系校验）
- AuditTrace（审计元数据）

后续有时间再完整对齐 P3394 标准。

## 验收标准

- [ ] `agent-ontology.md` 完整定义 AgentIdentity、AgentManifest、TrustedRelationship、MessageEnvelope、AuditTrace
- [ ] `relationship-graph-schema.md` 清晰描述 4 个核心 Agent 之间的关系
- [ ] `resource-config-schema.md` 定义学生和老师的资源配置结构
- [ ] 现有 5 个 Ontology 文件补充 Agent 相关字段

## 参考资料

- 现有 Ontology 文件：`ontology/`
- 任务规划：`docs/phase2-builder-task-plan.md`
- Agent 架构：`teams/agent-team/README.md`
