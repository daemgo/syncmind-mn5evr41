# Dashboard 首页代码生成

你是一个代码生成 Agent。基于 init-plan.json 的 dashboard 计划生成系统首页（仪表盘）。

核心原则：Dashboard 是用户打开系统看到的第一个页面，必须展示核心指标、趋势图表、最近数据。代码质量对标 design-patterns.md 中的设计规范。

---

## 输入数据

| 数据 | 来源 |
|------|------|
| `{dashboardPlan}` | init-plan.json 的 `dashboard` |
| `{modules}` | init-plan.json 的 `modules[]`（用于引用 mock 数据和类型） |
| `{dictionary}` | init-plan.json 的 `globalRules.dictionary` |

---

## 必须参考

生成代码前，读取 `design-patterns.md`，特别是以下章节：
- §1 Page Layout Pattern（sticky header）
- §2 Stats Card Pattern（图标 + 趋势 + 环比）
- §3 Chart Pattern（recharts + ChartContainer）
- §4 Data Table Pattern（最近数据表格）
- §8 Timeline Pattern（最近动态）

**必须严格遵循这些模式。**

---

## 生成文件

### `src/app/page.tsx` — 系统首页

**MUST NOT** 是默认的 Next.js 欢迎页，**MUST** 是 Dashboard 仪表盘。

```typescript
"use client";

// Icons from dashboardPlan.stats
import { ArrowUp, ArrowDown, /* stat icons */ } from "lucide-react";
// recharts
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, XAxis, YAxis } from "recharts";
// shadcn/ui
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// Mock data from modules
import { {module1}Mock } from "@/mock/{module1}";
// ...
```

---

## Dashboard 结构

### 1. Stats Cards（统计卡片行）

基于 `dashboardPlan.stats` 生成 3-4 个统计卡片。

**必须遵循 design-patterns.md §2 的完整模式**：
- 每个卡片：标题 + 大号数值 + 图标（彩色背景圆角框）+ 趋势箭头 + 环比数据
- 使用 mock 数据计算数值（如 `{module}Mock.length` 作为总数）
- 趋势数据用 mock（正/负百分比）
- 图标色对：emerald/blue/violet/amber

布局：`grid gap-4 sm:grid-cols-2 lg:grid-cols-4`

### 2. Charts Row（图表行）

基于 `dashboardPlan.charts` 生成 1-2 个图表。

**必须遵循 design-patterns.md §3**：
- 使用 `ChartContainer` + `ChartConfig` + `ChartTooltip`
- 颜色用 CSS 变量：`var(--color-chart-1)` 到 `var(--color-chart-5)`
- **禁止** `<div>图表占位</div>` 或任何占位符

常用图表组合：
- 主图（`lg:col-span-2`）：折线图或柱状图（趋势数据）
- 副图（`lg:col-span-1`）：饼图（分类分布）

Mock 图表数据直接内联定义（月份趋势、分类分布等）。

布局：`grid gap-4 lg:grid-cols-3`

### 3. Recent Data + Activity（底部行）

基于 `dashboardPlan.recentTable` 生成最近数据表格。

**必须遵循 design-patterns.md §4**：
- Card 包装
- 简化的表格（4-5 列）
- 状态列用 Badge
- 行可点击

如果有关联模块，加一个 Activity Timeline（design-patterns.md §8）：
- 最近 5 条操作记录
- 不同类型的圆点颜色

布局：`grid gap-4 lg:grid-cols-3`（表格 `lg:col-span-2`，动态 `lg:col-span-1`）

---

## Mock 数据策略

Dashboard 的 mock 数据有两个来源：

1. **引用模块 mock**：从已生成的 mock 文件 import，用于统计卡片和最近数据表格
2. **内联 mock**：图表趋势数据（月份/金额/数量）和活动动态，直接定义在 page.tsx 中

```typescript
// Chart data (inline mock)
const trendData = [
  { month: "1月", value1: 18600, value2: 420 },
  // ... 7 months
];

// Category data for pie chart (inline mock)
const categoryData = [
  { name: "分类1", value: 35, fill: "var(--color-chart-1)" },
  // ...
];

// Activity data (inline mock)
const activities = [
  { time: "10:32", text: "新记录已创建", type: "info" as const },
  // ... 5 items
];
```

---

## ChartConfig 要求

每个图表必须定义 `ChartConfig`：

```typescript
const trendChartConfig: ChartConfig = {
  value1: { label: "指标1", color: "var(--color-chart-1)" },
  value2: { label: "指标2", color: "var(--color-chart-2)" },
};
```

---

## 输出

生成 `src/app/page.tsx`，输出进度：`[Dashboard] 已生成首页仪表盘：N 个统计卡片 + M 个图表 + 最近数据表格`
