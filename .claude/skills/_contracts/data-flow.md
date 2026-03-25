# Skill 数据流契约

本文档定义 skill 之间的数据传递契约。每个 skill 在读写文件时，必须遵守此处定义的字段约定。

---

## 数据流全景

```
用户输入
  │
  ├─→ /profile ──→ docs/customer/profile.json
  │                    │
  ├─→ /requirements ──→ docs/customer/requirements.json
  │                    │
  │                    ▼
  ├─→ /sales-guide ──→ docs/customer/sales-guide.json
  │   (依赖 profile，可选读取 requirements)
  │
  │   requirements.json ──→ /plan-writer ──→ docs/plan/solution.json
  │   (或用户对话 Mode C)                         │
  │                                               ▼
  │                                    /spec-writer ──→ docs/spec/spec.json
  │                                                          │
  │                                                          ▼
  └─→ /init-app ──→ src/ (前端代码)
      (读取 spec.json)
```

**单链数据流**：requirements.json → plan-writer → solution.json → spec-writer → spec.json → init-app

---

## 关键接口契约

### 1. requirements.json → plan-writer

plan-writer 采用 Multi-Agent 架构，有两种数据入口：
- **Mode A**（有 requirements.json）：由 `collect-and-validate` Agent 读取 requirements.json 生成 `{data_summary}`
- **Mode C**（无 requirements.json）：由 `parse-dialog` → `rebuild-from-dialog` 从用户对话 + 知识库重建等效 `{data_summary}`

两种模式输出相同结构的 `{data_summary}`，后续 Phase 2/3 Agent 无差别消费。

**collect-and-validate 读取的字段**（所有路径基于 `current.*`）：

| 字段路径 | 用途 | 必须 |
|----------|------|------|
| `current.background.businessContext` | 项目背景 | 是 |
| `current.background.currentChallenges[]` | 现有挑战 | 是 |
| `current.background.triggerEvent` | 触发事件 | 否 |
| `current.background.painPoints[]` | 痛点 | 否 |
| `current.needs[]` (category=business) | 业务需求（按 category 筛选） | 是 |
| `current.needs[]` (category=functional) | 功能需求（按 module 分组） | 是 |
| `current.needs[]` (category=technical) | 技术需求 | 否 |
| `current.needs[].confidence` | 置信度（low 的在方案中标注 [待验证]） | 是 |
| `current.needs[].status` | 只使用 status=active 和 verified 的需求 | 是 |
| `current.constraints.budget` | 预算约束 | 否 |
| `current.constraints.timeline` | 时间约束 | 否 |
| `current.constraints.technical` | 技术约束 | 否 |
| `current.constraints.resources` | 资源约束 | 否 |
| `current.successCriteria` | 成功标准 | 否 |
| `current.solutionDirection.overallApproach` | 方案方向 | 否 |
| `current.completionRate.overall` | 完成度（< 60% 阻止生成） | 是 |
| `current.pendingQuestions[]` | 待解决问题 | 否 |
| `currentVersion` | 需求版本号 | 是 |
| `status` | 需求状态 | 是 |

**数据质量门控**：collect-and-validate 在以下情况阻止方案生成：
- requirements.json 不存在
- 所有 needs 的 confidence=low
- status="draft" 且 completionRate.overall < 60%
- 数据完整性评分 < 60%（5 维加权评分）

### 2. solution.json → spec-writer

spec-writer 的**唯一输入**是 solution.json，不读取 requirements.json。方案内容已经过 plan-writer 的 A/B 对弈，需求已被消化和取舍。

| 字段路径 | 用途 | 必须 |
|----------|------|------|
| `scenes[].versions[].content` | Markdown 格式方案，提取功能模块/页面/字段设计 | 是 |
| `scenes[].versions[].version` | 方案版本号，写入 spec.json 的 `meta.sourceSolution` | 是 |
| `scenes[].versions[].requirementsVersion` | 需求来源标识（版本号或 "dialog"） | 否 |
| `scenes[].id` | 方案场景 ID，写入 spec.json 的 `meta.sourceSolutionScene` | 是 |
| `currentScene` | 默认目标场景 | 是 |

**前置条件**：solution.json 存在且目标场景有至少一个版本。`requirementsVersion="dialog"` 时也正常执行。

### 3. spec.json → init-app（经 .init-plan.json 中间产物）

init-app 采用三阶段架构（分析 → 并行生成 → 验证），spec.json 不直接传给 codegen agents，而是先由 analyze agent 转换为 `.init-plan.json` 中间产物。

#### 3.0 三种输入模式

init-app 支持三种数据来源，全部统一输出 `.init-plan.json`：

| 模式 | 触发条件 | 输入 | 精度 |
|------|---------|------|------|
| Mode A | spec.json 存在 | spec.json 结构化数据 | 最高 |
| Mode B | 无 spec，有 solution.json | solution.json Markdown 提取 | 中等 |
| Mode C | 无 spec 也无 solution | 用户对话描述 + 可选知识库 | 快速原型 |

#### 3.1 .init-plan.json 中间产物契约

```typescript
interface InitPlan {
  meta: {
    specVersion: string;
    specHash: string;
    generatedAt: string;
    sourceMode: "spec" | "solution" | "dialog";
  };
  globalRules: {
    dictionary: DictItem[];
    statusFlows: StatusFlow[];
    roles: RoleSpec[];
  };
  sitemap: SitemapNode[];
  modules: ModulePlan[];
  dashboard: DashboardPlan;
}

interface ModulePlan {
  moduleId: string;
  moduleName: string;
  routeBase: string;
  inferred: boolean;       // Mode B/C 推断的标记为 true
  action: "create" | "update" | "skip" | "warn_removal";
  locked: boolean;
  pages: PagePlan[];
  typeDefinition: TypeDef;
  mockDataRequirements: MockReq;
  filesToGenerate: string[];
}
```

**关键设计**：三种模式输出相同的 InitPlan 结构，下游 codegen agents 无差别消费。Mode B/C 推断的模块标记 `inferred: true`。

#### 3.2 spec.json → init-plan.json 字段映射（Mode A）

**这是最关键的契约**。init-app analyze agent 解析 spec.json 的完整映射：

| spec.json 字段 | init-app 映射目标 | 说明 |
|----------------|-------------------|------|
| `architecture.sitemap[]` | 导航菜单 + 路由结构 | `route` 决定文件路径，`icon` 决定菜单图标 |
| `modules[].pages[]` | `src/app/[route]/page.tsx` | 一个 page 一个文件 |
| `pages[].layout` | 页面骨架模板 | 必须是: `list` / `detail` / `form` / `dashboard` / `steps` / `custom` |
| `pages[].sections[].type` | 组件类型 | **必须是以下枚举值之一** |
| `sections[].fields[]` | 表单字段 | `fieldKey` 用作代码中的字段名 |
| `sections[].columns[]` | 表格列 | `fieldKey` 对应 mock 数据的 key |
| `sections[].actions[]` | 操作按钮 | `position` 决定按钮位置 |
| `globalRules.dictionary[]` | `src/lib/dict.ts` | `id` 被 `optionSource` 引用 |
| `globalRules.statusFlows[]` | Badge 颜色 + 状态流转逻辑 | `statuses[].color` 决定 Badge 颜色 |

#### sections[].type 枚举值（spec-writer 和 init-app 必须一致）

```typescript
type SectionType =
  | "table"       // → Table 组件
  | "form"        // → Form + Input + Select
  | "card"        // → Card 信息卡片
  | "cards"       // → Card 列表
  | "chart"       // → recharts + ChartContainer
  | "tabs"        // → Tabs 标签页
  | "steps"       // → div + Badge 步骤条
  | "timeline"    // → div + 左侧竖线时间线
  | "description" // → dl + grid 描述列表
  | "statistic"   // → Card + 大号数字 + 趋势
  | "custom"      // → 自定义
```

**spec-writer 禁止使用此枚举之外的 type 值**，否则 init-app 无法映射组件。

#### pages[].layout 枚举值

```typescript
type PageLayout =
  | "list"       // 列表页：筛选 + 表格 + 分页
  | "detail"     // 详情页：信息展示 + 标签页
  | "form"       // 表单页：数据录入
  | "dashboard"  // 仪表盘：卡片 + 图表
  | "steps"      // 步骤页：分步操作
  | "custom"     // 自定义
```

#### fields[].type 枚举值

```typescript
type FieldType =
  | "text" | "textarea" | "number" | "money" | "percent"
  | "date" | "datetime" | "daterange" | "time"
  | "select" | "multiselect" | "radio" | "checkbox" | "switch"
  | "upload" | "image" | "richtext"
  | "cascader" | "treeselect" | "user" | "department"
  | "address" | "phone" | "email" | "idcard" | "url"
  | "color" | "rate" | "slider" | "custom"
```

### 4. profile.json → sales-guide

sales-guide 从 profile.json 读取的字段：

| 字段路径 | 用途 | 必须 |
|----------|------|------|
| `profile.timing` | 时机分析输入 | 是 |
| `profile.strategy` | 增长阶段、竞争态势、扩张/收缩信号 | 是 |
| `profile.policyAnalysis` | 政策杠杆、切入素材 | 是 |
| `profile.organization` | 决策链基础 | 是 |
| `profile.techStack` | 竞对识别、技术现状 | 是 |
| `profile.painPoints` | 价值主张、破冰素材 | 是 |
| `profile.opportunities` | 机会点、切入角度 | 否 |
| `profile.contacts` | 决策链具名角色 | 否 |
| `profile.creditRisk` | 风险评估、禁区话题 | 否 |
| `profile.scale` | 竞对匹配、组织类型推断 | 是 |
| `profile.industry` / `profile.subIndustry` | 行业竞对、典型痛点 | 是 |

### 5. requirements.json → sales-guide（可选）

sales-guide 从 requirements.json 读取的字段（丰富策略，非必须）：

| 字段路径 | 用途 | 必须 |
|----------|------|------|
| `current.needs[]` (priority=must) | 价值主张对齐、访谈问题设计 | 否 |
| `current.constraints.budget` | 异议预判（价格异议）、紧急度评估 | 否 |
| `current.constraints.timeline` | 紧急度评估、行动计划节奏 | 否 |
| `current.users[]` | 访谈问题定向、决策链补充 | 否 |
| `current.pendingQuestions[]` | 融入访谈提纲的定制问题 | 否 |
| `currentVersion` / `status` | 判断需求成熟度 | 否 |

---

## 字段引用规则

### dictionary 引用

spec-writer 在 `fields[].optionSource` 中引用 dictionary ID 时，必须确保该 ID 在 `globalRules.dictionary[]` 中存在：

```json
// field 引用
{ "optionSource": "dict-sample-status" }

// dictionary 定义（必须存在）
{ "id": "dict-sample-status", "items": [...] }
```

init-app 根据 `optionSource` 从 `globalRules.dictionary` 查找选项，生成到 `src/lib/dict.ts`。

### statusFlows 引用

`statusFlows[].statuses[].color` 的值会被 init-app 映射为 Badge 的颜色类名。建议使用：
`gray` / `blue` / `green` / `red` / `yellow` / `purple` / `orange`

---

## 版本兼容

各 skill 写入文件时，必须维护版本信息：

| 文件 | 版本字段 | 格式 |
|------|----------|------|
| requirements.json | `currentVersion` | "v0.1", "v0.2", ..., "v1.0" |
| solution.json | `scenes[].versions[].version` | "v1", "v2", ... |
| spec.json | `meta.version` | "1.0.0" (semver) |
| spec.json | `meta.sourceSolution` | 引用 solution 的版本 |
| spec.json | `meta.sourceSolutionScene` | 引用 solution 的场景 ID |
| sales-guide.json | `version` | "1.0", "1.1", ..., "2.0" |
