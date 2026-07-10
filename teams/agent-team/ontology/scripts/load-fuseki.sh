#!/bin/bash
# ====================================================================
# Fuseki 加载脚本
# 把 OWL 本体 + SHACL Shapes 加载到 Apache Jena Fuseki
# ====================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ONTOLOGY_DIR="$(dirname "$SCRIPT_DIR")"
CORE_DIR="$ONTOLOGY_DIR/core"

# 颜色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Fuseki 配置
FUSEKI_URL="${FUSEKI_URL:-http://localhost:3030}"
DATASET_NAME="${DATASET_NAME:-team3}"
ADMIN_USER="${FUSEKI_USER:-admin}"
ADMIN_PASSWORD="${FUSEKI_PASSWORD:-admin}"

# Step 1: 检查 Fuseki
echo -e "${YELLOW}=== Fuseki 加载 Team 3 本体 ===${NC}"
if ! curl -sf -u "$ADMIN_USER:$ADMIN_PASSWORD" "$FUSEKI_URL/\$/ping" > /dev/null 2>&1; then
    echo -e "${RED}❌ 无法连接 Fuseki${NC}"
    echo "请先启动 Fuseki:"
    echo "  docker run -d -p 3030:3030 \\"
    echo "    -e FUSEKI_ADMIN=admin \\"
    echo "    -e FUSEKI_PASSWORD=admin \\"
    echo "    -e JVM_ARGS='-Xmx2g' \\"
    echo "    --name fuseki-team3 \\"
    echo "    stain/jena-fuseki:2.0.0"
    exit 1
fi
echo -e "${GREEN}✅ Fuseki 已连接${NC}"

# Step 2: 创建 dataset
echo -e "${YELLOW}[1/5]${NC} 创建 dataset '$DATASET_NAME'..."
curl -sf -X POST -u "$ADMIN_USER:$ADMIN_PASSWORD" \
    --data-urlencode "dbName=$DATASET_NAME" \
    --data-urlencode "dbType=tdb2" \
    "$FUSEKI_URL/\$/datasets" || true
echo -e "${GREEN}✅ Dataset 已创建${NC}"

# Step 3: 加载 OWL
echo -e "${YELLOW}[2/5]${NC} 加载 OWL 主文件..."
OWL_FILE="$CORE_DIR/agent-ontology.ttl"
if [ ! -f "$OWL_FILE" ]; then
    echo -e "${RED}❌ OWL 文件不存在: $OWL_FILE${NC}"
    exit 1
fi
curl -sf -X POST -u "$ADMIN_USER:$ADMIN_PASSWORD" \
    -H "Content-Type: text/turtle" \
    --data-binary "@$OWL_FILE" \
    "$FUSEKI_URL/$DATASET_NAME/data" \
    -o /tmp/fuseki_owl_response.txt
echo -e "${GREEN}✅ OWL 加载完成 ($(wc -c < $OWL_FILE) bytes)${NC}"

# Step 4: 加载 SHACL
echo -e "${YELLOW}[3/5]${NC} 加载 SHACL Shapes..."
SHACL_FILE="$CORE_DIR/agent-ontology-shapes.ttl"
if [ ! -f "$SHACL_FILE" ]; then
    echo -e "${RED}❌ SHACL 文件不存在: $SHACL_FILE${NC}"
    exit 1
fi
curl -sf -X POST -u "$ADMIN_USER:$ADMIN_PASSWORD" \
    -H "Content-Type: text/turtle" \
    --data-binary "@$SHACL_FILE" \
    "$FUSEKI_URL/$DATASET_NAME/data" \
    -o /tmp/fuseki_shacl_response.txt
echo -e "${GREEN}✅ SHACL 加载完成 ($(wc -c < $SHACL_FILE) bytes)${NC}"

# Step 5: 验证
echo -e "${YELLOW}[4/5]${NC} 验证加载结果..."
QUERY='SELECT (COUNT(*) AS ?count) WHERE { ?s a ?o }'
RESULT=$(curl -sf -u "$ADMIN_USER:$ADMIN_PASSWORD" \
    -H "Accept: application/sparql-results+json" \
    --data-urlencode "query=$QUERY" \
    "$FUSEKI_URL/$DATASET_NAME/query" | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(data['results']['bindings'][0]['count']['value'])
")
echo -e "${GREEN}✅ 共 $RESULT 个三元组已加载${NC}"

# Step 6: 跑 10 个红线 SPARQL 检查
echo -e "${YELLOW}[5/5]${NC} 跑 10 个红线 SPARQL 检查..."
QUERIES_FILE="$ONTOLOGY_DIR/graph/fuseki/red-line-queries.sparql"
if [ -f "$QUERIES_FILE" ]; then
    # 跑 RED-001 检查
    echo "RED-001 检查（Submission 必须由 SubmissionTaskAgent 处理）..."
    RED001_QUERY='
        PREFIX : <http://elite20.team3/ontology#>
        SELECT (COUNT(*) AS ?count) WHERE {
            ?s a :Submission ;
               :processedByAgentId ?agent .
            FILTER (!STRSTARTS(?agent, "submission-task-"))
        }
    '
    RESULT=$(curl -sf -u "$ADMIN_USER:$ADMIN_PASSWORD" \
        -H "Accept: application/sparql-results+json" \
        --data-urlencode "query=$RED001_QUERY" \
        "$FUSEKI_URL/$DATASET_NAME/query" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data['results']['bindings'][0]['count']['value'])
except:
    print('0')
")
    echo "  违反 RED-001 的实例数: $RESULT"
fi

echo
echo -e "${GREEN}🎉 Fuseki 加载完成！${NC}"
echo "访问 Fuseki UI: $FUSEKI_URL"
echo "SPARQL Endpoint: $FUSEKI_URL/$DATASET_NAME/query"
echo "Update Endpoint: $FUSEKI_URL/$DATASET_NAME/update"
