# 输出规则

## Markdown 展示模板

根据模式不同，使用不同的展示结构。

### 模式 A/B 通用展示（首次生成 & 迭代补充）

```markdown
# 【需求文档】：{customerName}

> {版本} · {状态} · 完成度 {completionRate.overall}% · {日期}

## 0. 需求来源
[sources 模块：列出所有信息来源，标注类型和日期]
[迭代模式下：标注"本次新增来源"]

## 1. 业务背景
[background 模块：业务背景、当前挑战、触发事件]
[现有系统列表 + 痛点分析]
[标注哪些是客户说的、哪些是推演的]

## 2. 需求清单
[needs[] 模块：按 category 分组展示]

### 业务需求
[每条需求：标题 | 优先级 | 置信度 | 来源标签]

### 功能需求
[同上，按 module 子分组]

### 技术需求
[同上]

### 其他需求（数据/集成/安全/非功能）
[合并展示，按重要性排序]

## 3. 用户角色
[users[] 模块：角色、数量、主要任务]

## 4. 约束条件
[constraints 模块：预算/时间/技术/组织，标注已确认 vs 待确认]

## 5. 范围与优先级
[scope 模块：范围内/范围外/未来范围]
[phases 分期规划]
[priorityMatrix 优先级矩阵]

## 6. 方案方向建议
[solutionDirection 模块：初步方案建议]

## 7. 风险与假设
[risksAndAssumptions 模块]

## 8. 待验证问题
[pendingQuestions 模块：分优先级列出]
```

### 迭代模式额外输出（模式 B 在文档前插入）

```markdown
---
### 本次更新摘要

**输入**：{inputSummary}
**版本**：{上一版本} → {当前版本}

**变更**：
- {changeSummary 条目}

**新增需求**：{数量} 条
**验证假设**：{数量} 条（confidence 升级）
**否定假设**：{数量} 条
---
```

### 模式 C 展示（版本确认）

```markdown
# 【需求文档 · 正式版】：{customerName}

> v1.0 · 已确认 · {日期}

[完整需求文档，格式同模式 A 但：]
- 移除所有 [假设待验证] 标注
- rejected 的需求不展示
- confidence=low 的需求标注"⚠ 未充分验证"
- 添加"确认记录"章节
```

### 问题清单展示（所有模式结尾附加）

```markdown
---

## 待回答问题

### 必问（下次沟通务必确认）

1. **{question}**
   背景：{purpose}
   建议问：{targetPerson}

### 选问（有机会就了解）

2. **{question}**
   背景：{purpose}

---
回答方式：直接回复答案，或粘贴新的沟通记录，我会自动更新需求文档。
```

> 需求文档已生成。运行 `/plan-writer` 生成解决方案。

---

## JSON 写入规则

写入路径：`docs/customer/requirements.json`

### 写入内容

直接写入 synthesize Agent 输出的完整 JSON 结构。

### 字段说明

| 顶层字段 | 说明 |
|----------|------|
| currentVersion | 当前版本号 |
| status | draft / confirmed / frozen |
| versions[] | 版本历史，每个版本存完整快照 |
| current | 当前版本的完整需求内容 |

### 写入策略

- **首次写入**：创建完整文件
- **迭代写入**：
  1. 读取现有文件
  2. 将当前版本的 current 内容复制到 versions[] 作为新快照
  3. 更新 currentVersion
  4. 更新 current 为新内容
- **确认写入**：更新 status 为 confirmed，版本升为整数

### 置信度标签映射

在 Markdown 展示中，使用 `confidence` + `source.type` 组合判断显示标签（不依赖独立的 `isAssumption` 字段）：

| confidence | source.type | 显示标签 |
|------------|-------------|----------|
| high | 任意 | `[已确认]` |
| medium | sales-observation | `[销售判断]` |
| medium | 其他 | `[待验证]` |
| low | profile-inference | `[假设待验证 · 档案推演]` |
| low | case-matching | `[假设待验证 · 行业案例]` |
| low | industry-pattern | `[假设待验证 · 行业通用]` |

### source 类型标签映射（用于来源说明）

| source.type | 显示标签 |
|-------------|----------|
| customer-stated | 客户原话 |
| sales-observation | 销售观察 |
| profile-inference | 档案推演 |
| industry-pattern | 行业通用 |
| case-matching | 行业案例 |

### needs status 标签映射

| status | 显示处理 |
|--------|----------|
| active | 正常展示 |
| verified | 展示，标注 `✓` |
| rejected | 模式 A/B 中展示并标注 ~~删除线~~；模式 C 中不展示 |
| deferred | 展示在"未来范围"章节 |

### humanizer-zh 规则

所有文本输出（Markdown 展示部分）必须经过 humanizer-zh 处理：
- 需求描述不要写成广告文案
- 痛点描述用客户的话，不用我们的话
- 方案方向建议直接说，不绕圈子
- JSON 中的字段值保持简洁客观，不美化
