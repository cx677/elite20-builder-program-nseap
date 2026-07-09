# Agent 拆分实施文档

版本：v1.0  
日期：2026-07-09  
用途：Platform Team 将 `workflow.ts` 单体流程拆成 Agent 消息链  

> 前置条件：已阅读 `docs/feishu-table-schema.md`（飞书表结构）、`agents/audit/audit-log-schema.md`（审计日志）、`agents/inbox/README.md`（Inbox 设计）、`agents/messages/message-envelope-schema.md`（消息格式）。

---

## 0. 拆分前 vs 拆分后

### 当前（单体）

```
POST /api/submit
  → workflow.ts: submitChallengeProject(input)
    ├── validateInput()
    ├── feishu.getStudentById()
    ├── feishu.getChallengeById()
    ├── github.checkRepoHealth()
    ├── ai.evaluateSubmission()
    ├── feishu.createSubmission()
    ├── feishu.createEvaluation()
    ├── ai.generatePortfolioDescription()
    └── feishu.createPortfolioItem()
  → 返回 WorkflowResult
```

**问题**：
- 所有逻辑写死在一个函数里
- 没有 Agent 身份（谁调用的？谁处理的？）
- 没有审计日志
- 没有消息路由
- 前端同步等结果，无法异步处理

### 目标（Agent 消息链）

```
POST /api/submit (前端入口不变)
  → createSubmissionRequest(input)
    → 构造 MessageEnvelope { from: student-companion-{id}, to: submission-task-agent, type: submission_request }
    → 写入 InboxQueue（status=pending）
    → 写入 AuditLog（action=submission_request_received）
    → 返回 { request_id, status: "received" }

系统侧异步（或同步模拟异步）：
  SubmissionTaskAgent.processNext()
    → 从 InboxQueue 取出下一条 pending 消息
    → verifyAgentIdentity(from_agent)
    → verifyTrustedRelationship(from_agent, to_agent)
    → dedupCheck(message_id)
    → validateSubmission()
    → checkGitHub()
    → createSubmissionRecord()
    → writeAuditLog()
    → routeToReview()
    → 更新 InboxQueue status=done
    → 触发 notifyStudent()
```

---

## 1. 新增 TypeScript 类型

### 文件：`src/lib/agents/types.ts`（新建）

```typescript
// 消息类型枚举 — 对齐 agents/messages/message-envelope-schema.md
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

export type RoutingPriority = "urgent" | "high" | "normal" | "low";

export type InboxStatus = "pending" | "processing" | "done" | "failed" | "rejected";

export type SubmissionValidationStatus = "pending" | "passed" | "failed" | "needs_revision";

export type ReviewMode = "ai_first" | "teacher_first" | "peer_first";

export type RoutingStatus = "pending_review" | "routed" | "review_complete";

export type AuditAction =
  | "create_submission_record"
  | "update_submission_status"
  | "create_evaluation_record"
  | "route_to_review"
  | "send_feedback"
  | "publish_challenge"
  | "submission_request_received";

// Message Envelope
export type MessageEnvelope<T = unknown> = {
  message_id: string;
  request_id: string;
  from_agent: string;
  to_agent: string;
  message_type: MessageType;
  timestamp: string;
  payload: T;
  routing_metadata: {
    priority: RoutingPriority;
    retry_count: number;
    max_retries: number;
    ttl_seconds: number;
    requires_ack: boolean;
  };
  audit_trace_pointer: string;
};

// Inbox Queue Record
export type InboxRecord = {
  queue_id: string;
  message_id: string;
  request_id: string;
  from_agent: string;
  to_agent: string;
  message_type: MessageType;
  status: InboxStatus;
  priority: RoutingPriority;
  payload_json: string;
  received_at: string;
  processed_at?: string;
  retry_count: number;
  error_message?: string;
  audit_trace_pointer: string;
};

// Audit Log Record
export type AuditLogRecord = {
  audit_id: string;
  timestamp: string;
  agent_id: string;
  action: AuditAction;
  target_resource: string;
  before_state: object | null;
  after_state: object | null;
  routing_path: string[];
  related_message_id: string;
  related_request_id: string;
  metadata?: object;
};

// Submission Request Payload — 对齐现有 SubmissionInput
export type SubmissionRequestPayload = {
  student_id: string;
  challenge_id: string;
  project_title: string;
  project_summary: string;
  github_repo_url: string;
  readme_url?: string;
  demo_url?: string;
  aar_text: string;
  self_evaluation_text: string;
  is_public: boolean;
};
```

---

## 2. 新增文件清单

在 MVP 代码仓库 `ai-x-challenge-learning-mvp/src/lib/agents/` 下新建：

| 文件 | 职责 | 依赖 |
|---|---|---|
| `types.ts` | Agent 类型定义 | 无 |
| `ids.ts` | 生成 message_id / request_id / audit_id / queue_id | 复用或新建 |
| `message-envelope.ts` | 构造和验证 Message Envelope | `types.ts` |
| `audit-logger.ts` | 写审计日志到飞书 AuditLogs 表 | `types.ts`, `feishu.ts` |
| `inbox-queue.ts` | 消息入队 / 出队 / 更新状态 | `types.ts`, `feishu.ts` |
| `submission-task-agent.ts` | Submission Task Agent 核心逻辑 | 以上全部 + `github.ts` + `ai.ts` |
| `trusted-relationship.ts` | 验证 Agent 间可信关系 | `types.ts`, `feishu.ts` |

---

## 3. 核心模块实现步骤

### 步骤 1：`message-envelope.ts` — 消息封装

```typescript
// src/lib/agents/message-envelope.ts
import { makeId } from "@/lib/ids";
import type { MessageEnvelope, MessageType } from "./types";

export function createEnvelope<T>(params: {
  from_agent: string;
  to_agent: string;
  message_type: MessageType;
  payload: T;
}): MessageEnvelope<T> {
  const request_id = makeId("req");
  const message_id = makeId("msg");
  const audit_trace_pointer = makeId("audit");

  return {
    message_id,
    request_id,
    from_agent: params.from_agent,
    to_agent: params.to_agent,
    message_type: params.message_type,
    timestamp: new Date().toISOString(),
    payload: params.payload,
    routing_metadata: {
      priority: "normal",
      retry_count: 0,
      max_retries: 3,
      ttl_seconds: 3600,
      requires_ack: true,
    },
    audit_trace_pointer,
  };
}

export function validateEnvelope(envelope: MessageEnvelope): string | null {
  if (!envelope.message_id.startsWith("msg-")) return "invalid message_id";
  if (!envelope.request_id.startsWith("req-")) return "invalid request_id";
  if (!envelope.from_agent) return "missing from_agent";
  if (!envelope.to_agent) return "missing to_agent";
  // MVP 阶段暂不验证签名，字段预留
  return null; // 验证通过
}
```

### 步骤 2：`audit-logger.ts` — 审计日志

```typescript
// src/lib/agents/audit-logger.ts
import { makeId } from "@/lib/ids";
import * as feishu from "@/lib/feishu";
import type { AuditLogRecord, AuditAction } from "./types";

export async function writeAuditLog(params: {
  agent_id: string;
  action: AuditAction;
  target_resource: string;
  before_state?: object | null;
  after_state?: object | null;
  routing_path: string[];
  related_message_id: string;
  related_request_id: string;
  metadata?: object;
}): Promise<string> {
  const audit_id = makeId("audit");
  const log: AuditLogRecord = {
    audit_id,
    timestamp: new Date().toISOString(),
    agent_id: params.agent_id,
    action: params.action,
    target_resource: params.target_resource,
    before_state: params.before_state ?? null,
    after_state: params.after_state ?? null,
    routing_path: params.routing_path,
    related_message_id: params.related_message_id,
    related_request_id: params.related_request_id,
    metadata: params.metadata,
  };

  await feishu.createAuditLog(log); // 需要在 feishu.ts 中新增此方法
  return audit_id;
}
```

### 步骤 3：`inbox-queue.ts` — 消息队列

```typescript
// src/lib/agents/inbox-queue.ts
import { makeId } from "@/lib/ids";
import * as feishu from "@/lib/feishu";
import type { InboxRecord, MessageEnvelope, InboxStatus } from "./types";

export async function enqueueMessage(envelope: MessageEnvelope): Promise<string> {
  const queue_id = makeId("q");
  await feishu.createInboxRecord({
    queue_id,
    message_id: envelope.message_id,
    request_id: envelope.request_id,
    from_agent: envelope.from_agent,
    to_agent: envelope.to_agent,
    message_type: envelope.message_type,
    status: "pending",
    priority: envelope.routing_metadata.priority,
    payload_json: JSON.stringify(envelope.payload),
    received_at: new Date().toISOString(),
    retry_count: 0,
    audit_trace_pointer: envelope.audit_trace_pointer,
  });
  return queue_id;
}

export async function dequeueNextMessage(agentId: string): Promise<InboxRecord | null> {
  // 按优先级取最旧的 pending 消息
  const record = await feishu.getNextPendingMessage(agentId);
  if (!record) return null;

  // 标记为 processing
  await feishu.updateInboxStatus(record.queue_id, "processing");
  return record;
}

export async function markInboxDone(queueId: string): Promise<void> {
  await feishu.updateInboxStatus(queueId, "done", new Date().toISOString());
}

export async function markInboxFailed(queueId: string, error: string): Promise<void> {
  await feishu.updateInboxStatus(queueId, "failed", undefined, error);
}
```

### 步骤 4：`submission-task-agent.ts` — 核心中枢

```typescript
// src/lib/agents/submission-task-agent.ts
import { createEnvelope, validateEnvelope } from "./message-envelope";
import { enqueueMessage } from "./inbox-queue";
import { writeAuditLog } from "./audit-logger";
import * as github from "@/lib/github";
import * as ai from "@/lib/ai";
import * as feishu from "@/lib/feishu";
import { makeId } from "@/lib/ids";
import type { MessageEnvelope, SubmissionRequestPayload } from "./types";

const AGENT_ID = "submission-task-agent";

// ===== 学生侧入口：发起提交请求 =====
export async function receiveSubmissionRequest(params: {
  studentId: string;
  envelope: MessageEnvelope<SubmissionRequestPayload>;
}): Promise<{ request_id: string; status: string }> {

  // 1. 验证消息格式
  const err = validateEnvelope(params.envelope);
  if (err) throw new Error(`Invalid envelope: ${err}`);

  // 2. 写入 Inbox（入队）
  await enqueueMessage(params.envelope);

  // 3. 写审计日志
  await writeAuditLog({
    agent_id: AGENT_ID,
    action: "submission_request_received",
    target_resource: `inbox_queue.${params.envelope.message_id}`,
    routing_path: [params.envelope.from_agent, AGENT_ID],
    related_message_id: params.envelope.message_id,
    related_request_id: params.envelope.request_id,
    metadata: {
      student_id: params.studentId,
      challenge_id: params.envelope.payload.challenge_id,
    },
  });

  return {
    request_id: params.envelope.request_id,
    status: "received",
  };
}

// ===== 系统侧：处理队列中的提交 =====
export async function processSubmissionRequest(
  envelope: MessageEnvelope<SubmissionRequestPayload>
): Promise<{
  submission_id: string;
  evaluation_id: string;
  portfolio_item_id: string;
}> {
  const payload = envelope.payload;
  const routingPath = [envelope.from_agent, AGENT_ID];

  // 1. 校验身份
  const student = await feishu.getStudentById(payload.student_id);
  const challenge = await feishu.getChallengeById(payload.challenge_id);

  // 2. GitHub 检查
  const githubCheck = await github.checkRepoHealth(payload.github_repo_url);

  // 3. AI 初评
  const aiEvaluation = await ai.evaluateSubmission({
    student,
    challenge,
    submission: {
      studentId: payload.student_id,
      challengeId: payload.challenge_id,
      projectTitle: payload.project_title,
      projectSummary: payload.project_summary,
      githubRepoUrl: payload.github_repo_url,
      readmeUrl: payload.readme_url,
      demoUrl: payload.demo_url,
      aarText: payload.aar_text,
      selfEvaluationText: payload.self_evaluation_text,
      isPublic: payload.is_public,
    },
    githubCheck,
  });

  // 4. 写入飞书 Submission Record ⚠️ 只有这里能写
  const submission = await feishu.createSubmission({
    submission_id: makeId("sub"),
    student_id: payload.student_id,
    student_name: student.name,
    challenge_id: payload.challenge_id,
    project_title: payload.project_title,
    project_summary: payload.project_summary,
    github_repo_url: payload.github_repo_url,
    readme_url: payload.readme_url || "",
    demo_url: payload.demo_url || "",
    aar_text: payload.aar_text,
    self_evaluation_text: payload.self_evaluation_text,
    github_check_result: JSON.stringify(githubCheck),
    status: githubCheck.repoExists ? "checked" : "needs_revision",
    is_public: payload.is_public,
    submitted_at: new Date().toISOString(),
    // 🆕 Agent 字段
    submitted_by_agent_id: envelope.from_agent,
    processed_by_agent_id: AGENT_ID,
    submission_request_id: envelope.request_id,
    system_validation_status: githubCheck.repoExists ? "passed" : "needs_revision",
    routing_status: "routed",
    audit_log_pointer: envelope.audit_trace_pointer,
  });

  // 5. 审计日志 — 创建提交记录
  await writeAuditLog({
    agent_id: AGENT_ID,
    action: "create_submission_record",
    target_resource: `feishu.submissions.${submission.submission_id}`,
    before_state: null,
    after_state: { submission_id: submission.submission_id, status: "checked" },
    routing_path: routingPath,
    related_message_id: envelope.message_id,
    related_request_id: envelope.request_id,
    metadata: { github_check_score: githubCheck.score },
  });

  // 6. 写入 Evaluation
  const evaluation = await feishu.createEvaluation({
    submission_id: submission.submission_id,
    student_id: payload.student_id,
    challenge_id: payload.challenge_id,
    evaluator_type: "ai",
    score_total: aiEvaluation.scoreTotal,
    scores_json: JSON.stringify(aiEvaluation.scores),
    strengths: aiEvaluation.strengths,
    weaknesses: aiEvaluation.weaknesses,
    suggestions: aiEvaluation.suggestions,
    feedback: aiEvaluation.feedback,
    created_at: new Date().toISOString(),
  });

  // 7. 审计日志 — 路由评审
  routingPath.push("review-task-agent");
  await writeAuditLog({
    agent_id: AGENT_ID,
    action: "route_to_review",
    target_resource: `feishu.evaluations.${evaluation.evaluation_id}`,
    routing_path: routingPath,
    related_message_id: envelope.message_id,
    related_request_id: envelope.request_id,
  });

  // 8. Portfolio（保持现有逻辑，后续可拆成单独 Agent）
  const portfolioDescription = await ai.generatePortfolioDescription({
    student,
    challenge,
    submission: {
      studentId: payload.student_id,
      challengeId: payload.challenge_id,
      projectTitle: payload.project_title,
      projectSummary: payload.project_summary,
      githubRepoUrl: payload.github_repo_url,
      readmeUrl: payload.readme_url,
      demoUrl: payload.demo_url,
      aarText: payload.aar_text,
      selfEvaluationText: payload.self_evaluation_text,
      isPublic: payload.is_public,
    },
    githubCheck,
    aiEvaluation,
  });

  const portfolioItem = await feishu.createPortfolioItem({
    student_id: student.student_id,
    student_name: student.name,
    submission_id: submission.submission_id,
    title: payload.project_title,
    type: "project",
    summary: payload.project_summary,
    public_description: portfolioDescription.publicDescription,
    github_url: payload.github_repo_url,
    demo_url: payload.demo_url || "",
    cover_image_url: "",
    skills: portfolioDescription.skills.join(", "),
    ai_feedback_summary: aiEvaluation.feedback,
    is_public: payload.is_public,
    created_at: new Date().toISOString(),
  });

  return {
    submission_id: submission.submission_id,
    evaluation_id: evaluation.evaluation_id,
    portfolio_item_id: portfolioItem.portfolio_item_id,
  };
}
```

### 步骤 5：改造 `/api/submit` — 保持前端兼容

```typescript
// src/app/api/submit/route.ts（改造后）
import { NextResponse } from "next/server";
import { createEnvelope } from "@/lib/agents/message-envelope";
import { receiveSubmissionRequest } from "@/lib/agents/submission-task-agent";
import type { SubmissionRequestPayload } from "@/lib/agents/types";
import type { SubmissionInput } from "@/lib/types";

const STUDENT_COMPANION_PREFIX = "student-companion";

export async function POST(request: Request) {
  try {
    const input = (await request.json()) as SubmissionInput;

    // Step 1: 构造消息信封
    const fromAgent = `${STUDENT_COMPANION_PREFIX}-${input.studentId}`;
    const envelope = createEnvelope<SubmissionRequestPayload>({
      from_agent: fromAgent,
      to_agent: "submission-task-agent",
      message_type: "submission_request",
      payload: {
        student_id: input.studentId,
        challenge_id: input.challengeId,
        project_title: input.projectTitle,
        project_summary: input.projectSummary,
        github_repo_url: input.githubRepoUrl,
        readme_url: input.readmeUrl,
        demo_url: input.demoUrl,
        aar_text: input.aarText,
        self_evaluation_text: input.selfEvaluationText,
        is_public: input.isPublic,
      },
    });

    // Step 2: 送入 Agent 处理链
    const result = await receiveSubmissionRequest({
      studentId: input.studentId,
      envelope,
    });

    // Step 3: MVP 阶段同步处理（后续改为异步）
    // 实际生产环境这里应该由后台 worker 异步消费 Inbox
    // 但 MVP 阶段保持同步以简化部署
    const { submission_id, evaluation_id, portfolio_item_id } =
      await processSubmissionRequest(envelope); // 从 submission-task-agent 导入

    return NextResponse.json({
      ok: true,
      submissionId: submission_id,
      evaluationId: evaluation_id,
      portfolioItemId: portfolio_item_id,
      requestId: result.request_id,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Submit failed" },
      { status: 500 },
    );
  }
}
```

---

## 4. 新增 feishu.ts 方法

在 `src/lib/feishu.ts` 末尾新增以下方法：

```typescript
// --- Agent 相关（Phase 2 新增）---

export async function createAuditLog(log: Record<string, unknown>) {
  return createRecord(requireEnv("FEISHU_AUDITLOGS_TABLE_ID"), log);
}

export async function createInboxRecord(record: Record<string, unknown>) {
  return createRecord(requireEnv("FEISHU_INBOX_TABLE_ID"), record);
}

export async function getNextPendingMessage(agentId: string) {
  // 取目标 Agent、status=pending、按 priority 排序的最旧记录
  const rows = await listRecords(requireEnv("FEISHU_INBOX_TABLE_ID"));
  // 简化实现：在内存中筛选和排序
  const pending = rows
    .filter((r) => r.fields.to_agent === agentId && r.fields.status === "pending")
    .sort((a, b) => {
      const priOrder: Record<string, number> = { urgent: 0, high: 1, normal: 2, low: 3 };
      const pa = priOrder[String(a.fields.priority)] ?? 2;
      const pb = priOrder[String(b.fields.priority)] ?? 2;
      return pa - pb;
    });
  if (pending.length === 0) return null;
  return normalizeInboxRecord(pending[0]);
}

export async function updateInboxStatus(
  queueId: string,
  status: string,
  processedAt?: string,
  errorMessage?: string,
) {
  // 飞书 Bitable API 不支持直接更新单条记录
  // 这里需要根据 queue_id 查找并更新
  // MVP 阶段可简化为只写新记录 + 前台过滤 status
  // 完整的实现需要 BitTable 的 update API
}
```

---

## 5. 环境变量新增

`.env.example` / `.env.local` 新增：

```bash
# Agent 阶段新增
FEISHU_AUDITLOGS_TABLE_ID=
FEISHU_INBOX_TABLE_ID=
```

---

## 6. 实施顺序

| 步骤 | 内容 | 预计工作量 | 依赖 |
|---|---|---|---|
| 1 | 在飞书建 AuditLogs 和 InboxQueue 两张表 | 30 分钟 | 飞书表结构文档 |
| 2 | 在飞书 Submissions 表新增 12 个 Agent 字段 | 15 分钟 | 同上 |
| 3 | 创建 `src/lib/agents/types.ts` | 15 分钟 | 无 |
| 4 | 创建 `src/lib/agents/message-envelope.ts` | 15 分钟 | 步骤 3 |
| 5 | 创建 `src/lib/agents/audit-logger.ts` | 15 分钟 | 步骤 3 + feishu 新方法 |
| 6 | 创建 `src/lib/agents/inbox-queue.ts` | 20 分钟 | 步骤 3 + feishu 新方法 |
| 7 | 在 `feishu.ts` 新增 createAuditLog / createInboxRecord | 15 分钟 | 步骤 1 |
| 8 | 创建 `src/lib/agents/submission-task-agent.ts` | 30 分钟 | 步骤 4-7 |
| 9 | 改造 `/api/submit/route.ts` | 15 分钟 | 步骤 8 |
| 10 | 改造后测试提交流程 | 30 分钟 | 步骤 9 |
| 11 | 配置 Vercel 新环境变量 | 10 分钟 | 步骤 1 |

**总预计**：约 3-4 小时完成全部拆分。

---

## 7. 验收标准

- [ ] `POST /api/submit` 返回结果中包含 `requestId` 字段（Agent 链路 ID）
- [ ] AuditLogs 表有新记录，能按 `request_id` 追溯到完整提交流程
- [ ] InboxQueue 表有消息进出记录
- [ ] Submission Record 包含 `submitted_by_agent_id` / `processed_by_agent_id` / `routing_status` / `audit_log_pointer`
- [ ] 现有前端页面功能不受影响（API 返回格式兼容）

---

## 关联文档

- 飞书表结构：`docs/feishu-table-schema.md`
- Message Envelope Schema：`agents/messages/message-envelope-schema.md`
- Audit Log Schema：`agents/audit/audit-log-schema.md`
- Inbox 设计：`agents/inbox/README.md`
- Agent Manifest：`agents/manifests/submission-task-agent.schema.json`
- 当前 workflow.ts：`ai-x-challenge-learning-mvp/src/lib/workflow.ts`
