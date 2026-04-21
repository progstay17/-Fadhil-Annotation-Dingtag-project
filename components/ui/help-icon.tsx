"use client"

import * as React from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface HelpIconProps {
  children: React.ReactNode
  className?: string
}

export function HelpIcon({ children, className }: HelpIconProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "ml-1 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full border border-slate-300 dark:border-slate-600 w-4 h-4 flex items-center justify-center shrink-0 transition-colors cursor-pointer",
            className
          )}
        >
          ?
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4 shadow-xl bg-popover text-popover-foreground border-border z-50">
        <div className="font-mono text-xs whitespace-pre-wrap leading-relaxed">
          {children}
        </div>
      </PopoverContent>
    </Popover>
  )
}
