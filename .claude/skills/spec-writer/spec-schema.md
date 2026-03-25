# Spec.json Schema 定义

spec.json 的完整 TypeScript 接口定义。spec-writer 生成时和所有下游消费者必须严格遵守此契约。

---

## 顶层结构

```typescript
interface SpecDocument {
  // ===== 元信息 =====
  meta: {
    version: string;           // spec 版本号，如 "1.0.0"
    name: string;              // 产品名称
    description: string;       // 一句话描述
    createdAt: string;         // 创建时间
    updatedAt: string;         // 更新时间
    status: "draft" | "review" | "approved";
    sourceSolution: string;    // 来源方案版本，如 "v1"
    sourceSolutionScene: string; // 来源方案场景，如 "normal"
  };

  // ===== 第一部分：产品概述 =====
  overview: {
    background: string;        // 项目背景（简洁版）
    goals: string[];           // 产品目标（3-5条）
    targetUsers: {
      role: string;            // 角色名称
      description: string;     // 角色描述
      needs: string[];         // 核心诉求
    }[];
    scope: {
      included: string[];      // 范围内
      excluded: string[];      // 范围外（明确不做的）
    };
  };

  // ===== 第二部分：信息架构 =====
  architecture: {
    sitemap: SitemapNode[];    // 站点地图/导航结构
  };

  // ===== 第三部分：模块定义 =====
  modules: ModuleSpec[];

  // ===== 第四部分：全局规则 =====
  globalRules: {
    roles: RoleSpec[];         // 角色权限定义
    dictionary: DictItem[];    // 数据字典（下拉选项等）
    statusFlows: StatusFlow[]; // 状态流转定义
  };
}
```

---

## 站点地图

```typescript
interface SitemapNode {
  id: string;                  // 唯一标识
  name: string;                // 显示名称
  route: string;               // 路由路径
  icon?: string;               // 图标名称（如 "users", "file-text"）
  children?: SitemapNode[];    // 子节点
}
```

---

## 模块定义

```typescript
interface ModuleSpec {
  id: string;                  // 模块ID，如 "user-management"
  name: string;                // 模块名称，如 "用户管理"
  description: string;         // 模块描述
  locked: boolean;             // 是否锁定（人工定制后锁定，AI 跳过）
  lockedReason?: string;       // 锁定原因
  pages: PageSpec[];           // 模块下的页面
}
```

---

## 页面定义

```typescript
interface PageSpec {
  id: string;                  // 页面ID
  name: string;                // 页面名称
  route: string;               // 路由路径
  description: string;         // 页面描述
  locked: boolean;             // 是否锁定
  lockedReason?: string;
  layout: PageLayout;          // 页面布局类型
  sections: SectionSpec[];     // 页面区块
}

type PageLayout =
  | "list"                     // 列表页：表格 + 筛选 + 操作
  | "detail"                   // 详情页：信息展示
  | "form"                     // 表单页：数据录入
  | "dashboard"                // 仪表盘：多卡片/图表
  | "steps"                    // 步骤页：分步操作
  | "custom";                  // 自定义布局
```

---

## 区块定义

```typescript
interface SectionSpec {
  id: string;
  name: string;                // 区块名称（如"基础信息"、"操作记录"）
  type: SectionType;           // 区块类型
  description: string;         // 区块描述
  fields?: FieldSpec[];        // 字段列表（表单/表格类）
  columns?: ColumnSpec[];      // 表格列定义（table 类型专用）
  actions?: ActionSpec[];      // 操作按钮
  rules?: RuleSpec[];          // 业务规则
  config?: SectionConfig;      // 区块配置
}

type SectionType =
  | "table"                    // 数据表格
  | "form"                     // 表单
  | "card"                     // 信息卡片
  | "cards"                    // 卡片列表
  | "chart"                    // 图表
  | "tabs"                     // 标签页
  | "steps"                    // 步骤条
  | "timeline"                 // 时间线
  | "description"              // 描述列表
  | "statistic"                // 统计数值
  | "custom";                  // 自定义

interface SectionConfig {
  // 表格配置
  pagination?: boolean;        // 是否分页
  pageSize?: number;           // 每页条数
  selectable?: boolean;        // 是否可选择
  sortable?: boolean;          // 是否可排序

  // 表单配置
  layout?: "vertical" | "horizontal" | "inline";
  columns?: number;            // 几列布局

  // 图表配置
  chartType?: "bar" | "line" | "pie" | "area";

  // 通用配置
  collapsible?: boolean;       // 是否可折叠
  defaultCollapsed?: boolean;  // 默认折叠
}
```

**spec-writer 禁止使用 SectionType 和 PageLayout 枚举之外的值。**

---

## 字段定义

```typescript
interface FieldSpec {
  id: string;
  name: string;                // 字段标签（显示名）
  fieldKey: string;            // 字段 key（代码用）
  type: FieldType;             // 字段类型
  required: boolean;           // 是否必填
  placeholder?: string;        // 占位提示
  defaultValue?: any;          // 默认值
  options?: OptionItem[];      // 选项（select/radio/checkbox 类型）
  optionSource?: string;       // 选项来源（引用数据字典 ID）
  validation?: ValidationRule[];
  visible?: VisibilityRule;    // 显示条件
  editable?: EditableRule;     // 可编辑条件
  helpText?: string;           // 帮助文本
  width?: string;              // 宽度（表格列宽）
}

type FieldType =
  | "text" | "textarea" | "number" | "money" | "percent"
  | "date" | "datetime" | "daterange" | "time"
  | "select" | "multiselect" | "radio" | "checkbox" | "switch"
  | "upload" | "image" | "richtext"
  | "cascader" | "treeselect" | "user" | "department"
  | "address" | "phone" | "email" | "idcard" | "url"
  | "color" | "rate" | "slider" | "custom";

interface OptionItem {
  label: string;
  value: string;
  color?: string;
  disabled?: boolean;
}

interface ValidationRule {
  type: "required" | "length" | "pattern" | "range" | "custom";
  rule: string;
  message: string;
  min?: number;
  max?: number;
}

interface VisibilityRule {
  condition: string;
  description: string;
}

interface EditableRule {
  condition: string;
  description: string;
}
```

---

## 表格列定义

```typescript
interface ColumnSpec {
  id: string;
  name: string;                // 列标题
  fieldKey: string;            // 数据字段
  type: ColumnType;            // 列类型
  width?: string;
  fixed?: "left" | "right";
  sortable?: boolean;
  filterable?: boolean;
  align?: "left" | "center" | "right";
  render?: ColumnRender;
}

type ColumnType =
  | "text" | "number" | "money" | "date" | "datetime"
  | "tag" | "status" | "avatar" | "image"
  | "link" | "progress" | "action";

interface ColumnRender {
  type: "tag" | "status" | "link" | "progress" | "custom";
  config?: {
    colorMap?: Record<string, string>;
    linkPattern?: string;
  };
}
```

---

## 操作定义

```typescript
interface ActionSpec {
  id: string;
  name: string;
  type: "primary" | "default" | "danger" | "link" | "icon";
  icon?: string;
  position: ActionPosition;
  confirm?: ConfirmConfig;
  behavior: ActionBehavior;
  permission?: string;
  visible?: VisibilityRule;
  disabled?: EditableRule;
}

type ActionPosition =
  | "toolbar" | "toolbar-left" | "toolbar-right"
  | "row" | "row-more"
  | "form-footer"
  | "card-header" | "card-footer";

interface ConfirmConfig {
  title: string;
  content: string;
  type: "info" | "warning" | "danger";
}

interface ActionBehavior {
  type: "navigate" | "modal" | "drawer" | "action" | "download" | "print";
  target?: string;
  params?: Record<string, string>;
  description: string;
  successMessage?: string;
}
```

---

## 业务规则

```typescript
interface RuleSpec {
  id: string;
  name: string;
  description: string;
  trigger: "onLoad" | "onChange" | "onSubmit" | "onAction";
  condition: string;
  action: RuleAction;
}

interface RuleAction {
  type: "validate" | "calculate" | "setField" | "setVisible" | "setEditable" | "message";
  config: Record<string, any>;
}
```

---

## 全局规则

```typescript
interface RoleSpec {
  id: string;
  name: string;
  description: string;
  permissions: {
    module: string;
    actions: string[];         // view/create/edit/delete/export/...
    dataScope?: string;        // all/department/self
  }[];
}

interface DictItem {
  id: string;                  // 字典ID，供字段 optionSource 引用
  name: string;
  category: string;
  items: {
    label: string;
    value: string;
    color?: string;
    icon?: string;
    disabled?: boolean;
  }[];
}

interface StatusFlow {
  id: string;
  entity: string;
  description: string;
  statuses: {
    id: string;
    name: string;
    color: string;             // gray/blue/green/red/yellow/purple/orange
    description: string;
  }[];
  transitions: {
    from: string;
    to: string;
    action: string;
    actor?: string;
    condition?: string;
  }[];
}
```
