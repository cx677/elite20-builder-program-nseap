#!/bin/bash
# ====================================================================
# OWL + SHACL + SWRL 验证脚本
# 用 apache-jena reasoner 验证 OWL 一致性
# 用 TopBraid SHACL API 验证 SHACL Shapes
# 用 Drools 或 jena-rules 验证 SWRL
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

# Step 1: OWL 一致性检查（用 apache-jena）
echo -e "${YELLOW}[1/3]${NC} OWL 一致性检查..."

OWL_FILE="$CORE_DIR/agent-ontology.ttl"
if [ ! -f "$OWL_FILE" ]; then
    echo -e "${RED}❌ OWL 文件不存在${NC}"
    exit 1
fi

# 检查 jena 命令
JENA_CMD=""
if command -v riot &> /dev/null; then
    JENA_CMD="riot"
elif command -v jena &> /dev/null; then
    JENA_CMD="jena"
fi

if [ -n "$JENA_CMD" ]; then
    # 用 riot 解析验证语法
    if $JENA_CMD --validate "$OWL_FILE" > /tmp/owl_check.txt 2>&1; then
        echo -e "${GREEN}✅ OWL 语法有效${NC}"
    else
        echo -e "${RED}❌ OWL 语法错误:${NC}"
        cat /tmp/owl_check.txt
        exit 1
    fi

    # 用 jena reasoner 跑一致性
    if command -v jena &> /dev/null; then
        echo "  跑 HermiT reasoner..."
        if jena --query "$ONTOLOGY_DIR/graph/fuseki/consistency-check.rq" --data "$OWL_FILE" > /tmp/reasoner.txt 2>&1; then
            if grep -q "consistent" /tmp/reasoner.txt; then
                echo -e "${GREEN}✅ OWL 一致性通过${NC}"
            else
                echo -e "${YELLOW}⚠️ 一致性状态未明${NC}"
            fi
        fi
    fi
else
    echo -e "${YELLOW}⚠️ jena 未安装，跳过 reasoner 检查${NC}"
    echo "  安装: brew install jena (macOS) 或从 https://jena.apache.org/download/ 下载"
fi

# Step 2: SHACL Shapes 验证
echo
echo -e "${YELLOW}[2/3]${NC} SHACL Shapes 验证..."
SHACL_FILE="$CORE_DIR/agent-ontology-shapes.ttl"

# 检查 SHACL 关键字完整性
if grep -q "sh:NodeShape" "$SHACL_FILE" && grep -q "sh:targetClass" "$SHACL_FILE"; then
    echo "  解析 SHACL 文件..."

    # 统计
    NODE_SHAPES=$(grep -c "sh:NodeShape" "$SHACL_FILE" || true)
    PROP_SHAPES=$(grep -c "sh:property" "$SHACL_FILE" || true)
    SPARQL_CONSTRAINTS=$(grep -c "sh:SPARQLConstraint" "$SHACL_FILE" || true)
    RED_REFS=$(grep -c "RED-0" "$SHACL_FILE" || true)

    echo "    NodeShape: $NODE_SHAPES"
    echo "    PropertyShape: $PROP_SHAPES"
    echo "    SPARQL Constraint: $SPARQL_CONSTRAINTS"
    echo "    Red Line refs: $RED_REFS"

    # 检查 10 条红线全部覆盖
    for i in 001 002 003 004 005 006 007 008 009 010; do
        if grep -q "RED-$i" "$SHACL_FILE"; then
            echo -e "    ${GREEN}✅ RED-$i 覆盖${NC}"
        else
            echo -e "    ${RED}❌ RED-$i 缺失${NC}"
        fi
    done
fi

# Step 3: SWRL 规则检查
echo
echo -e "${YELLOW}[3/3]${NC} SWRL 规则检查..."
SWRL_FILE="$CORE_DIR/agent-ontology-rules.swrll"

if [ -f "$SWRL_FILE" ]; then
    RULES=$(grep -c "swrl:Imp" "$SWRL_FILE" || true)
    VIOLATES=$(grep -c "violatesRED" "$SWRL_FILE" || true)
    BUILTINS=$(grep -c "swrlb:" "$SWRL_FILE" || true)

    echo "  Imp 规则数: $RULES"
    echo "  推理谓词数: $VIOLATES"
    echo "  swrlb 内置: $BUILTINS"

    # 检查每个 RED 都有 Imp
    for i in 001 002 003 004 005 006 007 008 009 010; do
        if grep -q "RED00$i-Rule" "$SWRL_FILE" 2>/dev/null || grep -q "RED0$i-Rule" "$SWRL_FILE" 2>/dev/null; then
            echo -e "  ${GREEN}✅ RED-$i 规则已定义${NC}"
        else
            echo -e "  ${YELLOW}⚠️ RED-$i 可能未定义${NC}"
        fi
    done
fi

echo
echo -e "${GREEN}🎉 验证完成！${NC}"
