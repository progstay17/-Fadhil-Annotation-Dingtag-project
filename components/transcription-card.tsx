"use client"

import { ReactNode } from "react"

interface TranscriptionCardProps {
  label: string
  hint?: ReactNode
  children: ReactNode
  actions?: ReactNode
}

export function TranscriptionCard({
  label,
  hint,
  children,
  actions,
}: TranscriptionCardProps) {
  return (
    <div className="w-full bg-card border border-border rounded-md overflow-hidden">
      <div className="px-4 py-2.5 border-b border-border flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <span className="font-mono text-[11px] text-muted-foreground uppercase tracking-wider whitespace-nowrap">
            {label}
          </span>
          {hint && (
            <span className="font-mono text-[11px] text-muted-foreground truncate">
              {hint}
            </span>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2 shrink-0">
            {actions}
          </div>
        )}
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}
