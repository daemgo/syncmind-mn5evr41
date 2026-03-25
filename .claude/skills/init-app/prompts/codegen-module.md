# 单模块代码生成

你是一个代码生成 Agent。基于 init-plan.json 中的单个 ModulePlan 生成该模块的完整代码：类型、Mock 数据、组件、页面。

核心原则：每个模块独立完整，可单独编译。代码质量对标 design-patterns.md 中的设计规范。

---

## 输入数据

| 数据 | 来源 |
|------|------|
| `{modulePlan}` | init-plan.json 中的单个 `modules[]` 项 |
| `{dictionary}` | init-plan.json 的 `globalRules.dictionary`（该模块引用的字典项） |
| `{statusFlows}` | init-plan.json 的 `globalRules.statusFlows`（该模块引用的状态流） |

---

## 必须参考

生成代码前，读取以下文件：
1. `design-patterns.md` — 设计规范（布局、卡片、表格、图表等模式）
2. `component-mapping.md` — section.type 和 field.type 的组件映射

**严格遵循**这些文件中定义的模式和规范。

---

## 生成文件（按依赖顺序）

### 1. `src/types/{module}.ts` — 类型定义

基于 `modulePlan.typeDefinition` 生成：

```typescript
export interface {InterfaceName} {
  id: string;
  // ... fields from typeDefinition.fields
}

export type {StatusEnum} = {/* union from typeDefinition.statusEnums */};
```

规则：
- 每个字段的 TypeScript 类型根据 field.type 推断（text→string, number→number, money→number, date→string, select→联合类型或string, boolean→boolean）
- 状态字段生成独立的 type alias
- 可选字段标记 `?`

### 2. `src/mock/{module}.ts` — Mock 数据

基于 `modulePlan.mockDataRequirements` 生成：

```typescript
import type { {InterfaceName} } from "@/types/{module}";

export const {entityName}Mock: {InterfaceName}[] = [
  // Generate {recordCount} records with realistic data
];
```

规则：
- 至少生成 `recordCount` 条记录（默认 15 条）
- 数据要合理：
  - ID 用递增编号：`"1"`, `"2"`, ...
  - 编号用前缀+日期+序号：`"ORD-2026001"`, `"CUS-2026001"`
  - 名称用中文，符合业务场景
  - 金额合理分布（不全是整数）
  - 状态分布：覆盖所有状态值，主要状态多几条
  - 日期从近到远排列
- 导出 Mock 数据数组，变量名用 `{entityName}Mock`

### 3. `src/components/{module}/{module}-filter.tsx` — 筛选组件

基于列表页的 filter section 生成。参考 design-patterns.md §5（Filter Bar Pattern）。

必须包含：
- 关键词搜索（带 Search 图标的 Input）
- 状态下拉（Select，选项来自 dictionary）
- 如果有日期字段，加日期范围
- 重置按钮

```typescript
"use client";

import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

interface {Module}FilterProps {
  // filter state props
}

export function {Module}Filter(/* props */) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Follow design-patterns.md §5 exactly */}
        </div>
      </CardContent>
    </Card>
  );
}
```

### 4. `src/components/{module}/{module}-table.tsx` — 表格组件

基于 table section 的 columns 和 actions 生成。参考 design-patterns.md §4（Data Table Pattern）。

必须包含：
- Card 包装 + hover:shadow-md
- 完整 Table 组件（TableHeader + TableBody）
- 每行 hover:bg-muted/50 + cursor-pointer
- 状态列用 Badge
- 金额列右对齐 + font-medium
- 操作列用 DropdownMenu（MoreHorizontal 图标）
- 分页组件（design-patterns.md §6）

```typescript
"use client";

import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
// ... imports per design-patterns.md §12
import type { {InterfaceName} } from "@/types/{module}";
import { {entityName}Mock } from "@/mock/{module}";

export function {Module}Table() {
  return (
    <>
      {/* Table Card - follow design-patterns.md §4 exactly */}
    </>
  );
}
```

### 5. `src/components/{module}/{module}-form.tsx` — 表单组件

基于 form section 的 fields 生成。使用 component-mapping.md 的 Field Type → Form Component 映射。

```typescript
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
// ... other field components per field types

interface {Module}FormProps {
  mode: "create" | "edit";
  initialData?: Partial<{InterfaceName}>;
}

export function {Module}Form({ mode, initialData }: {Module}FormProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-base font-medium">
          {mode === "create" ? "新建" : "编辑"}{moduleName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {/* Fields mapped per component-mapping.md */}
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline">取消</Button>
          <Button>提交</Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

字段布局：`grid grid-cols-2 gap-4`，textarea 和 richtext 占满宽度 `col-span-2`。
每个字段需要 label（`text-sm font-medium`）。

### 6. `src/components/{module}/{module}-detail.tsx` — 详情组件

基于 detail page 的 sections 生成。

```typescript
"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { {InterfaceName} } from "@/types/{module}";

interface {Module}DetailProps {
  data: {InterfaceName};
}

export function {Module}Detail({ data }: {Module}DetailProps) {
  return (
    <div className="space-y-6">
      {/* Info Card - description layout */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="text-base font-medium">基本信息</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-4">
            {/* key-value pairs */}
            <div>
              <dt className="text-sm text-muted-foreground">{label}</dt>
              <dd className="mt-1 font-medium">{value}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Related Data Tabs (if has relations) */}
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">关联数据</TabsTrigger>
          <TabsTrigger value="tab2">操作记录</TabsTrigger>
        </TabsList>
        {/* TabsContent */}
      </Tabs>
    </div>
  );
}
```

### 7. 页面文件

#### `src/app/{module}/page.tsx` — 列表页

```typescript
import { {Module}Filter } from "@/components/{module}/{module}-filter";
import { {Module}Table } from "@/components/{module}/{module}-table";

export default function {Module}ListPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Sticky header with title + New button - design-patterns.md §1 */}
      <div className="container mx-auto px-6 py-6 space-y-4">
        {/* Status Tabs (if has statusFlows) - design-patterns.md §9 */}
        <{Module}Filter />
        <{Module}Table />
      </div>
    </div>
  );
}
```

#### `src/app/{module}/[id]/page.tsx` — 详情页

```typescript
import { {Module}Detail } from "@/components/{module}/{module}-detail";
import { {entityName}Mock } from "@/mock/{module}";

export default function {Module}DetailPage({ params }: { params: { id: string } }) {
  const data = {entityName}Mock.find(item => item.id === params.id) || {entityName}Mock[0];

  return (
    <div className="min-h-screen bg-background">
      {/* Header with back button + breadcrumb */}
      <div className="container mx-auto px-6 py-6">
        <{Module}Detail data={data} />
      </div>
    </div>
  );
}
```

#### `src/app/{module}/create/page.tsx` — 新建页

```typescript
import { {Module}Form } from "@/components/{module}/{module}-form";

export default function {Module}CreatePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header with back button */}
      <div className="container mx-auto px-6 py-6">
        <{Module}Form mode="create" />
      </div>
    </div>
  );
}
```

---

## 代码规范

- 所有客户端组件加 `"use client"`
- 页面组件（app/ 下）如果只做组合可以是 Server Component（不加 "use client"）
- 使用 `@/` 路径别名
- Mock 数据直接 import 使用（纯前端 Demo）
- 状态管理用 React `useState`（简单场景）
- 组件 props 使用 interface 定义
- 代码注释用英文

---

## 输出

按顺序写入上述文件。每写完一个文件输出一行进度：`[{module}] 已生成 {filename}`
