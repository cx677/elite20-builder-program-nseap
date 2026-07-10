# ADR 0002: 为什么同时用 Neo4j + Fuseki 两个数据库

> **状态**: Accepted
> **日期**: 2026-07-08
> **决策者**: Team 3

## 背景

Team 3 本体需要在 2 类查询场景下高效运行：

1. **图遍历查询** — 找出所有 Submission 及其相关 Skill / Agent / Event
2. **OWL 推理 + SPARQL** — 跑 10 条架构红线 / 验证 OWL 约束

候选：

1. **Neo4j + Neosemantics** — 图数据库，n10s 插件支持 OWL
2. **Apache Jena Fuseki** — 纯 SPARQL + OWL Reasoner
3. **Stardog** — 企业级知识图谱
4. **GraphDB** — OWL 2 DL 推理最强
5. **只用一个** — 妥协

## 决策

**同时用 Neo4j + Fuseki**，互为补充。

| 数据库 | 角色 | 优势 |
|---|---|---|
| **Neo4j + n10s** | 图遍历 + 可视化 | Cypher 直觉、图算法、Browser UI |
| **Fuseki + TDB2** | OWL Reasoner + SPARQL | W3C 标准、强推理能力、SPARQL 1.1 |

## 理由

### 1. 不同场景需要不同工具

| 场景 | Neo4j | Fuseki |
|---|---|---|
| 找出 Submission 关联的 Agent | ⭐⭐⭐⭐⭐ (Cypher MATCH) | ⭐⭐ (需要多跳 SPARQL) |
| 跑 OWL Reasoner 验证一致性 | ⭐⭐ (需要 n10s + reasoner) | ⭐⭐⭐⭐⭐ (内置) |
| SHACL Validation | ⭐⭐ (需要 SHACL API) | ⭐⭐⭐⭐ (有完整 API) |
| 10 条红线 SPARQL 查询 | ⭐⭐⭐ (Cypher 可写) | ⭐⭐⭐⭐⭐ (SPARQL 1.1 标准) |
| 可视化 | ⭐⭐⭐⭐⭐ (Neo4j Browser) | ⭐⭐ (Fuseki UI 弱) |
| 实时应用查询 | ⭐⭐⭐⭐⭐ (Cypher 快) | ⭐⭐ (SPARQL 解析慢) |

### 2. 维护一致性

OWL 是 source of truth，**两个数据库都用同一份 .ttl**：

```bash
# Neo4j 加载
./load-neo4j.sh   # 用 n10s 从 .ttl 导入

# Fuseki 加载
./load-fuseki.sh  # 用 TDB2 存储 .ttl
```

更新本体 → 重新加载两个数据库 → 始终保持一致。

### 3. CI/CD 友好

两个数据库都能 Docker Compose 一键启动：

```yaml
# scripts/docker-compose.yml
services:
  neo4j:   # 图遍历
  fuseki:  # 推理
```

## 架构图

```text
                  ┌──────────────┐
                  │  .ttl / .swrll│
                  │  (Source)    │
                  └──────┬───────┘
                         │
            ┌────────────┴────────────┐
            ↓                         ↓
     ┌─────────────┐           ┌─────────────┐
     │   Neo4j     │           │   Fuseki    │
     │  (n10s)     │           │   (TDB2)    │
     │             │           │             │
     │ • Cypher   │           │ • SPARQL    │
     │ • 图算法   │           │ • Reasoner │
     │ • 可视化   │           │ • SHACL     │
     └─────────────┘           └─────────────┘
            ↓                         ↓
     ┌─────────────┐           ┌─────────────┐
     │  Next.js    │           │  监控/审计  │
     │  API Server │           │  报告/告警  │
     └─────────────┘           └─────────────┘
```

## 替代方案

### 方案 A：只 Neo4j

- ❌ 缺 SHACL / Reasoner 原生支持
- ❌ SPARQL 查询不完整
- ❌ OWL 2 DL 推理需要额外配置

### 方案 B：只 Fuseki

- ❌ 图遍历慢（SPARQL 多跳）
- ❌ 无 Browser UI 可视化
- ❌ 无图算法

### 方案 C：用 Stardog

- ❌ 企业级昂贵
- ❌ 团队学习成本高
- ✅ 单一平台（但 Fuseki + Neo4j 组合更灵活）

**结论**：双数据库组合是 trade-off 最优解。

## 实现细节

### Neo4j 加载（n10s）

```cypher
// 1. 初始化 n10s
CALL n10s.graphconfig.init({
  handleVocabUris: 'IGNORE',
  handleMultival: 'OVERWRITE'
});

// 2. 导入 OWL
CALL n10s.onto.import.fetch(
  'file:///path/to/agent-ontology.ttl',
  'Turtle'
);
```

### Fuseki 加载（TDB2）

```bash
# 1. 创建 dataset
curl -X POST -u admin:admin \
    --data-urlencode "dbName=team3" \
    --data-urlencode "dbType=tdb2" \
    http://localhost:3030/\$/datasets

# 2. 上传 OWL
curl -X POST -u admin:admin \
    -H "Content-Type: text/turtle" \
    --data-binary "@agent-ontology.ttl" \
    http://localhost:3030/team3/data
```

## 成本

| 项目 | Neo4j | Fuseki |
|---|---|---|
| Docker 镜像 | ~600MB | ~400MB |
| 内存 | 1-2GB | 1-2GB |
| 启动时间 | 30s | 20s |
| License | GPL v3 | Apache 2.0 |

**两个加起来** ~2GB 内存 + 1GB 磁盘，**完全可在单机运行**。

## 后果

### 正面

- 各取所长
- 双倍查询能力
- 标准化（SPARQL）和图遍历（Cypher）并存

### 负面

- 维护 2 个数据库
- 加载需 2 步
- 团队需要懂 2 套查询语言

## 监控

```bash
# 跑 10 条红线监控
python3 python/run_red_line_queries.py \
    --fuseki-url http://localhost:3030/team3 \
    --output docs/red-line-report.md
```

报告输出到 `docs/red-line-report.md`，CI/CD 自动跑。

## 参考

- [Neo4j + Neosemantics](https://neo4j.com/labs/neosemantics/)
- [Apache Jena Fuseki](https://jena.apache.org/documentation/fuseki2/)
- [W3C SPARQL 1.1](https://www.w3.org/TR/sparql11-query/)
