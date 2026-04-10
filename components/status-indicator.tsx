"use client"

import { cn } from "@/lib/utils"

export type StatusState = "idle" | "loading" | "success" | "error"

interface StatusIndicatorProps {
  state: StatusState
  message: string
}

export function StatusIndicator({ state, message }: StatusIndicatorProps) {
  return (
    <div className="flex items-center gap-2 h-5">
      <div
        className={cn(
          "w-1.5 h-1.5 rounded-full shrink-0 transition-colors",
          state === "idle" && "bg-muted-foreground",
          state === "loading" && "bg-primary animate-pulse",
          state === "success" && "bg-emerald-500",
          state === "error" && "bg-red-400"
        )}
      />
      <span className="font-mono text-[11px] text-muted-foreground">
        {message}
      </span>
    </div>
  )
}
