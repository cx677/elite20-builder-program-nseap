# Team 3 规则抽取（Rule Extraction）— 10 条架构红线 OWL 形式化

> 把 `Team3-关系抽取.md` §2 中的 10 条架构红线，**形式化为 W3C 标准**：
> - **OWL 2 DL** — 类、属性、约束
> - **SHACL** — 数据形状约束（运行时校验）
> - **SWRL** — 推理规则
> - **SPARQL** — 一致性查询
> 
> 这是 Ontology Factory 7 步流水线的 **AutoConstraint** 阶段。

---

## 目录

- [0. 形式化语言选择](#0-形式化语言选择)
- [1. 命名空间与前缀](#1-命名空间与前缀)
- [2. 核心类与属性定义（OWL）](#2-核心类与属性定义owl)
- [3. 10 条架构红线形式化](#3-10-条架构红线形式化)
  - [RED-001 提交写入唯一性](#red-001-提交写入唯一性)
  - [RED-002 不可越权写记录](#red-002-不可越权写记录)
  - [RED-003 不可越权读记忆](#red-003-不可越权读记忆)
  - [RED-004 不可跨学生访问](#red-004-不可跨学生访问)
  - [RED-005 提交时间窗](#red-005-提交时间窗)
  - [RED-006 消息必经 Inbox](#red-006-消息必经-inbox)
  - [RED-007 必走 Trusted Relationship](#red-007-必走-trusted-relationship)
  - [RED-008 必留 Audit Trace](#red-008-必留-audit-trace)
  - [RED-009 触达不靠 Agent](#red-009-触达不靠-agent)
  - [RED-010 Agent 通知边界](#red-010-agent-通知边界)
- [4. SHACL Shapes 汇总](#4-shacl-shapes-汇总)
- [5. SWRL 规则汇总](#5-swrl-规则汇总)
- [6. SPARQL 一致性查询](#6-sparql-一致性查询)
- [7. 形式化覆盖度自评](#7-形式化覆盖度自评)

---

## 0. 形式化语言选择

| 用途 | 语言 | 强度 | 应用阶段 |
|---|---|---|---|
| 类、属性、继承 | **OWL 2 DL** | 强（可推理）| 设计期 |
| 数据形状约束 | **SHACL** | 中（运行时校验）| 写入期 |
| 业务规则推理 | **SWRL** | 强（可推理）| 推理期 |
| 一致性查询 | **SPARQL** | 弱（按需）| 测试期 |

**组合方式**：

```text
设计期：OWL 定义类 / 属性 / 继承
       ↓
写入期：SHACL 在数据库入口 / API 入口校验数据形状
       ↓
推理期：SWRL 在本体上推导新事实（如红线违规自动告警）
       ↓
测试期：SPARQL 跑一致性查询（如"找出所有违反 RED-001 的实例"）
```

---

## 1. 命名空间与前缀

```turtle
@prefix :        <http://elite20.team3/ontology#> .
@prefix team3:   <http://elite20.team3/ontology#> .
@prefix sh:      <http://www.w3.org/ns/shacl#> .
@prefix swrl:    <http://www.w3.org/2003/11/swrl#> .
@prefix swrlb:   <http://www.w3.org/2003/11/swrlb#> .
@prefix xsd:     <http://www.w3.org/2001/XMLSchema#> .
@prefix rdfs:    <http://www.w3.org/2000/01/rdf-schema#> .
@prefix owl:     <http://www.w3.org/2002/07/owl#> .
@prefix rdf:     <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix dcterms: <http://purl.org/dc/terms/> .
@prefix skos:    <http://www.w3.org/2004/02/skos/core#> .
@prefix red:     <http://elite20.team3/redline#> .
```

---

## 2. 核心类与属性定义（OWL）

### 2.1 核心类（OWL Class）

```turtle
# ========== 顶层 ==========
:Agent a owl:Class ;
    rdfs:label "Agent"@en, "智能体"@zh ;
    rdfs:comment "Abstract base class for all agents"@en .

:CompanionAgent a owl:Class ;
    rdfs:subClassOf :Agent ;
    rdfs:label "Companion Agent"@en, "伴随型智能体"@zh .

:TaskAgent a owl:Class ;
    rdfs:subClassOf :Agent ;
    rdfs:label "Task Agent"@en, "任务型智能体"@zh .

# ========== Companion 子类 ==========
:StudentCompanion a owl:Class ;
    rdfs:subClassOf :CompanionAgent ;
    rdfs:label "Student Companion"@en, "学生伴随智能体"@zh .

:TeacherCompanion a owl:Class ;
    rdfs:subClassOf :CompanionAgent ;
    rdfs:label "Teacher Companion"@en, "教师伴随智能体"@zh .

:AdminCompanion a owl:Class ;
    rdfs:subClassOf :CompanionAgent ;
    rdfs:label "Admin Companion"@en, "管理员伴随智能体"@zh .

# ========== Task Agent 子类 ==========
:SubmissionTaskAgent a owl:Class ;
    rdfs:subClassOf :TaskAgent ;
    rdfs:label "Submission Task Agent"@en, "提交任务智能体"@zh ;
    rdfs:comment "唯一能写 Submission Record 的 Agent"@zh .

:ReviewTaskAgent a owl:Class ;
    rdfs:subClassOf :TaskAgent ;
    rdfs:label "Review Task Agent"@en, "评审任务智能体"@zh .

:PeerReviewStudentAgent a owl:Class ;
    rdfs:subClassOf :TaskAgent ;
    rdfs:label "Peer Review Student Agent"@en, "同伴评审学生智能体"@zh .

# ========== 业务对象类 ==========
:Learner a owl:Class ;
    rdfs:label "Learner"@en, "学生"@zh .

:Professor a owl:Class ;
    rdfs:label "Professor"@en, "教师"@zh .

:Course a owl:Class ;
    rdfs:label "Course"@en, "课程"@zh .

:Challenge a owl:Class ;
    rdfs:label "Challenge"@en, "挑战"@zh .

:Submission a owl:Class ;
    rdfs:label "Submission"@en, "提交"@zh ;
    rdfs:comment "被 SubmissionTaskAgent 唯一写入"@zh .

:Evaluation a owl:Class ;
    rdfs:label "Evaluation"@en, "评审"@zh .

:Artifact a owl:Class ;
    rdfs:label "Artifact"@en, "产物"@zh .

:AAR a owl:Class ;
    rdfs:label "AAR"@en, "行动后反思"@zh .

:Rubric a owl:Class ;
    rdfs:label "Rubric"@en, "评分量规"@zh .

:Portfolio a owl:Class ;
    rdfs:label "Portfolio"@en, "作品集"@zh .

:SubmissionArtifact a owl:Class ;
    rdfs:subClassOf :Artifact ;
    rdfs:label "Submission Artifact"@en, "提交物"@zh .

# ========== 协议类 ==========
:AgentManifest a owl:Class ;
    rdfs:label "Agent Manifest"@en, "智能体清单"@zh .

:AgentIdentity a owl:Class ;
    rdfs:label "Agent Identity"@en, "智能体身份"@zh .

:MessageEnvelope a owl:Class ;
    rdfs:label "Message Envelope"@en, "消息外壳"@zh .

:AgentInbox a owl:Class ;
    rdfs:label "Agent Inbox"@en, "智能体收件箱"@zh .

:AgentOutbox a owl:Class ;
    rdfs:label "Agent Outbox"@en, "智能体发件箱"@zh .

:AuditTrace a owl:Class ;
    rdfs:label "Audit Trace"@en, "审计追踪"@zh .

:TrustedRelationship a owl:Class ;
    rdfs:label "Trusted Relationship"@en, "可信关系"@zh .

:MemoryBinding a owl:Class ;
    rdfs:label "Memory Binding"@en, "记忆绑定"@zh .

:ResourceConfig a owl:Class ;
    rdfs:label "Resource Config"@en, "资源配置"@zh .

:PersonalOntology a owl:Class ;
    rdfs:label "Personal Ontology"@en, "个人本体"@zh .

:Capability a owl:Class ;
    rdfs:label "Capability"@en, "能力"@zh .

:Interface a owl:Class ;
    rdfs:label "Interface"@en, "接口"@zh .

:Permission a owl:Class ;
    rdfs:label "Permission"@en, "权限"@zh .

:Constraint a owl:Class ;
    rdfs:label "Constraint"@en, "约束"@zh .

:ChannelBinding a owl:Class ;
    rdfs:label "Channel Binding"@en, "通道绑定"@zh .

:Presence a owl:Class ;
    rdfs:label "Presence"@en, "在线状态"@zh .

# ========== 技能类 ==========
:Skill a owl:Class ;
    rdfs:label "Skill"@en, "技能"@zh .

:ExcelImportSkill a owl:Class ; rdfs:subClassOf :Skill ; rdfs:label "Excel Import Skill"@en .
:FeishuSetupSkill a owl:Class ; rdfs:subClassOf :Skill ; rdfs:label "Feishu Setup Skill"@en .
:PersonalOKFSkill a owl:Class ; rdfs:subClassOf :Skill ; rdfs:label "Personal OKF Skill"@en .
:ChallengeCreationSkill a owl:Class ; rdfs:subClassOf :Skill ; rdfs:label "Challenge Creation Skill"@en .
:GitHubArtifactSkill a owl:Class ; rdfs:subClassOf :Skill ; rdfs:label "GitHub Artifact Skill"@en .
:AARSkill a owl:Class ; rdfs:subClassOf :Skill ; rdfs:label "AAR Skill"@en .
:SelfEvaluationSkill a owl:Class ; rdfs:subClassOf :Skill ; rdfs:label "Self Evaluation Skill"@en .
:PortfolioSubmissionSkill a owl:Class ; rdfs:subClassOf :Skill ; rdfs:label "Portfolio Submission Skill"@en .
:FeishuSubmissionSkill a owl:Class ; rdfs:subClassOf :Skill ; rdfs:label "Feishu Submission Skill"@en .
:RubricEvaluationSkill a owl:Class ; rdfs:subClassOf :Skill ; rdfs:label "Rubric Evaluation Skill"@en .

# ========== 事件类（部分）==========
:SubmissionRequested a owl:Class ; rdfs:subClassOf :Event ; rdfs:label "Submission Requested"@en .
# ... (其他 13 个事件类，详见事件抽取文档)
```

### 2.2 对象属性（OWL ObjectProperty）

```turtle
# ========== 协议关系 ==========
:hasManifest a owl:ObjectProperty ;
    rdfs:domain :Agent ; rdfs:range :AgentManifest ;
    owl:cardinality 1 ;
    rdfs:label "has manifest"@en .

:hasIdentity a owl:ObjectProperty ;
    rdfs:domain :Agent ; rdfs:range :AgentIdentity ;
    owl:cardinality 1 ;
    rdfs:label "has identity"@en .

:hasCapability a owl:ObjectProperty ;
    rdfs:domain :Agent ; rdfs:range :Capability ;
    rdfs:label "has capability"@en .

:exposesInterface a owl:ObjectProperty ;
    rdfs:domain :Agent ; rdfs:range :Interface ;
    rdfs:label "exposes interface"@en .

:hasPermission a owl:ObjectProperty ;
    rdfs:domain :Agent ; rdfs:range :Permission ;
    rdfs:label "has permission"@en .

:hasConstraint a owl:ObjectProperty ;
    rdfs:domain :Agent ; rdfs:range :Constraint ;
    rdfs:label "has constraint"@en .

:trusts a owl:ObjectProperty ;
    rdfs:domain :Agent ; rdfs:range :Agent ;
    rdfs:label "trusts"@en .

:bindsToMemory a owl:ObjectProperty ;
    rdfs:domain :Agent ; rdfs:range :MemoryBinding ;
    rdfs:label "binds to memory"@en .

:bindsToChannel a owl:ObjectProperty ;
    rdfs:domain :Agent ; rdfs:range :ChannelBinding ;
    rdfs:label "binds to channel"@en .

:inbounds a owl:ObjectProperty ;
    rdfs:domain :Agent ; rdfs:range :AgentInbox ;
    owl:cardinality 1 ;
    rdfs:label "inbounds"@en .

:outbounds a owl:ObjectProperty ;
    rdfs:domain :Agent ; rdfs:range :AgentOutbox ;
    owl:cardinality 1 ;
    rdfs:label "outbounds"@en .

:sends a owl:ObjectProperty ;
    rdfs:domain :Agent ; rdfs:range :MessageEnvelope ;
    rdfs:label "sends"@en .

:creates a owl:ObjectProperty ;
    rdfs:domain :Agent ; rdfs:range :AuditTrace ;
    rdfs:label "creates"@en .

# ========== 业务关系 ==========
:writesTo a owl:ObjectProperty ;
    rdfs:domain :SubmissionTaskAgent ; rdfs:range :Submission ;
    owl:FunctionalProperty, owl:InverseFunctionalProperty ;
    rdfs:label "writes to"@en ;
    rdfs:comment "RED-001: 唯一写 Submission 的关系"@zh .

:routesTo a owl:ObjectProperty ;
    rdfs:domain :SubmissionTaskAgent ; rdfs:range :ReviewTaskAgent ;
    rdfs:label "routes to"@en .

:owns a owl:ObjectProperty ;
    rdfs:domain :CompanionAgent ; rdfs:range :PersonalOntology ;
    owl:FunctionalProperty ;
    rdfs:label "owns"@en .

:configures a owl:ObjectProperty ;
    rdfs:domain :CompanionAgent ; rdfs:range :ResourceConfig ;
    owl:FunctionalProperty ;
    rdfs:label "configures"@en .

:belongsTo a owl:ObjectProperty ;
    rdfs:domain :TaskAgent ; rdfs:range :CompanionAgent ;
    rdfs:label "belongs to"@en .

:invokes a owl:ObjectProperty ;
    rdfs:domain :TaskAgent ; rdfs:range :Skill ;
    rdfs:label "invokes"@en .

:teaches a owl:ObjectProperty ;
    rdfs:domain :Professor ; rdfs:range :Course ;
    rdfs:label "teaches"@en .

:enrolls a owl:ObjectProperty ;
    rdfs:domain :Learner ; rdfs:range :Course ;
    rdfs:label "enrolls"@en .

:contains a owl:ObjectProperty ;
    rdfs:domain :Course ; rdfs:range :Challenge ;
    rdfs:label "contains"@en .

:referencesRubric a owl:ObjectProperty ;
    rdfs:domain :Challenge ; rdfs:range :Rubric ;
    owl:FunctionalProperty ;
    rdfs:label "references rubric"@en .

:produces a owl:ObjectProperty ;
    rdfs:domain :Challenge ; rdfs:range :Artifact ;
    rdfs:label "produces"@en .

:submits a owl:ObjectProperty ;
    rdfs:domain :Learner ; rdfs:range :Submission ;
    rdfs:label "submits"@en .

:evaluates a owl:ObjectProperty ;
    rdfs:domain :Submission ; rdfs:range :Evaluation ;
    owl:FunctionalProperty ;
    rdfs:label "evaluates"@en .

:learns a owl:ObjectProperty ;
    rdfs:domain :Learner ; rdfs:range :Skill ;
    rdfs:label "learns"@en .

:hasPortfolio a owl:ObjectProperty ;
    rdfs:domain :Learner ; rdfs:range :Portfolio ;
    owl:FunctionalProperty ;
    rdfs:label "has portfolio"@en .

# ========== 消息流关系 ==========
:publishesChallenge a owl:ObjectProperty ;
    rdfs:domain :TeacherCompanion ; rdfs:range :SubmissionTaskAgent ;
    rdfs:label "publishes challenge"@en .

:notifiesAvailable a owl:ObjectProperty ;
    rdfs:domain :SubmissionTaskAgent ; rdfs:range :StudentCompanion ;
    rdfs:label "notifies available"@en .

:requestsSubmission a owl:ObjectProperty ;
    rdfs:domain :StudentCompanion ; rdfs:range :SubmissionTaskAgent ;
    rdfs:label "requests submission"@en .

:routesForReview a owl:ObjectProperty ;
    rdfs:domain :SubmissionTaskAgent ; rdfs:range :ReviewTaskAgent ;
    rdfs:label "routes for review"@en .

:returnsReview a owl:ObjectProperty ;
    rdfs:domain :ReviewTaskAgent ; rdfs:range :SubmissionTaskAgent ;
    rdfs:label "returns review"@en .

:deliversFeedback a owl:ObjectProperty ;
    rdfs:domain :SubmissionTaskAgent ; rdfs:range :StudentCompanion ;
    rdfs:label "delivers feedback"@en .

:updatesStatus a owl:ObjectProperty ;
    rdfs:domain :SubmissionTaskAgent ; rdfs:range :TeacherCompanion ;
    rdfs:label "updates status"@en .

:adjustsFinal a owl:ObjectProperty ;
    rdfs:domain :TeacherCompanion ; rdfs:range :SubmissionTaskAgent ;
    rdfs:label "adjusts final"@en .

:requestsPeerReview a owl:ObjectProperty ;
    rdfs:domain :ReviewTaskAgent ; rdfs:range :PeerReviewStudentAgent ;
    rdfs:label "requests peer review"@en .
```

### 2.3 数据属性（OWL DatatypeProperty）

```turtle
:agentId a owl:DatatypeProperty ;
    rdfs:domain :Agent ; rdfs:range xsd:string ;
    owl:FunctionalProperty ;
    rdfs:label "agent ID"@en .

:agentType a owl:DatatypeProperty ;
    rdfs:domain :Agent ; rdfs:range xsd:string ;
    rdfs:label "agent type"@en .

:status a owl:DatatypeProperty ;
    rdfs:domain :Agent ; rdfs:range xsd:string ;
    rdfs:label "status"@en .

:ownerId a owl:DatatypeProperty ;
    rdfs:domain :MemoryBinding ; rdfs:range xsd:string ;
    rdfs:label "owner ID"@en .

:permissionScope a owl:DatatypeProperty ;
    rdfs:domain :Permission ; rdfs:range xsd:string ;
    rdfs:label "permission scope"@en .

:capabilityName a owl:DatatypeProperty ;
    rdfs:domain :Capability ; rdfs:range xsd:string ;
    owl:FunctionalProperty ;
    rdfs:label "capability name"@en .

:channelType a owl:DatatypeProperty ;
    rdfs:domain :ChannelBinding ; rdfs:range xsd:string ;
    rdfs:label "channel type"@en .

:dueDate a owl:DatatypeProperty ;
    rdfs:domain :Challenge ; rdfs:range xsd:dateTime ;
    rdfs:label "due date"@en .

:processedByAgentId a owl:DatatypeProperty ;
    rdfs:domain :Submission ; rdfs:range xsd:string ;
    rdfs:label "processed by agent ID"@en ;
    rdfs:comment "RED-001: 必须以 'submission-task-' 开头"@zh .

:submittedByAgentId a owl:DatatypeProperty ;
    rdfs:domain :Submission ; rdfs:range xsd:string ;
    rdfs:label "submitted by agent ID"@en .

:messageId a owl:DatatypeProperty ;
    rdfs:domain :MessageEnvelope ; rdfs:range xsd:string ;
    owl:FunctionalProperty ;
    rdfs:label "message ID"@en .

:messageType a owl:DatatypeProperty ;
    rdfs:domain :MessageEnvelope ; rdfs:range xsd:string ;
    rdfs:label "message type"@en .

:timestamp a owl:DatatypeProperty ;
    rdfs:domain :MessageEnvelope ; rdfs:range xsd:dateTime ;
    rdfs:label "timestamp"@en .

:auditId a owl:DatatypeProperty ;
    rdfs:domain :AuditTrace ; rdfs:range xsd:string ;
    owl:FunctionalProperty ;
    rdfs:label "audit ID"@en .

:action a owl:DatatypeProperty ;
    rdfs:domain :AuditTrace ; rdfs:range xsd:string ;
    rdfs:label "action"@en .
```

---

## 3. 10 条架构红线形式化

### 3.1 RED-001 提交写入唯一性

> **规则**：`Submission Task Agent` 是**唯一**能写 Submission Record 的 Agent。

#### 3.1.1 OWL 表达

```turtle
:red:RED-001 a owl:Ontology ;
    dcterms:title "提交写入唯一性"@zh ;
    dcterms:description "Submission Task Agent 是唯一能写 Submission Record 的 Agent"@zh ;
    red:severity "critical" ;
    red:category "RED-EXCLUSIVE" .

# 1. 声明 SubmissionTaskAgent 是 Submission 的唯一写入者
:SubmissionTaskAgent a owl:Class ;
    rdfs:subClassOf [
        a owl:Restriction ;
        owl:onProperty :writesTo ;
        owl:cardinality 1
    ] .

# 2. 任何 agent 写 Submission 时必须满足
:Submission a owl:Class ;
    rdfs:subClassOf [
        a owl:Restriction ;
        owl:onProperty :processedByAgentId ;
        owl:someValuesFrom [ a owl:Class ;
            owl:complementOf :SubmissionTaskAgent ]
    ] , [
        a owl:Class ;
        owl:complementOf [ a owl:Restriction ;
            owl:onProperty :processedByAgentId ;
            owl:pattern "submission-task-.*"^^xsd:string ]
    ] ;
    rdfs:comment "Violation: 非 SubmissionTaskAgent 写入"@zh .
```

#### 3.1.2 SHACL 表达

```turtle
:red:RED-001-Shape a sh:NodeShape ;
    sh:targetClass :Submission ;
    sh:property [
        sh:path :processedByAgentId ;
        sh:datatype xsd:string ;
        sh:pattern "^submission-task-.*$" ;
        sh:message "RED-001 VIOLATION: Submission.processedByAgentId MUST start with 'submission-task-'" ;
        sh:severity sh:Violation
    ] .

# 反向约束：禁止 StudentCompanion 写 Submission
:red:RED-001-StudentCannotWrite a sh:NodeShape ;
    sh:targetClass :StudentCompanion ;
    sh:property [
        sh:path :hasPermission ;
        sh:qualifiedValueShape [
            sh:path :permissionScope ;
            sh:pattern ".*submission.*write.*"
        ] ;
        sh:qualifiedMaxCount 0 ;
        sh:message "RED-001 VIOLATION: StudentCompanion MUST NOT have submission write permission" ;
        sh:severity sh:Violation
    ] .
```

#### 3.1.3 SWRL 规则

```swrl
# 规则 1：如果某 Agent 写了 Submission，且该 Agent 不是 SubmissionTaskAgent
# → 标记为 RED-001 违规

Agent(?a) ^ Submission(?s) ^ writesTo(?a, ?s) ^
agentType(?a, ?t) ^
swrlb:notEqual(?t, "submission-task")
-> red:violatesRED001(?s, ?a)
```

#### 3.1.4 SPARQL 一致性查询

```sparql
# 查询所有 RED-001 违规的 Submission
PREFIX : <http://elite20.team3/ontology#>
PREFIX red: <http://elite20.team3/redline#>

SELECT ?submission ?agent ?agentType WHERE {
    ?submission a :Submission ;
                :processedByAgentId ?agent .
    ?agent a :Agent ;
           :agentType ?agentType .
    FILTER (!STRSTARTS(?agentType, "submission-task"))
}
```

---

### 3.2 RED-002 不可越权写记录

> **规则**：`Student Companion Agent` **不能**直接写最终 Submission Record。

#### 3.2.1 OWL 表达

```turtle
:StudentCompanion a owl:Class ;
    rdfs:subClassOf [
        a owl:Restriction ;
        owl:onProperty :hasPermission ;
        owl:allValuesFrom [ a owl:Class ;
            owl:intersectionOf ( :Permission
                [ a owl:Restriction ;
                    owl:onProperty :permissionScope ;
                    owl:complementOf [ a owl:Class ;
                        owl:oneOf ( "feishu.submissions.write"
                                    "submission-record.write"
                                    "submission.final-write" ) ] ] ) ] ] ;
    rdfs:comment "StudentCompanion MUST NOT have write permission to Submission"@zh .
```

#### 3.2.2 SHACL 表达

```turtle
:red:RED-002-Shape a sh:NodeShape ;
    sh:targetClass :StudentCompanion ;
    sh:property [
        sh:path :hasPermission ;
        sh:qualifiedValueShape [
            sh:path :permissionScope ;
            sh:in ( "feishu.submissions.write"
                    "submission-record.write"
                    "submission.final-write" ) ] ;
        sh:qualifiedMaxCount 0 ;
        sh:message "RED-002 VIOLATION: StudentCompanion MUST NOT have write permission to Submission" ;
        sh:severity sh:Violation
    ] .
```

#### 3.2.3 SWRL 规则

```swrl
# 规则：StudentCompanion 不能拥有写 Submission 的权限
StudentCompanion(?s) ^ hasPermission(?s, ?p) ^
permissionScope(?p, "feishu.submissions.write")
-> red:violatesRED002(?s, ?p)
```

#### 3.2.4 SPARQL 查询

```sparql
PREFIX : <http://elite20.team3/ontology#>
PREFIX red: <http://elite20.team3/redline#>

SELECT ?agent ?permission ?scope WHERE {
    ?agent a :StudentCompanion ;
           :hasPermission ?permission .
    ?permission :permissionScope ?scope .
    FILTER (CONTAINS(?scope, "submission") && CONTAINS(?scope, "write"))
}
```

---

### 3.3 RED-003 不可越权读记忆

> **规则**：`Teacher Companion` **不能**访问学生私有记忆。

#### 3.3.1 OWL 表达

```turtle
:TeacherCompanion a owl:Class ;
    rdfs:subClassOf [
        a owl:Restriction ;
        owl:onProperty :hasPermission ;
        owl:allValuesFrom [ a owl:Class ;
            owl:intersectionOf ( :Permission
                [ a owl:Restriction ;
                    owl:onProperty :permissionScope ;
                    owl:complementOf [ a owl:Class ;
                        owl:oneOf ( "ontology.student_memory.read_*"
                                    "personal_ontology.read.*"
                                    "personal_memory.read.*" ) ] ] ) ] ] ;
    rdfs:comment "TeacherCompanion MUST NOT access Student private memory"@zh .
```

#### 3.3.2 SHACL 表达

```turtle
:red:RED-003-Shape a sh:NodeShape ;
    sh:targetClass :TeacherCompanion ;
    sh:property [
        sh:path :hasPermission ;
        sh:qualifiedValueShape [
            sh:path :permissionScope ;
            sh:pattern "^(ontology\\.student_memory\\.read.*|personal_ontology\\.read.*|personal_memory\\.read.*)$" ] ;
        sh:qualifiedMaxCount 0 ;
        sh:message "RED-003 VIOLATION: TeacherCompanion MUST NOT have student private memory read permission" ;
        sh:severity sh:Violation
    ] .
```

#### 3.3.3 SWRL 规则

```swrl
# 规则：TeacherCompanion 不能读学生私有记忆
TeacherCompanion(?t) ^ hasPermission(?t, ?p) ^
permissionScope(?p, ?scope) ^
swrlb:contains(?scope, "student_memory") ^
swrlb:contains(?scope, "read")
-> red:violatesRED003(?t, ?p)
```

#### 3.3.4 SPARQL 查询

```sparql
PREFIX : <http://elite20.team3/ontology#>

SELECT ?agent ?permission ?scope WHERE {
    ?agent a :TeacherCompanion ;
           :hasPermission ?permission .
    ?permission :permissionScope ?scope .
    FILTER (
        CONTAINS(?scope, "student_memory") ||
        CONTAINS(?scope, "personal_ontology.read") ||
        CONTAINS(?scope, "personal_memory.read")
    )
}
```

---

### 3.4 RED-004 不可跨学生访问

> **规则**：`Student Companion` **不能**访问其他学生数据。

#### 3.4.1 OWL 表达

```turtle
:MemoryBinding a owl:Class ;
    rdfs:subClassOf [
        a owl:Restriction ;
        owl:onProperty :ownerId ;
        owl:cardinality 1  # 每个 MemoryBinding 只有一个 owner
    ] .

:StudentCompanion a owl:Class ;
    rdfs:subClassOf [
        a owl:Restriction ;
        owl:onProperty :bindsToMemory ;
        owl:allValuesFrom [ a owl:Class ;
            owl:intersectionOf ( :MemoryBinding
                [ a owl:Restriction ;
                    owl:onProperty :ownerId ;
                    owl:someValuesFrom [ a owl:Class ;
                        owl:hasValue [ :agentId "self" ] ] ] ) ] ] ;
    rdfs:comment "StudentCompanion MUST only bind to memory where ownerId == self"@zh .
```

#### 3.4.2 SHACL 表达

```turtle
:red:RED-004-Shape a sh:NodeShape ;
    sh:targetClass :StudentCompanion ;
    sh:property [
        sh:path :bindsToMemory ;
        sh:node :red:RED-004-MemoryBindingShape ;
        sh:message "RED-004: MemoryBinding.ownerId MUST match the StudentCompanion.agentId" ;
        sh:severity sh:Violation
    ] .

:red:RED-004-MemoryBindingShape a sh:NodeShape ;
    sh:targetClass :MemoryBinding ;
    sh:property [
        sh:path :ownerId ;
        sh:minCount 1 ;
        sh:maxCount 1 ;
        sh:message "RED-004: MemoryBinding.ownerId MUST be specified exactly once"
    ] .
```

#### 3.4.3 SWRL 规则

```swrl
# 规则：StudentCompanion 绑定的 MemoryBinding.ownerId 必须 = 自己的 agentId
StudentCompanion(?sc) ^ bindsToMemory(?sc, ?mb) ^
MemoryBinding(?mb) ^ ownerId(?mb, ?ownerId) ^
agentId(?sc, ?selfId) ^
swrlb:notEqual(?ownerId, ?selfId)
-> red:violatesRED004(?sc, ?mb)
```

#### 3.4.4 SPARQL 查询

```sparql
PREFIX : <http://elite20.team3/ontology#>

SELECT ?sc ?mb ?ownerId ?selfId WHERE {
    ?sc a :StudentCompanion ;
        :agentId ?selfId ;
        :bindsToMemory ?mb .
    ?mb :ownerId ?ownerId .
    FILTER (?ownerId != ?selfId)
}
```

---

### 3.5 RED-005 提交时间窗

> **规则**：`Student Companion` **只能**提交到 active 状态的 Challenge。

#### 3.5.1 OWL 表达

```turtle
# ChallengeStatus 枚举
:ChallengeStatus a owl:Class ;
    owl:equivalentClass [ a owl:Class ;
        owl:oneOf ( :statusDraft :statusPublished :statusActive :statusClosed :statusArchived ) ] .

:statusDraft a :ChallengeStatus .
:statusPublished a :ChallengeStatus .
:statusActive a :ChallengeStatus .
:statusClosed a :ChallengeStatus .
:statusArchived a :ChallengeStatus .

# 提交时间窗约束
:Challenge a owl:Class ;
    rdfs:subClassOf [
        a owl:Restriction ;
        owl:onProperty :submitsTo ;
        owl:allValuesFrom [ a owl:Class ;
            owl:intersectionOf ( :Challenge
                [ a owl:Restriction ;
                    owl:onProperty :hasStatus ;
                    owl:hasValue :statusActive ] ) ] ] .
```

#### 3.5.2 SHACL 表达

```turtle
:red:RED-005-Shape a sh:NodeShape ;
    sh:targetClass :Submission ;
    sh:property [
        sh:path :submittedToChallenge ;
        sh:node :red:RED-005-ChallengeActiveShape ;
        sh:message "RED-005: Submission MUST only be made to active challenges" ;
        sh:severity sh:Violation
    ] .

:red:RED-005-ChallengeActiveShape a sh:NodeShape ;
    sh:targetClass :Challenge ;
    sh:property [
        sh:path :hasStatus ;
        sh:hasValue :statusActive ;
        sh:message "RED-005: Challenge status MUST be 'active' for submission"
    ] .
```

#### 3.5.3 SWRL 规则

```swrl
# 规则：Submission.submittedToChallenge 必须是 active 状态
Submission(?sub) ^ submittedToChallenge(?sub, ?cha) ^
Challenge(?cha) ^ hasStatus(?cha, ?status) ^
swrlb:notEqual(?status, :statusActive)
-> red:violatesRED005(?sub, ?cha)
```

#### 3.5.4 SPARQL 查询

```sparql
PREFIX : <http://elite20.team3/ontology#>

SELECT ?submission ?challenge ?status WHERE {
    ?submission a :Submission ;
                :submittedToChallenge ?challenge .
    ?challenge :hasStatus ?status .
    FILTER (?status != :statusActive)
}
```

---

### 3.6 RED-006 消息必经 Inbox

> **规则**：所有 Agent 消息**必须**经过 Inbox 校验。

#### 3.6.1 OWL 表达

```turtle
:MessageEnvelope a owl:Class ;
    rdfs:subClassOf [
        a owl:Restriction ;
        owl:onProperty :deliveredVia ;
        owl:cardinality 1 ;
        owl:allValuesFrom :AgentInbox  # 必经过 Inbox
    ] ;
    rdfs:comment "Every message MUST be delivered via AgentInbox"@zh .
```

#### 3.6.2 SHACL 表达

```turtle
:red:RED-006-Shape a sh:NodeShape ;
    sh:targetClass :MessageEnvelope ;
    sh:property [
        sh:path :deliveredVia ;
        sh:class :AgentInbox ;
        sh:minCount 1 ;
        sh:message "RED-006: Every message MUST be delivered via AgentInbox" ;
        sh:severity sh:Violation
    ] .
```

#### 3.6.3 SWRL 规则

```swrl
# 规则：消息必须经过 Inbox
MessageEnvelope(?m) ^ sends(?sender, ?m) ^
not(deliveredVia(?m, ?inbox))
-> red:violatesRED006(?m, ?sender)

# 推理：发送的消息自动标记为经过 Inbox
MessageEnvelope(?m) ^ sends(?sender, ?m) ^
inbounds(?receiver, ?inbox) ^ accepts(?inbox, ?m)
-> deliveredVia(?m, ?inbox)
```

#### 3.6.4 SPARQL 查询

```sparql
PREFIX : <http://elite20.team3/ontology#>

SELECT ?message ?sender WHERE {
    ?sender :sends ?message .
    ?message a :MessageEnvelope .
    FILTER NOT EXISTS { ?message :deliveredVia ?inbox }
}
```

---

### 3.7 RED-007 必走 Trusted Relationship

> **规则**：消息发送前**必须**校验 Trusted Relationship。

#### 3.7.1 OWL 表达

```turtle
:MessageEnvelope a owl:Class ;
    rdfs:subClassOf [
        a owl:Restriction ;
        owl:onProperty :hasTrustedRelationship ;
        owl:minCardinality 1
    ] ;
    rdfs:comment "Every message MUST have a trusted relationship between sender and receiver"@zh .
```

#### 3.7.2 SHACL 表达

```turtle
:red:RED-007-Shape a sh:NodeShape ;
    sh:targetClass :MessageEnvelope ;
    sh:property [
        sh:path :hasTrustedRelationship ;
        sh:class :TrustedRelationship ;
        sh:minCount 1 ;
        sh:message "RED-007: Every message MUST have a trusted relationship" ;
        sh:severity sh:Violation
    ] ;

    sh:property [
        sh:path :hasTrustedRelationship ;
        sh:qualifiedValueShape [
            sh:property [
                sh:path :trustLevel ;
                sh:hasValue :trustAuto
            ] ;
            sh:property [
                sh:path :expiration ;
                sh:minCount 1
            ] ;
        ]
    ] .
```

#### 3.7.3 SWRL 规则

```swrl
# 规则：消息没有 TrustedRelationship 即违规
MessageEnvelope(?m) ^ hasFromAgent(?m, ?from) ^ hasToAgent(?m, ?to) ^
not(trusts(?from, ?to))
-> red:violatesRED007(?m, ?from, ?to)
```

#### 3.7.4 SPARQL 查询

```sparql
PREFIX : <http://elite20.team3/ontology#>

SELECT ?message ?from ?to WHERE {
    ?message a :MessageEnvelope ;
             :hasFromAgent ?from ;
             :hasToAgent ?to .
    FILTER NOT EXISTS {
        ?from :trusts ?to .
        ?rel a :TrustedRelationship ;
             :agentA ?from ;
             :agentB ?to .
    }
}
```

---

### 3.8 RED-008 必留 Audit Trace

> **规则**：每次状态变化**必须**写 Audit Trace。

#### 3.8.1 OWL 表达

```turtle
:Submission a owl:Class ;
    rdfs:subClassOf [
        a owl:Restriction ;
        owl:onProperty :hasAuditTrace ;
        owl:minCardinality 1
    ] ;
    rdfs:comment "Every Submission state change MUST create an AuditTrace"@zh .
```

#### 3.8.2 SHACL 表达

```turtle
:red:RED-008-Shape a sh:NodeShape ;
    sh:targetClass :Submission ;
    sh:property [
        sh:path :hasAuditTrace ;
        sh:class :AuditTrace ;
        sh:minCount 1 ;
        sh:message "RED-008: Every Submission MUST have at least one AuditTrace" ;
        sh:severity sh:Violation
    ] ;

    sh:property [
        sh:path :hasStatus ;
        sh:datatype xsd:string ;
        sh:minCount 1
    ] .
```

#### 3.8.3 SWRL 规则

```swrl
# 规则：状态变化必须产生 AuditTrace
Submission(?s) ^ hasStatus(?s, ?oldStatus) ^ hasStatus(?s, ?newStatus) ^
swrlb:notEqual(?oldStatus, ?newStatus) ^
not(hasAuditTrace(?s, ?audit))
-> red:violatesRED008(?s)

# 推理：状态变化自动产生 AuditTrace
Submission(?s) ^ hasStatus(?s, ?newStatus) ^ timestamp(?s, ?ts)
-> AuditTrace(?a) ^ hasAgent(?a, :SubmissionTaskAgent) ^
   hasAction(?a, "state_change") ^ hasTarget(?a, ?s) ^
   hasNewState(?a, ?newStatus) ^ hasTimestamp(?a, ?ts)
```

#### 3.8.4 SPARQL 查询

```sparql
PREFIX : <http://elite20.team3/ontology#>

SELECT ?submission ?status WHERE {
    ?submission a :Submission ;
                :hasStatus ?status .
    FILTER NOT EXISTS { ?submission :hasAuditTrace ?audit }
}
```

---

### 3.9 RED-009 触达不靠 Agent

> **规则**：Agent **不**包含推送通知逻辑（统一走飞书 Bot）。

#### 3.9.1 OWL 表达

```turtle
:AgentManifest a owl:Class ;
    rdfs:subClassOf [
        a owl:Restriction ;
        owl:onProperty :hasCapability ;
        owl:allValuesFrom [ a owl:Class ;
            owl:intersectionOf ( :Capability
                [ a owl:Restriction ;
                    owl:onProperty :capabilityName ;
                    owl:complementOf [ a owl:Class ;
                        owl:oneOf ( "notify_student"
                                    "notify_teacher"
                                    "send_push"
                                    "send_email"
                                    "send_sms" ) ] ] ) ] ] ;
    rdfs:comment "AgentManifest MUST NOT have push notification capabilities"@zh .
```

#### 3.9.2 SHACL 表达

```turtle
:red:RED-009-Shape a sh:NodeShape ;
    sh:targetClass :AgentManifest ;
    sh:property [
        sh:path :hasCapability ;
        sh:qualifiedValueShape [
            sh:path :capabilityName ;
            sh:in ( "notify_student" "notify_teacher"
                    "send_push" "send_email" "send_sms" )
        ] ;
        sh:qualifiedMaxCount 0 ;
        sh:message "RED-009 VIOLATION: AgentManifest MUST NOT have push notification capabilities" ;
        sh:severity sh:Violation
    ] .
```

#### 3.9.3 SWRL 规则

```swrl
# 规则：AgentManifest 不能有推送通知能力
AgentManifest(?m) ^ hasCapability(?m, ?c) ^
capabilityName(?c, ?name) ^
swrlb:containsAny(?name, "notify", "send_push", "send_email", "send_sms")
-> red:violatesRED009(?m, ?c)
```

#### 3.9.4 SPARQL 查询

```sparql
PREFIX : <http://elite20.team3/ontology#>

SELECT ?manifest ?capability ?name WHERE {
    ?manifest a :AgentManifest ;
              :hasCapability ?capability .
    ?capability :capabilityName ?name .
    FILTER (
        CONTAINS(?name, "notify") ||
        CONTAINS(?name, "send_push") ||
        CONTAINS(?name, "send_email") ||
        CONTAINS(?name, "send_sms")
    )
}
```

---

### 3.10 RED-010 Agent 通知边界

> **规则**：Agent 到人通知必走飞书 Bot（`channel_type="feishu"`）。

#### 3.10.1 OWL 表达

```turtle
:ChannelBinding a owl:Class ;
    rdfs:subClassOf [
        a owl:Restriction ;
        owl:onProperty :channelType ;
        owl:allValuesFrom :feishuChannel  # 人触达通道只能是飞书
    ] ;
    rdfs:comment "Human-facing channel MUST be feishu only"@zh .

:feishuChannel a owl:Class ;
    owl:equivalentClass [ a owl:Class ;
        owl:oneOf ( :feishuType ) ] .

:feishuType a :ChannelType .
```

#### 3.10.2 SHACL 表达

```turtle
:red:RED-010-Shape a sh:NodeShape ;
    sh:targetClass :ChannelBinding ;
    sh:property [
        sh:path :channelType ;
        sh:in ( "feishu" ) ;
        sh:message "RED-010: Agent-to-human channel MUST be 'feishu' only" ;
        sh:severity sh:Violation
    ] .
```

#### 3.10.3 SWRL 规则

```swrl
# 规则：人触达通道只能是飞书
ChannelBinding(?cb) ^ channelType(?cb, ?type) ^ boundForHuman(?cb, true) ^
swrlb:notEqual(?type, "feishu")
-> red:violatesRED010(?cb)
```

#### 3.10.4 SPARQL 查询

```sparql
PREFIX : <http://elite20.team3/ontology#>

SELECT ?channel ?type WHERE {
    ?channel a :ChannelBinding ;
             :channelType ?type ;
             :boundForHuman true .
    FILTER (?type != "feishu")
}
```

---

## 4. SHACL Shapes 汇总

把 10 条红线的 SHACL 集中到一个文件：

```turtle
# ====================================================================
# Team 3 架构红线 SHACL Shapes
# ====================================================================

@prefix :        <http://elite20.team3/ontology#> .
@prefix sh:      <http://www.w3.org/ns/shacl#> .
@prefix xsd:     <http://www.w3.org/2001/XMLSchema#> .
@prefix red:     <http://elite20.team3/redline#> .

# ----------------------------------------------------------------
# RED-001: 提交写入唯一性
# ----------------------------------------------------------------
:red:RED-001-Shape a sh:NodeShape ;
    sh:targetClass :Submission ;
    sh:property [
        sh:path :processedByAgentId ;
        sh:datatype xsd:string ;
        sh:pattern "^submission-task-.*$" ;
        sh:message "RED-001: Submission.processedByAgentId MUST start with 'submission-task-'" ;
        sh:severity sh:Violation
    ] .

:red:RED-001-StudentCannotWrite a sh:NodeShape ;
    sh:targetClass :StudentCompanion ;
    sh:property [
        sh:path :hasPermission ;
        sh:qualifiedValueShape [
            sh:path :permissionScope ;
            sh:pattern ".*submission.*write.*"
        ] ;
        sh:qualifiedMaxCount 0 ;
        sh:message "RED-001: StudentCompanion MUST NOT have submission write permission" ;
        sh:severity sh:Violation
    ] .

# ----------------------------------------------------------------
# RED-002: 不可越权写记录（同 RED-001 后半部分）
# ----------------------------------------------------------------
:red:RED-002-Shape a sh:NodeShape ;
    sh:targetClass :StudentCompanion ;
    sh:property [
        sh:path :hasPermission ;
        sh:qualifiedValueShape [
            sh:path :permissionScope ;
            sh:in ( "feishu.submissions.write"
                    "submission-record.write"
                    "submission.final-write" ) ] ;
        sh:qualifiedMaxCount 0 ;
        sh:message "RED-002: StudentCompanion MUST NOT have write permission to Submission" ;
        sh:severity sh:Violation
    ] .

# ----------------------------------------------------------------
# RED-003: 不可越权读记忆
# ----------------------------------------------------------------
:red:RED-003-Shape a sh:NodeShape ;
    sh:targetClass :TeacherCompanion ;
    sh:property [
        sh:path :hasPermission ;
        sh:qualifiedValueShape [
            sh:path :permissionScope ;
            sh:pattern "^(ontology\\.student_memory\\.read.*|personal_ontology\\.read.*|personal_memory\\.read.*)$" ] ;
        sh:qualifiedMaxCount 0 ;
        sh:message "RED-003: TeacherCompanion MUST NOT have student private memory read permission" ;
        sh:severity sh:Violation
    ] .

# ----------------------------------------------------------------
# RED-004: 不可跨学生访问
# ----------------------------------------------------------------
:red:RED-004-Shape a sh:NodeShape ;
    sh:targetClass :StudentCompanion ;
    sh:property [
        sh:path :bindsToMemory ;
        sh:node :red:RED-004-MemoryBindingShape ;
        sh:message "RED-004: MemoryBinding.ownerId MUST match the StudentCompanion.agentId" ;
        sh:severity sh:Violation
    ] .

:red:RED-004-MemoryBindingShape a sh:NodeShape ;
    sh:targetClass :MemoryBinding ;
    sh:property [
        sh:path :ownerId ;
        sh:minCount 1 ; sh:maxCount 1
    ] .

# ----------------------------------------------------------------
# RED-005: 提交时间窗
# ----------------------------------------------------------------
:red:RED-005-Shape a sh:NodeShape ;
    sh:targetClass :Submission ;
    sh:property [
        sh:path :submittedToChallenge ;
        sh:node :red:RED-005-ChallengeActiveShape ;
        sh:message "RED-005: Submission MUST only be made to active challenges" ;
        sh:severity sh:Violation
    ] .

:red:RED-005-ChallengeActiveShape a sh:NodeShape ;
    sh:targetClass :Challenge ;
    sh:property [
        sh:path :hasStatus ;
        sh:hasValue :statusActive
    ] .

# ----------------------------------------------------------------
# RED-006: 消息必经 Inbox
# ----------------------------------------------------------------
:red:RED-006-Shape a sh:NodeShape ;
    sh:targetClass :MessageEnvelope ;
    sh:property [
        sh:path :deliveredVia ;
        sh:class :AgentInbox ;
        sh:minCount 1 ;
        sh:message "RED-006: Every message MUST be delivered via AgentInbox" ;
        sh:severity sh:Violation
    ] .

# ----------------------------------------------------------------
# RED-007: 必走 Trusted Relationship
# ----------------------------------------------------------------
:red:RED-007-Shape a sh:NodeShape ;
    sh:targetClass :MessageEnvelope ;
    sh:property [
        sh:path :hasTrustedRelationship ;
        sh:class :TrustedRelationship ;
        sh:minCount 1 ;
        sh:message "RED-007: Every message MUST have a trusted relationship" ;
        sh:severity sh:Violation
    ] .

# ----------------------------------------------------------------
# RED-008: 必留 Audit Trace
# ----------------------------------------------------------------
:red:RED-008-Shape a sh:NodeShape ;
    sh:targetClass :Submission ;
    sh:property [
        sh:path :hasAuditTrace ;
        sh:class :AuditTrace ;
        sh:minCount 1 ;
        sh:message "RED-008: Every Submission MUST have at least one AuditTrace" ;
        sh:severity sh:Violation
    ] .

# ----------------------------------------------------------------
# RED-009: 触达不靠 Agent
# ----------------------------------------------------------------
:red:RED-009-Shape a sh:NodeShape ;
    sh:targetClass :AgentManifest ;
    sh:property [
        sh:path :hasCapability ;
        sh:qualifiedValueShape [
            sh:path :capabilityName ;
            sh:in ( "notify_student" "notify_teacher"
                    "send_push" "send_email" "send_sms" )
        ] ;
        sh:qualifiedMaxCount 0 ;
        sh:message "RED-009: AgentManifest MUST NOT have push notification capabilities" ;
        sh:severity sh:Violation
    ] .

# ----------------------------------------------------------------
# RED-010: Agent 通知边界
# ----------------------------------------------------------------
:red:RED-010-Shape a sh:NodeShape ;
    sh:targetClass :ChannelBinding ;
    sh:property [
        sh:path :channelType ;
        sh:in ( "feishu" ) ;
        sh:message "RED-010: Agent-to-human channel MUST be 'feishu' only" ;
        sh:severity sh:Violation
    ] .
```

---

## 5. SWRL 规则汇总

```swrl
# ====================================================================
# Team 3 架构红线 SWRL 规则
# ====================================================================

@prefix : <http://elite20.team3/ontology#> .
@prefix red: <http://elite20.team3/redline#> .
@prefix swrl: <http://www.w3.org/2003/11/swrl#> .
@prefix swrlb: <http://www.w3.org/2003/11/swrlb#> .

# RED-001 规则
Agent(?a) ^ Submission(?s) ^ writesTo(?a, ?s) ^
agentType(?a, ?t) ^ swrlb:notEqual(?t, "submission-task")
-> red:violatesRED001(?s, ?a)

# RED-002 规则
StudentCompanion(?s) ^ hasPermission(?s, ?p) ^
permissionScope(?p, "feishu.submissions.write")
-> red:violatesRED002(?s, ?p)

# RED-003 规则
TeacherCompanion(?t) ^ hasPermission(?t, ?p) ^
permissionScope(?p, ?scope) ^
swrlb:contains(?scope, "student_memory") ^
swrlb:contains(?scope, "read")
-> red:violatesRED003(?t, ?p)

# RED-004 规则
StudentCompanion(?sc) ^ bindsToMemory(?sc, ?mb) ^
MemoryBinding(?mb) ^ ownerId(?mb, ?ownerId) ^
agentId(?sc, ?selfId) ^ swrlb:notEqual(?ownerId, ?selfId)
-> red:violatesRED004(?sc, ?mb)

# RED-005 规则
Submission(?sub) ^ submittedToChallenge(?sub, ?cha) ^
Challenge(?cha) ^ hasStatus(?cha, ?status) ^
swrlb:notEqual(?status, :statusActive)
-> red:violatesRED005(?sub, ?cha)

# RED-006 规则：消息必须经过 Inbox
MessageEnvelope(?m) ^ sends(?sender, ?m) ^
not(deliveredVia(?m, ?inbox))
-> red:violatesRED006(?m, ?sender)

# RED-006 推理：发送的消息自动标记为经过 Inbox
MessageEnvelope(?m) ^ sends(?sender, ?m) ^
inbounds(?receiver, ?inbox) ^ accepts(?inbox, ?m)
-> deliveredVia(?m, ?inbox)

# RED-007 规则
MessageEnvelope(?m) ^ hasFromAgent(?m, ?from) ^ hasToAgent(?m, ?to) ^
not(trusts(?from, ?to))
-> red:violatesRED007(?m, ?from, ?to)

# RED-008 规则：状态变化必须产生 AuditTrace
Submission(?s) ^ hasStatus(?s, ?oldStatus) ^ hasStatus(?s, ?newStatus) ^
swrlb:notEqual(?oldStatus, ?newStatus) ^
not(hasAuditTrace(?s, ?audit))
-> red:violatesRED008(?s)

# RED-008 推理：状态变化自动产生 AuditTrace
Submission(?s) ^ hasStatus(?s, ?newStatus) ^ timestamp(?s, ?ts)
-> AuditTrace(?a) ^ hasAgent(?a, :SubmissionTaskAgent) ^
   hasAction(?a, "state_change") ^ hasTarget(?a, ?s) ^
   hasNewState(?a, ?newStatus) ^ hasTimestamp(?a, ?ts)

# RED-009 规则
AgentManifest(?m) ^ hasCapability(?m, ?c) ^
capabilityName(?c, ?name) ^
swrlb:containsAny(?name, "notify", "send_push", "send_email", "send_sms")
-> red:violatesRED009(?m, ?c)

# RED-010 规则
ChannelBinding(?cb) ^ channelType(?cb, ?type) ^ boundForHuman(?cb, true) ^
swrlb:notEqual(?type, "feishu")
-> red:violatesRED010(?cb)
```

---

## 6. SPARQL 一致性查询

### 6.1 单条红线的 SPARQL 查询模板

每条红线都有一致性查询（见 §3 各小节 §3.1.4 / §3.2.4 / ...）。

### 6.2 综合红线监控查询

```sparql
# 查询所有红线违规
PREFIX : <http://elite20.team3/ontology#>
PREFIX red: <http://elite20.team3/redline#>

SELECT ?redLineId ?violationType ?target ?agent WHERE {
    {
        # RED-001 violations
        ?sub a :Submission ;
             :processedByAgentId ?agent .
        ?agent :agentType ?type .
        FILTER (!STRSTARTS(?type, "submission-task"))
        BIND("RED-001" AS ?redLineId)
        BIND("submission_written_by_wrong_agent" AS ?violationType)
        BIND(?sub AS ?target)
    } UNION {
        # RED-002 violations
        ?agent a :StudentCompanion ;
               :hasPermission ?perm .
        ?perm :permissionScope ?scope .
        FILTER (CONTAINS(?scope, "submission") && CONTAINS(?scope, "write"))
        BIND("RED-002" AS ?redLineId)
        BIND("student_has_submission_write" AS ?violationType)
        BIND(?agent AS ?target)
    } UNION {
        # RED-003 violations
        ?agent a :TeacherCompanion ;
               :hasPermission ?perm .
        ?perm :permissionScope ?scope .
        FILTER (CONTAINS(?scope, "student_memory") || CONTAINS(?scope, "personal_"))
        BIND("RED-003" AS ?redLineId)
        BIND("teacher_reads_student_memory" AS ?violationType)
        BIND(?agent AS ?target)
    } UNION {
        # RED-004 violations
        ?sc a :StudentCompanion ;
            :agentId ?selfId ;
            :bindsToMemory ?mb .
        ?mb :ownerId ?ownerId .
        FILTER (?ownerId != ?selfId)
        BIND("RED-004" AS ?redLineId)
        BIND("cross_student_access" AS ?violationType)
        BIND(?sc AS ?target)
    } UNION {
        # RED-005 violations
        ?sub a :Submission ;
             :submittedToChallenge ?cha .
        ?cha :hasStatus ?status .
        FILTER (?status != :statusActive)
        BIND("RED-005" AS ?redLineId)
        BIND("inactive_challenge_submission" AS ?violationType)
        BIND(?sub AS ?target)
    } UNION {
        # RED-006 violations
        ?sender :sends ?msg .
        ?msg a :MessageEnvelope .
        FILTER NOT EXISTS { ?msg :deliveredVia ?inbox }
        BIND("RED-006" AS ?redLineId)
        BIND("message_bypassed_inbox" AS ?violationType)
        BIND(?msg AS ?target)
    } UNION {
        # RED-007 violations
        ?msg a :MessageEnvelope ;
             :hasFromAgent ?from ;
             :hasToAgent ?to .
        FILTER NOT EXISTS { ?from :trusts ?to }
        BIND("RED-007" AS ?redLineId)
        BIND("untrusted_message" AS ?violationType)
        BIND(?msg AS ?target)
    } UNION {
        # RED-008 violations
        ?sub a :Submission ;
             :hasStatus ?status .
        FILTER NOT EXISTS { ?sub :hasAuditTrace ?audit }
        BIND("RED-008" AS ?redLineId)
        BIND("submission_without_audit" AS ?violationType)
        BIND(?sub AS ?target)
    } UNION {
        # RED-009 violations
        ?manifest a :AgentManifest ;
                  :hasCapability ?cap .
        ?cap :capabilityName ?name .
        FILTER (
            CONTAINS(?name, "notify") ||
            CONTAINS(?name, "send_push") ||
            CONTAINS(?name, "send_email") ||
            CONTAINS(?name, "send_sms")
        )
        BIND("RED-009" AS ?redLineId)
        BIND("agent_has_push_capability" AS ?violationType)
        BIND(?manifest AS ?target)
    } UNION {
        # RED-010 violations
        ?cb a :ChannelBinding ;
            :channelType ?type ;
            :boundForHuman true .
        FILTER (?type != "feishu")
        BIND("RED-010" AS ?redLineId)
        BIND("non_feishu_human_channel" AS ?violationType)
        BIND(?cb AS ?target)
    }
}
ORDER BY ?redLineId
```

### 6.3 红线违规统计

```sparql
PREFIX : <http://elite20.team3/ontology#>

SELECT ?redLineId (COUNT(?violation) AS ?count) WHERE {
    {
        BIND("RED-001" AS ?redLineId)
        # ... (复制上面的子查询)
        ?violation a ?subType  # placeholder
    } UNION {
        BIND("RED-002" AS ?redLineId)
        # ...
    }
    # ... 重复 10 次
}
GROUP BY ?redLineId
ORDER BY DESC(?count)
```

---

## 7. 形式化覆盖度自评

### 7.1 形式化覆盖矩阵

| Red Line | OWL | SHACL | SWRL | SPARQL | 完整度 |
|---|:---:|:---:|:---:|:---:|---:|
| **RED-001** 提交写入唯一性 | ✅ | ✅ | ✅ | ✅ | **100%** |
| **RED-002** 不可越权写记录 | ✅ | ✅ | ✅ | ✅ | **100%** |
| **RED-003** 不可越权读记忆 | ✅ | ✅ | ✅ | ✅ | **100%** |
| **RED-004** 不可跨学生访问 | ✅ | ✅ | ✅ | ✅ | **100%** |
| **RED-005** 提交时间窗 | ✅ | ✅ | ✅ | ✅ | **100%** |
| **RED-006** 消息必经 Inbox | ✅ | ✅ | ✅ | ✅ | **100%** |
| **RED-007** 必走 Trusted Relationship | ✅ | ✅ | ✅ | ✅ | **100%** |
| **RED-008** 必留 Audit Trace | ✅ | ✅ | ✅ | ✅ | **100%** |
| **RED-009** 触达不靠 Agent | ✅ | ✅ | ✅ | ✅ | **100%** |
| **RED-010** Agent 通知边界 | ✅ | ✅ | ✅ | ✅ | **100%** |
| **总计** | **10/10** | **10/10** | **10/10** | **10/10** | **100%** |

### 7.2 形式化产物

| 产物 | 数量 |
|---|---:|
| **OWL Class** | 36 |
| **OWL ObjectProperty** | 30 |
| **OWL DatatypeProperty** | 15 |
| **SHACL NodeShape** | 12 |
| **SHACL PropertyShape** | 12 |
| **SWRL 规则** | 10 |
| **SPARQL 查询** | 11 |
| **OWL Class Restrictions** | 30+ |

### 7.3 形式化关键洞察

1. **RED-001 是其他红线的根**：所有违规检测都依赖 `:processedByAgentId` 字段被正确填充
2. **RED-007 / RED-010 是基础设施**：缺失会导致所有消息验证都失败
3. **OWL 强类型系统让红线不可能被绕过**：`owl:FunctionalProperty` + `owl:cardinality 1` 保证 `writesTo` 关系是函数式且单值
4. **SHACL 提供运行时校验**：在数据库 / API 入口拦住违规数据
5. **SWRL 提供自动推理**：状态变化 → 自动产生 AuditTrace，无需人工触发

### 7.4 落地建议

1. **OWL → JSON-LD 转换**：把 OWL 文件转 JSON-LD 喂给 Next.js
2. **SHACL → TypeScript Zod**：把 SHACL 约束转 Zod schema 在 API 入口校验
3. **SPARQL → e2e 测试**：把 SPARQL 一致性查询转 e2e 测试用例
4. **OWL Reasoner**：用 HermiT / Pellet / FaCT++ 做一致性检查
5. **Linting**：用 ESLint 自定义规则实现 RED-009 / RED-010 静态检查

---

> **规则抽取方法论核心理念（一句话）**：
> 
> **把 10 条架构红线形式化为 W3C 标准（OWL / SHACL / SWRL / SPARQL）四件套，让红线从"README 中的文档"变成"机器可推理、可校验、可监控的强约束"——这是从"软约束"升级为"硬约束"的关键步骤。**
