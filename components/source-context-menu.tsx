"use client"

import { Button } from "@/components/ui/button"
import { 
  MoreHorizontal, 
  Zap, 
  Pause, 
  Play,
  AlertCircle,
  Settings,
  Bell,
  Wifi,
  Trash2,
  ChevronDown
} from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface SourceContextMenuProps {
  source: {
    address: string
    connected: boolean
    errors: number
  }
  onForceSync?: () => void
  onPause?: () => void
  onResume?: () => void
  onViewLogs?: () => void
  onModifyConfig?: () => void
  onManageAlerts?: () => void
  onTestConnection?: () => void
  onDelete?: () => void
  isPaused?: boolean
}

export function SourceContextMenu({
  source,
  onForceSync,
  onPause,
  onResume,
  onViewLogs,
  onModifyConfig,
  onManageAlerts,
  onTestConnection,
  onDelete,
  isPaused = false,
}: SourceContextMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  const menuItems = [
    {
      label: "Forcer la synchronisation",
      icon: Zap,
      onClick: () => {
        onForceSync?.()
        setIsOpen(false)
      },
      color: "text-foreground",
      section: "flux",
    },
    {
      label: isPaused ? "Réactiver" : "Mettre en pause",
      icon: isPaused ? Play : Pause,
      onClick: () => {
        isPaused ? onResume?.() : onPause?.()
        setIsOpen(false)
      },
      color: "text-foreground",
      section: "flux",
    },
    {
      label: "Voir les logs d'erreurs",
      icon: AlertCircle,
      onClick: () => {
        onViewLogs?.()
        setIsOpen(false)
      },
      color: source.errors > 0 ? "text-amber-500" : "text-foreground",
      highlight: source.errors > 0,
      section: "flux",
    },
    {
      label: "Modifier la configuration",
      icon: Settings,
      onClick: () => {
        onModifyConfig?.()
        setIsOpen(false)
      },
      color: "text-foreground",
      section: "config",
    },
    {
      label: "Gérer les alertes",
      icon: Bell,
      onClick: () => {
        onManageAlerts?.()
        setIsOpen(false)
      },
      color: "text-foreground",
      section: "config",
    },
    {
      label: "Tester la connexion",
      icon: Wifi,
      onClick: () => {
        onTestConnection?.()
        setIsOpen(false)
      },
      color: "text-foreground",
      section: "maintenance",
    },
    {
      label: "Supprimer la source",
      icon: Trash2,
      onClick: () => {
        onDelete?.()
        setIsOpen(false)
      },
      color: "text-destructive",
      section: "maintenance",
    },
  ]

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-muted-foreground"
        onClick={() => setIsOpen(!isOpen)}
      >
        <MoreHorizontal className="h-3.5 w-3.5" />
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-1 w-56 bg-card border border-border rounded-lg shadow-lg z-40 py-1">
            {/* Flux Management */}
            <div>
              {menuItems
                .filter(item => item.section === "flux")
                .map((item, i) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={i}
                      onClick={item.onClick}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-muted/60 transition-colors",
                        item.highlight && "bg-muted/40"
                      )}
                    >
                      <Icon className={cn("h-4 w-4", item.color)} />
                      <span className="text-foreground">{item.label}</span>
                    </button>
                  )
                })}
            </div>

            <div className="h-px bg-border my-1" />

            {/* Configuration */}
            <div>
              {menuItems
                .filter(item => item.section === "config")
                .map((item, i) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={i}
                      onClick={item.onClick}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-muted/60 transition-colors"
                    >
                      <Icon className={cn("h-4 w-4", item.color)} />
                      <span className="text-foreground">{item.label}</span>
                    </button>
                  )
                })}
            </div>

            <div className="h-px bg-border my-1" />

            {/* Maintenance */}
            <div>
              {menuItems
                .filter(item => item.section === "maintenance")
                .map((item, i) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={i}
                      onClick={item.onClick}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-muted/60 transition-colors",
                        item.section === "maintenance" && i === 1 && "hover:bg-destructive/10"
                      )}
                    >
                      <Icon className={cn("h-4 w-4", item.color)} />
                      <span className={cn("text-foreground", item.section === "maintenance" && i === 1 && "text-destructive")}>
                        {item.label}
                      </span>
                    </button>
                  )
                })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
