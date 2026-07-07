# Elite20 Platform — Agent 接口规范

> **文档状态:** 基于 IEEE P3394 D1.0.0 草案对齐
> **版本:** v0.2 (P3394-aligned)
> **最后更新:** 2026-06-29
> **标准参考:** [Agent 本体](../../../ontology/agent-ontology.md)

---

## 1. 定位

本文档定义 Elite20 Builder Program 中 **Platform（Team 5）** 与 **Agent（Team 3）** 之间的接口契约，**对齐 IEEE P3394 LLM Agent Interface Standard**。

P3394 定义了 Agent 互操作的五大模块：Agent Manifest、Channel & Channel Adapter、Universal Message Format (UMF)、Session、Security。Elite20 Platform 作为 P3394 部署的协调方，负责：

- 提供通道（Channel）基础设施（Web / CLI / API）
- 管理 Agent 注册与发现（基于 Agent Manifest）
- 转发 UMF 消息
- 维护学习会话（Session）上下文
- 执行基于关系（Relationship）的授权

**涉及的 7 个 Agent（Team 3 交付）：**

| Agent | P3394 Channel | 主要关系 | 核心能力 |
|-------|---------------|---------|---------|
| Student Companion | openapi, wechat | client, owner | 学习陪伴、答疑 |
| Instructor Agent | openapi | client, peer | 课程讲解、知识传授 |
| Mentor Agent | openapi | client, peer | 职业指导、路径规划 |
| Coding Coach | openapi, cli | client, owner | 编码指导、代码审查 |
| Knowledge Librarian | openapi, mcp | peer, client | 知识库检索、资料推荐 |
| Evaluation Agent | openapi | administrator | 自动评分、学习评估 |
| Project Manager | openapi | administrator, peer | 项目进度管理 |

---

## 2. Agent Manifest 规范

每个 Agent **必须**发布一份 Agent Manifest（JSON/YAML），声明其公开契约。Manifest 声明"Agent 是什么、怎么访问它"，**不暴露**内部实现。

### 2.1 必需元素

```json
{
  "channels": [
    {
      "id": "student-companion/v1",
      "scope": "https://platform.elite20.edu/agents/",
      "channel": "openapi",
      "principal_source": "oauth2_sub_claim"
    }
  ],
  "service_principal": {
    "schema": {
      "person": "email or agent URI",
      "org": "organization identifier",
      "role": "student | instructor | admin"
    }
  },
  "channel_adapter": {
    "name": "elite20-openapi-adapter",
    "responsibilities": [
      "listen",
      "extract_channel_unique_id",
      "validate_security",
      "resolve_service_principal",
      "resolve_relationship",
      "validate_semantic_blocks",
      "normalize_to_umf",
      "deliver_to_handle_message"
    ]
  },
  "handle_message": {
    "input_forms": {
      "http": ["POST /m", "POST /p", "POST /z"],
      "cli": ["-m msg.json", "-p 'prompt'", "-z pkg.zip"],
      "mcp": ["tool_call handle_message"]
    },
    "canonical_form": "-m / POST /m (native UMF)"
  },
  "relationships": [
    {
      "name": "owner",
      "capability_access": "all",
      "allowed_speech_acts": "unrestricted"
    },
    {
      "name": "client",
      "capability_access": {
        "include": ["answer_question", "session_management"]
      },
      "allowed_speech_acts": ["request", "query"],
      "constraints": { "rate_limit": "100/hour" }
    }
  ],
  "capability": {
    "name": "handle_message",
    "declarations": [
      {
        "name": "answer_question",
        "description": "Answer student questions about course content",
        "input_schema": { "$ref": "schemas/answer_question.input.v1.json" },
        "output_schema": { "$ref": "schemas/answer_question.output.v1.json" },
        "semantic_block_spec": {
          "max_embedding_depth": 2,
          "allowed_formats": ["text", "markdown", "json"],
          "allowed_languages": ["zh", "en"],
          "allow_executable_blocks": false
        }
      }
    ],
    "bindings": [
      {
        "relationship": "client",
        "channels": ["openapi"],
        "capabilities": ["answer_question", "session_management"],
        "semantic_block_policy": "standard"
      }
    ]
  },
  "conformance": {
    "p3394_level": 2,
    "p3394_version": "D1.0.0",
    "normative_interface": "handle_message"
  }
}
```

### 2.2 五种标准关系

Elite20 Platform 使用 P3394 定义的五种标准关系：

| 关系 | 适用场景 | 能力范围 | 语音行为 |
|------|---------|---------|---------|
| **owner** | 学生对自己的 Student Companion | 全部能力 | 不限制 |
| **administrator** | 教师对 Evaluation Agent | 配置 + 查看 + 会话管理 | request, command, query, configure |
| **peer** | Agent 之间（如 Librarian ↔ Coach） | 查询 + 委托 + 协商 | request, query, delegate, negotiate |
| **client** | 学生对 Instructor/Mentor | 已发布的服务能力 | request, query |
| **anonymous** | 未登录访客 | 仅发现（get_manifest） | query |

### 2.3 Session 配置

```json
{
  "session": {
    "mode": "session",
    "ownership": {
      "role": "owner_capable",
      "accepts_bootstrap": ["session.create", "agent-cli-cmd -s create"]
    },
    "tagging": {
      "correlation_id": true,
      "canonical_id_derivation": {
        "algorithm": "HMAC-SHA256",
        "inputs": ["server_secret", "principal_id", "channel_signature", "session_nonce"]
      }
    },
    "nesting": {
      "supports_child_sessions": true,
      "supports_being_parent": true,
      "max_depth": 5,
      "default_budget_inheritance": "capped"
    }
  }
}
```

### 2.4 必需的 session_management 能力

每个 owner_capable 的 Agent **必须**在 `capability.declarations` 中声明保留能力 `session_management`：

```json
{
  "name": "session_management",
  "description": "P3394 session lifecycle management",
  "input_schema": { "$ref": "p3394://schemas/session.request.v1.json" },
  "output_schema": { "$ref": "p3394://schemas/session.response.v1.json" },
  "semantic_block_spec": {
    "max_embedding_depth": 1,
    "allowed_formats": ["json"],
    "allowed_languages": ["*"],
    "allow_executable_blocks": false,
    "max_semantic_blocks_per_message": 1
  }
}
```

---

## 3. Channel 与 Channel Adapter

### 3.1 Elite20 支持的通道

| 通道 | 类型 | 用途 | principal_source |
|------|------|------|-----------------|
| **openapi** | Transport | Web 平台主通道 | oauth2_sub_claim |
| **cli** | Transport | 命令行开发 | os_user (implicit trust) |
| **mcp** | Transport | Agent 间互操作 | mcp_bearer_sub |
| **wechat** | Transport | 微信集成 | wechat_openid |
| **openai_chat_completions** | Compatibility | OpenAI 格式兼容 | api_key_identity |
| **anthropic_messages** | Compatibility | Anthropic 格式兼容 | api_key_identity |

### 3.2 Channel Adapter 八步责任

Platform 为每个通道提供 Channel Adapter 实现，必须完成八步：

```
入站消息
  │
  ├─ 1. listen                      监听通道
  ├─ 2. extract_channel_unique_id   提取通道唯一标识
  ├─ 3. validate_security           验证安全凭证
  ├─ 4. resolve_service_principal   解析服务主体 (person, org, role)
  ├─ 5. resolve_relationship        解析关系 (owner/admin/peer/client/anonymous)
  ├─ 6. validate_semantic_blocks    验证语义块（安全门）
  ├─ 7. normalize_to_umf            归一化为 UMF
  └─ 8. deliver_to_handle_message   交付到 handle_message
                                │
                                ▼
                          Agent 处理
```

### 3.3 三种输入形式

所有通道的输入最终归一化为 UMF。三种规范输入形式：

| 形式 | CLI | HTTP | MCP | 说明 |
|------|-----|------|-----|------|
| **-m** (canonical) | `-m msg.json` | `POST /m` | `tool_call handle_message` | 完整 UMF JSON |
| **-p** (prompt) | `-p 'prompt'` | `POST /p` | — | 纯文本提示 |
| **-z** (package) | `-z pkg.zip` | `POST /z` | — | 多部分包（文件/附件） |

### 3.4 端点解析

```
endpoint = resolve(channel, scope, id)

# URL-based 通道（openapi）:
scope = "https://platform.elite20.edu/agents/"  # 必须以 / 结尾
id = "student-companion/v1"                     # 不能以 / 开头
endpoint = scope + id = "https://platform.elite20.edu/agents/student-companion/v1"

# CLI 通道:
scope = "$PATH"
id = "elite20-student-companion"

# MCP 通道:
scope = "elite20-mcp-registry"
id = "student-companion"
```

---

## 4. Universal Message Format (UMF)

### 4.1 UMF 信封结构

```json
{
  "message_id": "uuid-v4",
  "sender": "student@elite20.edu",
  "recipient": "student-companion/v1",
  "message_type": "agent.handle_message.query",
  "content_type": "text/plain",
  "body": "什么是 KSTAR 循环？",
  "correlation_id": "session-abc123",
  "canonical_session_id": "session-abc123",
  "parent_session_id": null,
  "timestamp": "2026-06-29T22:00:00Z",
  "return_channel": "openapi",
  "attachments": [],
  "metadata": {
    "service_principal": {
      "person": "student@elite20.edu",
      "org": "sias-university",
      "role": "student"
    },
    "relationship": "client",
    "security_context_level": "standard",
    "invoked_capability": "answer_question",
    "semantic_block_policy": "standard",
    "session_lifecycle": "open",
    "session_owner": {
      "person": "student@elite20.edu",
      "org": "sias-university",
      "role": "student"
    },
    "session_epoch": 3
  }
}
```

### 4.2 必需字段

| 字段 | 类型 | 说明 |
|------|------|------|
| message_id | string | 全局唯一消息标识 |
| sender | string | 发送方标识 |
| recipient | string | 接收方端点 |
| message_type | string | namespace.action 格式（如 agent.handle_message.query） |
| content_type | string | MIME 类型 |
| body | string \| object | 消息内容 |

### 4.3 语音行为类型（Speech Acts）

message_type 可包含语音行为子类型：

| 语音行为 | 说明 | 适用关系 |
|---------|------|---------|
| request | 请求 | owner, administrator, peer, client, anonymous |
| command | 命令 | owner, administrator |
| query | 查询 | 全部 |
| configure | 配置 | owner, administrator |
| delegate | 委托 | owner, administrator, peer |
| negotiate | 协商 | owner, peer |

### 4.4 保留 session.* 消息类型

```
session.create                    创建会话
session.context_variables.update  更新上下文变量
session.participants.update       更新参与者
session.budgets.update            更新预算
session.memory_pointers.update    更新记忆指针
session.lifecycle.transition      生命周期转换
session.context.fetch             查询会话上下文
```

### 4.5 标准错误消息（agent.error）

适配器边界失败时返回：

```json
{
  "message_type": "agent.error",
  "body": {
    "reason_code": "SEMANTIC_BLOCK_VIOLATION",
    "message": "Embedding depth exceeded maximum",
    "details": { "max_depth": 2, "actual_depth": 4 }
  }
}
```

错误码词汇表：AUTHENTICATION_FAILED, AUTHORIZATION_DENIED, CAPABILITY_NOT_FOUND, SEMANTIC_BLOCK_VIOLATION, SESSION_NOT_FOUND, SESSION_TERMINATED, MALFORMED_INPUT, RATE_LIMIT_EXCEEDED, CHANNEL_UNAVAILABLE, INTERNAL_ERROR。

---

## 5. Session 模型

### 5.1 三种会话模式

| 模式 | 说明 | 适用 Agent |
|------|------|-----------|
| **stateless** | 无状态，每条消息独立 | Knowledge Librarian（纯查询） |
| **session** | 关联绑定，七态生命周期 | Student Companion, Coding Coach |
| **persistent** | 长期持久，跨重启 | Mentor Agent（长期指导） |

### 5.2 Session Context 五分区

```
Session Context
├── context_variables       上下文变量（如 @@Course="VibeCoding", @@Week=1）
├── participants            参与者和角色
├── budgets_and_constraints 预算和约束（速率限制、token 配额、超时）
├── memory_pointers         记忆指针（个人文档、知识库、工作目录）
└── child_sessions          子会话列表
```

### 5.3 七态生命周期

```
provisioning → open → suspended → closing → closed
                                      ↓
                                  failed / aborted
                                      ↓
                                   archived
```

- **provisioning**: 创建中，资源分配
- **open**: 活跃处理
- **suspended**: 暂停（成本/空闲）
- **closing**: 优雅终止中
- **closed**: 正常终止
- **failed/aborted**: 异常终止
- **archived**: 归档（只读）

### 5.4 会话嵌套

Platform 支持会话嵌套（如 Student Companion 调用 Coding Coach）：

- 父会话通过 `session.create` 传 `parent_session_id` 创建子会话
- 子会话获得新的 `canonical_session_id`
- 子会话上下文默认隔离
- 父会话通过 `passed_variables`（by-value 或 by-reference）授予可见性
- 生命周期级联：父会话终止 → 子会话终止
- 预算继承：share / capped / independent

### 5.5 Dumb-Agent Bootstrap

无状态客户端（如浏览器代理）启动会话：

```
# API 方式
POST /m
{
  "message_type": "session.create",
  "body": { "initial_context": {} }
}

# CLI 方式
agent-cli-cmd -s create
```

---

## 6. Security 规范

### 6.1 Service Principal

Elite20 的 Service Principal 结构：

```json
{
  "person": "student@elite20.edu",    // 全局唯一标识
  "org": "sias-university",            // 组织上下文
  "role": "student"                    // 功能角色
}
```

同一人在不同 org/role 下是不同的 Principal，解析为不同的关系。

### 6.2 Principal Resolution Chain

```
channel_unique_id                    // 从通道提取
    ↓
principal_mapping_registry           // 内部映射表
    ↓
service_principal (person, org, role) // 结构化主体
    ↓
relationship_mapping                 // 首次匹配规则
    ↓
relationship type                    // owner/admin/peer/client/anonymous
    ↓
capability_access                    // 能力授权
```

### 6.3 非升级不变量（核心安全保证）

**三条不可违反的规则：**

1. **Security Context Elevation**: 提升的安全上下文不能超过关系上限。client 关系永远不能提升到 privileged。
2. **Delegation**: 子 Agent 不能拥有比委托者更高的关系权限。
3. **Extensions**: 扩展不能绕过核心授权流（principal → relationship → capability）。

### 6.4 Semantic Block Constraints（安全功能）

语义块验证是**安全门**，不是格式化步骤。防御多级嵌入攻击（如 McKinsey Lilli 泄露模式）。

```json
{
  "semantic_block_constraints": {
    "policies": {
      "permissive": { "max_embedding_depth": 5, "allow_executable_blocks": true },
      "standard":   { "max_embedding_depth": 2, "allow_executable_blocks": false },
      "strict":     { "max_embedding_depth": 1, "allow_executable_blocks": false },
      "minimal":    { "max_embedding_depth": 1, "allow_executable_blocks": false, "allowed_formats": ["text"] }
    }
  }
}
```

运行时有效契约 = 能力的 `semantic_block_spec` ∩ 关系的 `semantic_block_policy`（最严格胜出）。

### 6.5 Principal-Associated Resources

资源是 **principal 级别**的，不是 agent 级别的：

- 学生的文档文件夹绑定到该学生的 Principal
- Knowledge Librarian 在不同学生的会话中访问不同的资源
- 跨 Principal 资源访问是**非升级违规**（与超越关系上限同类）

---

## 7. Conformance Levels

Elite20 Agent 应至少达到 **Level 2 (Standard)**：

| 级别 | 要求 | Elite20 目标 |
|------|------|------------|
| **Level 1 — Minimal** | UMF + handle_message + Agent Manifest 基础 | 最低门槛 |
| **Level 2 — Standard** | + Session + semantic block constraints | **所有 Agent 必须** |
| **Level 3 — Advanced** | + security context elevation + extension profiles | Evaluation Agent / Project Manager |

---

## 8. Platform 实现职责

Platform（Team 5）负责实现以下 P3394 基础设施：

| 职责 | 说明 | 状态 |
|------|------|------|
| Channel Adapter（openapi） | HTTP 通道适配器 | [待实现] |
| Channel Adapter（cli） | CLI 通道适配器 | [待实现] |
| Agent Registry | 基于 Manifest 的 Agent 注册与发现 | [待实现] |
| UMF 路由 | UMF 消息路由到目标 Agent | [待实现] |
| Session Manager | 会话生命周期管理 | [待实现] |
| Principal Registry | 学生/教师身份映射 | [待实现] |
| Semantic Block Validator | 消息结构安全验证 | [待实现] |
| Audit Log | 消息审计日志 | [待实现] |

---

## 9. Team 3 实现指引

Team 3 开发 Agent 时需要：

1. **发布 Agent Manifest** — JSON/YAML 格式，遵循 §2 规范
2. **实现 handle_message** — 唯一规范入口，接受 UMF
3. **声明能力** — 每个能力有 input/output schema + semantic_block_spec
4. **支持 session_management** — owner_capable 的 Agent 必须实现
5. **遵循非升级不变量** — 不能绕过关系授权
6. **达到 Level 2 一致性** — 至少支持 Session + semantic block constraints

---

## 参考资料

- [Agent 本体](../../../ontology/agent-ontology.md) — 主仓库内的 Agent 结构设计
- [Agent 协作流程](../../../agents/agent-collaboration-flow.md) — 主仓库内的 Agent 工作流
- [标准映射](../../../standards/standards-mapping.md) — Richard 资料与仓库结构的对应关系
- [从 OpenClaw 到 P3394 架构](https://mp.weixin.qq.com/s/Fd49jcGizkZ8B7y1jrmMjg) — 行业验证文章

_本文档基于 P3394 D1.0.0 草案。标准正式发布后需同步更新。_
