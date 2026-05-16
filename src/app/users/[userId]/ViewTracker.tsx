"use client";

import { useEffect } from "react";
import { incrementCabinetViews } from "@/lib/profiles";

export default function ViewTracker({ userId, isOwner }: { userId: string; isOwner: boolean }) {
  useEffect(() => {
    if (!isOwner) {
      incrementCabinetViews(userId);
    }
  }, [userId, isOwner]);

  return null;
}
