# Component Mapping Reference

Codegen agents use this file to map spec.json types to shadcn/ui components. See `_contracts/data-flow.md` for the authoritative enum definitions.

---

## Section Type → Component

| `section.type` | Primary Components | Layout Pattern |
|---------------|--------------------|----------------|
| `table` | `Table`, `TableBody`, `TableCell`, `TableHead`, `TableHeader`, `TableRow` | Card wrapper + Table + pagination + DropdownMenu actions |
| `form` | `Form`, `Input`, `Select`, `Textarea`, `Button` | Card wrapper + grid layout (`grid grid-cols-2 gap-4`) + submit/cancel buttons |
| `card` | `Card`, `CardContent`, `CardHeader`, `CardTitle` | Single info card with key-value pairs |
| `cards` | `Card` (multiple) | `grid gap-4 sm:grid-cols-2 lg:grid-cols-3` card list |
| `chart` | `recharts` (BarChart/LineChart/PieChart) + `ChartContainer` + `ChartTooltip` | Card wrapper + ChartContainer with CSS variable colors |
| `tabs` | `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` | Tab navigation with content panels |
| `steps` | `div` + `Badge` + flex connecting lines | `flex items-center` + Badge for current step + dashed lines between |
| `timeline` | `div` + left border line + dots | `border-l-2 border-muted` + positioned dots (see design-patterns.md §8) |
| `description` | `dl` + `grid grid-cols-2` | Label in `text-muted-foreground`, value in `font-medium` |
| `statistic` | `Card` + large number + trend | Number `text-3xl font-bold` + ArrowUp/ArrowDown + percentage (see design-patterns.md §2) |
| `custom` | Custom implementation | Follow closest matching pattern above |

---

## Field Type → Form Component

| `field.type` | Component | Notes |
|-------------|-----------|-------|
| `text` | `<Input />` | |
| `textarea` | `<Textarea />` | |
| `number` | `<Input type="number" />` | |
| `money` | `<Input />` + `¥` prefix | Wrap in `<div className="relative">`, prefix as `absolute left-3` span |
| `percent` | `<Input type="number" />` + `%` suffix | |
| `date` | `<Input type="date" />` | Use native date input (simple mock demo) |
| `datetime` | `<Input type="datetime-local" />` | |
| `daterange` | Two `<Input type="date" />` with `~` separator | Wrap in flex with gap-2 |
| `time` | `<Input type="time" />` | |
| `select` | `<Select>` + `<SelectContent>` + `<SelectItem>` | Options from `optionSource` → `globalRules.dictionary` |
| `multiselect` | Multiple `<Badge>` with remove + `<Select>` | Simplified: use Select with multi display |
| `radio` | `<RadioGroup>` + `<RadioGroupItem>` | |
| `checkbox` | `<Checkbox>` | |
| `switch` | `<Switch>` | |
| `upload` | `<Button variant="outline">` + upload icon | Placeholder: click shows alert("上传功能演示") |
| `image` | Same as upload | |
| `richtext` | `<Textarea rows={6} />` | Simplified for mock demo |
| `cascader` | Two linked `<Select>` | |
| `treeselect` | `<Select>` | Simplified for mock demo |
| `user` | `<Select>` with user names | |
| `department` | `<Select>` with department names | |
| `address` | `<Input />` | |
| `phone` | `<Input type="tel" />` | |
| `email` | `<Input type="email" />` | |
| `idcard` | `<Input />` | |
| `url` | `<Input type="url" />` | |
| `color` | `<Input type="color" />` | |
| `rate` | Stars using `★` characters | Simplified for mock demo |
| `slider` | `<Input type="range" />` | |
| `custom` | `<Input />` | Default fallback |

---

## Column Type → Table Cell Rendering

| `column.type` | Rendering | Example |
|--------------|-----------|---------|
| `text` | Direct display | `{value}` |
| `number` | Formatted number | `{value.toLocaleString()}` |
| `money` | Money format | `¥${(value/100).toLocaleString("zh-CN", { minimumFractionDigits: 2 })}` |
| `date` | Date format | `{value}` (already formatted string in mock) |
| `datetime` | DateTime format | `{value}` |
| `tag` | `<Badge variant="outline">` | |
| `status` | `<Badge variant={statusVariant(value)}>` | Use statusVariant helper function |
| `link` | `<Link>` or `<span className="text-primary cursor-pointer">` | Navigate to detail page |
| `action` | `<DropdownMenu>` | MoreHorizontal icon button (see design-patterns.md §4) |

---

## Page Layout → Page Structure

| `page.layout` | Structure |
|---------------|-----------|
| `list` | Sticky header + Status tabs + Filter bar + Data table + Pagination |
| `detail` | Sticky header (with back button) + Breadcrumb + Info card (description) + Tabs for related data |
| `form` | Sticky header + Form card with all fields + Submit/Cancel buttons |
| `dashboard` | Sticky header + Stats cards grid + Charts row + Recent data table |
| `steps` | Sticky header + Step indicator + Current step content + Next/Prev buttons |
| `custom` | Sticky header + Custom content |

---

## Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Route path | kebab-case | `/sample-management`, `/order-details` |
| Component file | kebab-case | `sample-table.tsx`, `order-form.tsx` |
| Component name | PascalCase | `SampleTable`, `OrderForm` |
| Function name | camelCase | `getSampleList`, `formatMoney` |
| Constant | UPPER_SNAKE_CASE | `SAMPLE_STATUS`, `ORDER_TYPES` |
| Type/Interface | PascalCase | `Sample`, `SampleStatus`, `OrderItem` |
| Mock data file | kebab-case | `src/mock/samples.ts`, `src/mock/orders.ts` |
| Type def file | kebab-case | `src/types/sample.ts`, `src/types/order.ts` |
