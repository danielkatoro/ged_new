"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { AuthGuard } from "@/components/auth-guard"
import { cn } from "@/lib/utils"

export function Shell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Sidebar onCollapsedChange={setCollapsed} />
        <div
          className={cn(
            "transition-all duration-300",
            collapsed ? "pl-[72px]" : "pl-64"
          )}
        >
          {children}
        </div>
      </div>
    </AuthGuard>
  )
}
