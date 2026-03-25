# Design Patterns Reference

This file distills design patterns from `src/_examples/dashboard.tsx` and `src/_examples/list-page.tsx`. Codegen agents reference this instead of reading raw 600+ line sample files.

---

## 1. Page Layout Pattern

Every page follows this structure:

```tsx
<div className="min-h-screen bg-background">
  {/* Sticky Header */}
  <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
    <div className="container mx-auto px-6 py-4">
      <h1 className="text-2xl font-semibold tracking-tight">{pageTitle}</h1>
      <p className="text-sm text-muted-foreground">{pageDescription}</p>
    </div>
  </div>

  <div className="container mx-auto px-6 py-6 space-y-6">
    {/* Page Content */}
  </div>
</div>
```

List pages add a button in the header:

```tsx
<div className="container mx-auto px-6 py-4 flex items-center justify-between">
  <div>
    <h1>...</h1>
    <p>...</p>
  </div>
  <Button>
    <Plus className="mr-1.5 h-4 w-4" />
    新建{entityName}
  </Button>
</div>
```

---

## 2. Stats Card Pattern

```tsx
<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
  {stats.map((stat) => (
    <Card key={stat.title} className="hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
          <div className={`${stat.bg} ${stat.color} rounded-lg p-2`}>
            <stat.icon className="h-4 w-4" />
          </div>
        </div>
        <p className="mt-2 text-2xl font-bold">{stat.value}</p>
        <div className="mt-1 flex items-center gap-1 text-xs">
          {stat.trend === "up" ? (
            <ArrowUp className="h-3 w-3 text-emerald-600" />
          ) : (
            <ArrowDown className="h-3 w-3 text-red-500" />
          )}
          <span className={stat.trend === "up" ? "text-emerald-600" : "text-red-500"}>
            {stat.change}
          </span>
          <span className="text-muted-foreground">较上月</span>
        </div>
      </CardContent>
    </Card>
  ))}
</div>
```

**Required elements**: icon with colored bg circle (`rounded-lg p-2`), trend arrow (ArrowUp/ArrowDown), percentage change, comparison text.

**Icon color pairs**: `text-emerald-600 / bg-emerald-50`, `text-blue-600 / bg-blue-50`, `text-violet-600 / bg-violet-50`, `text-amber-600 / bg-amber-50`.

---

## 3. Chart Pattern (recharts + ChartContainer)

**MUST use**: `recharts` + shadcn `ChartContainer` + `ChartTooltip` + CSS variable colors.

**NEVER use**: `<div>图表占位</div>` or placeholder divs.

### ChartConfig

```tsx
const chartConfig: ChartConfig = {
  revenue: { label: "收入", color: "var(--color-chart-1)" },
  orders: { label: "订单", color: "var(--color-chart-2)" },
};
```

### Line/Bar Chart

```tsx
<ChartContainer config={chartConfig} className="h-[280px] w-full">
  <LineChart data={data}>
    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
    <XAxis dataKey="month" className="text-xs" tick={{ fill: "var(--color-muted-foreground)" }} />
    <YAxis className="text-xs" tick={{ fill: "var(--color-muted-foreground)" }} />
    <ChartTooltip content={<ChartTooltipContent />} />
    <Line type="monotone" dataKey="revenue" stroke="var(--color-chart-1)" strokeWidth={2}
          dot={{ r: 4, fill: "var(--color-chart-1)" }} activeDot={{ r: 6 }} />
  </LineChart>
</ChartContainer>
```

### Pie Chart

```tsx
<ChartContainer config={categoryChartConfig} className="h-[220px] w-full">
  <PieChart>
    <ChartTooltip content={<ChartTooltipContent />} />
    <Pie data={data} dataKey="value" nameKey="name"
         cx="50%" cy="50%" innerRadius={50} outerRadius={80}
         strokeWidth={2} stroke="var(--color-background)">
      {data.map((entry) => (
        <Cell key={entry.name} fill={entry.fill} />
      ))}
    </Pie>
  </PieChart>
</ChartContainer>
```

**Available chart colors**: `var(--color-chart-1)` through `var(--color-chart-5)`. Pie chart data uses `fill: "var(--color-chart-N)"`.

**Pie chart legend**: Grid layout below chart:

```tsx
<div className="mt-2 grid grid-cols-2 gap-2">
  {data.map((item) => (
    <div key={item.name} className="flex items-center gap-2 text-xs">
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.fill }} />
      <span className="text-muted-foreground">{item.name}</span>
      <span className="ml-auto font-medium">{item.value}%</span>
    </div>
  ))}
</div>
```

---

## 4. Data Table Pattern

```tsx
<Card className="hover:shadow-md transition-shadow">
  <CardHeader className="pb-2 flex flex-row items-center justify-between">
    <CardTitle className="text-base font-medium">
      {tableName}
      <span className="ml-2 text-sm font-normal text-muted-foreground">共 {count} 条</span>
    </CardTitle>
  </CardHeader>
  <CardContent>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Column</TableHead>
          {/* ... */}
          <TableHead className="w-[50px]" /> {/* Actions column */}
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id} className="cursor-pointer hover:bg-muted/50">
            <TableCell className="font-mono text-sm font-medium">{item.id}</TableCell>
            {/* ... */}
            <TableCell>
              <Badge variant={statusVariant(item.status)}>{item.status}</Badge>
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>查看详情</DropdownMenuItem>
                  <DropdownMenuItem>编辑</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">删除</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </CardContent>
</Card>
```

**Key rules**:
- Row hover: `cursor-pointer hover:bg-muted/50`
- ID column: `font-mono text-sm font-medium`
- Money column: `text-right font-medium`, format `¥X,XXX.XX`
- Long text: `max-w-[180px] truncate`
- Actions: DropdownMenu with MoreHorizontal icon, NOT inline buttons
- Status: Badge with variant function

---

## 5. Filter Bar Pattern

```tsx
<Card className="hover:shadow-md transition-shadow">
  <CardContent className="p-4">
    <div className="flex flex-wrap items-center gap-3">
      {/* Keyword search */}
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="搜索..." className="pl-9" />
      </div>
      {/* Status/category select */}
      <Select>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="状态筛选" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">全部状态</SelectItem>
          {/* from dictionary */}
        </SelectContent>
      </Select>
      {/* Reset */}
      <Button variant="ghost" size="sm" className="text-muted-foreground">重置</Button>
    </div>
  </CardContent>
</Card>
```

---

## 6. Pagination Pattern

```tsx
<div className="mt-4 flex items-center justify-between">
  <p className="text-sm text-muted-foreground">显示 1-{pageSize} 条，共 {total} 条</p>
  <div className="flex items-center gap-1">
    <Button variant="outline" size="sm" disabled={page === 1}>
      <ChevronLeft className="h-4 w-4" />
    </Button>
    {/* Page buttons */}
    <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">{currentPage}</Button>
    <Button variant="outline" size="sm">
      <ChevronRight className="h-4 w-4" />
    </Button>
  </div>
</div>
```

---

## 7. Status Badge Pattern

```tsx
function statusVariant(status: string) {
  // Map status to shadcn Badge variants
  // "completed/success" → "default"
  // "in_progress/processing" → "secondary"
  // "pending/waiting" → "outline"
  // "cancelled/failed" → "destructive"
}
```

Use Badge colors from `globalRules.statusFlows[].statuses[].color`:
- `gray` → `variant="outline"`
- `blue` → `variant="secondary"`
- `green` → `variant="default"`
- `red` → `variant="destructive"`
- `yellow` → custom: `className="border-amber-200 bg-amber-50 text-amber-700"`
- `purple` → custom: `className="border-purple-200 bg-purple-50 text-purple-700"`

---

## 8. Timeline Pattern

```tsx
<div className="space-y-4">
  {activities.map((activity, i) => (
    <div key={i} className="flex gap-3">
      <div className="relative flex flex-col items-center">
        <div className={`h-2 w-2 rounded-full mt-1.5 ${dotColor(activity.type)}`} />
        {i < activities.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
      </div>
      <div className="pb-4">
        <p className="text-sm leading-snug">{activity.text}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{activity.time}</p>
      </div>
    </div>
  ))}
</div>
```

Dot colors: success → `bg-emerald-500`, warning → `bg-amber-500`, info → `bg-blue-500`.

---

## 9. Status Tabs Pattern (List Page)

```tsx
<Tabs defaultValue="全部">
  <TabsList>
    {statusTabs.map((tab) => (
      <TabsTrigger key={tab} value={tab} className="text-sm">{tab}</TabsTrigger>
    ))}
  </TabsList>
</Tabs>
```

Place above filter bar. Tab values from `globalRules.statusFlows` statuses.

---

## 10. Card Hover Rule

**ALL Card components** must have: `className="hover:shadow-md transition-shadow"`

---

## 11. Color Token Rules

- Use semantic tokens: `text-muted-foreground`, `bg-background`, `border-border`
- Chart colors: `var(--color-chart-1)` through `var(--color-chart-5)`
- Icon accent colors (stats cards only): `text-emerald-600`, `text-blue-600`, `text-violet-600`, `text-amber-600` with matching `bg-*-50`
- **NEVER** hardcode hex colors in component code
- Trend indicators: `text-emerald-600` (up), `text-red-500` (down)

---

## 12. Import Reference

Common imports for generated pages:

```tsx
// Icons
import { ArrowUp, ArrowDown, Plus, Search, MoreHorizontal, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";

// shadcn/ui
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Charts (dashboard only)
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, XAxis, YAxis } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
```
