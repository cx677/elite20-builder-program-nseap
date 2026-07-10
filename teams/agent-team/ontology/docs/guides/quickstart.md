# Quickstart — 5 分钟跑通 Team 3 本体

> 5 分钟把 Team 3 的 6 份抽取报告工程化为可机器读取的本体。

## 前置条件

- macOS / Linux
- Docker + Docker Compose
- Python 3.11+
- Node.js 20+（可选，用于 Zod 校验）
- cypher-shell（可选，用于 Neo4j）

## 步骤 1: 启动 Neo4j + Fuseki（2 分钟）

```bash
cd ontology/scripts
docker-compose up -d
```

启动后访问：
- **Neo4j Browser**: http://localhost:7474 (user: `neo4j`, password: `password`)
- **Fuseki UI**: http://localhost:3030 (user: `admin`, password: `admin`)

## 步骤 2: 加载本体到 Neo4j（30 秒）

```bash
cd ontology/scripts
./load-neo4j.sh
```

预期输出：
```
[1/5] 测试 Neo4j 连接...
✅ 连接成功
[2/5] 加载约束 + 索引...
✅ 约束 + 索引加载完成
[3/5] 清空旧数据...
✅ 旧数据已清空
[4/5] 加载 7 层节点...
✅ 7 层节点加载完成
[5/5] 验证导入结果...
✅ 导入完成: 230 节点
```

## 步骤 3: 加载本体到 Fuseki（30 秒）

```bash
cd ontology/scripts
./load-fuseki.sh
```

预期输出：
```
✅ Fuseki 已连接
✅ Dataset 已创建
✅ OWL 加载完成 (47535 bytes)
✅ SHACL 加载完成 (26517 bytes)
✅ 共 X 个三元组已加载
🔴 RED-001 检查...
  违反 RED-001 的实例数: 0
🎉 Fuseki 加载完成！
```

## 步骤 4: 验证 10 条架构红线

```bash
cd ontology/scripts
python3 python/run_red_line_queries.py \
    --fuseki-url http://localhost:3030/team3 \
    --output docs/red-line-report.md
```

预期输出：
```
🔍 Running 10 Red Line SPARQL queries against http://localhost:3030/team3
  ✅ RED-001: 0 violations
  ✅ RED-002: 0 violations
  ... (10 行)
  📊 Total: 0 violations (0 critical)
```

## 步骤 5: 在 Next.js 项目中使用 Zod

### 5.1 复制 Schema 到项目

```bash
# 把 zod-from-schemas.ts 复制到 Next.js 项目的 src/schemas/
cp ontology/schemas/typescript-zod/zod-from-schemas.ts \
   /path/to/nextjs/src/schemas/
```

### 5.2 在 API Route 使用

```typescript
// /app/api/submissions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { 
  SubmissionRecordSchema,
  validateSubmissionRecord 
} from '@/schemas/zod-from-schemas';

export async function POST(req: NextRequest) {
  const body = await req.json();
  
  // 🔴 编译时 + 运行时双重校验
  const { valid, errors, data } = validateSubmissionRecord(body);
  if (!valid) {
    return NextResponse.json({ 
      error: 'Invalid Submission Record', 
      details: errors 
    }, { status: 400 });
  }
  
  // data.processed_by_agent_id 已经被验证以 'submission-task-' 开头
  // 任何学生不能直接调用 - 这就是 RED-001 的代码层强制
  
  // 写入数据库
  // ...
  return NextResponse.json({ success: true, data });
}
```

### 5.3 校验 Agent Manifest

```typescript
import { 
  StudentCompanionManifestSchema,
  TeacherCompanionManifestSchema,
  AGENT_MANIFESTS 
} from '@/schemas/zod-from-schemas';

// 加载学生 manifest
const studentManifest = await loadManifest('student-companion-s001');

// 🔴 编译时类型 + 运行时校验
const result = StudentCompanionManifestSchema.safeParse(studentManifest);
if (!result.success) {
  console.error('Manifest violates RED-002:', result.error);
  throw new Error('Invalid manifest');
}
```

## 步骤 6: 在 Neo4j Browser 查询

打开 http://localhost:7474

```cypher
// 找出所有 Submission 及其状态
MATCH (s:Submission)-[:hasAuditTrace]->(a:AuditTrace)
RETURN s.submission_id, s.status, a.action
LIMIT 10
```

```cypher
// 找出所有违反 RED-001 的可能路径
MATCH (sta:AgentRole {role_name: 'SubmissionTaskAgent'})-[r]->(sub:Class {id: 'T:Submission'})
RETURN sta.role_name, type(r), sub.label
```

## 步骤 7: 在 Fuseki SPARQL 查询

打开 http://localhost:3030/#/dataset/team3/query

```sparql
PREFIX : <http://elite20.team3/ontology#>
SELECT ?sub ?agent WHERE {
    ?sub a :Submission ;
         :processedByAgentId ?agent .
    FILTER (!STRSTARTS(?agent, "submission-task-"))
}
```

应该返回 0 行（合规）。

## 常见问题

### Q1: 加载 Neo4j 时报"连接失败"

**A**: 检查 Docker 状态：
```bash
docker ps | grep neo4j
# 如未运行：
cd ontology/scripts
docker-compose up -d neo4j
```

### Q2: Fuseki 报"无 dataset"

**A**: 重新创建：
```bash
curl -X POST -u admin:admin \
    --data-urlencode "dbName=team3" \
    --data-urlencode "dbType=tdb2" \
    http://localhost:3030/\$/datasets
```

### Q3: 跑红线查询时报 401 Unauthorized

**A**: Fuseki 默认 admin 密码是 `admin`，可在 `load-fuseki.sh` 中修改。

### Q4: Zod 编译失败

**A**: 确保 npm install zod：
```bash
npm install zod
```

## 下一步

- 📖 读 [`docs/adr/0001-use-owl-turtle.md`](../adr/0001-use-owl-turtle.md) — 为什么用 Turtle
- 📖 读 [`docs/adr/0002-use-neo4j-and-fuseki.md`](../adr/0002-use-neo4j-and-fuseki.md) — 为什么双数据库
- 📖 读 [`docs/adr/0003-red-line-formalization.md`](../adr/0003-red-line-formalization.md) — 为什么 4 维度形式化
- 🔧 跑 `./validate.sh` 看完整校验
- 🔧 改 `core/agent-ontology.ttl` 加新类
