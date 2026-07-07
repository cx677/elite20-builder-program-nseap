# Demo Team

负责把二期成果做成可展示、可传播的演示材料。

## 当前成员

- 张浩

## 核心任务（7.6 更新）

**重点**：Demo 不是普通截图展示，而是要让老师、同学、评委、合作方快速理解"这是一个 Agent-native 的 AI 学习操作系统，而不是普通作业提交表单"。

用三张图讲清楚：
1. **飞书后台** — 学生、Challenge、提交、评价、作品集的记录
2. **GitHub 作业仓库** — 真实作品和证据链
3. **Web App 前台** — 提交入口、作品集展示

用一句话讲清楚：
> 学生提交 GitHub 项目，系统自动检查、AI 初评、写入飞书并生成作品集。

## 本周最小交付

### 1. 演示脚本

- `presentation/demo-script.md`：3 分钟演示脚本

脚本结构：
```
开场（30秒）
→ "二期做的是系统，不是材料"
→ 展示目标

演示（2分钟）
→ 打开 Web App 首页
→ 选择 Challenge，说明这是什么
→ 提交一个真实项目（用张浩 C2S 为例）
→ 展示 AI 初评结果
→ 切换到飞书，展示写入的记录
→ 切换回 Web App 作品集，展示最终展示效果

收尾（30秒）
→ "下一步是升级为 Agent-native 架构"
→ 一张图说明 Student Companion Agent → Submission Task Agent 流程
```

### 2. 系统架构图（文字版）

- `presentation/system-overview.md`

两张图：

**图1：当前已跑通的 MVP 闭环**
```
学生表单提交
→ Web App /api/submit
→ GitHub 仓库检查
→ DeepSeek AI 初评
→ 飞书写入（Submission + Evaluation + PortfolioItem）
→ Web App 作品集展示
```

**图2：下一步 Agent-native 目标**
```
Teacher Companion Agent 发布 Challenge
→ Student Companion Agent 发起 submission request
→ Submission Task Agent 校验 + 写入飞书 + 路由评审
→ Review Task Agent 评审
→ Feedback 回流给 Student Companion Agent
→ Portfolio / Ontology Memory 更新
```

### 3. 群内进展同步文案

- `progress-update-for-group.md`

可直接发到群里的文案：

> 目前二期 AI+X / NSEAP Builder Program 已跑通最小闭环：Web App 提交项目，GitHub 检查仓库和 README，DeepSeek 做 AI 初评，飞书记录学生、任务、提交、评价和作品集，前台展示结果。已经用真实项目"智引 AI 导航导师"和张浩 C2S 挑战提交跑通流程。7.6 新方向：下一步升级为 Agent-native 架构，学生、老师、提交、评审都有自己的 Agent 身份，提交经过 Submission Task Agent，过程能路由、能审计、能进入作品集。七个组本周各出一个最小可评审版本。

### 4. Demo 视频脚本

- `demo-video/storyboard.md`：视频分镜脚本

## 给佟博士/老师汇报用的说法

> 我们这几天不是只整理材料，而是先把二期最小系统闭环跑通了。当前已经实现 Web App + 飞书 + GitHub + DeepSeek 的真实联动：学生提交 GitHub 项目后，系统自动检查仓库、README 和最新提交，调用 DeepSeek 做 AI 初评，再把提交、评价和作品集记录写入飞书，前台可以展示作品集。7.6 Richard 新资料进一步明确，下一步不能做成普通 LMS，而要升级成 Agent-native 的 Challenge 发布、提交、评审和反馈路由系统：学生有 Student Companion Agent，老师有 Teacher Companion Agent，提交必须经过 Submission Task Agent，所有状态变化要有 Agent 身份、消息协议和审计记录。

## 与其他 Team 的接口

- **Platform Team**：获取 Web App 部署链接和截图
- **Challenge Team**：获取 Challenge 内容用于演示
- **Knowledge Team**：引用真实案例（智引AI导航导师、张浩 C2S）

## 验收标准

- [ ] 3 分钟演示脚本完整
- [ ] 系统架构两张图（文字版）清晰
- [ ] 群内同步文案可直接发送
- [ ] Demo 视频分镜脚本完成

## 参考资料

- 真实案例仓库：`zhiyin-ai-navigator`、`zhanghao-c2s-ai-x-paradigm-submission`
- 任务规划：`docs/phase2-builder-task-plan.md`
- 平台代码：`teams/platform-team/README.md`
