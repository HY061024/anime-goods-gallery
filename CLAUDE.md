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
- Vercel 部署 (项目名: goods)
- 自定义域名: zyhy1000.com (待接入)

## 环境变量

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
- SUPABASE_SERVICE_ROLE_KEY
- ADMIN_CREATE_PASSWORD

## 当前进度

- 2026-05-16: 项目初始版本已完成（首页、商品列表、商品详情、后台管理、Supabase 连接）
- 待验证: 本地启动、Supabase 数据连接、Vercel 线上部署、商品图片路径
- 待办: zyhy1000.com 域名接入 Vercel、Cloudflare 代理问题处理

