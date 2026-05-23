import Link from "next/link";
import { createClient } from "@/lib/supabaseServer";
import { getProfile } from "@/lib/profiles";
import { logout } from "@/lib/authActions";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    try {
      profile = await getProfile(user.id);
    } catch {
      // profile 可能尚未创建
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-xl font-bold text-slate-800">个人中心</h1>

      {user ? (
        <>
          {/* 用户信息卡片 */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-pink-100">
            <div className="flex items-center gap-4">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="头像"
                  className="h-16 w-16 rounded-full object-cover ring-2 ring-pink-100"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-pink-100 text-2xl font-bold text-pink-500">
                  {(profile?.display_name ?? user.email ?? "用").charAt(0)}
                </div>
              )}
              <div>
                <p className="text-lg font-semibold text-slate-800">
                  {profile?.display_name ?? "未设置昵称"}
                </p>
                <p className="text-sm text-slate-500">{user.email}</p>
              </div>
            </div>
            <div className="mt-4">
              <Link
                href="/mypage"
                className="inline-block rounded-xl bg-pink-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-pink-600"
              >
                编辑资料
              </Link>
            </div>
          </div>

          {/* 快捷入口 */}
          <div className="mt-4 space-y-2">
            <SectionTitle>我的内容</SectionTitle>
            <ProfileLink href="/mypage" icon={<CabinetIcon />} label="我的投稿" />
            <ProfileLink href="/mypage" icon={<GridIcon />} label="我的痛柜" />
            <ProfileLink href="/mypage/friends" icon={<FriendsIcon />} label="好友" />
            <ProfileLink
              href="/mypage/messages"
              icon={<MessageIcon />}
              label="消息"
            />
            <ProfileLink href="/cabinets" icon={<CabinetSquareIcon />} label="痛柜广场" />
          </div>

          <div className="mt-4 space-y-2">
            <SectionTitle>设置与反馈</SectionTitle>
            <ProfileLink href="/feedback" icon={<FeedbackIcon />} label="意见反馈" />
            <ProfileLink href="/admin" icon={<AdminIcon />} label="后台管理" />
          </div>

          {/* 退出登录 */}
          <form action={logout} className="mt-6">
            <button
              type="submit"
              className="w-full rounded-xl border border-red-200 px-4 py-3 text-sm font-medium text-red-500 transition hover:bg-red-50"
            >
              退出登录
            </button>
          </form>
        </>
      ) : (
        <>
          {/* 未登录 */}
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm border border-pink-100">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-pink-100">
              <svg
                className="h-10 w-10 text-pink-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <p className="mb-2 text-lg font-semibold text-slate-800">
              登录后使用完整功能
            </p>
            <p className="mb-6 text-sm text-slate-500">
              登录后可管理投稿、痛柜、好友和消息
            </p>
            <div className="flex justify-center gap-3">
              <Link
                href="/auth/login"
                className="rounded-xl bg-pink-500 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-pink-600"
              >
                登录
              </Link>
              <Link
                href="/auth/signup"
                className="rounded-xl border border-pink-200 px-6 py-2.5 text-sm font-medium text-pink-500 transition hover:bg-pink-50"
              >
                注册
              </Link>
            </div>
          </div>

          <div className="mt-4">
            <ProfileLink href="/feedback" icon={<FeedbackIcon />} label="意见反馈" />
          </div>
        </>
      )}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-1 text-xs font-medium uppercase tracking-wider text-slate-400">
      {children}
    </p>
  );
}

function ProfileLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm border border-pink-100 transition hover:bg-pink-50"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-50 text-pink-500">
        {icon}
      </span>
      <span className="text-sm font-medium text-slate-600">{label}</span>
      <svg
        className="ml-auto h-4 w-4 text-slate-300"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5l7 7-7 7"
        />
      </svg>
    </Link>
  );
}

function CabinetIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  );
}

function FriendsIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}

function FeedbackIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
    </svg>
  );
}

function AdminIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function CabinetSquareIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  );
}
