# 项目上下文：二次元周边图鉴网站

这是一个二次元周边图鉴/搜索网站项目。

## 回答要求

- 全程使用中文解释。
- 面向初学者讲解。
- 给代码时必须解释关键逻辑。
- 不要一次性修改太多文件。
- Windows 环境下，终端命令优先使用 PowerShell。

## 项目功能

- 谷子图鉴（公共区）：所有用户公开商品，显示上传者和时间
- 痛柜（私人收藏）：用户个人收藏，可设为公开分享
- 商品列表展示 + 搜索 + 详情页
- 公开投稿 + 管理员审核流程
- 删除申请 + 管理员审核流程
- 用户注册/登录（Supabase Auth）
- 个人中心：投稿管理、痛柜管理、通知中心
- 手机拍照上传（Supabase Storage）

## 商品数据结构

商品包含：

- id, title, work, character, category, price, description, image
- submitter_id（上传者 UUID）
- visibility（'public' | 'private'，公开/私密）
- created_at（发布时间）

## 图片规则

商品图片路径使用：

/goods/图片名.jpg

实际图片文件应放在：

public/goods/

## 技术栈

- Next.js 16 + React 19 + Tailwind CSS 4
- Supabase (数据库 + 存储)
- Vercel 部署 (项目名: anime-goods-gallery)
- 自定义域名: zyhy1000.com (已接入，Cloudflare CNAME 指向 Vercel)
- Supabase Storage 用于手机拍照上传图片

## 环境变量

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
- SUPABASE_SERVICE_ROLE_KEY
- ADMIN_CREATE_PASSWORD

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

## 管理员路由结构

- `src/app/admin/(public)/page.tsx` — 登录页
- `src/app/admin/(protected)/layout.tsx` — 需登录的 layout（统一 requireAdmin）
- `src/app/admin/(protected)/items/new/` — 新增周边
- `src/app/admin/(protected)/items/review/` — 审核管理
- `src/app/admin/(protected)/notifications/` — 管理员通知
- `src/app/admin/(protected)/feedback/` — 反馈管理
- `src/app/admin/(protected)/admins/` — 管理员管理（仅 super_admin）

## 数据库迁移（需在 Supabase SQL Editor 执行）

### 第一次迁移（已执行）
```sql
ALTER TABLE items ADD COLUMN submitter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE INDEX idx_items_submitter_id ON items(submitter_id);

CREATE TABLE notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id INTEGER REFERENCES items(id) ON DELETE SET NULL,
  item_title TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL CHECK (type IN ('submission_approved','submission_rejected','delete_approved','delete_rejected')),
  message TEXT NOT NULL DEFAULT '',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_notifications_user_id ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_id) WHERE is_read = false;

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
```

### 第二次迁移（痛柜功能需要，未执行）
```sql
ALTER TABLE items ADD COLUMN visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'private'));

CREATE TABLE user_collections (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, item_id)
);
CREATE INDEX idx_collections_user ON user_collections(user_id);

CREATE TABLE profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  cabinet_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE user_collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own collections" ON user_collections FOR ALL USING (auth.uid() = user_id);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own profile" ON profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Anyone can read public profiles" ON profiles FOR SELECT USING (cabinet_public = true);
```

### 第三次迁移（浏量计数需要，未执行）
```sql
ALTER TABLE profiles ADD COLUMN cabinet_views INTEGER NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION increment_cabinet_views(target_user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE profiles SET cabinet_views = cabinet_views + 1 WHERE user_id = target_user_id;
END;
$$ LANGUAGE plpgsql;
```

### 第四次迁移（好友+消息+反馈+个人资料扩展，已执行）
```sql
-- profiles 扩展
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS banner_url TEXT;

-- 好友系统
CREATE TABLE IF NOT EXISTS friendships (
  id BIGSERIAL PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(sender_id, receiver_id)
);
CREATE INDEX IF NOT EXISTS idx_friendships_receiver ON friendships(receiver_id, status);
CREATE INDEX IF NOT EXISTS idx_friendships_sender ON friendships(sender_id, status);

DROP POLICY IF EXISTS "Users can read own friendships" ON friendships;
DROP POLICY IF EXISTS "Users can create friendships" ON friendships;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own friendships" ON friendships FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can create friendships" ON friendships FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- 站内消息
CREATE TABLE IF NOT EXISTS messages (
  id BIGSERIAL PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL DEFAULT '',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_messages_thread ON messages(LEAST(sender_id, receiver_id), GREATEST(sender_id, receiver_id), created_at DESC);

DROP POLICY IF EXISTS "Users can read own messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own messages" ON messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can send messages" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- 意见反馈
CREATE TABLE IF NOT EXISTS feedback (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 管理员通知
CREATE TABLE IF NOT EXISTS admin_notifications (
  id BIGSERIAL PRIMARY KEY,
  item_id INTEGER REFERENCES items(id) ON DELETE SET NULL,
  item_title TEXT NOT NULL DEFAULT '',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 管理员表
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## Supabase Dashboard 配置

- Authentication → Providers → 启用 Email，关闭 Confirm email

