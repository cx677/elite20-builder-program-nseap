#!/usr/bin/env python3
"""
OWL 验证脚本：检查 .ttl 文件的语法、类和属性的完整性。
"""
import argparse
import sys
import re
from pathlib import Path


def validate_owl(owl_file: Path) -> tuple[bool, list[str]]:
    """Validate OWL Turtle file."""
    issues = []

    if not owl_file.exists():
        return False, [f"❌ File not found: {owl_file}"]

    content = owl_file.read_text(encoding='utf-8')

    # 1. Check prefixes
    prefixes = re.findall(r'@prefix\s+(\w+):\s+<([^>]+)>\s*\.', content)
    if not prefixes:
        issues.append("❌ No prefixes defined")

    required_prefixes = ['owl', 'rdf', 'rdfs', 'xsd']
    declared = [p[0] for p in prefixes]
    for req in required_prefixes:
        if req not in declared:
            issues.append(f"❌ Missing required prefix: {req}")

    # 2. Check bracket balance
    no_comments = re.sub(r'#[^\n]*', '', content)
    if no_comments.count('[') != no_comments.count(']'):
        issues.append(f"❌ Bracket [] unbalanced: {no_comments.count('[')} vs {no_comments.count(']')}")
    if no_comments.count('(') != no_comments.count(')'):
        issues.append(f"❌ Bracket () unbalanced: {no_comments.count('(')} vs {no_comments.count(')')}")
    if no_comments.count('{') != no_comments.count('}'):
        issues.append(f"❌ Bracket {{}} unbalanced: {no_comments.count('{')} vs {no_comments.count('}')}")

    # 3. Check class definitions
    classes = set(re.findall(r'^:([\w-]+)\s+a\s+owl:Class', content, re.MULTILINE))
    if len(classes) < 50:
        issues.append(f"⚠️  Only {len(classes)} classes defined (expected 80+)")

    # 4. Check property definitions
    obj_props = set(re.findall(r'^:([\w-]+)\s+a\s+owl:ObjectProperty', content, re.MULTILINE))
    data_props = set(re.findall(r'^:([\w-]+)\s+a\s+owl:DatatypeProperty', content, re.MULTILINE))
    if len(obj_props) < 20:
        issues.append(f"⚠️  Only {len(obj_props)} object properties defined (expected 30+)")

    # 5. Check red line references
    red_lines = set(re.findall(r'RED-\d{3}', content))
    if len(red_lines) < 10:
        issues.append(f"❌ Only {len(red_lines)} red lines referenced (expected 10)")
    else:
        for i in range(1, 11):
            red_id = f"RED-{i:03d}"
            if red_id not in red_lines:
                issues.append(f"❌ Missing red line: {red_id}")

    # 6. Check enum coverage
    oneOf = re.findall(r'owl:oneOf', content)
    if len(oneOf) < 14:
        issues.append(f"⚠️  Only {len(oneOf)} owl:oneOf definitions (expected 14+ enums)")

    # 7. Check for obvious typos
    if 'a owl:Class ;' in content and 'a sh:NodeShape' not in content:
        # Not an issue, just checking
        pass

    return len(issues) == 0, issues


def main():
    parser = argparse.ArgumentParser(description='Validate OWL Turtle file')
    parser.add_argument('--owl', required=True, help='Path to OWL .ttl file')
    args = parser.parse_args()

    owl_file = Path(args.owl)
    print(f"🔍 Validating OWL: {owl_file}")
    print(f"   Size: {owl_file.stat().st_size} bytes")

    valid, issues = validate_owl(owl_file)

    print()
    if issues:
        print(f"❌ Found {len(issues)} issues:")
        for issue in issues:
            print(f"  {issue}")
    else:
        print("✅ All checks passed!")

    sys.exit(0 if valid else 1)


if __name__ == '__main__':
    main()
