#!/usr/bin/env python3
"""
跑 10 条架构红线 SPARQL 查询
"""
import argparse
import sys
import urllib.request
import urllib.parse
import json
import re
from pathlib import Path


# 10 条红线 + 1 条综合监控
RED_LINE_QUERIES = {
    'RED-001': {
        'name': '提交写入唯一性',
        'query': '''
            PREFIX : <http://elite20.team3/ontology#>
            SELECT (COUNT(*) AS ?count) WHERE {
                ?s a :Submission ;
                   :processedByAgentId ?agent .
                FILTER (!STRSTARTS(?agent, "submission-task-"))
            }
        ''',
        'expect': 0,
        'severity': 'critical'
    },
    'RED-002': {
        'name': '不可越权写记录',
        'query': '''
            PREFIX : <http://elite20.team3/ontology#>
            SELECT (COUNT(*) AS ?count) WHERE {
                ?agent a :StudentCompanion ;
                       :hasPermission ?perm .
                ?perm :permissionScope ?scope .
                FILTER (CONTAINS(?scope, "submission") && CONTAINS(?scope, "write"))
            }
        ''',
        'expect': 0,
        'severity': 'critical'
    },
    'RED-003': {
        'name': '不可越权读记忆',
        'query': '''
            PREFIX : <http://elite20.team3/ontology#>
            SELECT (COUNT(*) AS ?count) WHERE {
                ?agent a :TeacherCompanion ;
                       :hasPermission ?perm .
                ?perm :permissionScope ?scope .
                FILTER (CONTAINS(?scope, "student_memory") || CONTAINS(?scope, "personal_"))
            }
        ''',
        'expect': 0,
        'severity': 'high'
    },
    'RED-004': {
        'name': '不可跨学生访问',
        'query': '''
            PREFIX : <http://elite20.team3/ontology#>
            SELECT (COUNT(*) AS ?count) WHERE {
                ?student a :StudentCompanion ;
                         :agentId ?selfId ;
                         :bindsToMemory ?mb .
                ?mb :ownerId ?ownerId .
                FILTER (?ownerId != ?selfId)
            }
        ''',
        'expect': 0,
        'severity': 'high'
    },
    'RED-005': {
        'name': '提交时间窗',
        'query': '''
            PREFIX : <http://elite20.team3/ontology#>
            SELECT (COUNT(*) AS ?count) WHERE {
                ?sub a :Submission ;
                     :submittedToChallenge ?cha .
                ?cha :hasStatus ?status .
                FILTER (?status != :challengeActive)
            }
        ''',
        'expect': 0,
        'severity': 'medium'
    },
    'RED-006': {
        'name': '消息必经 Inbox',
        'query': '''
            PREFIX : <http://elite20.team3/ontology#>
            SELECT (COUNT(*) AS ?count) WHERE {
                ?sender :sends ?msg .
                ?msg a :MessageEnvelope .
                FILTER NOT EXISTS { ?msg :deliveredVia ?inbox }
            }
        ''',
        'expect': 0,
        'severity': 'critical'
    },
    'RED-007': {
        'name': '必走 Trusted Relationship',
        'query': '''
            PREFIX : <http://elite20.team3/ontology#>
            SELECT (COUNT(*) AS ?count) WHERE {
                ?msg a :MessageEnvelope ;
                     :fromAgent ?from ;
                     :toAgent ?to .
                FILTER NOT EXISTS { ?from :trusts ?to }
            }
        ''',
        'expect': 0,
        'severity': 'critical'
    },
    'RED-008': {
        'name': '必留 Audit Trace',
        'query': '''
            PREFIX : <http://elite20.team3/ontology#>
            SELECT (COUNT(*) AS ?count) WHERE {
                ?sub a :Submission .
                FILTER NOT EXISTS { ?sub :hasAuditTrace ?audit }
            }
        ''',
        'expect': 0,
        'severity': 'critical'
    },
    'RED-009': {
        'name': '触达不靠 Agent',
        'query': '''
            PREFIX : <http://elite20.team3/ontology#>
            SELECT (COUNT(*) AS ?count) WHERE {
                ?manifest a :AgentManifest ;
                          :hasCapability ?cap .
                ?cap :capabilityName ?name .
                FILTER (CONTAINS(?name, "notify") || CONTAINS(?name, "send_push"))
            }
        ''',
        'expect': 0,
        'severity': 'medium'
    },
    'RED-010': {
        'name': 'Agent 通知边界',
        'query': '''
            PREFIX : <http://elite20.team3/ontology#>
            SELECT (COUNT(*) AS ?count) WHERE {
                ?cb a :ChannelBinding ;
                    :channelType ?type .
                FILTER (?type != "feishu")
            }
        ''',
        'expect': 0,
        'severity': 'medium'
    },
}


def run_sparql(fuseki_url: str, query: str, timeout: int = 30) -> int:
    """Run SPARQL query against Fuseki, return count."""
    encoded_query = urllib.parse.quote(query)
    url = f"{fuseki_url}/query?query={encoded_query}"

    req = urllib.request.Request(url)
    req.add_header('Accept', 'application/sparql-results+json')

    try:
        with urllib.request.urlopen(req, timeout=timeout) as response:
            data = json.loads(response.read().decode('utf-8'))
            bindings = data.get('results', {}).get('bindings', [])
            if bindings:
                return int(bindings[0].get('count', {}).get('value', 0))
            return 0
    except Exception as e:
        print(f"  ⚠️  Query error: {e}")
        return -1


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--fuseki-url', required=True)
    parser.add_argument('--output', help='Output markdown report')
    args = parser.parse_args()

    print(f"🔍 Running 10 Red Line SPARQL queries against {args.fuseki_url}")
    print()

    report = ['# 🔴 架构红线监控报告', '']
    report.append(f'Endpoint: `{args.fuseki_url}`')
    report.append('')
    report.append('| # | Red Line | 名称 | 严重性 | 违规数 | 状态 |')
    report.append('|---|---------|------|--------|--------|------|')

    total_violations = 0
    critical_violations = 0

    for i, (red_id, config) in enumerate(RED_LINE_QUERIES.items(), 1):
        count = run_sparql(args.fuseki_url, config['query'])
        status = '✅' if count == config['expect'] else '❌'
        report.append(f'| {i} | {red_id} | {config["name"]} | {config["severity"]} | {count} | {status} |')

        if count > 0:
            total_violations += count
            if config['severity'] == 'critical':
                critical_violations += count
            print(f"  ❌ {red_id}: {count} violations ({config['name']})")
        else:
            print(f"  ✅ {red_id}: 0 violations")

    print()
    print(f"📊 Total: {total_violations} violations ({critical_violations} critical)")

    report.append('')
    report.append(f'## Summary')
    report.append(f'- Total violations: {total_violations}')
    report.append(f'- Critical violations: {critical_violations}')

    if args.output:
        Path(args.output).parent.mkdir(parents=True, exist_ok=True)
        Path(args.output).write_text('\n'.join(report), encoding='utf-8')
        print(f"📄 Report: {args.output}")

    sys.exit(1 if critical_violations > 0 else 0)


if __name__ == '__main__':
    main()
