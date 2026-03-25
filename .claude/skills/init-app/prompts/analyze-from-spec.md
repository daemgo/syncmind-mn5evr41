# Spec 分析与生成计划 (Mode A)

你是一个代码架构分析 Agent。读取 spec.json，分析其结构，生成完整的代码生成计划（init-plan.json）。

核心原则：只输出结构化计划，不生成任何代码。确保每个模块的页面集完整。

---

## 输入数据

| 文件 | 用途 | 必须 |
|------|------|------|
| `docs/spec/spec.json` | 核心输入：模块、页面、字段、字典、状态流 | 是 |
| `docs/spec/.spec-mapping.yaml` | 增量更新时的已有映射（检测变更、锁定） | 否 |

---

## 执行步骤

### Step 1：读取 spec.json

读取 `docs/spec/spec.json`，提取以下结构：

```
architecture.sitemap[]     → 路由结构、导航菜单
modules[]                  → 模块列表
modules[].pages[]          → 页面定义
pages[].layout             → 页面布局类型（list/detail/form/dashboard/steps/custom）
pages[].sections[]         → 区块定义
sections[].type            → 区块类型（table/form/card/chart/tabs/steps/timeline/description/statistic/custom）
sections[].fields[]        → 表单字段
sections[].columns[]       → 表格列
sections[].actions[]       → 操作按钮
globalRules.dictionary[]   → 数据字典
globalRules.statusFlows[]  → 状态流转
globalRules.roles[]        → 角色权限
```

### Step 2：页面完整性补全

对每个 module，检查是否包含以下页面。**缺失的必须自动补齐**：

| 页面 | layout | 路由 | 必须包含 |
|------|--------|------|---------|
| 列表页 | `list` | `/[module]` | 筛选栏 + 数据表格 + 分页 + 新建按钮 |
| 详情页 | `detail` | `/[module]/[id]` | 面包屑 + 信息摘要 + Tab 切换 + 编辑/删除 |
| 新建页 | `form` | `/[module]/create` | 完整表单 + 提交/取消 |

补齐规则：
- 列表页缺失 → 从 module 的所有 fields 推断表格列，从 dictionary 推断筛选下拉
- 详情页缺失 → 用 description 布局展示所有字段，关联数据用 tabs
- 新建页缺失 → 用 form 布局包含所有非只读字段

### Step 3：增量变更检测（仅当 .spec-mapping.yaml 存在时）

1. 读取 `.spec-mapping.yaml` 中的 `specHash`
2. 计算当前 spec.json 的 hash
3. 如果 hash 相同 → 输出 `{ "noChanges": true }` 并停止
4. 如果不同，逐模块对比：
   - 新增模块 → `action: "create"`
   - 变更模块 → 检查是否 `locked: true`，是则 `action: "skip"`，否则 `action: "update"`
   - 删除模块 → `action: "warn_removal"`（不自动删除文件）

### Step 4：生成 ModulePlan

对每个模块生成详细的生成计划：

```json
{
  "moduleId": "sample-management",
  "moduleName": "样品管理",
  "routeBase": "/samples",
  "inferred": false,
  "action": "create",
  "locked": false,
  "pages": [
    {
      "pageId": "sample-list",
      "path": "/samples",
      "layout": "list",
      "filePath": "src/app/samples/page.tsx",
      "sections": [
        {
          "sectionId": "sample-filter",
          "type": "form",
          "fields": [
            { "fieldKey": "keyword", "label": "关键词", "type": "text" },
            { "fieldKey": "status", "label": "状态", "type": "select", "optionSource": "dict-sample-status" }
          ]
        },
        {
          "sectionId": "sample-table",
          "type": "table",
          "columns": [
            { "fieldKey": "sampleNo", "label": "样品编号", "type": "link" },
            { "fieldKey": "status", "label": "状态", "type": "status" }
          ],
          "actions": [
            { "key": "view", "label": "查看详情" },
            { "key": "edit", "label": "编辑" },
            { "key": "delete", "label": "删除", "confirm": true }
          ]
        }
      ]
    }
  ],
  "typeDefinition": {
    "interfaceName": "Sample",
    "fields": [
      { "key": "id", "tsType": "string", "optional": false },
      { "key": "sampleNo", "tsType": "string", "optional": false },
      { "key": "status", "tsType": "SampleStatus", "optional": false }
    ],
    "statusEnums": {
      "SampleStatus": ["pending", "testing", "completed", "abnormal"]
    }
  },
  "mockDataRequirements": {
    "entityName": "samples",
    "recordCount": 15,
    "fieldKeys": ["id", "sampleNo", "sampleName", "status", "receiveTime"],
    "statusValues": ["pending", "testing", "completed"]
  },
  "filesToGenerate": [
    "src/types/sample.ts",
    "src/mock/samples.ts",
    "src/components/samples/sample-table.tsx",
    "src/components/samples/sample-form.tsx",
    "src/components/samples/sample-filter.tsx",
    "src/components/samples/sample-detail.tsx",
    "src/app/samples/page.tsx",
    "src/app/samples/[id]/page.tsx",
    "src/app/samples/create/page.tsx"
  ]
}
```

### Step 5：生成 DashboardPlan

```json
{
  "stats": [
    { "title": "统计名称", "valueSource": "模块.count", "icon": "LucideIconName", "color": "emerald" }
  ],
  "charts": [
    { "type": "line", "title": "趋势图", "dataSource": "模块.trend", "dataKeys": ["value1", "value2"] }
  ],
  "recentTable": {
    "source": "主模块",
    "columns": ["id", "name", "status", "date"],
    "limit": 5
  }
}
```

Dashboard 统计卡片至少 3-4 个，覆盖主要模块的核心指标。图表至少 1 个。

### Step 6：组装 init-plan.json

输出完整的 `.init-plan.json`：

```json
{
  "meta": {
    "specVersion": "从 spec.json meta.version 获取",
    "specHash": "计算的 hash",
    "generatedAt": "ISO 时间戳",
    "sourceMode": "spec"
  },
  "globalRules": {
    "dictionary": "从 spec.json globalRules.dictionary 直接复制",
    "statusFlows": "从 spec.json globalRules.statusFlows 直接复制",
    "roles": "从 spec.json globalRules.roles 直接复制"
  },
  "sitemap": "从 spec.json architecture.sitemap 直接复制",
  "modules": ["Step 4 生成的 ModulePlan 数组"],
  "dashboard": "Step 5 生成的 DashboardPlan"
}
```

---

## 输出

将 init-plan.json 写入 `docs/spec/.init-plan.json`。

输出一行进度：`[分析完成] 识别 N 个模块，M 个页面，计划已写入 .init-plan.json`
