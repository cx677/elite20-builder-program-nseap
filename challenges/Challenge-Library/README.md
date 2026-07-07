# Challenge Library

> AI+X Vibe Coding 实验班 · 可复用的PBL挑战库
> 
> 最终交付物之一：重新设计所有PBL挑战，形成完整的Challenge Catalog

## 📖 定位

本 Challenge Library 是 **NSEAP AI Learning Operating System** 的核心组成部分，面向：

- **学校**：可直接部署运行的AI Native课程挑战
- **企业**：可复用的PBL（项目式学习）模板
- **培训机构**：拿来即用的训练体系

## 🗂️ 目录结构

```
Challenge-Library/
├── README.md                  ← 本文件，挑战总览
├── level-1/                   ← 入门级挑战
│   ├── C01-first-ai-assistant.md   构建你的第一个AI助手
│   ├── C02-ai-pair-programming.md  AI结对编程入门
│   ├── C03-prompt-engineering.md   提示词工程实战
│   └── C04-ai-research-review.md   用AI做研究综述
├── level-2/                   ← 进阶级挑战
│   ├── C05-single-agent.md         单智能体系统开发
│   ├── C06-multi-agent.md          多智能体协作系统
│   ├── C07-data-pipeline.md        AI + 数据处理管道
│   └── C08-im-integration.md       飞书/钉钉/微信集成
├── level-3/                   ← 高级挑战
│   ├── C09-real-project.md         真实项目交付
│   └── C10-platform-rebuild.md     AI教育平台重构（Final）
├── rubrics/                   ← 评分标准
│   └── assessment-rubric.md        四维评估体系
└── templates/                 ← 模板与工具
    ├── aar-template.md             课后复盘模板
    └── kstar-template.md           KSTAR情境方案模板
```

## 🎯 挑战总览

### Level 1: AI 基础认知与工具使用（入门）

| 编号 | 名称 | 类型 | 核心产出 | 耗时 |
|------|------|------|----------|------|
| [C01](level-1/C01-first-ai-assistant.md) | 构建你的第一个AI助手 | 构建型 | 可对话的AI Bot | 2-3天 |
| [C02](level-1/C02-ai-pair-programming.md) | AI结对编程入门 | 探索型 | 代码+协作记录 | 2-3天 |
| [C03](level-1/C03-prompt-engineering.md) | 提示词工程实战 | 构建型 | Prompt库 | 3-4天 |
| [C04](level-1/C04-ai-research-review.md) | 用AI做研究综述 | 研究型 | 文献综述 | 3-4天 |

### Level 2: 智能体开发与系统集成（进阶）

| 编号 | 名称 | 类型 | 核心产出 | 耗时 |
|------|------|------|----------|------|
| [C05](level-2/C05-single-agent.md) | 单智能体系统开发 | 构建型 | Agent应用 | 4-5天 |
| [C06](level-2/C06-multi-agent.md) | 多智能体协作系统 | 构建型 | Multi-Agent系统 | 5-7天 |
| [C07](level-2/C07-data-pipeline.md) | AI + 数据处理管道 | 构建型 | 数据处理管线 | 4-5天 |
| [C08](level-2/C08-im-integration.md) | 飞书/钉钉/微信集成 | 产品型 | IM集成方案 | 5-7天 |

### Level 3: 真实项目与产品交付（高级）

| 编号 | 名称 | 类型 | 核心产出 | 耗时 |
|------|------|------|----------|------|
| [C09](level-3/C09-real-project.md) | 真实项目交付 | 产品型 | 可部署产品 | 2-3周 |
| [C10](level-3/C10-platform-rebuild.md) | AI教育平台重构 | 产品型 | 完整的课程平台 | 3-4周 |

## 🧩 挑战模板结构

每个挑战统一使用以下模板结构：

```
┌─ 挑战编号 · 名称
│
├─ 📋 挑战概述 — 难度/类型/耗时/前置要求
├─ 🎯 学习目标 — 完成本挑战后能做什么
├─ 📦 交付物 — 必须提交的产出
├─ 🧩 挑战步骤 — Step 1 → Step 2 → Step 3 ...
├─ 📐 评分标准 (Rubric) — 通过/良好/优秀 三级
├─ 🔗 参考资源 — 文档/示例/工具
├─ 💡 提示与常见坑 — 踩过的坑别踩第二次
└─ 📝 AAR模板 — 课后复盘结构
```

## 📐 四维评估体系

| 维度 | 说明 | 权重 |
|------|------|------|
| 🧠 **拿来主义** | 能否有效借鉴已有方案，站在巨人肩膀上 | 20% |
| 💬 **有效反馈** | 是否主动获取并吸收他人反馈 | 20% |
| 🔄 **多次迭代** | 是否持续改进，不满足于"做完就行" | 30% |
| 📦 **可复用性** | 产出能否被他人直接使用或扩展 | 30% |

更多详情见 [评估体系](rubrics/assessment-rubric.md)

## 🚀 使用方式

### 作为教师/课程设计者
1. 浏览挑战目录，按难度/类型挑选
2. 复制挑战文件，按需修改前置要求和参考资源
3. 发布给学生，使用Rubric进行评审

### 作为学生/学习者
1. 选择适合自己水平的挑战
2. 按挑战步骤执行，AI辅助开发
3. 提交交付物，获取AI和同侪反馈
4. 完成AAR复盘，沉淀经验

### 作为企业/培训机构
1. 将Level 3挑战直接作为真实项目需求
2. 使用Rubric评估候选人能力
3. 可自定义挑战领域（如金融/医疗/教育）

## 🔗 与Builder Challenge的衔接

| Builder Challenge | 对应本库 | 说明 |
|------------------|---------|------|
| BC01 重新设计课程首页 | C07/C10 | 数据驱动+平台构建 |
| BC02 重新设计Week 1 | C01-C04 | 入门挑战对应入门课程 |
| BC03 重新设计Challenge模板 | 本库本身 | Challenge Library就是BC03的产出 |
| BC04 建立Skill Ontology | rubrics/ | 评估体系的Ontology基础 |
| BC05 开发Coding Coach | C05 | 单智能体应用 |
| BC06 开发Evaluation Agent | rubrics/ | AI自动评审 |
| BC07 建立Knowledge Base | C07 | 数据处理和知识库 |
| BC08 企业部署版本 | C09 | 真实项目交付 |
| BC09 课程产品化 | C10 | 最终产品化 |
| BC10 NSEAP V1.0 | C10 | 最终集成 |

## 📝 维护说明

本 Challenge Library 是活文档，需要持续维护和更新：

- **挑战内容更新**：根据课程反馈优化每个挑战的描述和步骤
- **新增挑战**：根据技术进步（AI工具更新）新增挑战
- **Rubric调整**：根据实际使用效果调整评估标准
- **示例更新**：更新AI工具使用的示例

---

> 🏗️ 本库由刘婷婷维护 · Elite20 Builder Program · 2026
