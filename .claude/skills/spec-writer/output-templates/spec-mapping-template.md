# .spec-mapping.yaml 格式

模块→代码文件的映射关系，用于增量更新时识别哪些文件需要重新生成、哪些已被人工定制（锁定）。

---

```yaml
version: "1.0.0"
specHash: "a3f8c2d1"            # spec.json 的 hash
generatedAt: "2026-01-27T10:30:00Z"

mappings:
  - moduleId: user-management
    moduleName: 用户管理
    locked: false
    files:
      - path: src/app/users/page.tsx
        type: page
        pageId: user-list

      - path: src/app/users/[id]/page.tsx
        type: page
        pageId: user-detail

      - path: src/components/users/user-table.tsx
        type: component
        sectionId: user-list-table

      - path: src/mock/users.ts
        type: mock

  - moduleId: approval-flow
    moduleName: 审批流程
    locked: true
    lockedReason: "交付团队已自定义审批逻辑"
    lockedAt: "2026-01-25T10:00:00Z"
    lockedBy: "李四"
    files:
      - path: src/app/approval/page.tsx
        type: page
```

---

## 锁定级别

| 级别 | 说明 | 效果 |
|------|------|------|
| 模块锁定 | 整个模块锁定 | 模块下所有页面跳过 |
| 页面锁定 | 单个页面锁定 | 只跳过该页面 |
| 文件锁定 | 单个代码文件锁定 | 只跳过该文件 |
