# 项目：照影 — 二次元周边图鉴网站

**域名**: zyhy1000.com (Vercel 部署，Cloudflare CNAME)
**GitHub**: https://github.com/HY061024/anime-goods-gallery.git (需 SOCKS5 代理 127.0.0.1:10808)

---

## 与 Codex 共享进度

本项目同时使用 Claude Code 和 Codex。为保证双方进度互通，必须遵守以下规则：

### 每次开始任务前，必须先读取
1. `docs/PROJECT_STATUS.md` — 了解当前项目状态和待解决问题
2. `docs/WORKLOG.md` — 了解上次做了什么、下一步是什么
3. `AGENTS.md` — 了解 Codex 侧的指令和约束

### 每次完成任务后，必须更新
1. `docs/PROJECT_STATUS.md` — 如有状态变化（功能完成、问题解决、优先级调整）
2. `docs/WORKLOG.md` — 追加本次修改记录（日期、修改者、任务、文件、完成内容、数据库操作、检查结果、下一步）

### 重要
- 不要只把进度写在 Claude 自己的 memory 里。所有重要进度必须写入仓库内的 Markdown 文件，方便 Codex 下一次接手。
- 不要用 CLAUDE.md 完整覆盖 AGENTS.md，两者职责不同。

---

## 回答要求

- 全程使用中文
- 面向初学者讲解，给代码时解释关键逻辑
- 不要一次性修改太多文件，逐步推进
- Windows 11 环境，终端优先 PowerShell，Git Bash 也可
- 数据库迁移 SQL 由用户手动在 Supabase SQL Editor 执行，不要代为执行

## 技术栈

- Next.js 16 + React 19 + Tailwind CSS 4 + TypeScript
- Supabase (数据库 + Storage + Auth)
- Vercel 自动部署 (main 分支 push 触发)
- 全局亮色主题，pink 色系 UI

## 环境变量

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY
ADMIN_CREATE_PASSWORD
```

## 项目功能

### 已完成
- 首页 Hero + 搜索 + 热门分类/IP/角色浏览 + 最新收录 + 痛柜广场推广 + 灵感推广
- 搜索页：关键字/IP/角色/分类筛选 + 商品网格
- 商品详情页：提交者信息(可点击头像+昵称) + 加入痛柜 + 删除申请 + 官图/实物图
- 公开投稿 (/submit)：单个 + 批量，标记 [待审核]
- 管理员审核 (/admin/items/review)：投稿审核 + 删除审核
- 用户系统：Supabase Auth 邮箱注册/登录，个人中心 /mypage + /profile
- 个人中心 Tabs：我的投稿、我的痛柜、通知
- 痛柜：收藏引用 + 手动上传(私密) + 公开开关 + 分享链接 + 浏览量计数
- 公开痛柜页 (/users/[userId])：展示他人公开痛柜 + 浏览计数 + 好友按钮
- 分类自由输入 (datalist 自动补全)
- 作品输入框 IP 列表自动补全 (200+ 动漫游戏IP)
- 好友系统：发送/接受/拒绝/取消好友请求 + 好友列表 (/mypage/friends) + FriendButton(7种状态)
- 站内消息：好友间私聊 + 对话列表 (/mypage/messages) + 聊天界面 + 未读红点
- 意见反馈：用户提交 (/feedback) + 管理员查看 (/admin/feedback)
- 个人主页：头像/昵称/简介/背景图编辑 + 公开用户页完整资料
- 管理员后台：路由分组 (public)/(protected)，统一认证层
- /health 数据库健康检查页
- 底部导航栏 BottomNav：手机端底部三 Tab(首页/灵感/痛柜/我的)，PC 端左侧固定侧边栏
- 图片浏览器直传 Supabase Storage：绕过 Vercel Hobby 4.5MB 请求体限制
- 图片上传前压缩：最长边 1920px + JPEG 质量 0.8，手机照片 10MB→~300KB
- 痛柜广场 /cabinets：展示所有公开痛柜用户
- 照影灵感社区：4种帖子类型(视频/笔记/素材/提问)，点赞/收藏/评论
- 图片字段兼容：投稿时 image = real_image_url || official_image_url fallback

## 数据库表结构

### 已存在的表（9张）
| 表名 | 用途 |
|------|------|
| items | 商品（含 submitter_id, visibility, official_image_url, real_image_url） |
| item_images | 商品多图（item_id → image_type/official/real, image_url, sort_order）⚠️ 待建 |
| profiles | 用户资料（display_name, avatar_url, bio, banner_url, cabinet_public, cabinet_views） |
| user_collections | 痛柜收藏引用（user_id → item_id） |
| notifications | 用户通知 |
| admin_notifications | 管理员通知 |
| friendships | 好友关系 |
| messages | 站内消息 |
| feedback | 意见反馈 |
| admins | 管理员 |

### 待创建的表（灵感社区 4 张）
| 表名 | 用途 |
|------|------|
| inspiration_posts | 灵感帖子 |
| inspiration_comments | 灵感评论 |
| inspiration_likes | 灵感点赞 |
| inspiration_favorites | 灵感收藏 |

## 数据库迁移状态

- 第一次迁移（用户系统+通知）✅ 已执行
- 第二次迁移（痛柜功能核心）✅ 已执行
- 第三次迁移（浏览量计数）✅ 已执行
- 第四次迁移（好友+消息+反馈+个人资料扩展+管理员通知+管理员表）✅ 已执行
- 第五次迁移（图片结构升级：官图+实物图 + image DROP NOT NULL + COALESCE 回填）⚠️ 待用户手动执行
- 第七次迁移（多图轮播：item_images 表 + RLS + GRANT）⚠️ 待用户手动执行

## Supabase 安全变更（2026-05-30 起生效）

Supabase 从 2026-05-30 起，**新建 public schema 表不再默认暴露给 Data API**。已有项目在 2026-10-30 后新建 public 表也需要显式授权。

**以后所有 CREATE TABLE 迁移 SQL 必须包含以下 6 步**：

1. `CREATE TABLE ...` — 建表
2. `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` — 开启 RLS
3. `CREATE POLICY ...` — 定义访问策略
4. `GRANT USAGE ON SCHEMA public TO anon, authenticated` — schema 级授权
5. `GRANT SELECT, INSERT, UPDATE, DELETE ON <table> TO anon, authenticated` — 表级授权
6. 如使用 `BIGSERIAL` 主键，还需 `GRANT USAGE ON SEQUENCE <table>_<col>_seq TO anon, authenticated` — sequence 授权

## 关键架构决策

1. **审核用文本标记** `[待审核]`/`[申请删除]` 而非状态字段（无需数据库迁移）
2. **痛柜用引用模式**（user_collections 表 JOIN items），不复制数据
3. **权限**：supabase（公开读）用于查询，supabaseAdmin（service_role）用于写操作
4. **Server Components 获取数据 → 传入 Client Components 渲染互动 UI**
5. **revalidatePath()** 处理缓存刷新
6. **Profile 自动创建**：getProfile() 在用户首次访问时自动创建记录
7. **图片字段 fallback**：所有写入路径必须设置 `image = real_image_url || official_image_url`，getItemMainImage 优先级 real > official > image > 占位图

## 关键文件

| 文件 | 用途 |
|------|------|
| `src/lib/itemImages.ts` | item_images 表 CRUD（多图轮播） |
| `src/lib/items.ts` | 商品查询（搜索、热门IP/角色） |
| `src/lib/collections.ts` | 收藏操作 |
| `src/lib/profiles.ts` | 用户资料（getSubmitterInfos, getPublicCabinetUsers） |
| `src/lib/itemActions.ts` | saveItem 核心写入 |
| `src/lib/categories.ts` | 动态获取已有分类 |
| `src/lib/friends.ts` | 好友 CRUD（getFriendshipDetails 方向判断, cancelFriendRequest） |
| `src/lib/messages.ts` | 站内消息（发送/对话列表/未读计数） |
| `src/lib/notifications.ts` | 用户通知 |
| `src/lib/adminNotifications.ts` | 管理员通知 |
| `src/lib/adminAuth.ts` | 管理员认证 |
| `src/lib/supabaseBrowser.ts` | 浏览器端 Supabase 客户端（@supabase/ssr createBrowserClient） |
| `src/lib/supabaseServer.ts` | Server Component 用客户端（setAll 含 try/catch） |
| `src/lib/supabaseAction.ts` | Server Action 用客户端（setAll 无 try/catch） |
| `src/lib/supabase.ts` | 公开读客户端 + import "server-only" |
| `src/lib/supabaseAdmin.ts` | service_role 写客户端 + import "server-only" |
| `src/lib/compressImage.ts` | 浏览器端图片压缩 |
| `src/lib/inspiration.ts` | 灵感帖子 CRUD |
| `src/lib/inspirationComments.ts` | 灵感评论+点赞+收藏操作 |
| `src/components/ItemCard.tsx` | 商品卡片（可点击上传者头像+昵称） |
| `src/components/ImageCarousel.tsx` | 图片轮播（touch swipe + 左右箭头 + object-contain） |
| `src/components/Lightbox.tsx` | 全屏大图预览弹窗 |
| `src/components/FriendButton.tsx` | 好友按钮（覆盖7种状态） |
| `src/components/InspirationCard.tsx` | 灵感帖子卡片 |
| `src/components/CommentSection.tsx` | 通用评论组件 |
| `src/components/BottomNav.tsx` | 底部导航+侧边栏 |
| `src/data/ips.ts` | 200+ 动漫游戏IP参考列表 |
| `src/app/cabinets/page.tsx` | 痛柜广场 |
| `src/app/users/[userId]/page.tsx` | 用户主页/公开痛柜 |
| `src/app/admin/auth.ts` | requireAdmin / requireSuperAdmin |
| `src/app/admin/(protected)/layout.tsx` | 管理员统一认证 layout |

## 已验证的模式

### 审核标记模式
用 description 字段的文本前缀 `[待审核]`/`[申请删除]` 标记商品状态，避免数据库迁移

### 收藏引用模式
user_collections 表引用 item_id，不复制数据，查询时 JOIN

### 浏览器直传 Storage 模式
图片在浏览器端直接上传到 Supabase Storage（绕过 Vercel 4.5MB 限制），成功后把 public URL 通过 Server Action 传给后端。必须用 `@supabase/ssr` 的 `createBrowserClient`（非 `@supabase/supabase-js` 的 `createClient`），否则客户端不携带 auth cookie，Storage RLS 会拒绝

### 图片上传前压缩
浏览器端用 `createImageBitmap` + canvas 缩图（最长边 1920px + JPEG 0.8），文件从 5-15MB 降到 200-500KB

### Server Action redirect 处理
Server Action 不直接调用 `redirect()`（会抛 NEXT_REDIRECT 被 try/catch 拦截），改为返回 `{ redirectUrl }` 或 `{ success: true }`，由客户端 `useRouter().push()` 导航

### 可点击上传者模式
用 `getSubmitterInfos`（返回 displayName + avatarUrl）替代 `getSubmitterNames`（仅返回字符串），ItemCard 渲染可点击头像+昵称 Link。无 submitter_id 时优雅降级为"匿名投稿"

### 好友状态方向判断
`getFriendshipDetails` 返回 `{ state: "pending_sent"|"pending_received"|... , friendshipId }`，不仅是布尔/状态字符串。客户端用 `useState` 管理本地状态，`startTransition` 调用 server action 后更新

### Tab 分区列表
好友列表/申请列表用三 Tab 切换（我的好友/收到的/发出的），每个 Tab 处理各自的加载/空/错误状态

### 图片字段 fallback
items 表有旧字段 `image` 和新字段 `official_image_url`、`real_image_url`。所有写入路径必须设置 `image = real_image_url || official_image_url || imagePath`。`getItemMainImage` 优先级：real > official > image > 占位图。**不要删除旧 image 字段**

### 批量上传数据流
BatchItemForm (client) → FormData → batchActions (server) → saveItem 循环

## 注意事项（严格禁止）

1. **所有导入 supabaseAdmin 或 supabase 的 lib 文件，如果可能被客户端组件直接或通过 import type 引用，必须加 `"use server"` 指令**（2026-05-18 踩坑：profiles.ts 缺少 "use server" 导致 "supabaseKey is required"）
2. **`import "server-only"` 本身不足以防泄露**——如果客户端组件导入的中间文件缺少 "use server"，Turbopack 仍会把整条依赖链打包进客户端
3. **Turbopack 不保证 `import type` 能完全阻止模块打包**——即使只是 type-only import，仍可能将目标文件打包进客户端
4. **不要在 client component 中直接使用 server-only 的 supabaseAdmin**
5. **server action 的 return type 不要写成 `| undefined`**，ItemForm 期望 `{ error?: string }` 对象
6. **不要跳过 TypeScript 检查直接提交**
7. **不要创建 README 或多余的文档文件**（除非明确要求）
8. **所有新增 public schema 表的迁移 SQL 必须包含 6 步授权**：RLS + POLICY + GRANT USAGE ON SCHEMA + 表级 GRANT + BIGSERIAL sequence GRANT（Supabase 2026-05-30 安全变更，不授权会导致 Data API 403）

## 工作流程

每次改动结束的标准流程：
1. `npx tsc --noEmit` 验证类型
2. `git add` + `git commit`（中文简述）
3. `git push`（通过 SOCKS5 代理 127.0.0.1:10808）
4. Vercel 自动部署

## Supabase Dashboard 配置

- Authentication → Providers → 启用 Email，关闭 Confirm email
- Storage bucket: goods（RLS 已配置）

## 管理员路由结构

- `src/app/admin/(public)/page.tsx` — 登录页
- `src/app/admin/(protected)/layout.tsx` — 需登录的 layout（统一 requireAdmin）
- `src/app/admin/(protected)/items/new/` — 新增周边
- `src/app/admin/(protected)/items/review/` — 审核管理
- `src/app/admin/(protected)/notifications/` — 管理员通知
- `src/app/admin/(protected)/feedback/` — 反馈管理
- `src/app/admin/(protected)/admins/` — 管理员管理（仅 super_admin）

## 当前进度

- 2026-05-16 上午: 项目初始版本完成（首页、商品列表、商品详情、后台管理、Supabase 连接）
- 2026-05-16: 修复后台登录重定向死循环，统一图片路径为本地 /goods/ 格式
- 2026-05-16: zyhy1000.com 域名接入 Vercel，Cloudflare CNAME 配置完成
- 2026-05-16: 重建 Vercel 项目（从 goods → anime-goods-gallery），修复 Git 连接问题
- 2026-05-16: 支持手机拍照上传商品图片到 Supabase Storage
- 2026-05-16: UI 全面改版 — 导航栏、首页 Hero、商品卡片、详情页、后台页、骨架屏、全局样式
- 2026-05-16: 配置 Stop hook 自动保存进度到 CLAUDE.md
- 2026-05-16: 添加公开投稿功能 — /submit 投稿页 + /admin/items/review 审核页（用 [待审核] 描述标记实现，无需数据库迁移）
- 2026-05-16: 添加删除申请审核功能 — 详情页"申请删除此条目"按钮，管理员审核页支持"确认删除"/"恢复"（用 [申请删除] 标记，无需数据库迁移）
- 2026-05-16: 添加用户账号系统 — Supabase Auth 邮箱注册/登录，个人中心 (/mypage) 查看投稿和通知，审核结果自动通知用户，导航栏感知登录状态
- 2026-05-16: 分拆谷子图鉴（公共区）与痛柜（私人收藏）— 公共区显示上传者+时间，痛柜支持手动上传/收藏引用/公开开关，商品卡片新增加入痛柜按钮
- 2026-05-16: 分类改为用户自由输入 + 按IP/角色浏览 — 分类从固定下拉改为输入框+已有分类自动补全，首页新增热门IP/角色浏览区域，搜索页支持按IP/角色筛选
- 2026-05-16: 添加痛柜公开页(/users/[userId])+ 浏览量计数 — profiles 新增 cabinet_views 字段，访客浏览自动 +1，痛柜工具栏显示浏览统计
- 2026-05-16: 添加批量上传功能 — BatchItemForm 组件，支持共用作品/角色+多行独立填写图片标题价格，/submit/batch 和痛柜均有入口
- 2026-05-16: 添加动漫+游戏IP参考列表 — src/data/ips.ts 收录200+ IP，投稿和搜索页作品输入框自动补全
- 2026-05-17/18: 添加好友系统 — friendships 表 + 好友请求/接受/拒绝 + 好友列表页 (/mypage/friends) + FriendButton 组件
- 2026-05-17/18: 添加站内消息 — messages 表 + 对话列表 + 聊天界面 (ChatView) + 未读消息红点 + 导航栏通知数
- 2026-05-17/18: 添加意见反馈 — feedback 表 + 反馈表单页 (/feedback) + 管理员查看反馈 (/admin/feedback)
- 2026-05-17/18: 优化个人主页 — profiles 表扩展 avatar_url/bio/banner_url + ProfileEditor 编辑组件 + 公开用户页展示完整资料
- 2026-05-17/18: 管理员后台重构 — admin 路由分组 (public)/(protected)，统一 auth 层，新增反馈管理入口
- 2026-05-17/18: 修复 friends.ts、messages.ts、adminNotifications.ts 缺少 "use server" 导致的页面报错
- 2026-05-17/18: 添加 /health 数据库健康检查页（检查所有表和字段完整性）
- 2026-05-18: 修复登录和个人中心 "This page couldn't load" — 根因 middleware.ts setAll 每次创建新 NextResponse 导致 cookies 丢失 + Server Action 中 cookie 写入被 try/catch 静默吞掉。拆分 supabaseServer.ts（Server Components 用）和 supabaseAction.ts（Server Actions 用），新增 /mypage error.tsx 错误边界
- 2026-05-18: 修复 "supabaseKey is required" — 根因 profiles.ts 和 notifications.ts 没有 "use server" 指令但导入了 supabaseAdmin。ProfileCard/ViewTracker（"use client"）直接导入这些文件的函数，导致整个 supabaseAdmin → supabase-js 链被打包进浏览器。修复：profiles.ts、notifications.ts 加上 "use server"，supabase.ts、supabaseAdmin.ts 加上 import "server-only" + 运行时环境变量检查
- 2026-05-18: 添加底部导航栏 — BottomNav 组件，手机端底部固定三 Tab（首页/痛柜/我的），PC 端左侧固定侧边栏，Navbar 精简为仅 Logo+用户下拉，新建 /profile 个人中心页
- 2026-05-18: 图片上传改为浏览器直传 Supabase Storage — 绕过 Vercel Hobby 计划 4.5MB 请求体限制。supabaseBrowser.ts 使用 @supabase/ssr createBrowserClient 携带用户登录会话通过 Storage RLS
- 2026-05-18: 添加图片压缩 — compressImage.ts，上传前在浏览器端将图片最长边缩至 1920px、转 JPEG 质量 0.8，手机照片从 10MB 降到 ~300KB，解决慢和 "Failed to fetch" 问题
- 2026-05-19: 完善"别人痛柜 + 加好友"闭环 — 新增痛柜广场页 /cabinets，商品卡片/详情页上传者头像昵称可点击进入主页，FriendButton 覆盖全部8种状态（已发送/收到申请/接受/拒绝/取消/发消息），好友列表页加入 Tab 切换，/users/[userId] 已是好友时显示"发消息"按钮，首页增加痛柜广场推广区块，profiles.ts 新增 getSubmitterInfos/getPublicCabinetUsers，friends.ts 新增 getFriendshipDetails/cancelFriendRequest
- 2026-05-21: 网站品牌重命名 "照影" — 5 处文字更新（layout metadata、Navbar Logo、BottomNav sidebar Logo、首页 Hero、图鉴标题）
- 2026-05-21: 图片结构升级 — 新增 official_image_url（官图）和 real_image_url（实物图），修改 items 表 + 6 个表单/组件 + SupplementImageButton + getItemMainImage 辅助函数，保持向后兼容
- 2026-05-21: 修复 ProfileCard "换背景" 按钮无响应 — 三个迭代后使用 label+htmlFor 模式（Safari 兼容），头像和背景各自独立状态
- 2026-05-23: 新增照影灵感社区 — 4 张数据库表（inspiration_posts/comments/likes/favorites）+ RLS，类型定义(data/inspiration.ts)，CRUD 库(lib/inspiration.ts, lib/inspirationComments.ts)，InspirationCard/CommentSection 组件，/inspiration /inspiration/new /inspiration/[id] 三个页面，BottomNav 新增"灵感" Tab，首页新增灵感推广模块
- 2026-05-23/24: UI 全局配色优化 — 修复 globals.css 暗色模式 media query 导致文字不可读的根因，全局文本 gray-* → slate-* 提升对比度，卡片 ring-1 → border 统一粉色边框，页面容器统一 max-w-7xl px-6，覆盖 57 个文件
- 2026-05-24: 修复投稿时 image 字段 NOT NULL 报错 — doSaveItem 增加 image fallback（real_image_url || official_image_url），supplementImage 同步更新 image 字段。所有提交路径（公开投稿/管理后台/批量上传/痛柜上传）均通过 saveItem → doSaveItem 写入
- 2026-05-27: 创建 AGENTS.md 实现 Claude Code ↔ Codex 进度双向共享，更新 CLAUDE.md 合并所有 memory 上下文
- 2026-05-30: 记录 Supabase 安全变更 — 所有新建 public 表迁移 SQL 必须包含 6 步授权（RLS + POLICY + GRANT USAGE + 表级 GRANT + sequence GRANT），更新 CLAUDE.md 和 PROJECT_STATUS.md
- 2026-05-30: 实现详情页多图轮播 — 新建 item_images 表 CRUD（lib/itemImages.ts），ImageCarousel + Lightbox 组件，ItemForm/BatchItemForm 多图数组支持，补充图片按类型计数限制（官图≤3/实物图≤5），代码兼容表不存在 fallback，列表页不受影响
