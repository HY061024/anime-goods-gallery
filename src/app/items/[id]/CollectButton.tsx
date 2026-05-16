"use client";

import { useState } from "react";
import { collectItem } from "@/app/actions";

export default function CollectButton({
  itemId,
  initialCollected,
}: {
  itemId: number;
  initialCollected: boolean;
}) {
  const [collected, setCollected] = useState(initialCollected);

  async function handleCollect() {
    await collectItem(itemId);
    setCollected(true);
  }

  if (collected) {
    return (
      <span className="inline-block rounded-xl bg-pink-50 px-5 py-2.5 text-sm font-medium text-pink-500">
        已加入痛柜
      </span>
    );
  }

  return (
    <button
      onClick={handleCollect}
      className="rounded-xl border-2 border-pink-300 bg-white px-5 py-2.5 text-sm font-medium text-pink-500 transition hover:bg-pink-50 active:bg-pink-100"
    >
      ＋ 加入我的痛柜
    </button>
  );
}
