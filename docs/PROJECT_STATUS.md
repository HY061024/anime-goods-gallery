# PROJECT_STATUS.md — 照影项目状态

> 最后更新：2026-06-22（分支确认 + 本地构建验证）
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
- 灵感区（视频/笔记/素材/提问 4 种帖子 + 点赞/收藏/评论 + 图片/视频本地上传 + 标签智能处理）
- 用户资料页（头像/昵称/简介/背景图编辑 + 公开页完整资料）
- 管理员后台（路由分组 + 统一认证 + 审核/反馈/管理员管理）
- 底部导航栏（手机端底部 Tab + PC 端左侧侧边栏）
- 图片浏览器直传 Supabase Storage（绕过 Vercel 4.5MB 限制）
- 意见反馈（/feedback 提交 + /admin/feedback 管理）
- 智能导入图鉴（/import — 链接解析/截图导入，自动生成待审核草稿）

## 当前重点问题

1. **投稿 image 字段兼容**：items.image 有 NOT NULL 约束，代码层面已通过 `image = real_image_url || official_image_url` fallback 缓解，但数据库层面第五次迁移（DROP NOT NULL）仍未执行
2. **首页电脑端配色**：文字对比度和配色在桌面端仍需协调优化
3. **用户个人页换背景按钮**：Safari 兼容问题已通过 label+htmlFor 模式修复，需验证
4. **痛柜和好友入口**：痛柜广场和别人主页的社交入口仍需完善
5. **灵感区**：需要补充内容和完善发布权限

## 数据库状态

- **Supabase 安全变更（2026-05-30）**：新建 public schema 表不再默认暴露给 Data API。以后所有迁移 SQL 必须包含 6 步：CREATE TABLE + RLS + POLICY + GRANT USAGE ON SCHEMA + 表级 GRANT + BIGSERIAL sequence GRANT。详见 CLAUDE.md。
- **线上详情页错误修复（2026-05-30）**：多图轮播上线后，详情页曾因 Server Component 向 Client Component 传 render function children 触发 RSC 错误；已改为客户端组件内部渲染 ImageCarousel + Lightbox。
- 第一次迁移（用户系统+通知）✅
- 第二次迁移（痛柜功能核心）✅
- 第三次迁移（浏览量计数）✅
- 第四次迁移（好友+消息+反馈+个人资料扩展+管理员）✅
- 第五次迁移（图片结构升级：DROP NOT NULL + COALESCE 回填）⚠️ 待执行
- 第六次迁移（灵感社区 4 张表 + RLS + GRANT）⚠️ 待执行（SQL 需同步加入 GRANT 授权）
- 第七次迁移（多图轮播 item_images 表 + RLS + GRANT）⚠️ 待执行
- 第八次迁移（灵感区图片多图 image_urls 字段）⚠️ 待执行
- 第九次迁移（智能导入 import_jobs + import_candidates 表 + items 来源字段）⚠️ 待执行（可重复执行版本，含 DROP POLICY IF EXISTS）
- 当前共 9 张表 + item_images 待创建 + 灵感社区 4 张表待创建 + import 2 张表待创建

## 当前分支与环境

- **当前分支**：`main`（跟踪 `origin/main`）
- **HEAD**：`0d3f2dc feat: add smart import entry points`
- **/import 页面**：✅ 存在（`src/app/import/page.tsx` + 5 个子模块）
- **智能导入入口**：✅ 首页 Hero 按钮 + 快捷功能区 + PC 侧边栏 + 手机底部导航 + 投稿页链接，共 5 处入口
- **TypeScript 编译**：✅ 通过（`npx tsc --noEmit` 0 errors）
- **npm run build**：⚠️ 在"收集页面数据"阶段失败，原因是 `.env.local` 缺少 `SUPABASE_SERVICE_ROLE_KEY`，导致 `src/lib/supabaseAdmin.ts` 模块加载时抛错。**这不是代码回退或入口丢失，而是本地环境变量不完整。**
- **下一步**：由我手动补充 `SUPABASE_SERVICE_ROLE_KEY` 后，再运行 `npm run build` 验证。

## 下一步优先级

1. ⚠️ **紧急**：本地 `.env.local` 补充 `SUPABASE_SERVICE_ROLE_KEY`，使 `npm run build` 通过
2. 执行第七次迁移（item_images 表），启用多图轮播功能
3. 修复投稿 image 字段兼容问题（执行第五次迁移）
4. 优化首页电脑端配色
5. 修复个人页换背景（验证 Safari 兼容）
6. 完善痛柜广场和别人主页社交入口
7. 完善灵感区（执行第六次迁移 + 权限 + 内容）
