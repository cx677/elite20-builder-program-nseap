#!/usr/bin/env python3
"""
JSON Schema 验证脚本：检查所有 .schema.json 文件的语法和结构。
"""
import argparse
import json
import sys
from pathlib import Path
from typing import List, Tuple


def validate_schema(schema_file: Path) -> Tuple[bool, List[str]]:
    """Validate single JSON Schema file."""
    issues = []

    try:
        with open(schema_file) as f:
            data = json.load(f)
    except json.JSONDecodeError as e:
        return False, [f"❌ Invalid JSON: {e}"]

    # Required fields
    if '$schema' not in data:
        issues.append("⚠️  Missing $schema declaration")
    if 'type' not in data:
        issues.append("❌ Missing 'type' field")
    elif data['type'] != 'object':
        # Top-level must be object
        if not isinstance(data['type'], str):
            issues.append("❌ 'type' should be 'object' at top level")

    # Check required vs properties
    required = set(data.get('required', []))
    properties = set(data.get('properties', {}).keys())
    missing_in_props = required - properties
    if missing_in_props:
        issues.append(f"❌ 'required' fields missing in 'properties': {missing_in_props}")

    # Check for "additionalProperties: false" with required (good practice)
    if data.get('additionalProperties') is not False and required:
        issues.append("⚠️  Consider setting additionalProperties: false")

    # Check pattern fields
    for prop_name, prop_def in data.get('properties', {}).items():
        if prop_def.get('type') == 'string' and 'pattern' in prop_def:
            try:
                import re
                re.compile(prop_def['pattern'])
            except re.error as e:
                issues.append(f"❌ Invalid regex in properties.{prop_name}.pattern: {e}")

    return len(issues) == 0, issues


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--schemas', required=True, help='Path to schemas directory')
    parser.add_argument('--output', help='Path to output report (markdown)')
    args = parser.parse_args()

    schemas_dir = Path(args.schemas)
    if not schemas_dir.exists():
        print(f"❌ Directory not found: {schemas_dir}")
        sys.exit(1)

    schema_files = list(schemas_dir.rglob('*.schema.json'))
    print(f"🔍 Found {len(schema_files)} JSON Schema files")
    print()

    report_lines = ['# JSON Schema 验证报告', '']
    report_lines.append(f'共 {len(schema_files)} 个文件\n')

    total_valid = 0
    total_issues = 0

    for schema_file in schema_files:
        rel = schema_file.relative_to(schemas_dir)
        valid, issues = validate_schema(schema_file)

        if valid:
            total_valid += 1
            print(f"  ✅ {rel}")
            report_lines.append(f'## ✅ {rel}')
        else:
            total_issues += len(issues)
            print(f"  ❌ {rel}: {len(issues)} issues")
            report_lines.append(f'## ❌ {rel}')

        if issues:
            report_lines.append('')
            for issue in issues:
                print(f"      {issue}")
                report_lines.append(f'  - {issue}')
        report_lines.append('')

    print()
    print(f"📊 Summary: {total_valid}/{len(schema_files)} valid, {total_issues} issues total")
    report_lines.append(f'## Summary')
    report_lines.append(f'- Valid: {total_valid}/{len(schema_files)}')
    report_lines.append(f'- Issues: {total_issues}')

    if args.output:
        Path(args.output).parent.mkdir(parents=True, exist_ok=True)
        Path(args.output).write_text('\n'.join(report_lines), encoding='utf-8')
        print(f"📄 Report written to: {args.output}")

    sys.exit(0 if total_issues == 0 else 1)


if __name__ == '__main__':
    main()
