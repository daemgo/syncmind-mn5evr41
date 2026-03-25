# 输出规则

## Markdown 展示模板

```markdown
# 【数字化诊断档案】：{companyName}

> {summary}

## 0. 企业画像
[profile 模块数据：行业、规模、主营业务、产品、商业模式、标签、营收规模]

## 1. 工商信息解读
[registration 模块：解读文本 + 关键发现（≤3条）]

## 2. 组织架构与决策链
[organization 模块：组织类型、一句话决策模式、关键角色（≤4个）]

## 3. 政策与风险
[collect-risk 数据：政策命中信号 + 司法风险等级]

## 4. 时机判断
[timing 模块：所处阶段、判断依据（≤3条）、建议切入策略]

## 5. 痛点与机会
[painPoints（≤5条） + opportunities（≤3条），标注哪些是假设]

## 6. 招聘信号
[hiring.keySignals：≤3条关键信号]

## 7. 竞争格局
[competition 模块：行业排名、竞对、客户]
```

> 档案生成完毕。运行 `/sales-guide` 获取销售进攻指南。

---

## JSON 写入规则

写入路径：`docs/customer/profile.json`

类型定义：`src/types/customer.ts` 中的 `CustomerProfile` 接口

### 字段映射

| 分析模块 | → JSON 字段 | 说明 |
|----------|------------|------|
| profile.companyName | companyName | |
| profile.shortName | shortName | |
| profile.industry | industry | |
| profile.subIndustry | subIndustry | |
| profile.scale | scale | |
| profile.mainBusiness | mainBusiness | |
| profile.products | products[] | 映射为 Product 接口 |
| profile.targetCustomers | targetCustomers[] | |
| profile.businessModel | businessModel | |
| profile.rating | rating | 根据综合评估给出 A/B/C/D |
| profile.tags | tags[] | |
| profile.summary | metadata.notes | CustomerProfile 无顶层 summary 字段 |
| profile.isListed | isListed | |
| profile.stockCode | stockCode | |
| profile.website | website | |
| profile.revenueScale | keyMetrics（追加） | |
| organization.type | type | 企业类型 |
| organization.decisionChain | organization.decisionChain | 决策链路径 |
| organization.keyPersons | organization.keyPersons[] | 第一条为创始人/法人，含 name+title |
| organization.salesStrategy | organization.salesStrategy | 攻略建议 |
| collect-risk.policy（hit=true） | tags[]（追加）+ policyAnalysis | 命中的政策写入标签 |
| collect-risk.legal | creditRisk | 司法风险数据 |
| timing.phase | strategy.phase | |
| timing.* | strategy.growthStage | 综合时机判断 |
| painPoints[] | painPoints[] | 映射为 PainPoint 接口 |
| opportunities[] | opportunities[] | 映射为 Opportunity 接口 |

### 不写入的字段（其他 skill/系统负责）

| 字段 | 负责方 |
|------|--------|
| salesGuide | `/sales-guide` skill |
| requirements | `/requirements` skill |
| contacts | 平台 CRM / 用户手动录入 |
| tracking | 平台系统自动维护 |
| budget | 面访后由销售补充 |

### metadata 字段

| 字段 | 规则 |
|------|------|
| createdAt | 首次生成时写入当前时间（ISO 8601） |
| updatedAt | 每次更新时写入当前时间 |
| createdBy | 固定 `"AI"` |
| version | 见 SKILL.md 版本管理规则 |
| confidence | 信息丰富度分数（20-100） |
| sources | 所有搜索中引用的有效 URL 列表 |

### 写入策略

- **merge 写入**：保留 JSON 中已有的其他字段值，只更新 profile 负责的字段
- **首次写入**：如果文件不存在，创建完整的 CustomerProfile 结构，未填充字段使用类型默认值（空字符串/空数组/0）
- **更新写入**：读取现有文件，仅覆盖 profile 负责的字段，保留其他 skill 已写入的数据
