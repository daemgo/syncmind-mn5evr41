---
name: init-app
description: 生成可运行的前端 Demo 代码。支持三种输入：Spec 文档、方案文档、用户直接描述。采用分析→并行生成→验证的三阶段架构。
metadata:
  short-description: 生成 Demo 代码
  triggers:
    - "生成demo"
    - "生成代码"
    - "init-app"
    - "初始化应用"
    - "生成应用"
    - "做个demo"
    - "创建一个系统"
  examples:
    - "基于 spec 生成 demo"
    - "生成前端代码"
    - "我要一个 CRM 系统，管理客户、商机、合同"
    - "做一个项目管理的 demo"
  dependencies:
    - spec-writer  # 推荐先有 Spec 文档（非必须）
---

在现有项目中生成可运行的前端 Demo 代码。直接执行，不输出本文档内容。

---

### 核心定位

**生成纯前端 Mock Demo**：基于 Spec、方案或用户描述，生成完整的前端界面 + Mock 数据，代码可直接运行。

#### 重要约束

- **在现有项目中生成**：项目基础设施已就绪，在现有项目基础上添加功能
- **基础技术栈固定**：Next.js 16、React、TypeScript、Tailwind CSS v4、shadcn/ui，**不接受改变**
- **纯前端 Demo**：Mock 数据的前端演示，不包含真实后端

---

### 三种输入模式

| 模式 | 触发条件 | 数据来源 | 精度 |
|------|---------|---------|------|
| **Mode A: Spec 驱动** | `docs/spec/spec.json` 存在 | spec.json 完整结构 | 最高 |
| **Mode B: Solution 降级** | 无 spec，有 `docs/plan/solution.json` | 从方案 Markdown 提取 | 中等 |
| **Mode C: 对话直接** | 无 spec 也无 solution | 用户对话描述 | 快速原型 |

---

### 执行流程

#### Phase 0：模式检测

```
1. 检查 docs/spec/spec.json 是否存在 → Mode A
2. 否则检查 docs/plan/solution.json 是否存在 → 提示用户选择（见下方）
3. 否则 → Mode C（从用户对话提取需求）
```

**有方案无 Spec 时（让用户选择）**：

检测到 solution.json 存在但 spec.json 不存在时，**不要静默降级**，先提示用户：

```
方案已就绪但还没有生成 Spec 文档。

A. 先运行 /spec-writer 生成 Spec，再生成 Demo（推荐，精度最高）
B. 直接基于方案生成 Demo（速度快，但页面结构为推断）
```

- 用户选 A → 提示执行 `/spec-writer`，**不要自动执行**（遵循 CLAUDE.md 依赖 skill 处理规则）
- 用户选 B → 进入 Mode B

Mode C 信息不足时（用户只说了「做个管理系统」），用选项确认系统类型，不要猜测。

#### Phase 1：分析与计划（1 个 Agent）

根据模式选择对应的分析 prompt：

| 模式 | Agent Prompt | 输入 |
|------|-------------|------|
| Mode A | `prompts/analyze-from-spec.md` | spec.json |
| Mode B | `prompts/analyze-from-solution.md` | solution.json |
| Mode C | `prompts/analyze-from-dialog.md` | 用户描述 + 可选知识库 |

**三种模式输出相同结构**：`docs/spec/.init-plan.json`

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
```

增量更新时，analyze 阶段对比 `.spec-mapping.yaml` 的 hash，仅标记变更模块。

#### Phase 2：生成共享基础设施（1 个 Agent，必须先完成）

使用 `prompts/codegen-shared.md`，输入 init-plan.json 的 sitemap + dictionary + statusFlows。

**生成文件**（按顺序）：
1. `src/lib/dict.ts` — 数据字典
2. `src/components/layout/sidebar.tsx` — 侧边导航
3. `src/components/layout/header.tsx` — 顶部栏
4. `src/app/layout.tsx` — 根布局

**Phase 2 必须在 Phase 3 之前完成**，因为所有模块依赖 layout 和 dict。

#### Phase 3：并行生成模块 + Dashboard（N+1 个 Agent）

**可并行执行**的独立任务：

| Agent | Prompt | 输入 |
|-------|--------|------|
| module:{id} × N | `prompts/codegen-module.md` | 单个 ModulePlan + dictionary + statusFlows |
| dashboard | `prompts/codegen-dashboard.md` | DashboardPlan + modules 概要 |

每个 module Agent 生成该模块的完整代码（类型 → mock → 组件 → 页面），按 HMR 安全顺序写入。

**增量更新时**：仅对 `action: "create"` 或 `action: "update"` 的模块调用 codegen，跳过 `locked` 和 `skip` 的模块。

**错误隔离**：单个模块失败不阻塞其他模块，verify 阶段报告部分成功。

#### Phase 4：验证与修复（1 个 Agent）

使用 `prompts/verify-and-fix.md`，输入 init-plan.json + 已生成代码。

**步骤**：
1. `pnpm build` — 编译检查，修复直到通过
2. 页面完整性 — 对照 plan 核对所有文件存在
3. 样式抽检 — 读 2-3 个页面检查设计规范
4. 更新 `.spec-mapping.yaml`
5. 输出汇总报告

---

### 参考文件

| 文件 | 用途 | 何时读取 |
|------|------|---------|
| `design-patterns.md` | 设计模式规范（提炼自 `src/_examples/`） | codegen 阶段 |
| `component-mapping.md` | section.type/field.type → 组件映射 | codegen 阶段 |
| `_contracts/data-flow.md` 第 3 节 | spec.json → init-app 的字段契约 | analyze 阶段 |

---

### 数据契约

**输入契约**：参考 `_contracts/data-flow.md` 第 3 节（spec.json → init-app），定义了 spec.json 中每个字段如何映射到代码。

**中间产物**：`.init-plan.json`（三种模式统一输出格式，下游 codegen 无差别消费）

**关键约束**：`sections[].type` 和 `pages[].layout` 必须是契约中定义的枚举值，否则无法生成对应组件。

---

### 增量更新机制

当再次运行 `/init-app` 时：

1. **analyze** 读取 spec.json + `.spec-mapping.yaml`
2. 比对 specHash → 无变化则输出「无更新」并停止
3. 有变化时逐模块 diff：
   - 新模块 → `action: "create"`
   - 变更模块（未锁定） → `action: "update"`
   - 锁定模块 → `action: "skip"`
   - 删除模块 → `action: "warn_removal"`（不自动删除文件）
4. Phase 2 仅在 sitemap/dict 变化时重新生成
5. Phase 3 仅对 create/update 模块调用 codegen
6. Phase 4 验证并更新映射文件

---

### 代码规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 路由 | kebab-case | `/samples`, `/sample-receive` |
| 组件文件 | kebab-case | `sample-table.tsx` |
| 组件名 | PascalCase | `SampleTable` |
| 函数 | camelCase | `getSampleList` |
| 常量 | UPPER_SNAKE_CASE | `SAMPLE_STATUS` |
| 类型 | PascalCase | `Sample`, `SampleStatus` |

- TypeScript 严格模式
- 函数组件 + Hooks
- Tailwind CSS 样式，语义化颜色 token
- shadcn/ui 组件规范
- 代码注释用英文

---

### 文件写入顺序（HMR 安全）

```
Phase 2: types/ → lib/dict.ts → layout 组件 → layout.tsx
Phase 3: 每个模块内部：types → mock → components → pages
         Dashboard: page.tsx（引用已有 mock）
```

**禁止**：先写页面再写依赖的组件（导致编译报错和白屏）。

---

### 错误处理

| 场景 | 处理 |
|------|------|
| spec.json 不存在 | 尝试 solution.json（Mode B），否则 Mode C |
| spec.json 格式错误 | 报错并提示具体位置 |
| 模块已锁定 | 跳过并在报告中说明 |
| shadcn 组件未安装 | 运行 `npx shadcn@latest add [component]` |
| 编译失败修复不了 | 报告具体错误给用户 |
| Mode C 信息不足 | 提供选项让用户选择系统类型 |

---

### 目录结构

```
.claude/skills/init-app/
├── SKILL.md                      # 本文件：编排器
├── design-patterns.md            # 设计模式规范（提炼自 _examples）
├── component-mapping.md          # 组件映射参考
└── prompts/
    ├── analyze-from-spec.md      # Mode A：Spec 分析
    ├── analyze-from-solution.md  # Mode B：Solution 降级分析
    ├── analyze-from-dialog.md    # Mode C：对话直接分析
    ├── codegen-shared.md         # 共享基础设施生成
    ├── codegen-module.md         # 单模块代码生成
    ├── codegen-dashboard.md      # Dashboard 首页生成
    └── verify-and-fix.md         # 质量验证与修复
```

---

### 与其他 Skill 的关系

| Skill | 关系 |
|-------|------|
| `/spec-writer` | 上游，提供 Spec 文档（Mode A） |
| `/plan-writer` | 上游，提供方案文档（Mode B） |
| `/requirements` | 上上游，提供需求数据 |
| `/knowledge-base` | Mode C 可选读取行业元模型增强推断 |
