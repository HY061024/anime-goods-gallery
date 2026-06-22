# Supabase SQL Editor Backup

说明：
- 以下内容来自 Supabase SQL Editor 左侧 PRIVATE 查询记录。
- 仅用于备份和项目上下文恢复。
- 未经检查不要重复运行。
- 不要在这里保存 service_role key、secret key、DeepSeek API Key、Vercel Token 或任何密码。
- 如果 SQL 中出现密钥、密码、Token，请用 [REDACTED] 替换。

备份时间：2026-06-18  
项目：anime-goods-gallery / zyhy1000.com

---

## 01. Import Job & Candidate Tracking with RLS

来源：Supabase SQL Editor / PRIVATE  
状态：疑似已执行，未复核  
用途：待整理  
是否可重复运行：待检查，暂时不要运行  

```sql
insert into public.items
(title, work, character, category, price, description, image)
values
(
  '初音未来 雪未来2024 亚克力立牌',
  'VOCALOID',
  '初音未来',
  '亚克力',
  88,
  '雪未来主题亚克力立牌，适合桌面展示和收藏。',
  '/goods/changli.jpg'
),
(
  '长离 Q版徽章',
  '鸣潮',
  '长离',
  '吧唧',
  35,
  '鸣潮角色长离主题 Q 版徽章，可用于痛包、收藏展示。',
  '/goods/changli.jpg'
),
(
  '亚丝娜 角色挂件',
  '刀剑神域',
  '亚丝娜',
  '挂件',
  45,
  '刀剑神域亚丝娜角色挂件，适合钥匙、包挂装饰。',
  '/goods/kirito.jpg'
),
(
  '桐人 黑衣剑士色纸',
  '刀剑神域',
  '桐人',
  '色纸',
  28,
  '桐人黑衣剑士主题色纸，适合收藏和展示。',
  '/goods/kirito.jpg'
),
(
  '芙宁娜 Q版亚克力钥匙扣',
  '原神',
  '芙宁娜',
  '挂件',
  39,
  '芙宁娜 Q 版亚克力钥匙扣，轻便可爱。',
  '/goods/cantarella.jpg'
),
(
  '坎特蕾拉 角色徽章',
  '鸣潮',
  '坎特蕾拉',
  '吧唧',
  32,
  '坎特蕾拉角色徽章，可用于痛包搭配。',
  '/goods/cantarella.jpg'
);
```

---
## 02. List Policies for Import Tables

来源：Supabase SQL Editor / PRIVATE  
状态：疑似已执行，未复核  
用途：待整理  
是否可重复运行：待检查，暂时不要运行  

```sql
这里粘贴第二条 SQL
```

---