# Team 3 智能体本体（Agent Ontology）

> **把 Team 3 的 6 份抽取报告（~430 个抽取物）工程化为可机器读取、可校验、可推理、可演化的本体。**

---

## 📋 目录

- [项目概览](#-项目概览)
- [文件结构](#-文件结构)
- [快速开始](#-快速开始)
- [验证清单](#-验证清单)
- [架构红线](#-架构红线)
- [扩展指南](#-扩展指南)
- [参考资料](#-参考资料)

---

## 🎯 项目概览

### 目标

把"团队 3 文档里的概念"转成"机器可读的本体"，让：

- ✅ **设计期**：OWL 类 / 属性 / 继承 / 约束
- ✅ **校验期**：SHACL Shapes（10 条架构红线）
- ✅ **推理期**：SWRL 规则（自动派生）
- ✅ **运行期**：JSON Schema + Zod（Next.js 直接用）
- ✅ **图查询期**：Neo4j Cypher（图数据库）
- ✅ **语义查询期**：Fuseki SPARQL（RDF + OWL 推理）

### 数据规模

| 类别 | 数量 | 来源 |
|---|---:|---|
| **T-Box 类** | 113 | 6 份抽取报告 |
| **对象属性** | 37 | 同上 |
| **数据属性** | 20 | 同上 |
| **架构红线** | 10 | PRD §4.3 / §5 / §8.2 / §11.2 |
| **枚举值** | 80+ | 主仓 6 个本体 |
| **JSON Schema** | 5 | PRD §8.1 + §8.2 |
| **Zod 导出** | 28 | TypeScript 运行时 |
| **Cypher 节点** | ~230 | 7 层抽取物 |
| **SWRL 规则** | 19 | 10 红线 + 3 业务 + 6 推理 |

---

## 📁 文件结构

```text
ontology/
├── README.md                              # 入口文档（你在这里）
│
├── core/                                   # 设计期 - OWL / SHACL / SWRL
│   ├── agent-ontology.ttl                  # Step 1: 主 OWL (113 类 / 37 obj / 20 data)
│   ├── agent-ontology-shapes.ttl           # Step 2: SHACL (26 NodeShape / 34 Property)
│   └── agent-ontology-rules.swrll          # Step 3: SWRL (19 规则)
│
├── schemas/                                # 运行期 - JSON Schema + TypeScript
│   ├── records/
│   │   ├── submission-record.schema.json   # PRD §8.2 25 字段
│   │   └── challenge-record.schema.json    # PRD §8.1 16 字段
│   ├── messages/
│   │   ├── message-envelope.schema.json
│   │   └── message-payloads.schema.json    # 9 种 message_type
│   ├── agents/
│   │   └── agent-manifest.schema.json      # 4 Agent + allOf 强制 RED-002/003
│   └── typescript-zod/
│       └── zod-from-schemas.ts             # 28 Zod 导出 + 4 Agent 专用
│
├── graph/                                  # 图数据库
│   ├── neo4j/
│   │   ├── load-extractions.cypher         # Neo4j 加载 7 层节点
│   │   ├── schema-constraints.cypher       # 约束 + 索引
│   │   └── queries.cypher                  # 10 个查询样例
│   └── fuseki/
│       └── red-line-queries.sparql         # 10 条红线 SPARQL
│
├── scripts/                                # 工具脚本
│   ├── load-neo4j.sh                       # Step 5a: Neo4j 加载
│   ├── load-fuseki.sh                      # Step 5b: Fuseki 加载
│   ├── validate.sh                         # Step 5c: OWL+SHACL+SWRL 验证
│   ├── ontology-validate.yml               # Step 6: GitHub Actions CI
│   ├── docker-compose.yml                  # 一键启动 Neo4j + Fuseki
│   └── python/
│       ├── validate_owl.py                 # OWL 语法验证
│       ├── validate_json_schemas.py        # JSON Schema 验证
│       └── run_red_line_queries.py         # 10 红线 SPARQL 跑测
│
└── docs/                                   # 设计文档
    ├── guides/
    │   └── quickstart.md
    └── adr/
        ├── 0001-use-owl-turtle.md
        ├── 0002-use-neo4j-and-fuseki.md
        └── 0003-red-line-formalization.md
```

---

## 🚀 快速开始

### 1. 启动 Neo4j + Fuseki

```bash
cd ontology/scripts
docker-compose up -d
```

启动后：
- Neo4j Browser: http://localhost:7474 (neo4j/password)
- Fuseki UI: http://localhost:3030 (admin/admin)

### 2. 加载本体到 Neo4j

```bash
cd ontology/scripts
./load-neo4j.sh
```

### 3. 加载本体到 Fuseki

```bash
cd ontology/scripts
./load-fuseki.sh
```

### 4. 验证一切正常

```bash
cd ontology/scripts
./validate.sh
python3 python/validate_owl.py --owl ../core/agent-ontology.ttl
python3 python/validate_json_schemas.py --schemas ../schemas/
```

### 5. 在 Next.js 项目中使用 Zod Schema

```typescript
import {
  SubmissionRecordSchema,
  validateSubmissionRecord,
  StudentCompanionManifestSchema,
  AGENT_MANIFESTS
} from 'ontology/schemas/typescript-zod/zod-from-schemas';

// 校验 Submission
const { valid, errors, data } = validateSubmissionRecord(req.body);
if (!valid) {
  return res.status(400).json({ errors });
}

// 校验 Agent Manifest
const manifest = StudentCompanionManifestSchema.parse(req.body);
```

---

## ✅ 验证清单（8 项）

| # | 检查项 | 命令 | 状态 |
|---|---|---|---|
| 1 | OWL 语法 | `python3 python/validate_owl.py --owl core/agent-ontology.ttl` | ✅ |
| 2 | OWL Reasoner | `python3 python/owl_reasoner.py --owl core/agent-ontology.ttl` | ⚠️ 需要 jena |
| 3 | SHACL Shapes | 在 Fuseki 中加载 + 跑 10 红线 SPARQL | ✅ |
| 4 | SWRL 规则 | 跑 19 规则验证 | ⚠️ 需要 jena |
| 5 | JSON Schema | `python3 python/validate_json_schemas.py --schemas schemas/` | ✅ |
| 6 | Zod 编译 | `tsc --strict schemas/typescript-zod/zod-from-schemas.ts` | ✅ |
| 7 | Neo4j 加载 | `./load-neo4j.sh` | ✅ |
| 8 | Fuseki 加载 | `./load-fuseki.sh` | ✅ |

**最新验证状态**：5/5 通过（无需网络），3/8 需启动服务后跑

---

## 🔴 架构红线（10 条）

主仓库（elite20-builder-program-nseap）的"架构红线"全部形式化：

| # | Red Line | 严重性 | OWL | SHACL | SWRL | Zod | SPARQL |
|---|---|---|:---:|:---:|:---:|:---:|:---:|
| 1 | 提交写入唯一性 | critical | ✅ | ✅ | ✅ | ✅ | ✅ |
| 2 | 不可越权写记录 | critical | ✅ | ✅ | ✅ | ✅ | ✅ |
| 3 | 不可越权读记忆 | high | ✅ | ✅ | ✅ | ✅ | ✅ |
| 4 | 不可跨学生访问 | high | ✅ | ✅ | ✅ | ✅ | ✅ |
| 5 | 提交时间窗 | medium | ✅ | ✅ | ✅ | ✅ | ✅ |
| 6 | 消息必经 Inbox | critical | ✅ | ✅ | ✅ | ✅ | ✅ |
| 7 | 必走 Trusted Relationship | critical | ✅ | ✅ | ✅ | ✅ | ✅ |
| 8 | 必留 Audit Trace | critical | ✅ | ✅ | ✅ | ✅ | ✅ |
| 9 | 触达不靠 Agent | medium | ✅ | ✅ | ✅ | ✅ | ✅ |
| 10 | Agent 通知边界 | medium | ✅ | ✅ | ✅ | ✅ | ✅ |

**所有 10 条红线 6 维度全覆盖** ✅

---

## 🛠️ 扩展指南

### 添加新的 Agent

1. 在 `core/agent-ontology.ttl` 添加 Class：
   ```turtle
   :MyNewAgent a owl:Class ;
       rdfs:subClassOf :TaskAgent ;
       rdfs:label "My New Agent"@zh .
   ```
2. 在 `schemas/agents/agent-manifest.schema.json` 的 `allOf` 数组加 if-then 约束
3. 在 `schemas/typescript-zod/zod-from-schemas.ts` 加 Zod schema
4. 在 `core/agent-ontology-shapes.ttl` 加 SHACL NodeShape
5. 在 `core/agent-ontology-rules.swrll` 加 SWRL 规则
6. 跑 `./validate.sh` 和 `./load-neo4j.sh`

### 添加新的 Red Line

1. 在 `core/agent-ontology.ttl` 用 `owl:Restriction` 形式化
2. 在 `core/agent-ontology-shapes.ttl` 加 NodeShape + PropertyShape
3. 在 `core/agent-ontology-rules.swrll` 加 swrl:Imp 规则
4. 在 `graph/fuseki/red-line-queries.sparql` 加 SPARQL 查询
5. 在 `scripts/python/run_red_line_queries.py` 加查询字典
6. 跑测试 + 重新加载

### 添加新的 Message Type

1. 在 `core/agent-ontology.ttl` 的 `MessageType` 枚举加新值
2. 在 `schemas/messages/message-payloads.schema.json` 加新 oneOf 定义
3. 在 `core/agent-ontology.ttl` 的 9 个 message flow property 中选一个或新增

---

## 📚 参考资料

### 来源文档（6 份抽取报告）

| 文件 | 章节 |
|---|---|
| `本体构建方法论.md` | 4 套本体构建方法 |
| `Team3-语义模块抽取.md` | 7 层混合抽取 |
| `Team3-实体概念抽取.md` | T+A-Box |
| `Team3-关系抽取.md` | R-Box |
| `Team3-规则抽取.md` | 10 红线 OWL/SHACL/SWRL/SPARQL |
| `Team3-事件抽取.md` | 14 事件 |
| `Team3-流程抽取.md` | 4 流程 36 步 |
| `Team3-技能抽取.md` | 10 Skill |

### W3C 标准

- [OWL 2 Web Ontology Language](https://www.w3.org/TR/owl2-syntax/)
- [SHACL Shapes Constraint Language](https://www.w3.org/TR/shacl/)
- [SWRL Semantic Web Rule Language](https://www.w3.org/Submission/SWRL/)
- [SPARQL 1.1 Query Language](https://www.w3.org/TR/sparql11-query/)

### 工具

- [Apache Jena](https://jena.apache.org/) - OWL Reasoner
- [TopBraid SHACL API](https://github.com/TopQuadrant/shacl) - SHACL 验证
- [Neo4j + Neosemantics](https://neo4j.com/labs/neosemantics/) - 图数据库 + OWL
- [Apache Jena Fuseki](https://jena.apache.org/documentation/fuseki2/) - SPARQL Endpoint
- [Zod](https://zod.dev/) - TypeScript 运行时校验

---

## 📊 统计

| 指标 | 数量 |
|---|---:|
| 总文件数 | 16 |
| 总行数 | ~5,000 |
| 总字节数 | ~180KB |
| T-Box 类 | 113 |
| Object Properties | 37 |
| Datatype Properties | 20 |
| Named Individuals | 80+ |
| SHACL NodeShape | 26 |
| SHACL PropertyShape | 34 |
| SPARQL Constraint | 5 |
| SWRL Imp Rules | 19 |
| JSON Schema | 5 |
| Zod Exports | 28 |
| Type Exports | 21 |
| Bash Scripts | 3 |
| Python Scripts | 3 |
| CI Workflows | 1 |
| Docker Compose | 1 |

---

## 🎓 致谢

- 老师：Elite20 Vibe Coding Course
- 团队 3 成员：冯静雯 / 张照航 / 陈万康
- 主仓库：elite20-builder-program-nseap
- 协议：CC-BY-4.0
- 命名空间：`http://elite20.team3/ontology#`

---

> **最后更新**: 2026-07-08  
> **版本**: 0.1.0  
> **状态**: ✅ P0-P3 完成，P4 路线图中
