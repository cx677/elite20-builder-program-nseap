# Team 3 本体讲解（小白版）

> 给非技术背景的同学讲清楚：**Team 3 是什么、为什么做、做了什么、和主仓什么关系**。

---

## 一、先打个比方

把整个 Elite20 系统想象成**一所学校**：

```text
┌─────────────────────────────────────────┐
│  整所学校的"操作系统"                       │
│  (你看到的网站、App、飞书群)                 │
└─────────────────────────────────────────┘
            │
    ┌───────┴───────┐
    ↓               ↓
┌─────────┐   ┌──────────┐
│ 主仓本体 │   │ Team 3 本体│
│ 业务层   │   │ 系统层    │
└─────────┘   └──────────┘
```

**两者的关系**（用学校作类比）：

| 比喻 | 主仓本体 | Team 3 本体 |
|---|---|---|
| 像学校的… | **教学大纲** | **校规校纪** |
| 关心的是… | "教什么？考什么？" | "谁可以做什么？什么不能做？" |
| 描述的是… | 课程、挑战、技能、评分 | Agent、消息、权限、审计 |
| 谁来看 | 老师、学生 | 工程师、系统管理员 |

**它们的关系**：

```text
主仓本体 = 静态的"是什么"
  比如：挑战、提交、评分、Skill

Team 3 本体 = 动态的"怎么运转"
  比如：哪个 AI 角色能写什么、消息怎么传、谁看得到谁看不到
```

---

## 二、Team 3 到底是什么？

### 一句话定义

> **Team 3 = "AI 老师/学生助手"团队** —— 他们要把"冷冰冰的代码"变成"会协作的 AI 同事"。

### 详细版（学生提交流程）

```text
你是一名学生，做完作业想提交。
    ↓
但提交不是直接把代码丢上去这么简单。
    ↓
需要：
  1. 检查代码是否完整（README/AAR 存在？）
  2. 检查是不是在截止日期内
  3. 让你不能用别人身份提交（防止作弊）
  4. 提交后要给老师看
  5. 老师确认后要通知你"通过/不通过"
    ↓
这一整套流程由 4 个 AI 角色协作完成：
  - 你的"学生助手"（Student Companion）
  - 老师的"教师助手"（Teacher Companion）
  - "提交审核员"（Submission Task Agent）
  - "评分员"（Review Task Agent）
```

**Team 3 就是设计、实现、维护这 4 个 AI 角色的团队**。

### Team 3 在 7 个 Builder Team 中的位置

```text
7 个 Builder Team
├── 1. 课程团队   (Curriculum)    决定教什么
├── 2. 挑战团队   (Challenge)     设计作业
├── 3. **Agent 团队 (Team 3)**     ★ 让 AI 协作起来 ★
├── 4. 本体团队   (Ontology)      定义数据结构
├── 5. 平台团队   (Platform)      做网站
├── 6. 知识团队   (Knowledge)     沉淀最佳实践
└── 7. 演示团队   (Demo)          拍宣传片
```

---

## 三、Team 3 要造什么？—— 4 个 AI 角色

想象你的学校里有 4 个 AI 同事：

| 角色 | 比喻 | 它做什么 |
|---|---|---|
| 🤖 **学生 AI 助手**<br>(Student Companion) | 你的"学习秘书" | 帮你理解作业、检查代码、准备提交 |
| 🤖 **老师 AI 助手**<br>(Teacher Companion) | 老师的"教学助理" | 帮老师发作业、收集提交、催进度 |
| 🤖 **提交审核员**<br>(Submission Task Agent) | 学校的"教务处" | 唯一能"盖章"说"这次提交算数"的人 |
| 🤖 **评分员**<br>(Review Task Agent) | 阅卷老师 | 读你的提交、给分数、写评语 |

它们之间的关系：

```text
[学生 AI 助手]  ──→  [提交审核员]  ──→  [评分员]  ──→  [老师 AI 助手]
  帮你准备           帮你盖章          帮你打分        帮老师总结
```

**但光是 4 个角色还不够**，还需要：

1. 📜 **规矩** — "学生不能自己盖章"（防止作弊）
2. 📬 **邮件系统** — 4 个 AI 之间怎么通信
3. 🗄️ **审计** — 每次操作都记下来（出问题时能查）
4. 🔐 **权限** — 谁能看到什么、谁能改什么
5. ✅ **校验** — 提交的东西格式对不对

**这就是 Team 3 的工作**——把这 5 件事全部实现。

---

## 四、Team 3 的"本体"是什么？

### 一句话

> **本体 = 4 个 AI 角色 + 5 件事的"完整说明书"**

### 这份说明书有 3 种用途（3 种格式）

```text
┌────────────────────────────────────────────┐
│  Team 3 本体 = 一份有 3 种格式的说明书        │
└────────────────────────────────────────────┘
        ↓               ↓               ↓
   ┌────────┐      ┌─────────┐    ┌──────────┐
   │ 设计图  │      │ 用户手册 │    │ 行为规范 │
   │ (OWL)  │      │(JSON    │    │ (SWRL/   │
   │        │      │ Schema) │    │  SHACL)  │
   └────────┘      └─────────┘    └──────────┘
   谁都能读懂     代码能直接用    机器能自动检查
   团队讨论       Next.js 项目    数据库验证
```

### 举个例子：一条规则有 3 种写法

**规则**：学生不能自己盖章（只有"提交审核员"才能盖）

**写法 1（设计图 OWL）**：
```turtle
:学生_AI  不能  直接写  :提交记录 .
```
> 团队讨论 / 文档用

**写法 2（用户手册 Zod）**：
```typescript
if (student.processedByAgentId !== "submission-task-...") {
  throw new Error("❌ 学生不能自己盖章！")
}
```
> 代码用

**写法 3（行为规范 SHACL）**：
```turtle
提交记录的"盖章人"字段必须以 "submission-task-" 开头 .
```
> 数据库自动验证用

**3 份文档说的是同一件事**——你从设计到部署，任何一层被绕过，其他层都能拦住。

---

## 五、Team 3 造出来后，谁来用？怎么用？

### 给老师用

> 老师在飞书里点"发作业" → AI 助手帮老师填好所有信息 → 学生在群里看到作业

### 给学生用

> 学生在 GitHub 写完代码 → 点"提交" → AI 助手帮你检查 → 自动评分 → 私聊通知结果

### 给开发者用

```typescript
// 复制 Team 3 写的 Zod Schema 到你的 Next.js 项目
import { SubmissionRecordSchema } from 'team3/zod';

const result = SubmissionRecordSchema.safeParse(req.body);
if (!result.success) {
  // Schema 自动告诉你哪个字段错了
  return res.status(400).json({ errors: result.error });
}
```

### 给系统管理员用

```bash
# 一键检查"系统有没有违反规矩"
python3 run_red_line_queries.py --fuseki-url http://localhost:3030/team3
# 输出：RED-001: 0 violations ✅
# 输出：RED-002: 0 violations ✅
# ...
```

---

## 六、总结

| 问题 | 回答 |
|---|---|
| **Team 3 是谁？** | 4 个 AI 角色（学生助手 / 教师助手 / 提交审核员 / 评分员）的设计者 |
| **Team 3 的本体是什么？** | 这 4 个 AI + 5 件事（规矩/邮件/审计/权限/校验）的完整说明书 |
| **本体长什么样？** | 3 种格式：OWL 设计图 + JSON Schema 用户手册 + SWRL/SHACL 行为规范 |
| **和主仓什么关系？** | 主仓管"教什么考什么"（业务层），Team 3 管"AI 怎么协作"（系统层） |
| **造出来给谁用？** | 老师、学生、开发者、系统管理员——4 类人 |

### 一句话总结

> **主仓本体是"学校的教材"，Team 3 本体是"学校的校规 + 操作系统"。教材告诉你学什么，校规 + 系统保证学得下去、考得公平、出问题能查。**

---

## 七、Team 3 已交付的实际产出

如果你想看具体造了什么，下面是文件清单：

### 设计期（OWL / SHACL / SWRL）
- `ontology/core/agent-ontology.ttl` — 113 类、37 对象属性、20 数据属性
- `ontology/core/agent-ontology-shapes.ttl` — 26 NodeShape、34 PropertyShape
- `ontology/core/agent-ontology-rules.swrll` — 17 Imp 规则、10 推理谓词

### 运行期（JSON Schema + Zod）
- `ontology/schemas/records/submission-record.schema.json` — 25 字段
- `ontology/schemas/records/challenge-record.schema.json` — 16 字段
- `ontology/schemas/typescript-zod/zod-from-schemas.ts` — 28 Zod 导出

### 工具（加载 + 验证）
- `ontology/scripts/load-neo4j.sh` / `load-fuseki.sh` / `validate.sh`
- `ontology/scripts/docker-compose.yml` — Neo4j + Fuseki 一键启动
- `ontology/scripts/ontology-validate.yml` — GitHub Actions CI

### 文档
- `ontology/README.md` — 入口
- `ontology/docs/guides/quickstart.md` — 5 分钟上手
- `ontology/docs/adr/0001..0003-*.md` — 3 个架构决策

---

## 八、深入阅读建议

如果你想继续深入，按这个顺序读：

1. **5 分钟入门**：`ontology/docs/guides/quickstart.md`
2. **理解设计**：`ontology/docs/adr/0001-use-owl-turtle.md`
3. **理解红线**：`ontology/docs/adr/0003-red-line-formalization.md`
4. **理解架构**：`ontology/docs/adr/0002-use-neo4j-and-fuseki.md`
5. **看代码**：`ontology/core/agent-ontology.ttl`

---

> **最后**：Team 3 的工作不是"写一个新 App"，而是给整个 Elite20 系统**装上一个能自我管理、自我约束的"神经系统"**。这个神经系统有 4 个 AI 角色 + 5 件事 + 10 条规矩 + 1 份完整说明书，**任何人想破坏都会被自动拦下**。

> **这就是 Team 3 真正的价值**。
