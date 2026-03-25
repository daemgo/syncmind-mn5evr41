"use client";

/**
 * Dashboard 设计样本 — 仅供 agent 生成代码时参考，不直接路由展示。
 *
 * 包含：统计卡片、折线图、柱状图、饼图、数据表格、时间线。
 * 所有组件均使用 shadcn/ui + recharts + theme 颜色变量。
 */

import {
  ArrowDown,
  ArrowUp,
  DollarSign,
  Package,
  ShoppingCart,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// ─── Mock Data ──────────────────────────────────────────────

const stats = [
  {
    title: "总收入",
    value: "¥128.4万",
    change: "+12.5%",
    trend: "up" as const,
    icon: DollarSign,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    title: "订单数",
    value: "1,284",
    change: "+8.2%",
    trend: "up" as const,
    icon: ShoppingCart,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    title: "活跃用户",
    value: "3,642",
    change: "-2.1%",
    trend: "down" as const,
    icon: Users,
    color: "text-violet-600",
    bg: "bg-violet-50",
  },
  {
    title: "库存商品",
    value: "856",
    change: "+4.3%",
    trend: "up" as const,
    icon: Package,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
];

const revenueData = [
  { month: "1月", revenue: 18600, orders: 420 },
  { month: "2月", revenue: 22400, orders: 510 },
  { month: "3月", revenue: 19800, orders: 480 },
  { month: "4月", revenue: 26200, orders: 620 },
  { month: "5月", revenue: 24500, orders: 580 },
  { month: "6月", revenue: 31000, orders: 720 },
  { month: "7月", revenue: 28400, orders: 660 },
];

const categoryData = [
  { name: "电子产品", value: 35, fill: "var(--color-chart-1)" },
  { name: "服装鞋帽", value: 25, fill: "var(--color-chart-2)" },
  { name: "食品饮料", value: 20, fill: "var(--color-chart-3)" },
  { name: "家居用品", value: 12, fill: "var(--color-chart-4)" },
  { name: "其他", value: 8, fill: "var(--color-chart-5)" },
];

const recentOrders = [
  { id: "ORD-2024001", customer: "张明科技", amount: "¥12,400", status: "已完成", date: "2024-03-15" },
  { id: "ORD-2024002", customer: "李氏贸易", amount: "¥8,600", status: "发货中", date: "2024-03-15" },
  { id: "ORD-2024003", customer: "王记百货", amount: "¥23,100", status: "待付款", date: "2024-03-14" },
  { id: "ORD-2024004", customer: "赵氏集团", amount: "¥5,800", status: "已完成", date: "2024-03-14" },
  { id: "ORD-2024005", customer: "陈记工坊", amount: "¥16,900", status: "已取消", date: "2024-03-13" },
];

const activities = [
  { time: "10:32", text: "新订单 ORD-2024006 已创建", type: "info" as const },
  { time: "09:15", text: "订单 ORD-2024001 已签收", type: "success" as const },
  { time: "08:40", text: "库存预警：商品 SKU-1042 库存不足", type: "warning" as const },
  { time: "昨天", text: "用户张明科技完成注册", type: "info" as const },
  { time: "昨天", text: "系统完成每日数据备份", type: "success" as const },
];

// ─── Chart Config ───────────────────────────────────────────

const revenueChartConfig: ChartConfig = {
  revenue: { label: "收入", color: "var(--color-chart-1)" },
  orders: { label: "订单", color: "var(--color-chart-2)" },
};

const categoryChartConfig: ChartConfig = {
  value: { label: "占比" },
};

// ─── Status Badge Variant ───────────────────────────────────

function statusVariant(status: string) {
  switch (status) {
    case "已完成": return "default" as const;
    case "发货中": return "secondary" as const;
    case "待付款": return "outline" as const;
    case "已取消": return "destructive" as const;
    default: return "outline" as const;
  }
}

// ─── Component ──────────────────────────────────────────────

export default function DashboardExample() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-2xl font-semibold tracking-tight">工作台</h1>
          <p className="text-sm text-muted-foreground">数据概览与业务动态</p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6 space-y-6">
        {/* Stats Cards */}
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

        {/* Charts Row */}
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Line + Bar Chart */}
          <Card className="lg:col-span-2 hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">收入趋势</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={revenueChartConfig} className="h-[280px] w-full">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" tick={{ fill: "var(--color-muted-foreground)" }} />
                  <YAxis className="text-xs" tick={{ fill: "var(--color-muted-foreground)" }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--color-chart-1)"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "var(--color-chart-1)" }}
                    activeDot={{ r: 6 }}
                  />
                  <Bar dataKey="orders" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} opacity={0.3} />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Pie Chart */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">品类分布</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={categoryChartConfig} className="h-[220px] w-full">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    strokeWidth={2}
                    stroke="var(--color-background)"
                  >
                    {categoryData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {categoryData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2 text-xs">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.fill }} />
                    <span className="text-muted-foreground">{item.name}</span>
                    <span className="ml-auto font-medium">{item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table + Activity */}
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Recent Orders Table */}
          <Card className="lg:col-span-2 hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">最近订单</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>订单号</TableHead>
                    <TableHead>客户</TableHead>
                    <TableHead>金额</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead className="text-right">日期</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-mono text-sm">{order.id}</TableCell>
                      <TableCell>{order.customer}</TableCell>
                      <TableCell className="font-medium">{order.amount}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(order.status)}>{order.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">{order.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">最近动态</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.map((activity, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="relative flex flex-col items-center">
                      <div
                        className={`h-2 w-2 rounded-full mt-1.5 ${
                          activity.type === "success"
                            ? "bg-emerald-500"
                            : activity.type === "warning"
                              ? "bg-amber-500"
                              : "bg-blue-500"
                        }`}
                      />
                      {i < activities.length - 1 && (
                        <div className="w-px flex-1 bg-border mt-1" />
                      )}
                    </div>
                    <div className="pb-4">
                      <p className="text-sm leading-snug">{activity.text}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
