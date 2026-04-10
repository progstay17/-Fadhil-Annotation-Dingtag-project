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
      <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
        <span className="font-mono text-[11px] text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
        {hint && (
          <span className="font-mono text-[11px] text-muted-foreground">
            {hint}
          </span>
        )}
      </div>
      <div className="p-4">{children}</div>
      {actions && (
        <div className="px-4 py-2.5 border-t border-border flex gap-2">
          {actions}
        </div>
      )}
    </div>
  )
}
