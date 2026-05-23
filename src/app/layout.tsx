import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import BottomNav from "@/components/BottomNav";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabaseServer";
import { getTotalUnreadCount } from "@/lib/messages";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "照影 - 二次元周边图鉴与同好灵感社区",
  description: "照影 — 二次元周边图鉴与同好灵感社区，收录手办、吧唧、亚克力、色纸、挂件等周边，分享你的收藏记忆与灵感",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let unreadMessages = 0;
  if (user) {
    try {
      unreadMessages = await getTotalUnreadCount(user.id);
    } catch {
      // messages 表可能尚未创建
    }
  }

  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-[#faf5ff] font-sans">
        <BottomNav
          userEmail={user?.email ?? null}
          unreadMessages={unreadMessages}
        />
        <main className="flex-1 lg:ml-[4.5rem] pb-14 lg:pb-0">
          {children}
        </main>
        <Footer className="hidden md:block lg:ml-[4.5rem]" />
      </body>
    </html>
  );
}
