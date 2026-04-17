"use client"

import { ReactNode } from "react"

interface TranscriptionCardProps {
  label: ReactNode
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
      <div className="px-4 py-2.5 border-b border-border flex flex-wrap items-center justify-between gap-y-2 gap-x-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 min-w-0 flex-1">
          <div className="font-mono text-[11px] text-muted-foreground uppercase tracking-wider whitespace-nowrap">
            {label}
          </div>
          {hint && (
            <div className="font-mono text-[11px] text-muted-foreground">
              {hint}
            </div>
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
