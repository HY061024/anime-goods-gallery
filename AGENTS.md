# AGENTS.md — Codex 项目指令

## 项目简介

**照影**（anime-goods-gallery）是一个二次元周边图鉴/社区网站。
- 域名：https://zyhy1000.com
- 部署：Vercel（main 分支 push 自动部署）
- GitHub：https://github.com/HY061024/anime-goods-gallery.git

## 技术栈

- Next.js 16 + React 19 + Tailwind CSS 4 + TypeScript
- Supabase（数据库 + Storage + Auth）
- 全局亮色主题，pink 色系 UI

## 每次开始任务前，必须先读取

1. `docs/PROJECT_STATUS.md` — 项目当前状态、已完成功能、待解决问题、下一步优先级
2. `docs/WORKLOG.md` — 历次修改记录，了解最近做了什么
3. `CLAUDE.md` — 完整的项目上下文（数据库表结构、迁移状态、架构决策、关键文件、已验证模式、注意事项、管理员路由结构）

## 每次完成任务后，必须更新

1. `docs/PROJECT_STATUS.md` — 如有状态变化（新功能完成 / 问题解决 / 优先级调整）
2. `docs/WORKLOG.md` — 按以下格式追加本次操作记录：

```
## YYYY-MM-DD
修改者：Codex
任务：（简述做了什么）
修改文件：
- path/to/file1.tsx
- path/to/file2.ts
完成内容：
1. 具体完成项1
2. 具体完成项2
数据库操作：无 / （描述执行的 SQL）
检查结果：
- npm run lint：
- npm run build：
下一步：（接下来应该做什么）
```

## 环境规则

- Windows 11 环境，终端命令**优先使用 PowerShell**
- Git 推送需通过 SOCKS5 代理（127.0.0.1:10808）
- 环境变量：NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY / SUPABASE_SERVICE_ROLE_KEY / ADMIN_CREATE_PASSWORD

## 行为约束

1. **不要一次性大范围重构**，逐步推进，每次改动尽量聚焦
2. **涉及数据库时**，先生成 SQL 让用户手动在 Supabase SQL Editor 执行，不要代为执行
3. **不要读取、展示或提交** `.env.local`、`.credentials.json` 等敏感文件
4. **修改后必须运行** `npm run lint` 和 `npm run build`，确认无报错
5. **不要破坏现有功能**：投稿、痛柜、好友、私信、灵感区均需保持正常
6. **不要修改 CLAUDE.md**（那是 Claude Code 的配置文件）
7. **全程使用中文**交流

## Server Action / Supabase 关键规则

- 所有导入 `supabaseAdmin` 或 `supabase` 的 lib 文件，如果可能被客户端组件引用，必须加 `"use server"` 指令
- `import "server-only"` 本身不足以防泄露——如果中间文件缺少 `"use server"`，Turbopack 仍会把整条依赖链打包进客户端
- 不要在 client component 中直接使用 server-only 的 supabaseAdmin
- Server Action 不直接调用 `redirect()`，改为返回 `{ redirectUrl }`，由客户端 `useRouter().push()` 导航
- 图片字段写入必须设置 `image = real_image_url || official_image_url`，不要删除旧 `image` 字段

## 数据库迁移 SQL 规范（Supabase 2026-05-30 起）

所有新建 public schema 表的迁移 SQL 必须包含 6 步：
1. `CREATE TABLE ...`
2. `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`
3. `CREATE POLICY ...`
4. `GRANT USAGE ON SCHEMA public TO anon, authenticated`
5. `GRANT SELECT, INSERT, UPDATE, DELETE ON <table> TO anon, authenticated`
6. 如使用 `BIGSERIAL`，还需 `GRANT USAGE ON SEQUENCE <seq_name> TO anon, authenticated`

不授权会导致 Data API 返回 403。详见 CLAUDE.md。

## 关键文件速查

| 文件 | 用途 |
|------|------|
| `src/lib/items.ts` | 商品查询 |
| `src/lib/itemActions.ts` | saveItem 核心写入 |
| `src/lib/collections.ts` | 收藏操作 |
| `src/lib/profiles.ts` | 用户资料 |
| `src/lib/friends.ts` | 好友 CRUD |
| `src/lib/messages.ts` | 站内消息 |
| `src/lib/inspiration.ts` | 灵感帖子 CRUD |
| `src/lib/inspirationComments.ts` | 灵感评论+点赞+收藏 |
| `src/lib/supabaseBrowser.ts` | 浏览器端 Supabase 客户端 |
| `src/lib/supabaseServer.ts` | Server Component 用客户端 |
| `src/lib/supabaseAction.ts` | Server Action 用客户端 |
| `src/lib/supabaseAdmin.ts` | service_role 写客户端 |
| `src/lib/compressImage.ts` | 图片压缩 |
| `src/components/ItemCard.tsx` | 商品卡片 |
| `src/components/FriendButton.tsx` | 好友按钮 |
| `src/components/InspirationCard.tsx` | 灵感帖子卡片 |
| `src/components/BottomNav.tsx` | 底部导航+侧边栏 |

> 完整的关键文件列表和架构决策见 CLAUDE.md。
