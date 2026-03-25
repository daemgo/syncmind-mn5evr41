---
name: spec-writer
description: 基于解决方案生成结构化产品需求说明书(Spec)
metadata:
  short-description: 生成产品需求说明书
  triggers:
    - "生成spec"
    - "写需求说明书"
    - "生成需求说明书"
    - "出spec"
    - "产品需求说明书"
    - "PRD"
  examples:
    - "基于方案生成spec"
    - "帮我写产品需求说明书"
    - "生成PRD文档"
  dependencies:
    - plan-writer    # 必须先有解决方案（solution.json）
    - humanizer-zh   # 输出人性化处理（必须）
---

基于 `solution.json` 的方案内容生成结构化产品需求说明书（Spec）。直接执行，不输出本文档内容。

---

### 核心定位

**Spec = 产品需求说明书，聚焦"做什么"，不关心"怎么做"**

| Spec 包含 | Spec 不包含 |
|-----------|-------------|
| 产品背景、目标、用户 | 技术架构设计 |
| 功能清单、模块划分 | 接口/API 设计 |
| 页面结构、交互流程 | 数据库设计 |
| 字段定义、业务规则 | 埋点方案 |
| 原型/线框描述 | 性能优化方案 |

### 工作流程位置

```
/plan-writer（解决方案）
      ↓
   docs/plan/solution.json
      ↓
/spec-writer（本 skill：方案 → 结构化 Spec）
      ↓
   docs/spec/spec.json + spec.md
```

### 输出物

| 文件 | 格式 | 说明 |
|------|------|------|
| spec.json | 结构化 JSON | 模块、页面、字段、业务规则的完整定义 |
| spec.md | Markdown | 可读版本，供人工阅读和评审 |
| .spec-mapping.yaml | YAML | 模块→文件映射，支持增量更新和锁定 |

---

### 数据来源

#### 唯一输入

| 文件 | 用途 |
|------|------|
| `docs/plan/solution.json` | 方案内容（Markdown），包含功能设计、模块划分、技术选型 |

**不读取 requirements.json**。方案内容已经过 plan-writer 的 A/B 对弈，需求已被消化和取舍。

#### 前置条件

| 条件 | 处理 |
|------|------|
| solution.json 存在 + 目标场景有版本 | 正常执行 |
| solution.json 不存在 | 提示先执行 `/plan-writer` |
| solution.json 的 requirementsVersion="dialog" | 正常执行（对话直出方案也能生成 spec） |

---

### 质量优先原则

**高质量 ≠ 内容多。内容多不解决真正问题 = 垃圾。**

| 维度 | 高质量 | 低质量（避免） |
|------|--------|---------------|
| **贴合方案** | 每个功能都能追溯到方案中的设计 | 凭空添加"可能有用"的功能 |
| **深度思考** | 解释"为什么这样设计" | 只列"做什么"，不说为什么 |
| **精炼不冗余** | 20 个字段解决问题 | 100 个字段显得专业 |
| **有取舍** | 明确说"不做什么"和原因 | 什么都想做，什么都做不好 |

#### 核心检查

- 每个模块能追溯到方案中的功能设计？
- 有没有"方案没提但看起来合理"的功能？（删除它）
- 每个字段都问过"删了会怎样"？
- scope.excluded 列出了不做的功能？

#### 反模式

看到"用户管理"就写上增删改查 15 个功能 — 这不是全面，是没有思考。客户要什么就做什么。

---

### 执行流程

#### Step 1：读取方案

1. 读取 `docs/plan/solution.json`
2. 找到目标场景（默认 `normal`）的最新版本
3. 提取 `content`（Markdown 方案文档）和 `requirementsVersion`
4. 检查方案是否包含功能设计内容（第 3 章"解决方案"）

#### Step 2：提取模块结构（1 Agent）

读取 `prompts/extract-modules.md`，启动 Agent：

| Agent | Prompt 文件 | 注入数据 |
|-------|------------|---------|
| extract-modules | `prompts/extract-modules.md` | `{solution_content}`（方案 Markdown） |

输出：模块/页面/功能/实体/角色的结构化数据。

#### Step 3：生成 Spec（1 Agent）

读取 `prompts/generate-spec.md`，启动 Agent：

| Agent | Prompt 文件 | 注入数据 |
|-------|------------|---------|
| generate-spec | `prompts/generate-spec.md` | `{module_structure}` + spec-schema.md |

输出：完整的 spec.json + 质量报告。

#### Step 4：生成输出文件

1. **spec.json**：直接写入 `docs/spec/spec.json`
2. **spec.md**：读取 `output-templates/spec-md-template.md`，基于 spec.json 数据填充模板，应用 humanizer-zh 处理
3. **.spec-mapping.yaml**：基于 `output-templates/spec-mapping-template.md` 格式，初始化模块→文件映射

#### Step 5：输出摘要

```markdown
**产品名称**：{name}
**版本**：{version}
**来源方案**：{sourceSolutionScene} {sourceSolution}

| 模块 | 页面数 | 字段数 | 操作数 |
|------|--------|--------|--------|
| {module} | {pages} | {fields} | {actions} |

生成文件：
- `docs/spec/spec.json` - 结构化数据
- `docs/spec/spec.md` - 可读文档（人工阅读）
- `docs/spec/.spec-mapping.yaml` - 映射文件（增量更新）

下一步：可运行 `/init-app` 基于 Spec 生成 Demo，或交付团队直接基于 Spec 开发。
```

#### Step 6：Git 提交

```
git add docs/spec/
git commit -m "feat: 生成产品需求说明书 {version}"
```

---

### 增量更新机制

#### 触发条件

当用户说"更新 spec"或 solution.json 有新版本时。

#### 更新流程

1. 读取当前 spec.json 和 .spec-mapping.yaml
2. 读取 solution.json 最新版本，与 spec.json 的 `sourceSolution` 对比
3. 检查锁定状态：已锁定的模块/页面跳过
4. 重新执行 Step 2-3，但只更新未锁定的部分
5. 生成变更报告
6. 更新文件，版本号递增

#### 锁定机制

在 spec.json 中设置 `locked: true`：

| 级别 | 效果 |
|------|------|
| 模块锁定 | 模块下所有页面跳过 |
| 页面锁定 | 只跳过该页面 |

在 .spec-mapping.yaml 中可设置文件级锁定。

---

### 数据契约

**输入契约**：参考 `_contracts/data-flow.md`（solution.json → spec-writer）

**输出契约**：spec.json 的接口定义见 `spec-schema.md`。`sections[].type`、`pages[].layout`、`fields[].type` 枚举值必须严格遵守契约中定义的枚举范围。

---

### 输出文件

```
docs/spec/
├── spec.json           # 结构化数据
├── spec.md             # 可读文档（人工阅读/审核）
└── .spec-mapping.yaml  # 模块→代码映射（增量更新用）
```

---

### 与其他 Skill 的关系

| Skill | 关系 |
|-------|------|
| `/plan-writer` | **上游**：提供方案内容（solution.json） |
| `/init-app` | **下游**：可基于 spec.json 生成 Demo 代码 |
| `/humanizer-zh` | 后处理：spec.md 文本去 AI 痕迹 |

---

### 文件结构

```
.claude/skills/spec-writer/
├── SKILL.md                              # 本文件：编排逻辑 + 质量原则
├── spec-schema.md                        # spec.json TypeScript 接口定义
├── output-templates/
│   ├── spec-md-template.md               # spec.md 文档模板
│   └── spec-mapping-template.md          # .spec-mapping.yaml 格式说明
└── prompts/
    ├── extract-modules.md                # Step 2: 从方案提取模块结构
    └── generate-spec.md                  # Step 3: 生成 spec.json
```
