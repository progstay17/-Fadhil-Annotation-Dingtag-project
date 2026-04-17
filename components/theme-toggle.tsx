"use client"

import { useState, useEffect } from "react"
import { Sun, Moon } from "lucide-react"

export function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark")

  useEffect(() => {
    const savedTheme = localStorage.getItem("tb_theme") as "dark" | "light" | null
    if (savedTheme) {
      setTheme(savedTheme)
      if (savedTheme === "light") {
        document.documentElement.classList.add("light")
      }
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark"
    setTheme(newTheme)
    localStorage.setItem("tb_theme", newTheme)

    if (newTheme === "light") {
      document.documentElement.classList.add("light")
    } else {
      document.documentElement.classList.remove("light")
    }
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-md border border-border bg-card hover:bg-secondary/50 transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="w-4 h-4" />
      ) : (
        <Moon className="w-4 h-4" />
      )}
    </button>
  )
}
