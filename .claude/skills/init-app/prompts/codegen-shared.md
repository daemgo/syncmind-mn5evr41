# 共享基础设施代码生成

你是一个代码生成 Agent。基于 init-plan.json 生成项目的共享基础设施代码：布局、导航、数据字典。

核心原则：这些文件是所有模块的依赖基础，必须先于模块代码生成。代码必须可编译。

---

## 输入数据

| 数据 | 来源 |
|------|------|
| `{sitemap}` | init-plan.json 的 `sitemap` |
| `{dictionary}` | init-plan.json 的 `globalRules.dictionary` |
| `{statusFlows}` | init-plan.json 的 `globalRules.statusFlows` |
| `{modules}` | init-plan.json 的 `modules[]`（仅取 moduleName 和 routeBase 用于导航） |

---

## 必须参考

生成代码前，读取 `design-patterns.md` 了解设计规范。所有代码必须符合其中定义的模式。

---

## 生成文件清单

按以下顺序生成（依赖关系决定顺序）：

### 1. `src/lib/dict.ts` — 数据字典

```typescript
// Dictionary items from spec globalRules
export const dictionaries = {
  "{dictId}": [
    { label: "{label}", value: "{value}", color: "{color}" },
    // ...
  ],
  // ... repeat for each dictionary
} as const;

// Helper: get options for a dictionary
export function getDictOptions(dictId: string) {
  return dictionaries[dictId as keyof typeof dictionaries] || [];
}

// Helper: get label for a value
export function getDictLabel(dictId: string, value: string): string {
  const options = getDictOptions(dictId);
  return options.find(o => o.value === value)?.label || value;
}

// Helper: get color for a value
export function getDictColor(dictId: string, value: string): string | undefined {
  const options = getDictOptions(dictId);
  return options.find(o => o.value === value)?.color;
}
```

从 `{dictionary}` 和 `{statusFlows}` 生成。statusFlows 中的 statuses 也要作为 dictionary 项生成。

### 2. `src/components/layout/sidebar.tsx` — 侧边导航

基于 `{sitemap}` 生成菜单配置：

```typescript
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
// Import lucide icons based on sitemap[].icon
import { Home, /* ... */ } from "lucide-react";

const menuItems = [
  {
    id: "dashboard",
    name: "工作台",
    icon: Home,
    route: "/",
  },
  // ... from sitemap
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-20 h-screen w-60 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col">
      {/* Logo/Brand */}
      <div className="px-4 py-5 border-b border-sidebar-border">
        <h2 className="text-lg font-semibold text-sidebar-foreground">{systemName}</h2>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {menuItems.map((item) => (
          <Link key={item.id} href={item.route}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              pathname === item.route || pathname.startsWith(item.route + "/")
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            )}>
            <item.icon className="h-4 w-4" />
            {item.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
```

对于有 children 的菜单项，用可折叠的子菜单实现。

图标映射：从 sitemap 的 `icon` 字段查找对应的 lucide-react 图标。常用映射：
- Home, Users, ShoppingCart, Package, FileText, BarChart3, Settings, Inbox, Calendar, FolderOpen, Briefcase, CreditCard, TrendingUp, Layers

### 3. `src/components/layout/header.tsx` — 顶部栏

```typescript
"use client";

export function Header() {
  return (
    <header className="h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10 flex items-center px-6">
      {/* Breadcrumb or page title injected by page */}
    </header>
  );
}
```

保持简洁，具体页面标题由各页面自己渲染（参考 design-patterns.md §1）。

### 4. `src/app/layout.tsx` — 根布局

```typescript
import type { Metadata } from "next";
import { Sidebar } from "@/components/layout/sidebar";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "{systemName}",
  description: "{systemDescription}",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-background font-sans antialiased">
        <Sidebar />
        <main className="ml-60 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
```

**注意**：
- 保留 `globals.css` 的导入
- 保留项目已有的字体配置（如果 layout.tsx 已存在）
- 使用 `ml-60` 与 sidebar 宽度 `w-60` 匹配

---

## 代码规范

- 所有组件使用 `"use client"` 指令（Next.js App Router client components）
- 使用 `@/` 路径别名
- 使用 `cn()` from `@/lib/utils` 做条件 className
- 使用语义化颜色 token，不硬编码颜色
- 代码注释用英文

---

## 输出

按顺序写入上述文件。每写完一个文件输出一行进度。
