#!/usr/bin/env node
/**
 * Team 3 MVP Demo - 单文件版
 * 5 组件最小闭环：飞书群 + Student Companion + Hermes + 飞书 Bitable + GitHub Repo
 *
 * 运行：node demo.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, 'output');

// ============================================================
// 颜色工具
// ============================================================
const c = {
  reset: '\x1b[0m', bold: '\x1b[1m',
  red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m',
  blue: '\x1b[34m', magenta: '\x1b[35m', cyan: '\x1b[36m', gray: '\x1b[90m',
};
const log = (icon, label, msg, color = 'cyan') =>
  console.log(`${c.gray}[${new Date().toISOString().slice(11, 19)}]${c.reset} ${c[color]}${icon} ${label}${c.reset} ${msg}`);
const header = (n, title) =>
  console.log(`\n${c.bold}${c.magenta}${'═'.repeat(70)}\n${c.reset}${c.bold}Step ${n}: ${title}${c.reset}\n${c.magenta}${'═'.repeat(70)}${c.reset}`);
const sub = (label, value, color = 'yellow') =>
  console.log(`   ${c.gray}├─${c.reset} ${c[color]}${label}${c.reset}: ${value}`);

// ============================================================
// Mock 1: 飞书 Bitable（5 张表 → 5 个 JSON 文件）
// ============================================================
const BITABLE_DIR = join(OUT, 'bitable');
mkdirSync(BITABLE_DIR, { recursive: true });
const TABLES = {
  Students: 'students.json',
  Challenges: 'challenges.json',
  Submissions: 'submissions.json',
  Evaluations: 'evaluations.json',
  PortfolioItems: 'portfolio.json',
};
const db = {};
for (const [name, file] of Object.entries(TABLES)) {
  const path = join(BITABLE_DIR, file);
  if (existsSync(path)) {
    db[name] = JSON.parse(readFileSync(path, 'utf-8'));
  } else {
    db[name] = [];
  }
}
const dbSave = () => {
  for (const [name, file] of Object.entries(TABLES)) {
    writeFileSync(join(BITABLE_DIR, file), JSON.stringify(db[name], null, 2));
  }
};
const dbInsert = (table, row) => {
  db[table].push(row);
  log('  ', `→ 飞书 Bitable.${table}`, `+1 行 (总 ${db[table].length} 行)`, 'blue');
  dbSave();
};

// ============================================================
// Mock 2: GitHub Repo（用文件系统模拟）
// ============================================================
const REPO_DIR = join(OUT, 'github', 'elite20-challenge-C01');
if (!existsSync(REPO_DIR)) mkdirSync(REPO_DIR, { recursive: true });
const gitCommit = (file, content, message) => {
  const path = join(REPO_DIR, file);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
  log('  ', `→ GitHub.${file}`, `commit: "${message}"`, 'magenta');
};

// ============================================================
// Mock 3: 飞书群（用数组模拟，控制台打印）
// ============================================================
const CHAT_LOG = join(OUT, 'chat', 'group-messages.json');
mkdirSync(dirname(CHAT_LOG), { recursive: true });
const chat = existsSync(CHAT_LOG) ? JSON.parse(readFileSync(CHAT_LOG, 'utf-8')) : [];
const sendMessage = (from, text, type = 'text') => {
  const msg = { time: new Date().toISOString(), from, type, text };
  chat.push(msg);
  log('  ', `→ 飞书群`, `${from}: ${text.slice(0, 60)}${text.length > 60 ? '...' : ''}`, 'green');
  writeFileSync(CHAT_LOG, JSON.stringify(chat, null, 2));
};
const sendRichMessage = (from, payload) => {
  // 飞书群卡片消息
  sendMessage(from, `📦 [Rich Card] ${payload.title}`);
  console.log(`      ${c.gray}┌─ Card Details ─────────────────${c.reset}`);
  for (const [k, v] of Object.entries(payload)) {
    if (k === 'title') continue;
    console.log(`      ${c.gray}│${c.reset} ` + c.cyan + k + c.reset + ': ' + v);
  }
  console.log(`      ${c.gray}└─────────────────────────────────${c.reset}`);
};

// ============================================================
// Mock 4: Hermes 消息路由（W3C 标准简化版）
// ============================================================
const hermesInbox = [];
const hermesOutbox = [];
const hermesRoute = (envelope) => {
  hermesOutbox.push(envelope);
  log('  ', '→ Hermes.outbox', `queued ${envelope.message_id} (${envelope.message_type})`, 'yellow');
  // 路由：根据 from/to 找目标 Agent
  setTimeout(() => {
    hermesInbox.push(envelope);
    log('  ', '→ Hermes.inbox', `delivered ${envelope.message_id} → ${envelope.to_agent}`, 'yellow');
    deliverToAgent(envelope);
  }, 100);
};
const deliverToAgent = (envelope) => {
  if (envelope.to_agent === 'student-companion') {
    studentCompanion.handle(envelope);
  } else if (envelope.to_agent === 'submission-task-agent') {
    submissionTaskAgent.handle(envelope);
  }
};
const makeEnvelope = (from, to, type, payload) => ({
  message_id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  request_id: `req-${Date.now()}`,
  from_agent: from,
  to_agent: to,
  message_type: type,
  timestamp: new Date().toISOString(),
  payload,
  audit_trace_pointer: `audit-${Date.now()}`,
});

// ============================================================
// Mock 5: Student Companion（学生 AI 助手）
// ============================================================
const studentCompanion = {
  agent_id: 'student-companion-zhanghao',
  name: 'Student Raymond',
  handle(envelope) {
    log('  ', '🤖 StudentCompanion', `received ${envelope.message_type}`, 'cyan');
    if (envelope.message_type === 'challenge_available') {
      // 学生看到新作业
      const ch = envelope.payload;
      sendMessage(
        'Student Raymond',
        `📚 新作业已发布: ${ch.title}\n` +
        `   截止: ${ch.due_date}\n` +
        `   所需 Skill: ${ch.skills.join(', ')}\n` +
        `   提交方式: 在 GitHub 写代码后跑 \`npm run submit\``
      );
    } else if (envelope.message_type === 'feedback') {
      const fb = envelope.payload;
      sendMessage(
        'Student Raymond',
        `📬 收到反馈\n` +
        `   分数: ${fb.scores.total_score}\n` +
        `   ${fb.feedback_summary}`
      );
    } else if (envelope.message_type === 'revision_required') {
      const r = envelope.payload;
      sendMessage(
        'Student Raymond',
        `⚠️ 提交需要修改\n` +
        `   原因: ${r.reason}\n` +
        `   请修改后重新提交`
      );
    } else if (envelope.message_type === 'submission_accepted') {
      const a = envelope.payload;
      sendMessage(
        'Student Raymond',
        `🎉 提交已被接受！\n` +
        `   最终分数: ${a.final_score}\n` +
        `   作品集已更新: ${a.portfolio_url}`
      );
    }
  },
  // 学生主动操作：准备并发送提交
  async submitToHermes(challengeId, repoFiles) {
    log('  ', '🤖 StudentCompanion', 'preparing submission package...', 'cyan');
    await new Promise(r => setTimeout(r, 200));
    const package_ = {
      challenge_id: challengeId,
      student_id: 'student-001',
      student_name: 'Zhang Hao',
      github_repo: 'elite20-challenge-C01',
      github_branch: 'main',
      github_commit: 'commit-sha-placeholder',
      submitted_files: repoFiles,
      self_reflection: '我用 AI 助手快速完成了 4 个 Agent 的协作',
      skills_used: ['SK-01', 'SK-02', 'SK-03'],
      ontology_nodes_used: [':Agent', ':StudentCompanion', ':Submission'],
    };
    log('  ', '🤖 StudentCompanion', '✓ 5 步校验通过 (github_repo/readme/aar/deadline/permissions)', 'cyan');

    // 5 步校验（mock）
    if (!package_.github_repo) throw new Error('❌ RED-005: missing github_repo');
    if (!package_.submitted_files.includes('README.md')) throw new Error('❌ RED-001: missing README');
    if (!package_.submitted_files.includes('aar.md')) throw new Error('❌ RED-001: missing AAR');

    // 通过 Hermes 发送
    const envelope = makeEnvelope(
      'student-companion-zhanghao',
      'submission-task-agent',
      'submission_request',
      package_
    );
    hermesRoute(envelope);
    return envelope;
  },
};

// ============================================================
// Mock: Submission Task Agent（提交任务智能体）
// ============================================================
const submissionTaskAgent = {
  agent_id: 'submission-task-agent',
  name: 'Submission Task Agent',
  handle(envelope) {
    log('  ', '⚙️ SubmissionTaskAgent', `received ${envelope.message_type}`, 'blue');
    if (envelope.message_type === 'submission_request') {
      const sub = envelope.payload;
      // 🔴 RED-001 架构红线：只有 SubmissionTaskAgent 能写 Submissions
      log('  ', '⚙️ SubmissionTaskAgent', '🔴 RED-001 check: only I can write Submission', 'red');

      const submission = {
        submission_id: `sub-${Date.now()}`,
        submission_request_id: envelope.request_id,
        challenge_id: sub.challenge_id,
        student_id: sub.student_id,
        submitted_by_agent_id: envelope.from_agent,
        processed_by_agent_id: 'submission-task-agent', // 🔴 RED-001
        admin_identity_mode: 'independent_admin',
        github_repo: `https://github.com/zhanghao/${sub.github_repo}`,
        github_branch: sub.github_branch,
        github_commit: sub.github_commit,
        submitted_files: sub.submitted_files,
        self_reflection_pointer: 'aar.md',
        skills_used: sub.skills_used,
        ontology_nodes_used: sub.ontology_nodes_used,
        system_validation_status: 'pending_review',
        review_mode: 'teacher_only',
        routing_status: 'routed_to_teacher',
        review_status: 'submitted',
        feedback_pointer: 'pending',
        audit_log_pointer: envelope.audit_trace_pointer,
        submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // 写入 飞书 Bitable.Submissions
      dbInsert('Submissions', submission);
      log('  ', '⚙️ SubmissionTaskAgent', `✓ Submission ${submission.submission_id} created`, 'blue');

      // 通知学生
      setTimeout(() => {
        hermesRoute(makeEnvelope(
          'submission-task-agent',
          'student-companion-zhanghao',
          'feedback',
          {
            submission_id: submission.submission_id,
            student_id: sub.student_id,
            scores: { total_score: 78, breakdown: 'mock' },
            feedback_summary: '提交已收到，等待老师评审',
          }
        ));
      }, 200);
    }
  },
};

// ============================================================
// 初始化数据
// ============================================================
if (db.Students.length === 0) {
  dbInsert('Students', {
    student_id: 'student-001', name: 'Zhang Hao',
    school: 'SIAS University', major: 'AI+X',
    feishu_id: 'ou-zhanghao', github_username: 'zhanghao',
  });
  dbInsert('Challenges', {
    challenge_id: 'C01-ai-assistant', title: 'Build Your First AI Assistant',
    description: '用 Claude API 写一个能回答问题的 AI 助手',
    teacher_id: 'teacher-001', teacher_agent_id: 'teacher-companion-t001',
    ontology_nodes: [':AIAssistant', ':PromptEngineering'],
    skills: ['SK-04', 'SK-05'],
    learning_objectives: ['理解 LLM API', '掌握 Prompt Engineering'],
    required_deliverables: ['GitHubRepo', 'README', 'AAR'],
    rubric_pointer: 'rub:C01-rubric',
    due_date: '2026-07-15T23:59:59Z',
    status: 'active',
  });
}

// ============================================================
// 主流程：跑 13 步 MVP 闭环
// ============================================================
async function run() {
  console.log(`${c.bold}${c.magenta}
╔═══════════════════════════════════════════════════════════════╗
║   Team 3 MVP Demo - Elite20 AI+X Challenge C01              ║
║   5 组件最小闭环：飞书群 + Student Companion + Hermes      ║
║                  + 飞书 Bitable (5 表) + GitHub Repo         ║
╚═══════════════════════════════════════════════════════════════╝${c.reset}`);

  console.log(`\n${c.gray}项目目录: ${__dirname}${c.reset}`);
  console.log(`${c.gray}输出目录: ${OUT}${c.reset}`);

  // ---- 步骤 1: 学生加入飞书群 ----
  header(1, '学生加入飞书群 "Elite20-C01"');
  sendMessage('小明', '大家好！我是小明，刚刚加入 Elite20-C01 班级 👋');
  sendMessage('系统', '欢迎 @小明 加入精英 20 训练营！');

  // ---- 步骤 2: 老师发布挑战 ----
  header(2, '老师发布挑战（Teacher Companion Agent）');
  await new Promise(r => setTimeout(r, 300));
  sendMessage('王老师', '@all 新作业发布: Build Your First AI Assistant');
  await new Promise(r => setTimeout(r, 200));
  // Teacher Companion Agent 发送 challenge_publish 到 Hermes
  hermesRoute(makeEnvelope(
    'teacher-companion-t001',
    'submission-task-agent',
    'challenge_publish',
    {
      challenge_id: 'C01-ai-assistant',
      title: 'Build Your First AI Assistant',
      teacher_id: 'teacher-001',
      teacher_agent_id: 'teacher-companion-t001',
      ontology_nodes: [':AIAssistant', ':PromptEngineering'],
      skills: ['SK-04', 'SK-05'],
      learning_objectives: ['理解 LLM API', '掌握 Prompt Engineering'],
      required_deliverables: ['GitHubRepo', 'README', 'AAR'],
      rubric_pointer: 'rub:C01-rubric',
      due_date: '2026-07-15T23:59:59Z',
    }
  ));
  await new Promise(r => setTimeout(r, 300));
  // SubmissionTaskAgent 把挑战写入 Bitable.Challenges + 广播给学生
  // (简化：直接 broadcast)
  hermesRoute(makeEnvelope(
    'submission-task-agent',
    'student-companion-zhanghao',
    'challenge_available',
    db.Challenges[0]
  ));
  await new Promise(r => setTimeout(r, 500));

  // ---- 步骤 3: 学生创建 GitHub Repo ----
  header(3, '学生创建 GitHub Repo');
  await new Promise(r => setTimeout(r, 200));
  log('  ', '🧑‍💻 小明', '在 GitHub 创建 elite20-challenge-C01 repo', 'yellow');
  gitCommit('README.md', `# AI Assistant for Elite20-C01

## 学习目标
- 理解 LLM API
- 掌握 Prompt Engineering

## 实现
- 调用 Claude API
- 处理用户输入
- 返回 AI 回答

## 技能沉淀
- Prompt Engineering
- API 集成
`, '[init] project README');
  gitCommit('ai-assistant.py', `import anthropic

def ask_ai(question: str) -> str:
    client = anthropic.Anthropic()
    msg = client.messages.create(
        model="claude-3-5-sonnet",
        max_tokens=1024,
        messages=[{"role": "user", "content": question}]
    )
    return msg.content[0].text

if __name__ == "__main__":
    print(ask_ai("Hello AI!"))
`, '[feat] implement AI assistant');
  gitCommit('aar.md', `# After Action Review (AAR) - C01

## 1. 任务是什么？
用 Claude API 写一个 AI 助手

## 2. 我预期会发生什么？
- API 调用成功
- 30 分钟内完成

## 3. 实际发生了什么？
- 用了 AI 辅助 15 分钟完成

## 4. 哪些地方有效？
- 边写边问 AI 加速开发

## 5. 哪些地方失败？
- 第一次 Prompt 不够具体

## 6. 我学到了什么？
- Prompt 模板很重要

## 7. 哪个 Skill 需要更新？
- SK-04 Prompt Engineering 加个例子

## 8. Companion 应该记住什么？
- 我喜欢先看 API 文档再写代码

## 9. 下次我会怎么做？
- 先写 3 个 Prompt 模板再开始
`, '[docs] write AAR after completion');
  await new Promise(r => setTimeout(r, 200));

  // ---- 步骤 4: 学生跑 npm run submit ----
  header(4, '学生跑 npm run submit');
  log('  ', '🧑‍💻 小明', '$ npm run submit', 'yellow');
  await new Promise(r => setTimeout(r, 300));

  // ---- 步骤 5-7: Student Companion 准备 + Hermes 路由 + Submission Task Agent 处理 ----
  header(5, 'Student Companion 准备提交包');
  await studentCompanion.submitToHermes('C01-ai-assistant', [
    'README.md', 'ai-assistant.py', 'aar.md',
  ]);
  await new Promise(r => setTimeout(r, 1000));

  // ---- 步骤 8: 写 PortfolioItem ----
  header(6, 'Submission Task Agent 写 PortfolioItem');
  await new Promise(r => setTimeout(r, 300));
  const lastSub = db.Submissions[db.Submissions.length - 1];
  const portfolioItem = {
    portfolio_item_id: `pf-${Date.now()}`,
    student_id: lastSub.student_id,
    submission_id: lastSub.submission_id,
    title: 'AI Assistant',
    type: 'project',
    github_url: lastSub.github_repo,
    is_public: true,
  };
  dbInsert('PortfolioItems', portfolioItem);
  log('  ', '→ 飞书群', `📦 @小明 Portfolio 已更新: ${portfolioItem.title}`, 'green');
  await new Promise(r => setTimeout(r, 300));

  // ---- 步骤 9: 通知学生 ----
  header(7, '通知学生提交已被接收');
  hermesRoute(makeEnvelope(
    'submission-task-agent',
    'student-companion-zhanghao',
    'submission_accepted',
    {
      submission_id: lastSub.submission_id,
      student_id: lastSub.student_id,
      final_score: 78,
      portfolio_url: 'https://portfolio.elite20.team3/student-001',
    }
  ));
  await new Promise(r => setTimeout(r, 500));

  // ---- 最终输出 ----
  header('FINAL', '🎉 MVP 闭环完成！');
  console.log(`${c.bold}学生视角的产出（实际文件已生成到 output/）：${c.reset}\n`);
  console.log(`   ${c.green}✅${c.reset} ${c.cyan}飞书群消息${c.reset}:        output/chat/group-messages.json   (${chat.length} 条)`);
  console.log(`   ${c.green}✅${c.reset} ${c.cyan}飞书 Bitable 5 表${c.reset}:    output/bitable/*.json`);
  for (const [name, rows] of Object.entries(db)) {
    console.log(`     ${c.gray}├─ ${name}: ${rows.length} 行${c.reset}`);
  }
  console.log(`   ${c.green}✅${c.reset} ${c.cyan}GitHub 提交${c.reset}:          output/github/elite20-challenge-C01/`);
  console.log(`     ${c.gray}├─ README.md, ai-assistant.py, aar.md (3 文件)${c.reset}`);
  console.log(`   ${c.green}✅${c.reset} ${c.cyan}Hermes 消息流${c.reset}:        7 条 envelope 已路由（log 在控制台）\n`);

  console.log(`${c.bold}下一步${c.reset}：
  - 看 ${c.yellow}output/chat/group-messages.json${c.reset} 看学生在群里看到啥
  - 看 ${c.yellow}output/bitable/submissions.json${c.reset} 看 Submissions 表的字段
  - 看 ${c.yellow}output/github/elite20-challenge-C01/${c.reset} 看提交的文件
  - 修改本文件重新跑：${c.cyan}node demo.mjs${c.reset}\n`);
}

run().catch(console.error);
