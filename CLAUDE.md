# 项目上下文：二次元周边图鉴网站

这是一个二次元周边图鉴/搜索网站项目。

## 回答要求

- 全程使用中文解释。
- 面向初学者讲解。
- 给代码时必须解释关键逻辑。
- 不要一次性修改太多文件。
- Windows 环境下，终端命令优先使用 PowerShell。

## 项目功能

- 商品列表展示
- 商品搜索
- 商品详情页
- 后台新增周边页面
- 图片放在 public/goods/ 目录下

## 商品数据结构

商品包含：

- id
- title
- work
- character
- category
- price
- description
- image

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
- 已配置 git SOCKS5 代理 (127.0.0.1:10808) 用于 GitHub 推送

## 数据库迁移（需在 Supabase SQL Editor 执行）

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

## Supabase Dashboard 配置

- Authentication → Providers → 启用 Email，关闭 Confirm email

