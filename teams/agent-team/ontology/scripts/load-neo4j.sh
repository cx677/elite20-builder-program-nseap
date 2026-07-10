#!/bin/bash
# ====================================================================
# Neo4j 加载脚本
# 把 OWL 本体 + 7 层抽取物导入 Neo4j 图数据库
# ====================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ONTOLOGY_DIR="$(dirname "$SCRIPT_DIR")"
NEO4J_DIR="$ONTOLOGY_DIR/graph/neo4j"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 配置（可通过环境变量覆盖）
NEO4J_USER="${NEO4J_USER:-neo4j}"
NEO4J_PASSWORD="${NEO4J_PASSWORD:-password}"
NEO4J_HOST="${NEO4J_HOST:-localhost}"
NEO4J_PORT="${NEO4J_PORT:-7687}"
NEO4J_URI="bolt://${NEO4J_HOST}:${NEO4J_PORT}"

echo -e "${YELLOW}=== Neo4j 加载 Team 3 本体 ===${NC}"
echo "URI: $NEO4J_URI"
echo "User: $NEO4J_USER"
echo

# Step 1: 检查 cypher-shell
if ! command -v cypher-shell &> /dev/null; then
    echo -e "${RED}❌ cypher-shell 未安装${NC}"
    echo "安装: https://neo4j.com/docs/operations-manual/current/tools/cypher-shell/"
    echo "或: docker run -it --rm neo4j cypher-shell -u neo4j -p password"
    exit 1
fi

# Step 2: 测试连接
echo -e "${YELLOW}[1/5]${NC} 测试 Neo4j 连接..."
if ! cypher-shell -a "$NEO4J_URI" -u "$NEO4J_USER" -p "$NEO4J_PASSWORD" \
    "RETURN 1 AS test" > /dev/null 2>&1; then
    echo -e "${RED}❌ 无法连接 Neo4j${NC}"
    echo "请先启动 Neo4j:"
    echo "  docker run -d -p 7687:7687 -p 7474:7474 \\"
    echo "    -e NEO4J_AUTH=neo4j/password \\"
    echo "    --name neo4j-team3 neo4j:latest"
    exit 1
fi
echo -e "${GREEN}✅ 连接成功${NC}"

# Step 3: 加载约束 + 索引
echo -e "${YELLOW}[2/5]${NC} 加载约束 + 索引..."
cypher-shell -a "$NEO4J_URI" -u "$NEO4J_USER" -p "$NEO4J_PASSWORD" \
    -f "$NEO4J_DIR/schema-constraints.cypher"
echo -e "${GREEN}✅ 约束 + 索引加载完成${NC}"

# Step 4: 清空旧数据（如果存在）
echo -e "${YELLOW}[3/5]${NC} 清空旧数据..."
cypher-shell -a "$NEO4J_URI" -u "$NEO4J_USER" -p "$NEO4J_PASSWORD" \
    "MATCH (n) DETACH DELETE n" 2>&1 | tail -1
echo -e "${GREEN}✅ 旧数据已清空${NC}"

# Step 5: 加载 7 层节点
echo -e "${YELLOW}[4/5]${NC} 加载 7 层节点..."
CYPHER_FILE="$NEO4J_DIR/load-extractions.cypher"
if [ ! -f "$CYPHER_FILE" ]; then
    echo -e "${RED}❌ 文件不存在: $CYPHER_FILE${NC}"
    exit 1
fi
cypher-shell -a "$NEO4J_URI" -u "$NEO4J_USER" -p "$NEO4J_PASSWORD" \
    -f "$CYPHER_FILE" 2>&1 | tail -3
echo -e "${GREEN}✅ 7 层节点加载完成${NC}"

# Step 6: 验证导入
echo -e "${YELLOW}[5/5]${NC} 验证导入结果..."
RESULT=$(cypher-shell -a "$NEO4J_URI" -u "$NEO4J_USER" -p "$NEO4J_PASSWORD" \
    "MATCH (n) RETURN count(n) AS nodes" 2>&1 | grep -E "^[0-9]+$" | head -1)
echo -e "${GREEN}✅ 导入完成: $RESULT 节点${NC}"

# 统计各层
echo
echo "===== 各层节点统计 ====="
cypher-shell -a "$NEO4J_URI" -u "$NEO4J_USER" -p "$NEO4J_PASSWORD" \
    "MATCH (n) RETURN labels(n)[0] AS type, count(n) AS count ORDER BY count DESC" \
    2>&1 | grep -E "^[A-Z]" | head -20

echo
echo "===== 各边类型统计 ====="
cypher-shell -a "$NEO4J_URI" -u "$NEO4J_USER" -p "$NEO4J_PASSWORD" \
    "MATCH ()-[r]->() RETURN type(r) AS type, count(r) AS count ORDER BY count DESC LIMIT 10" \
    2>&1 | grep -E "^[A-Z]" | head -10

echo
echo -e "${GREEN}🎉 Neo4j 加载完成！${NC}"
echo "访问 Neo4j Browser: http://localhost:7474"
echo "运行示例查询: cd $NEO4J_DIR && cypher-shell ... -f queries.cypher"
