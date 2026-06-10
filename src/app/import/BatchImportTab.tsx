"use client";

export default function BatchImportTab() {
  return (
    <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center">
      <svg className="mx-auto h-12 w-12 text-slate-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
      <h3 className="mt-4 text-lg font-semibold text-slate-500">批量图片导入</h3>
      <p className="mt-2 text-sm text-slate-400">
        上传多张图片，每张单独填写名称，统一设置作品/角色/分类，一键生成多条图鉴草稿。
      </p>
      <span className="mt-4 inline-block rounded-full bg-slate-200 px-4 py-1.5 text-xs font-medium text-slate-500">
        后续开放
      </span>
    </div>
  );
}
