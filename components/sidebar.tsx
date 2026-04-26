"use client"

import { cn } from "@/lib/utils"
import {
  House,
  Search,
  Mail,
  Tag,
  Settings,
  LogOut,
  ChevronLeft,
  Building2,
  Trash2,
} from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { destroySession, getCurrentUser, type User } from "@/lib/auth-store"

const navigation = [
  { name: "Accueil", icon: House, href: "/" },
  { name: "Recherche", icon: Search, href: "/recherche" },
  { name: "Directions", icon: Building2, href: "/direction" },
  { name: "Sources Emails", icon: Mail, href: "/sources-emails" },
  { name: "Types de Docs", icon: Tag, href: "/types-docs" },
  { name: "Corbeille", icon: Trash2, href: "/corbeille" },
]

interface SidebarProps {
  onCollapsedChange?: (collapsed: boolean) => void
}

export function Sidebar({ onCollapsedChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    setCurrentUser(getCurrentUser())
  }, [])

  const handleLogout = () => {
    destroySession()
    router.replace("/login")
  }

  const handleToggle = () => {
    const next = !collapsed
    setCollapsed(next)
    onCollapsedChange?.(next)
  }

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen transition-all duration-300 flex flex-col",
        "bg-card border-r border-border",
        collapsed ? "w-[72px]" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-foreground text-background font-bold text-sm flex-shrink-0">
            A
          </div>
          {!collapsed && (
            <div>
              <span className="font-semibold text-foreground tracking-tight text-sm block leading-none">
                Akieni
              </span>
              <span className="text-xs text-muted-foreground font-normal">GED</span>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={handleToggle}
        >
          <ChevronLeft
            className={cn(
              "h-4 w-4 transition-transform",
              collapsed && "rotate-180"
            )}
          />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <item.icon className="flex-shrink-0 h-[18px] w-[18px]" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-3 space-y-1">
        <Link
          href="/parametres"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
            pathname === "/parametres"
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          )}
        >
          <Settings className="h-[18px] w-[18px] flex-shrink-0" />
          {!collapsed && <span>Parametres</span>}
        </Link>

        <div
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2",
            collapsed ? "justify-center" : ""
          )}
        >
          <Avatar className="h-9 w-9 border-2 border-border flex-shrink-0">
            <AvatarFallback className="bg-muted text-foreground font-medium text-sm">
              {currentUser?.initials ?? "?"}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {currentUser ? `${currentUser.prenom} ${currentUser.nom}` : "—"}
              </p>
              <p className="text-xs text-muted-foreground truncate">{currentUser?.role ?? ""}</p>
            </div>
          )}
          {!collapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={handleLogout}
              title="Se déconnecter"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </aside>
  )
}
