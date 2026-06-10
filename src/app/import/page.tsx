"use client";

import { useState } from "react";
import Link from "next/link";
import LinkImportTab from "./LinkImportTab";
import ScreenshotImportTab from "./ScreenshotImportTab";
import BatchImportTab from "./BatchImportTab";

type TabKey = "link" | "screenshot" | "batch";

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: "link", label: "链接导入", icon: "🔗" },
  { key: "screenshot", label: "截图导入", icon: "📸" },
  { key: "batch", label: "批量导入", icon: "📦" },
];

export default function ImportPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("link");

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-8">
      {/* 返回 */}
      <Link
        href="/items"
        className="text-sm font-medium text-pink-500 transition hover:text-pink-600"
      >
        ← 返回图鉴
      </Link>

      {/* 标题 */}
      <h1 className="mt-3 text-2xl font-bold text-slate-800">智能导入图鉴</h1>
      <p className="mt-2 text-sm text-slate-500">
        从小红书、B站、微博、贴吧等网页链接或截图中快速生成图鉴草稿
      </p>

      {/* 合规提示 */}
      <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-700 leading-relaxed">
        <p className="font-medium">⚠️ 使用须知</p>
        <p className="mt-1">
          请确认你有权上传相关图片和信息，勿上传侵权素材或盗版资源。
          系统仅读取公开可访问的页面标题和预览图，不会抓取评论、点赞或用户隐私数据。
          导入内容将进入待审核队列，不会自动公开。
        </p>
      </div>

      {/* Tab 切换 */}
      <div className="mt-6 grid grid-cols-3 rounded-xl bg-slate-100 p-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-lg py-2.5 text-sm font-medium transition ${
              activeTab === tab.key
                ? "bg-white text-pink-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <span className="mr-1">{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab 内容 */}
      <div className="mt-5">
        {activeTab === "link" && <LinkImportTab />}
        {activeTab === "screenshot" && <ScreenshotImportTab />}
        {activeTab === "batch" && <BatchImportTab />}
      </div>

      {/* 底部说明 */}
      <div className="mt-8 rounded-xl bg-slate-50 border border-slate-100 px-4 py-4 text-xs text-slate-400 leading-relaxed">
        <p className="font-medium text-slate-500">使用步骤</p>
        <ol className="mt-1.5 space-y-1 list-decimal list-inside">
          <li>选择导入方式：粘贴链接或上传截图</li>
          <li>系统自动解析（或手动填写）图鉴信息</li>
          <li>编辑确认后提交，进入待审核队列</li>
          <li>管理员审核通过后公开显示</li>
          <li>其他用户可以补充作品、角色、价格等信息</li>
        </ol>
      </div>
    </div>
  );
}
