# Elite20 Builder Program / NSEAP

Elite20 Builder Program / NSEAP is the MVP design repository for AI+X Phase II.

The first goal is not to build a full LMS. The first goal is to make the Builder workflow run and turn each Challenge into reusable Skills, Task Agents, ontology updates, and knowledge assets.

```text
Situation -> Ontology -> Workflow -> Skill -> Task Agent -> Evaluation -> Knowledge Growth
```

## What This Repository Contains

- `docs/`: vision, workflow, and operating model
- `standards/`: mapping between Richard's reference documents and this repository
- `methodology/`: Situation-to-Agent, FDE workflow, Skill construction, and KSTAR loop
- `ontology/`: Course, Skill, Challenge, Project, and Assessment ontology drafts
- `challenges/`: standard Challenge, Rubric, and submission templates
- `agents/`: Agent architecture — manifests, message envelope, inbox/outbox, audit log
- `agents/manifests/`: machine-readable agent manifests (Student/Teacher Companion, Submission/Review Task Agents)
- `docs/technical-whitepaper-20260708.md`: full system whitepaper covering architecture, agents, data models, and roadmap
- `examples/`: end-to-end cases that show how a Challenge becomes a Cognitive Cell
- `teams/`: seven Builder Team workspaces aligned with Richard's team structure
- `knowledge-base/`: examples, FAQ, prompts, and reusable lessons
- `governance/`: contribution and review rules

## MVP Scope

The MVP now focuses on four layers:

1. Builder Workflow: how tasks are designed, submitted, reviewed, and released.
2. FDE Methodology: how a Situation becomes Ontology, Workflow, Skill, and Task Agent.
3. Ontology Layer: how Course, Skill, Challenge, Project, and Assessment connect.
4. Agent Interface Layer: how Agents declare identity, capability, inputs, outputs, and permissions.

## Core Agents (see whitepaper §6 for full architecture)

### Student-side
- **Student Companion Agent**: each student's personal learning assistant — understands Challenges, checks local workspace, prepares submission metadata, sends submission requests, receives feedback. Cannot directly write submission records.

### Teacher-side
- **Teacher Companion Agent**: teacher's teaching assistant — creates and publishes Challenges, views submission progress, triggers reviews, aggregates class feedback.

### System-side (platform agents)
- **Submission Task Agent**: the submission hub and **architecture red line** — the ONLY agent that can write final submission records. Validates identity, checks GitHub pointers, writes Feishu records, routes to review, records audit trails.
- **Review Task Agent**: evaluation executor — reads submission packages, reads rubrics, checks GitHub evidence (README, AAR, demo, code structure), generates AI initial reviews, provides reviewable feedback to teachers.
- **Peer Review Agent** (future): handles peer review assignments with isolated visibility and audit trails.

## Communication Channels

- WeChat / Feishu / Xuexitong: daily communication, notification, and teaching management.
- GitHub: formal Challenge publication, submission, review, documentation, and knowledge capture.

## Current File Map

Start here:

- `standards/standards-mapping.md`: how Richard's reference documents map to this repository
- `docs/next-implementation-plan.md`: next steps toward reference implementation
- `methodology/situation-to-agent.md`: the core Situation -> Agent construction method
- `docs/vision.md`: what Elite20 Builder OS is for
- `docs/workflow.md`: the main operating workflow
- `docs/mvp-roadmap.md`: phased MVP plan
- `docs/feishu-table-schema.md`: Feishu Bitable schema for all 5 tables + Agent extension fields
- `docs/vercel-deploy-guide.md`: step-by-step Vercel deployment guide
- `docs/agent-refactor-plan.md`: how to split monolithic workflow into Agent message chain
- `docs/phase2-builder-task-plan.md`: Phase II tasks, modules, team assignments, submission rules, and Phase I background appendix
- `docs/progress-report.md`: Chinese project progress report for group sharing
- `teams/team-roadmap.md`: seven-team responsibility and folder map
- `teams/github-submission-guide.md`: whether to use this repo or separate team repos
- `ontology/challenge-ontology.md`: how Challenge connects to Skill, Agent, Rubric, and Knowledge
- `challenges/challenge-template.md`: standard Challenge format
- `challenges/rubric-template.md`: standard scoring format
- `challenges/sample-challenge-01.md`: first sample Challenge
- `agents/agent-collaboration-flow.md`: how the five core agents collaborate
- `agents/manifests/`: machine-readable Agent manifests (Student/Teacher Companion, Submission/Review Task)
- `agents/messages/message-envelope-schema.md`: standard message format for all agent communication
- `agents/inbox/README.md`: Inbox/Outbox design and processing flow
- `agents/audit/audit-log-schema.md`: audit trail structure for every state change
- `examples/challenge-to-cognitive-cell-case/`: first end-to-end example
- `.github/ISSUE_TEMPLATE/`: GitHub issue templates for Challenges and submissions
- `reviews/evaluation-report-template.md`: standard review report format
- `prompts/`: reusable agent prompts
