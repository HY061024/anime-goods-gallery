# PROJECT_STATUS.md — 照影项目状态

> 最后更新：2026-05-30（多图轮播功能完成）
> 本项目同时由 Claude Code 和 Codex 维护。双方每次操作后都应更新此文件。

## 基本信息

- **网站名**：照影
- **项目名**：anime-goods-gallery
- **域名**：https://zyhy1000.com
- **GitHub**：https://github.com/HY061024/anime-goods-gallery.git
- **技术栈**：Next.js 16 + React 19 + Tailwind CSS 4 + Supabase + Vercel

## 当前已完成功能

- 图鉴首页（Hero + 搜索 + 热门分类/IP/角色 + 最新收录 + 痛柜广场推广 + 灵感推广）
- 商品列表与搜索（关键字/IP/角色/分类筛选 + 商品网格）
- 商品详情页（提交者信息可点击 + 加入痛柜 + 删除申请 + 官图/实物图多图轮播 + 大图预览 + 补充图片）
- 投稿与审核（单个/批量投稿 + [待审核] 标记 + 管理员审核页）
- 官图 / 实物图（official_image_url / real_image_url 双字段 + 图片压缩上传）
- 痛柜（收藏引用 + 手动上传私密 + 公开开关 + 分享链接 + 浏览量计数）
- 公开痛柜（/users/[userId] + 痛柜广场 /cabinets）
- 好友（发送/接受/拒绝/取消 + 好友列表 + FriendButton）
- 私信（好友间私聊 + 对话列表 + 未读红点）
- 灵感区（视频/笔记/素材/提问 4 种帖子 + 点赞/收藏/评论）
- 用户资料页（头像/昵称/简介/背景图编辑 + 公开页完整资料）
- 管理员后台（路由分组 + 统一认证 + 审核/反馈/管理员管理）
- 底部导航栏（手机端底部 Tab + PC 端左侧侧边栏）
- 图片浏览器直传 Supabase Storage（绕过 Vercel 4.5MB 限制）
- 意见反馈（/feedback 提交 + /admin/feedback 管理）

## 当前重点问题

1. **投稿 image 字段兼容**：items.image 有 NOT NULL 约束，代码层面已通过 `image = real_image_url || official_image_url` fallback 缓解，但数据库层面第五次迁移（DROP NOT NULL）仍未执行
2. **首页电脑端配色**：文字对比度和配色在桌面端仍需协调优化
3. **用户个人页换背景按钮**：Safari 兼容问题已通过 label+htmlFor 模式修复，需验证
4. **痛柜和好友入口**：痛柜广场和别人主页的社交入口仍需完善
5. **灵感区**：需要补充内容和完善发布权限

## 数据库状态

- **Supabase 安全变更（2026-05-30）**：新建 public schema 表不再默认暴露给 Data API。以后所有迁移 SQL 必须包含 6 步：CREATE TABLE + RLS + POLICY + GRANT USAGE ON SCHEMA + 表级 GRANT + BIGSERIAL sequence GRANT。详见 CLAUDE.md。
- 第一次迁移（用户系统+通知）✅
- 第二次迁移（痛柜功能核心）✅
- 第三次迁移（浏览量计数）✅
- 第四次迁移（好友+消息+反馈+个人资料扩展+管理员）✅
- 第五次迁移（图片结构升级：DROP NOT NULL + COALESCE 回填）⚠️ 待执行
- 第六次迁移（灵感社区 4 张表 + RLS + GRANT）⚠️ 待执行（SQL 需同步加入 GRANT 授权）
- 第七次迁移（多图轮播 item_images 表 + RLS + GRANT）⚠️ 待执行（SQL 已生成，需用户手动在 Supabase SQL Editor 执行）
- 当前共 9 张表 + item_images 待创建 + 灵感社区 4 张表待创建

## 下一步优先级

1. 执行第七次迁移（item_images 表），启用多图轮播功能
2. 修复投稿 image 字段兼容问题（执行第五次迁移）
3. 优化首页电脑端配色
4. 修复个人页换背景（验证 Safari 兼容）
5. 完善痛柜广场和别人主页社交入口
6. 完善灵感区（执行第六次迁移 + 权限 + 内容）
