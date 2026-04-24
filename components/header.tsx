"use client"

import { Bell, Search, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

const pageTitles: Record<string, string> = {
  "/": "Tableau de bord",
  "/recherche": "Recherche",
  "/direction": "Direction",
  "/workflows": "Workflows",
  "/sources-emails": "Sources Emails",
  "/types-docs": "Types de Documents",
  "/parametres": "Parametres",
}

export function Header() {
  const pathname = usePathname()
  const title = pageTitles[pathname] ?? "Akieni GED"
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <header className="sticky top-0 z-30 bg-card/95 backdrop-blur-xl border-b border-border">
      <div className="flex h-14 items-center justify-between px-6 gap-4">
        <h1 className="text-base font-semibold text-foreground shrink-0">{title}</h1>

        <div className="flex items-center gap-2 ml-auto">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              className="pl-9 h-9 w-48 text-sm bg-muted/50 border-0 focus-visible:ring-1 rounded-full"
            />
          </div>

          <Button 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9 text-muted-foreground hover:text-foreground rounded-full"
            onClick={toggleTheme}
          >
            {mounted && (
              theme === "dark" ? (
                <Sun className="h-4 w-4 transition-transform" />
              ) : (
                <Moon className="h-4 w-4 transition-transform" />
              )
            )}
          </Button>

          <Button variant="ghost" size="icon" className="relative h-9 w-9 text-muted-foreground hover:text-foreground rounded-full">
            <Bell className="h-4 w-4" />
            <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </Button>


        </div>
      </div>
    </header>
  )
}
