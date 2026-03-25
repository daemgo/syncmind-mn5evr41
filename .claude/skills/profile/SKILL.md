---
name: profile
description: 为目标企业建立数字化诊断档案，整合工商、政策、时机、风险等多维数据，输出可用于面客和提案的结构化档案
metadata:
  short-description: 生成企业数字化诊断档案
  triggers:
    - "生成客户档案"
    - "生成档案"
    - "客户档案"
    - "企业档案"
    - "面客准备"
    - "破冰准备"
    - "客户调研"
    - "档案"
    - "profile"
  examples:
    - "为XX公司生成客户档案"
    - "帮我调研一下这家企业"
    - "生成面客准备档案"
    - "出一下客户档案"
  dependencies:
    - humanizer-zh
---

直接执行，不输出本文档任何内容。

---

### 企业名称获取

按以下优先级确定 `{company_name}`：

1. **用户消息中包含企业名称** → 直接使用
2. **`docs/customer/profile.json` 已存在** → 读取其中的 `companyName` 字段
3. **以上都没有** → 向用户询问企业名称（仅此一种情况需要追问）

---

### 执行流程

**第一步：并行采集与分析**

读取以下 2 个 prompt 文件，同时启动 2 个 Agent（在同一条消息中发起 2 个 Agent 工具调用）：

| Agent | Prompt 文件 | 职责 |
|-------|------------|------|
| collect-new | `prompts/collect-new.md` | 官网深挖 + 工商 + 财务 + 招聘 + 竞争 + 新闻 → 直接分析推演 |
| collect-risk | `prompts/collect-risk.md` | 司法风险 + 政策信号 |

启动每个 Agent 时，将 `{company_name}` 注入到 prompt 开头。

collect-new 还需注入：
- `{industry_pain_points}`：行业痛点库内容（`industry-pain-points.md`）

collect-new Agent 完成搜索后直接进行分析推演，返回结构化的分析结论（含企业画像、组织决策链、时机判断、技术栈推断、痛点、机会等）。

**第二步：合并与渲染输出**

2 个 Agent 全部返回后：

1. 将 collect-risk 的风险和政策数据补充到 collect-new 的分析结论中
2. 将结构化数据写入 `docs/customer/profile.json`（遵循 `output-template.md` 中的字段映射规则）
3. 输出一句话告知用户完成，不输出完整 Markdown 档案（数据已写入文件，用户在页面上查看）

**降级策略**

| 场景 | 处理 |
|------|------|
| collect-risk Agent 超时/报错 | 用 collect-new 数据继续，风险字段标注缺失 |
| 搜索结果稀疏 | 基于行业/规模推断，标注 [假设待验证] |
| 全部搜索失败 | 直接走纯行业推断路径 |

不因信息不足停止执行。有限信息的推演档案远好于没有档案。

**版本管理**

| 场景 | 版本变化 |
|------|----------|
| 首次生成 | "1.0" |
| 用户要求"更新档案" | minor +0.1（如 1.0→1.1），重新执行采集，仅更新有变化的字段 |
| 核心字段变化（上市/融资/并购/行业变更） | major +1.0（如 1.1→2.0） |
