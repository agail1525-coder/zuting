# F03 收藏按钮组件 产品需求文档

> 版本: v1.0 | 日期: 2026-03-29 | 状态: 待开发 | 父模块: M14-收藏系统
> 组件名: SaveButton | 关联组件: CollectionPicker

---

## 1. 需求背景与目标

收藏按钮（SaveButton）是贯穿全平台的高频交互组件，出现在所有内容详情页和列表卡片中。组件必须在 Web（TailwindCSS）、Mobile（React Native Animated API）、小程序（Taro）三端表现一致，且满足「快、准、美」三个核心指标：

- **快**：点击响应 ≤ 100ms（乐观更新，先变 UI 再等 API）
- **准**：已收藏/未收藏状态与服务端严格同步，失败时回滚
- **美**：心形动画流畅（缩放+弹跳，300ms），与平台金色主题协调

---

## 2. 用户故事

### US-01 快速收藏到默认夹

**作为** 正在浏览圣地详情页的用户，
**我希望** 单击心形按钮即可收藏，无需任何额外操作，
**以便** 在不打断浏览流程的情况下保存感兴趣的内容。

**验收标准：**
- [ ] 单击心形：乐观更新（立即变为实心红心）→ POST /api/collections/quick-save
- [ ] API 成功：显示 Toast「已收藏到默认收藏夹」（2s 后自动消失）
- [ ] API 失败：回滚为空心心形 + Toast「收藏失败，请重试」
- [ ] 已收藏状态单击：二次确认后 DELETE，成功后变回空心

### US-02 长按选择目标收藏夹

**作为** 有多个主题收藏夹的用户，
**我希望** 长按心形按钮时弹出收藏夹选择器，
**以便** 将内容直接存入指定收藏夹而非默认收藏夹。

**验收标准：**
- [ ] Mobile：长按 500ms 触发；Web：右键点击或按住 500ms 触发
- [ ] CollectionPicker 弹窗从底部弹起（Mobile）/居中弹出（Web）
- [ ] 列表显示所有收藏夹，每行展示：封面图缩略图、名称、项目数、已收藏复选框
- [ ] 支持多选（同时存入多个收藏夹）
- [ ] 底部有「+ 新建收藏夹」快捷入口
- [ ] 确认后批量 POST，统一显示 Toast「已收藏到 N 个收藏夹」

### US-03 未登录提示引导

**作为** 未登录的访客，
**我希望** 点击收藏按钮时看到友好的登录引导，
**以便** 我了解需要登录才能使用收藏功能。

**验收标准：**
- [ ] 未登录点击心形按钮：弹出登录引导弹窗（非跳转页面）
- [ ] 弹窗文案：「登录后即可收藏，随时查看你的朝圣清单」
- [ ] 弹窗按钮：「去登录」（跳转登录页）和「取消」
- [ ] 弹窗关闭后用户停留在当前页面，收藏操作不执行

---

## 3. 组件设计规范

### 3.1 视觉状态

| 状态 | 图标 | 颜色 | 说明 |
|------|------|------|------|
| 未收藏（默认） | 空心心形 ♡ | 白色（深色背景上）/ 灰色（浅色背景上） | 鼠标悬停时轻微放大（scale 1.1） |
| 收藏中（Loading）| 旋转加载圈 | 金色 #D4A855 | API 请求期间显示 |
| 已收藏 | 实心心形 ♥ | 红色 #EF4444 | 带入场动画 |
| 错误状态 | 空心心形 ♡ + 抖动 | 灰色 | 失败回滚后短暂抖动 200ms |
| 置灰（禁用）| 空心心形 ♡ | 浅灰 #9CA3AF | 暂不支持收藏的内容类型 |

### 3.2 动画规范

**收藏入场动画（已收藏 → 实心）：**
```
0ms   → scale(1.0)
50ms  → scale(1.4)  # 快速放大
150ms → scale(0.85) # 弹回缩小
250ms → scale(1.1)  # 轻微弹跳
300ms → scale(1.0)  # 回到正常大小
```

**取消收藏出场动画（实心 → 空心）：**
```
0ms   → scale(1.0) opacity(1.0)
150ms → scale(0.8) opacity(0.5)
250ms → scale(1.0) opacity(1.0) → 空心图标
```

---

## 4. Props 接口定义

```typescript
// SaveButton 组件 Props
interface SaveButtonProps {
  /** 收藏内容的实体类型 */
  entityType: 'HOLY_SITE' | 'TEMPLE' | 'PATRIARCH' | 'TRIP';
  /** 收藏内容的实体 ID */
  entityId: string;
  /** 按钮尺寸，默认 'md' */
  size?: 'sm' | 'md' | 'lg';
  /** 自定义样式类名（Web TailwindCSS / 小程序内联样式对象） */
  className?: string;
  /** 自定义容器样式（React Native StyleSheet） */
  style?: object;
  /** 是否显示收藏数量（如圣地列表卡片不显示，详情页可显示） */
  showCount?: boolean;
  /** 初始收藏状态（来自服务端，避免首次闪烁） */
  initialSaved?: boolean;
  /** 收藏状态变化回调 */
  onSaveChange?: (saved: boolean) => void;
}

// CollectionPicker 组件 Props
interface CollectionPickerProps {
  /** 是否显示 */
  visible: boolean;
  /** 关闭回调 */
  onClose: () => void;
  /** 确认收藏回调，传入选中的收藏夹 ID 数组 */
  onConfirm: (collectionIds: string[]) => void;
  /** 当前内容已收藏的收藏夹 ID 列表（用于初始化选中状态） */
  savedCollectionIds?: string[];
}
```

### 4.1 尺寸规范

| size | 图标尺寸 | 点击热区 | 使用场景 |
|------|---------|---------|----------|
| sm | 16px | 32×32px | 列表卡片右上角 |
| md | 24px | 44×44px | 详情页默认（满足 iOS 最小点击区域） |
| lg | 32px | 56×56px | 详情页大图覆盖层 |

---

## 5. 状态管理与同步

### 5.1 乐观更新策略

```
用户点击 → 立即更新本地 UI 状态（saved: true/false）
            ↓
          POST/DELETE API
            ↓
         成功 → 无需操作（UI 已是正确状态）
         失败 → 回滚本地 UI 状态 → 显示错误 Toast
```

### 5.2 跨组件状态同步

同一页面内可能存在多个 SaveButton 指向同一 entityId（如列表页卡片 + 详情页顶部），使用全局状态管理同步：

- **Web（React Query）**：invalidate `collections/check?entityId=xxx` 查询，触发所有相关 SaveButton 重新判断状态
- **Mobile（Zustand / Context）**：维护 `savedSet: Set<string>`，所有 SaveButton 订阅同一 store
- **小程序（Taro 全局状态）**：使用 `app.globalData.savedItems` 维护已收藏 entityId 集合

### 5.3 页面加载时批量检查

为避免每个 SaveButton 独立发请求，采用批量检查策略：

```
页面挂载时 → 收集页面内所有 entityId
           → GET /api/collections/check?entityIds=id1,id2,id3（批量）
           → 返回 { [entityId]: boolean } 映射
           → 分发到各个 SaveButton 初始化状态
```

---

## 6. 全端实现规范

### 6.1 Web（Next.js + TailwindCSS）

```
文件路径: src/components/SaveButton.tsx
         src/components/CollectionPicker.tsx
动画实现: Framer Motion（scale + bounce keyframes）
状态管理: React Query（useQuery + useMutation）
```

### 6.2 Mobile（React Native + Expo）

```
文件路径: components/SaveButton.tsx
          components/CollectionPicker.tsx
动画实现: React Native Animated API（sequence + spring）
触觉反馈: Haptics.impactAsync(ImpactFeedbackStyle.Light) — 收藏成功时震动反馈
底部弹窗: @gorhom/bottom-sheet（CollectionPicker 使用）
```

### 6.3 小程序（Taro）

```
文件路径: src/components/SaveButton/index.tsx
          src/components/CollectionPicker/index.tsx
动画实现: Taro.createAnimation（transform scale）
弹窗实现: Taro AtModal 或自定义 fixed 定位弹层
```

---

## 7. 嵌入位置清单

| 页面/组件 | 嵌入位置 | size | 说明 |
|-----------|---------|------|------|
| 圣地详情页 | 顶部图片右上角 | lg | 叠加在封面图上 |
| 祖庭详情页 | 顶部图片右上角 | lg | 叠加在封面图上 |
| 祖师详情页 | 顶部图片右上角 | lg | 叠加在封面图上 |
| 圣地列表卡片 | 卡片右上角 | sm | 叠加在卡片图片上 |
| 祖庭列表卡片 | 卡片右上角 | sm | 叠加在卡片图片上 |
| 搜索结果卡片 | 卡片右上角 | sm | 搜索结果页 (Phase B) |
| 推荐内容卡片 | 卡片右上角 | sm | 首页推荐区 |

---

## 8. 验收标准

| 标准编号 | 描述 |
|----------|------|
| AC-01 | 点击响应（UI 变化）≤ 100ms，用户无感知延迟 |
| AC-02 | 收藏成功动画（缩放+弹跳）在三端均正常播放，动画流畅无卡顿 |
| AC-03 | API 失败时 UI 正确回滚，不残留错误状态 |
| AC-04 | 未登录点击显示登录引导弹窗，不跳转页面 |
| AC-05 | 长按（500ms）触发 CollectionPicker 而非单击的快速收藏 |
| AC-06 | CollectionPicker 列表正确显示已收藏状态，支持多选后批量保存 |
| AC-07 | 页面内多个指向同一 entityId 的 SaveButton 状态严格同步 |
| AC-08 | Mobile 端收藏成功时有触觉反馈（震动） |
| AC-09 | sm / md / lg 三种尺寸在 Web 和 Mobile 均渲染正确 |
| AC-10 | 组件 Props 均有 TypeScript 类型定义，无 any 类型（遵循 R-01） |
