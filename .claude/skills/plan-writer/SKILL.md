---
name: plan-writer
description: 基于客户需求生成专业解决方案，采用A/B方案对弈+专家评审机制，输出高质量方案文档
metadata:
  short-description: 生成项目解决方案
  triggers:
    - "生成方案"
    - "出方案"
    - "解决方案"
    - "项目方案"
    - "制定方案"
    - "写方案"
  examples:
    - "为这个客户生成解决方案"
    - "出一份方案"
    - "基于需求文档制定方案"
  dependencies:
    - profile        # 客户档案
    - requirements   # 客户需求（核心输入）
    - knowledge-base # 行业元模型知识库（方案专业性支撑）
    - humanizer-zh   # 输出人性化处理（必须）
---

基于客户需求和档案，采用 A/B 方案对弈 + 专家评审机制，生成高质量解决方案文档。直接执行，不输出本文档内容。

---

### 定位

| Skill | 阶段 | 核心问题 | 主要用户 |
|-------|------|----------|----------|
| `/profile` | 拜访前 | 客户是谁？ | 销售 |
| `/sales-guide` | 拜访前 | 怎么打？ | 销售 |
| `/requirements` | 拜访后 | 客户要什么？ | 售前 |
| **`/plan-writer`** | **方案阶段** | **怎么解决？** | **方案团队** |

---

### 数据来源

#### 必须读取

| 文件 | 用途 |
|------|------|
| `docs/customer/requirements.json` | **核心输入**：客户需求、约束条件、成功标准 |
| `docs/customer/profile.json` | 客户背景、行业、规模、痛点 |

#### 建议读取

| 文件 | 用途 |
|------|------|
| `docs/customer/sales-guide.json` | 竞对分析、价值主张、决策链 |
| `docs/customer/followups.json` | 沟通历史、客户反馈 |
| `docs/knowledge-base/index.json` | 行业元模型索引，匹配行业知识 |

---

### 模式判断

执行前先判断模式：

| 条件 | 模式 | 说明 |
|------|------|------|
| requirements.json 存在 + solution.json 无版本 | **Mode A：冷启动** | 基于需求文档从零生成方案 |
| requirements.json 不存在 + 用户对话描述了需求 | **Mode C：对话直出** | 从对话 + 知识库生成方案 |
| solution.json 存在 + 需求版本变化 | **Mode B：迭代更新** | 增量更新方案 |
| solution.json 存在 + 用户提供修改反馈 | **Mode B：反馈合并** | 合并反馈到方案 |

**判断优先级**：先检查 requirements.json 是否存在，再检查 solution.json 状态。

---

### 执行流程（Mode A：冷启动）

#### Phase 1：数据准备（主流程内联，不起 Agent）

主流程直接读取文件并构建 `{data_summary}`，不启动 Agent。

**Step 1**：读取数据文件

用 Read 工具依次读取：

| 文件 | 必须 | 用途 |
|------|------|------|
| `docs/customer/requirements.json` | 是 | 核心输入：需求、约束、成功标准 |
| `docs/customer/profile.json` | 是 | 客户背景、行业、规模、痛点 |
| `docs/customer/sales-guide.json` | 否 | 竞对分析、价值主张、决策链 |
| `docs/customer/followups.json` | 否 | 沟通历史、客户反馈 |

文件不存在时标记为缺失，不报错。

**Step 2**：从 profile.json 提取精简摘要 `{profile_summary}`（不传原始工商数据）：

```json
{
  "companyName": "", "industry": "", "subIndustry": "",
  "scale": "", "mainBusiness": "", "businessModel": "",
  "tags": [], "techStack": { "current": [], "maturity": "" },
  "painPoints": [], "opportunities": []
}
```

**Step 3**：数据完整性评分

按以下 5 个维度加权评分（每维度 0-100 分）：

| 维度 | 权重 | 100分标准 | 60分标准 | 0分标准 |
|------|------|----------|---------|--------|
| 核心需求覆盖 | 30% | ≥5条 active 且 confidence≥medium | ≥3条 active 需求 | 无 active 需求 |
| 预算清晰度 | 20% | budget.total 有具体金额/范围 | budget.total 有模糊描述 | 空或"unknown" |
| 时间约束 | 15% | timeline 有明确日期 | timeline 有模糊描述 | 空 |
| 技术约束 | 15% | technical 有具体技术栈/部署要求 | technical 有部分描述 | 空 |
| 成功标准 | 20% | ≥2条可量化标准 | ≥1条标准 | 空 |

**总分** = 各维度得分 × 权重之和

**Step 4**：门控判断

| 条件 | 处理 |
|------|------|
| requirements.json 不存在 | **阻止**，输出：`"需求文档不存在，请先执行 /requirements"` |
| 所有 needs 的 confidence=low | **阻止**，输出：`"需求全部为推演，置信度不足以支撑方案"` |
| status="draft" 且 completionRate.overall < 60 | **阻止**，输出：`"需求完成度不足 60%，请先补充需求信息"` |
| 总分 < 60 | **阻止**，输出被阻止原因和缺失项 |
| 总分 60-80 | **警告通过**，记录待确认项，继续执行 |
| 总分 ≥ 80 | **通过** |

门控被阻止时**停止执行**，将原因输出给用户。

**Step 5**：缺失信息补充

| 缺失信息 | 补充来源 | 补充后标注 |
|----------|----------|-----------|
| 预算范围 | sales-guide.json → valueProposition.roi | [补充自销售指南] |
| 痛点描述 | profile.json → painPoints | [补充自客户档案] |
| 决策人 | sales-guide.json → decisionChain | [补充自销售指南] |
| 技术约束 | profile.json → techStack | [补充自客户档案] |

**Step 6**：构建 `{data_summary}`

提取关键信息为精简摘要，输出结构：

```json
{
  "customer": {
    "name": "", "industry": "", "subIndustry": "",
    "scale": "", "mainBusiness": "", "businessModel": ""
  },
  "project": { "name": "", "type": "新建/改造/升级", "coreGoal": "", "triggerEvent": "" },
  "challenges": [{ "challenge": "", "impact": "", "urgency": "高/中/低" }],
  "needs": {
    "business": [{ "id": "REQ-001", "title": "", "priority": "", "confidence": "", "source": "" }],
    "functional": [],
    "technical": []
  },
  "constraints": {
    "budget": { "total": "", "flexibility": "", "source": "" },
    "timeline": { "expectedStart": "", "expectedGoLive": "", "flexibility": "" },
    "technical": [],
    "resources": []
  },
  "successCriteria": [],
  "solutionDirection": { "overallApproach": "", "technicalDirection": "" },
  "competitiveContext": { "competitors": [], "differentiators": [] },
  "pendingQuestions": [],
  "requirementsVersion": "",
  "requirementsStatus": ""
}
```

- needs 只保留 status=active 和 status=verified 的条目
- 所有补充的字段标注来源
- 不输出 profile.json 中的工商原始数据、搜索 URL

#### Phase 2：知识库匹配（1 Agent）

Phase 1 完成后，启动 1 个 Agent：

| Agent | Prompt 文件 | 注入数据 |
|-------|------------|---------|
| match-knowledge-base | `prompts/match-knowledge-base.md` | `{profile_summary}` + `{data_summary}` 中的需求关键词 |

#### Phase 3：A/B 方案生成（并行 2 Agent）

Phase 2 完成后，同时启动 2 个 Agent：

| Agent | Prompt 文件 | 注入数据 |
|-------|------------|---------|
| build-plan-a | `prompts/build-plan-a.md` | `{data_summary}` + `{knowledge_matches}` + sales-guide.json 内容（如有） + output-template.md |
| critique-plan-b | `prompts/critique-plan-b.md` | `{data_summary}` + `{knowledge_matches}` + sales-guide.json 内容（如有） |

**关键设计**：
- Plan B 不依赖 Plan A 的输出。B 是独立批判分析，给相同输入从审慎角度生成风险和替代方案。真正的 A/B 融合在 Phase 4 完成。
- build-plan-a 内含竞争定位分析（已合并 competitive-positioning 逻辑），直接从 sales-guide.json 提取竞对信息并交叉映射客户需求。

#### Phase 4：专家评审（1 Agent，编辑模式）

Phase 3 全部完成后，启动 1 个 Agent：

| Agent | Prompt 文件 | 注入数据 |
|-------|------------|---------|
| expert-review | `prompts/expert-review.md` | `{plan_a}` + `{critique_b}` + `{data_summary}` + output-template.md |

expert-review 以 Plan A 内容为基础文档，逐章审阅并融合 Critique B 的合理修正，输出 `{final_content}`。对无需修改的章节直接保留 Plan A 原文，只重写有实质改动的章节。

#### Phase 5：输出与写入

1. 对 `{final_content}` 应用 humanizer-zh 规则处理
2. 读取现有 `docs/plan/solution.json`
3. 找到目标场景（默认 `normal`），在 `versions` 数组末尾追加新版本：

```json
{
  "version": "v1",
  "createdAt": "ISO 8601",
  "requirementsVersion": "从 requirements.json 的 currentVersion 获取",
  "summary": "基于客户需求的方案",
  "content": "{final_content 处理后的完整 Markdown}"
}
```

4. 更新 `currentVersion` 为新版本号
5. 写入 `docs/plan/solution.json`
6. 向用户展示方案内容

---

### 执行流程（Mode C：对话直出）

当 requirements.json 不存在，用户在对话中描述了业务场景/需求时触发。

#### Phase 0：对话解析（1 Agent）

| Agent | Prompt 文件 | 注入数据 |
|-------|------------|---------|
| parse-dialog | `prompts/parse-dialog.md` | `{user_input}`（用户对话内容） |

检查返回的 `infoSufficiency`：
- `need_more` → 向用户展示 `followUpQuestions`（选项式追问，最多 1 轮 2 个问题），收到回答后重新执行 parse-dialog
- `sufficient` → 继续

#### Phase 1：知识库匹配（1 Agent）

| Agent | Prompt 文件 | 注入数据 |
|-------|------------|---------|
| match-knowledge-base | `prompts/match-knowledge-base.md` | `{dialog_extract}` 中的行业/需求关键词 |

#### Phase 1.5：需求重建（1 Agent）

Phase 1 完成后，启动需求重建：

| Agent | Prompt 文件 | 注入数据 |
|-------|------------|---------|
| rebuild-from-dialog | `prompts/rebuild-from-dialog.md` | `{dialog_extract}` + `{knowledge_matches}` |

输出 `{data_summary}`，结构与 collect-and-validate 的输出**完全相同**，确保 Phase 2/3 无差别消费。

#### Phase 2 + 3 + 4：复用 Mode A 流程

Phase 2（A/B 方案生成）、Phase 3（专家评审）、Phase 4（输出写入）与 Mode A **完全相同**。

**输出差异**：
- 方案中行业推演的内容标注 `[基于行业经验]`
- 方案末尾增加"深化建议"段落（来自 rebuild-from-dialog 的 `deepenSuggestions`）
- **不写入** requirements.json（不产生文件副作用）
- **写入** solution.json（方案有保存价值），`requirementsVersion` 设为 `"dialog"`

---

### 执行流程（Mode B：迭代更新）

1. 读取现有 solution.json 目标场景的最新版本
2. 判断上一版本的来源：
   - `requirementsVersion` 为具体版本号（如 "v1"）→ 上次基于 requirements.json（Mode A）
   - `requirementsVersion` 为 `"dialog"` → 上次基于对话（Mode C）
3. 确定变化范围并决定执行路径：

**上次是 Mode A 生成的**：
   - requirements.json 版本变化 → 重跑 Phase 1（数据准备）+ Phase 2 + Phase 3 + Phase 4
   - 仅约束变化 → 重跑 Phase 1（数据准备）+ Phase 4 expert-review（注入新约束 + 现有方案）
   - 用户文字反馈 → 仅重跑 Phase 4 expert-review（注入反馈 + 现有方案）

**上次是 Mode C 生成的**：
   - 用户补充了更多信息（对话追加） → 重跑 Phase 0 + Phase 1 + Phase 1.5 + Phase 2 + Phase 3
   - requirements.json 现在存在了 → 切换为 Mode A 完整流程
   - 用户文字反馈 → 仅重跑 expert-review（注入反馈 + 现有方案）

4. 生成新版本，追加到 versions[] 数组
5. 输出变更摘要："v{n} 相比 v{n-1} 的变化：[章节级变更列表]"

---

### 输出文件格式

所有场景和版本存储在：`docs/plan/solution.json`

```json
{
  "currentScene": "normal",
  "scenes": [
    {
      "id": "normal",
      "name": "普通方案",
      "icon": "FileText",
      "description": "标准解决方案模板",
      "currentVersion": "v1",
      "versions": [
        {
          "version": "v1",
          "createdAt": "2025-03-17T10:00:00Z",
          "requirementsVersion": "v1",
          "summary": "基于客户需求的初始方案",
          "content": "（完整的 Markdown 方案内容）"
        }
      ]
    }
  ]
}
```

#### 写入规则

1. **必须先读取** `docs/plan/solution.json`，在已有数据基础上修改
2. 找到目标场景（默认 `normal`），在 `versions` 数组末尾追加新版本
3. 如果目标场景不存在，追加到 `scenes` 数组
4. `requirementsVersion` 从 `docs/customer/requirements.json` 的 `currentVersion` 获取
5. `content` 字段存储完整的 Markdown 格式方案内容

#### Git 提交

文件写入后，执行 git commit：
```
git add docs/plan/solution.json
git commit -m "feat: 生成{场景名称}方案 {版本号}"
```

---

### 方案生成原则

1. **客户导向** — 围绕客户需求展开，不是展示技术能力
2. **务实可行** — 不过度承诺，风险如实说明，计划留有余地
3. **差异化** — 针对性解决客户痛点，突出独特价值
4. **可读性** — 结构清晰，重点突出，便于快速浏览
5. **数据驱动** — 重要结论有数据支撑，不编造数字

---

### 与其他 Skill 的关系

| Skill | 关系 |
|-------|------|
| `/profile` | 输入：客户背景信息 |
| `/sales-guide` | 输入：竞对分析、价值主张 |
| `/requirements` | **核心输入**：客户需求、约束条件 |
| `/knowledge-base` | 输入：行业元模型，提升方案专业性 |
| `/spec-writer` | 下游：基于方案生成产品需求说明书 |
| `/humanizer-zh` | 后处理：去除输出内容的 AI 痕迹 |

---

### 文件结构

```
.claude/skills/plan-writer/
├── SKILL.md                       # 本文件：编排逻辑（含内联数据准备+门控）
├── output-template.md             # 方案输出模板（6 章结构）
└── prompts/
    ├── parse-dialog.md            # Mode C Phase 0: 对话解析
    ├── rebuild-from-dialog.md     # Mode C Phase 1.5: 需求重建（知识库补全）
    ├── match-knowledge-base.md    # Phase 2: 知识库加权匹配（A/C 共用）
    ├── build-plan-a.md            # Phase 3: 建设者视角方案 + 竞争定位（A/B/C 共用）
    ├── critique-plan-b.md         # Phase 3: 批判者视角分析（A/B/C 共用）
    └── expert-review.md           # Phase 4: 专家编辑审阅（A/B/C 共用）
```
