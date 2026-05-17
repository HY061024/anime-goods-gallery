"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import Link from "next/link";
import { sendMessage } from "@/lib/messages";
import type { Message } from "@/lib/messages";

export default function ChatView({
  currentUserId,
  partnerId,
  partnerName,
  initialMessages,
}: {
  currentUserId: string;
  partnerId: string;
  partnerName: string;
  initialMessages: Message[];
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [text, setText] = useState("");
  const [isPending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView();
  }, []);

  function handleSend() {
    if (!text.trim()) return;
    const content = text;
    setText("");
    startTransition(async () => {
      const result = await sendMessage(currentUserId, partnerId, content);
      if (!result.error) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            sender_id: currentUserId,
            receiver_id: partnerId,
            content,
            is_read: false,
            created_at: new Date().toISOString(),
          },
        ]);
      }
    });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
        <Link
          href="/mypage/messages"
          className="text-gray-400 hover:text-gray-600 shrink-0"
        >
          ← 返回
        </Link>
        <Link
          href={`/users/${partnerId}`}
          className="text-sm font-medium text-gray-900 hover:text-pink-500"
        >
          {partnerName}
        </Link>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-sm text-gray-400 mt-8">暂无消息，打个招呼吧</p>
        )}
        {messages.map((msg) => {
          const isMine = msg.sender_id === currentUserId;
          return (
            <div
              key={msg.id}
              className={`flex ${isMine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  isMine
                    ? "bg-pink-500 text-white rounded-br-md"
                    : "bg-gray-100 text-gray-800 rounded-bl-md"
                }`}
              >
                {msg.content}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-gray-100 px-4 py-3">
        <div className="flex gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入消息…（Enter 发送）"
            rows={1}
            className="flex-1 resize-none rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-pink-400"
          />
          <button
            onClick={handleSend}
            disabled={isPending || !text.trim()}
            className="rounded-xl bg-pink-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-pink-600 disabled:opacity-50 shrink-0"
          >
            发送
          </button>
        </div>
      </div>
    </div>
  );
}
