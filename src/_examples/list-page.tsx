"use client";

/**
 * 列表页设计样本 — 仅供 agent 生成代码时参考，不直接路由展示。
 *
 * 包含：筛选栏、数据表格（排序、状态 Badge、操作列）、分页、空状态。
 * 所有组件均使用 shadcn/ui + theme 颜色变量。
 */

import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Plus,
  Search,
  SlidersHorizontal,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ─── Mock Data ──────────────────────────────────────────────

const orders = [
  {
    id: "ORD-2024001",
    customer: "张明科技有限公司",
    contact: "张明",
    amount: 124000,
    items: 5,
    status: "已完成",
    payment: "已付款",
    date: "2024-03-15",
  },
  {
    id: "ORD-2024002",
    customer: "李氏国际贸易",
    contact: "李婷",
    amount: 86000,
    items: 3,
    status: "发货中",
    payment: "已付款",
    date: "2024-03-15",
  },
  {
    id: "ORD-2024003",
    customer: "王记百货连锁",
    contact: "王大力",
    amount: 231000,
    items: 12,
    status: "待确认",
    payment: "待付款",
    date: "2024-03-14",
  },
  {
    id: "ORD-2024004",
    customer: "赵氏集团",
    contact: "赵刚",
    amount: 58000,
    items: 2,
    status: "已完成",
    payment: "已付款",
    date: "2024-03-14",
  },
  {
    id: "ORD-2024005",
    customer: "陈记工坊",
    contact: "陈晓",
    amount: 169000,
    items: 8,
    status: "已取消",
    payment: "已退款",
    date: "2024-03-13",
  },
  {
    id: "ORD-2024006",
    customer: "孙氏电子科技",
    contact: "孙鹏",
    amount: 42000,
    items: 4,
    status: "待确认",
    payment: "待付款",
    date: "2024-03-13",
  },
  {
    id: "ORD-2024007",
    customer: "周记物流",
    contact: "周瑜",
    amount: 95000,
    items: 6,
    status: "发货中",
    payment: "已付款",
    date: "2024-03-12",
  },
];

const statusTabs = ["全部", "待确认", "发货中", "已完成", "已取消"];

// ─── Helpers ────────────────────────────────────────────────

function statusVariant(status: string) {
  switch (status) {
    case "已完成": return "default" as const;
    case "发货中": return "secondary" as const;
    case "待确认": return "outline" as const;
    case "已取消": return "destructive" as const;
    default: return "outline" as const;
  }
}

function paymentColor(payment: string) {
  switch (payment) {
    case "已付款": return "text-emerald-600";
    case "待付款": return "text-amber-600";
    case "已退款": return "text-muted-foreground";
    default: return "";
  }
}

function formatMoney(amount: number) {
  return `¥${(amount / 100).toLocaleString("zh-CN", { minimumFractionDigits: 2 })}`;
}

// ─── Component ──────────────────────────────────────────────

export default function ListPageExample() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">销售订单</h1>
            <p className="text-sm text-muted-foreground">管理所有销售订单和发货状态</p>
          </div>
          <Button>
            <Plus className="mr-1.5 h-4 w-4" />
            新建订单
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6 space-y-4">
        {/* Status Tabs */}
        <Tabs defaultValue="全部">
          <TabsList>
            {statusTabs.map((tab) => (
              <TabsTrigger key={tab} value={tab} className="text-sm">
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Filters */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="搜索订单号、客户名称..." className="pl-9" />
              </div>
              <Select>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="付款状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="paid">已付款</SelectItem>
                  <SelectItem value="unpaid">待付款</SelectItem>
                  <SelectItem value="refunded">已退款</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="时间范围" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">近 7 天</SelectItem>
                  <SelectItem value="30d">近 30 天</SelectItem>
                  <SelectItem value="90d">近 90 天</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5" />
                更多筛选
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                重置
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-medium">
              订单列表
              <span className="ml-2 text-sm font-normal text-muted-foreground">共 {orders.length} 条</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[140px]">订单号</TableHead>
                  <TableHead>客户</TableHead>
                  <TableHead>联系人</TableHead>
                  <TableHead className="text-right">金额</TableHead>
                  <TableHead className="text-center">商品数</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>付款</TableHead>
                  <TableHead>日期</TableHead>
                  <TableHead className="w-[50px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-mono text-sm font-medium">{order.id}</TableCell>
                    <TableCell className="max-w-[180px] truncate">{order.customer}</TableCell>
                    <TableCell className="text-muted-foreground">{order.contact}</TableCell>
                    <TableCell className="text-right font-medium">{formatMoney(order.amount)}</TableCell>
                    <TableCell className="text-center">{order.items}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(order.status)}>{order.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className={`text-sm ${paymentColor(order.payment)}`}>{order.payment}</span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{order.date}</TableCell>
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

            {/* Pagination */}
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">显示 1-7 条，共 7 条</p>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" disabled>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">1</Button>
                <Button variant="outline" size="sm">2</Button>
                <Button variant="outline" size="sm">3</Button>
                <Button variant="outline" size="sm">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
