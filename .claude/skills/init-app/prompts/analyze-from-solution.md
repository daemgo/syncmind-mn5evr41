# Solution 降级分析与生成计划 (Mode B)

你是一个代码架构分析 Agent。当 spec.json 不存在时，从 solution.json 的 Markdown 方案内容中提取模块、页面、字段信息，生成等效的 init-plan.json。

核心原则：从非结构化的方案文档中提取结构化信息，推断缺失的细节。输出结构与 Mode A 完全一致。

---

## 输入数据

| 文件 | 用途 | 必须 |
|------|------|------|
| `docs/plan/solution.json` | 方案文档，读取 `scenes[].versions[].content` 中的 Markdown | 是 |
| `docs/spec/.spec-mapping.yaml` | 增量更新时的已有映射 | 否 |

---

## 执行步骤

### Step 1：读取方案内容

1. 读取 `docs/plan/solution.json`
2. 找到 `currentScene` 对应的场景
3. 取该场景最新版本的 `content`（Markdown 格式）
4. 如果 solution.json 不存在或为空 → 阻止执行，提示用户

### Step 2：从 Markdown 提取模块结构

从方案 Markdown 中识别：

**模块识别**（按优先级）：
1. 二级标题（`##`）中包含「模块」「管理」「系统」等关键词 → 模块
2. 功能列表中的顶层分组 → 模块
3. 业务流程中的主要阶段 → 模块

**页面识别**：
- 每个模块自动生成标准三页（列表、详情、新建）
- 方案中明确提到的额外页面（报表页、审批页等）也加入

**字段推断**：
- 从方案中提到的数据项推断字段名和类型
- 常见模式：「客户名称」→ `{ key: "name", type: "text" }`
- 金额相关 → `type: "money"`
- 日期相关 → `type: "date"` 或 `type: "datetime"`
- 状态相关 → `type: "select"`, 同时推断状态枚举

**状态流推断**：
- 从方案中提到的流程步骤推断状态值
- 默认状态颜色：待处理=gray, 进行中=blue, 已完成=green, 已取消=red

**字典推断**：
- 从方案中提到的分类、类型等推断 dictionary 项
- 生成 `dict-{module}-{field}` 格式的 dictionary ID

### Step 3：补全标准结构

与 Mode A 相同的页面完整性补全规则：
- 每个模块必须有 list + detail + form 三个页面
- 列表页必须有筛选栏（关键词 + 状态 + 重置）
- 详情页必须有面包屑 + 信息展示 + 关联数据 Tab
- 新建页必须有完整表单

### Step 4：生成 init-plan.json

输出格式与 Mode A 完全一致，唯一区别：

```json
{
  "meta": {
    "sourceMode": "solution",
    "specVersion": "inferred",
    "specHash": "solution content hash"
  }
}
```

所有 ModulePlan 标记 `"inferred": true`，因为结构是从非结构化文档推断的。

### Step 5：输出

将 init-plan.json 写入 `docs/spec/.init-plan.json`。

输出进度：`[降级分析完成] 从方案文档推断出 N 个模块，M 个页面。注意：页面结构为推断，精度低于 Spec 驱动模式。`
