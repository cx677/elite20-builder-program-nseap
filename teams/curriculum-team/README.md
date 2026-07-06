# Curriculum Team

负责把一期 AI+X 实验班的课程经验重构为可复用的课程体系。

## 当前成员

- 张浩（牵头）
- 后续老师补充课程内容

## 核心任务（7.6 更新）

**重点**：不要先追求完整教材，先把课程目标、阶段、Challenge 对应关系讲清楚。课程体系要能支撑 AI+X Cognitive Learning OS 的运行，而不是独立的 PPT 集合。

## 本周最小交付

### 1. 课程结构文档

- `syllabus/README.md`：课程总览（目标、对象、阶段、评价方式）
- `learning-objectives.md`：课程培养什么能力，分阶段说明
- `weekly-plan/week-01.md`：第一周内容，可直接用于授课
- `course-to-challenge-map.md`：课程知识点 → Challenge 对应关系

### 2. 课程设计原则

- `syllabus/design-principles.md`

说明：
- 为什么采用 Challenge 驱动学习
- 为什么 GitHub 是正式提交入口
- 为什么学生需要 Companion Agent
- 课程如何支持 Peer Review 和 Agent Review
- 课程如何支持真实项目过渡

## 课程目标框架

二期课程目标可以分三个层次：

### 能力层（学生学完后能做什么）

1. 能用 AI 工具辅助完成真实项目
2. 能定义 Situation → 设计 Skill → 包装 Agent
3. 能规范地使用 GitHub 管理项目和作品
4. 能完成 AAR 复盘和自评
5. 能进行 Peer Review

### 产物层（学生能交付什么）

- GitHub 项目仓库
- Agent / Skill 原型
- AAR 复盘文档
- 个人作品集（Portfolio）

### 系统层（学生能使用什么工具）

- Student Companion Agent（AI 辅助学习）
- Challenge 提交平台（Web App）
- 飞书作业记录（追踪自己的学习状态）
- GitHub 作品集（公开展示）

## 课程阶段建议

| 阶段 | 主题 | Challenge 连接 | 时长 |
|---|---|---|---|
| Phase 1 | AI+X 范式理解 | C2S（精读、建言、复盘） | Week 1-2 |
| Phase 2 | Skill / Agent 构建 | C4（工具链 / Skill）、C8（班级工具） | Week 3-5 |
| Phase 3 | 真实项目实战 | C10（综合项目） | Week 6-8 |
| Phase 4 | 作品沉淀与展示 | Portfolio、Demo | Week 9-10 |

## 与 Challenge 的对应关系

每周内容应能回答：

1. 本周学什么理论/方法？
2. 对应哪个 Challenge？
3. Challenge 要求学生做什么？
4. 如何通过 Student Companion Agent 引导学生？

## 与其他 Team 的接口

- **Challenge Team**：课程阶段对应的 Challenge ID 和 Rubric
- **Agent Team**：Student Companion Agent 如何在课程中引导学生
- **Platform Team**：课程内容如何在 Web App 中展示

## 验收标准

- [ ] `syllabus/README.md` 包含课程目标、对象、评价方式
- [ ] `learning-objectives.md` 分阶段描述能力目标
- [ ] `course-to-challenge-map.md` 说明知识点和 Challenge 的对应
- [ ] `weekly-plan/week-01.md` 可直接用于第一周授课

## 参考资料

- 任务规划：`docs/phase2-builder-task-plan.md`
- 一期背景：`docs/phase1-background-summary.md`（`docs/phase2-builder-task-plan.md` 附录部分）
