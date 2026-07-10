# ADR 0001: 为什么用 OWL Turtle 作为本体序列化格式

> **状态**: Accepted
> **日期**: 2026-07-08
> **决策者**: Team 3

## 背景

Team 3 的"智能体本体"需要一种**机器可读、可推理、可校验、可版本化**的格式来表示。

候选：

1. **Turtle (.ttl)** — W3C OWL 2 DL 标准格式
2. **RDF/XML (.rdf)** — 最古老但可读性差
3. **JSON-LD (.jsonld)** — Web 友好但 OWL 表达力弱
4. **N-Triples (.nt)** — 极简但不支持注释
5. **Markdown** — 易读但不可机读

## 决策

**采用 Turtle (.ttl)** 作为主本体序列化格式。

## 理由

### ✅ 优势

1. **可读性** — Turtle 是最容易读的 RDF 格式，接近自然英语
2. **W3C 标准** — OWL 2 DL 的官方格式
3. **Reasoner 友好** — HermiT / Pellet / ELK / owlrl 全部支持
4. **SHACL 兼容** — SHACL Shapes 也用 Turtle
5. **可写注释** — 支持 `# 注释`，比 N-Triples 友好
6. **命名空间支持** — `@prefix` 让 URI 简洁
7. **工具链成熟** — Protégé、TopBraid、Apache Jena 都原生支持

### ❌ 替代方案缺点

- **RDF/XML** — XML 噪音大，手写困难
- **JSON-LD** — 对 OWL FunctionalProperty / InverseFunctionalProperty 表达弱
- **N-Triples** — 没有注释，不支持 `@prefix`，大量重复 URI
- **Markdown** — 不可机读，无法跑 reasoner

## 取舍

| 维度 | Turtle | RDF/XML | JSON-LD |
|---|---|---|---|
| 可读性 | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| 工具支持 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| OWL 表达 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| Web 集成 | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Reasoner 友好 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |

**结论**：Turtle 在团队 3 的场景（学术 / 形式化优先 / 离线运行）下是最佳选择。

## 实现细节

### 命名空间

```turtle
@prefix :        <http://elite20.team3/ontology#> .
@prefix owl:     <http://www.w3.org/2002/07/owl#> .
@prefix rdf:     <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs:    <http://www.w3.org/2000/01/rdf-schema#> .
@prefix xsd:     <http://www.w3.org/2001/XMLSchema#> .
@prefix sh:      <http://www.w3.org/ns/shacl#> .
@prefix swrl:    <http://www.w3.org/2003/11/swrl#> .
@prefix swrlb:   <http://www.w3.org/2003/11/swrlb#> .
```

### 文件命名

- `agent-ontology.ttl` — 主本体
- `agent-ontology-shapes.ttl` — SHACL
- `agent-ontology-rules.swrll` — SWRL（虽然 SWRL 也用 .ttl，但用 .swrll 区分）

## 后果

### 正面

- 团队成员可以手写本体（无需专门工具）
- 与 W3C 标准完全对齐
- 工具链成熟（Protégé / TopBraid / Jena 都能用）
- 双数据库（Neo4j + Fuseki）都能加载

### 负面

- 团队需要学习 Turtle 语法
- 与传统 TypeScript / JSON 思维不同
- 大文件（>1000 行）需要 IDE 支持

## 替代方案

如果未来需要"Web 集成优先"，可以：
1. **保留 .ttl 主本体** — 作为权威
2. **生成 .jsonld 副本** — 用 `rdf2jsonld` 工具自动生成
3. **保留两种格式** — 选其一作为 source of truth

## 相关决策

- [ADR 0002](0002-use-neo4j-and-fuseki.md) — 为什么双数据库
- [ADR 0003](0003-red-line-formalization.md) — 为什么 4 维度形式化

## 参考

- https://www.w3.org/TR/turtle/
- https://www.w3.org/TR/owl2-syntax/
- OWL 2 Primer: https://www.w3.org/TR/owl2-primer/
