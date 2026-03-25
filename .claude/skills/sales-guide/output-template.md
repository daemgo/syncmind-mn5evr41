# 输出规则

## JSON 写入规则

写入路径：`docs/customer/sales-guide.json`

### 写入策略

- **首次写入**：创建完整 JSON
- **迭代写入**：只覆盖有变化的字段
- **始终更新**：metadata.generatedAt（首次）/ metadata.updatedAt（迭代）、metadata.version
- **UTF-8 编码**，JSON 缩进 2 个空格

### humanizer-zh 处理清单

| 字段路径 | 处理重点 |
|----------|---------|
| timing.entryStrategy | 具体可执行，不泛泛 |
| competitors[].counterStrategy | 像有经验的销售在教新人 |
| interviewGuide.*.question | 口语化，像同事聊天 |
| nextActions[].action | 具体到可执行 |
