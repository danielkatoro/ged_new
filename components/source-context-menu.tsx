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
  Trash2,
  FolderSearch,
} from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { ErrorLogsModal } from "./error-logs-modal"
import { DeleteConfirmDialog } from "./delete-confirm-dialog"

interface SourceContextMenuProps {
  source: {
    id: number
    address: string
    label: string
    connected: boolean
    errors: number
    isPaused: boolean
  }
  onForceSync?: () => void
  onPause?: () => void
  onResume?: () => void
  onViewLogs?: () => void
  onModifyConfig?: () => void
  onManageAlerts?: () => void
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
  onDelete,
  isPaused = false,
}: SourceContextMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showErrorLogs, setShowErrorLogs] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 })
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setMenuPosition({
        top: rect.bottom + 8,
        left: rect.right - 224,
      })
    }
  }, [isOpen])

  const menuItems = [
    {
      label: "Consulter les documents",
      icon: FolderSearch,
      onClick: () => {
        router.push(`/recherche?source=${encodeURIComponent(source.address)}`)
        setIsOpen(false)
      },
      color: "text-foreground",
      section: "flux",
    },
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
        setShowErrorLogs(true)
        setIsOpen(false)
      },
      color: source.errors > 0 ? "text-amber-500" : "text-foreground",
      highlight: source.errors > 0,
      section: "flux",
      disabled: source.errors === 0,
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
      label: "Supprimer la source",
      icon: Trash2,
      onClick: () => {
        setShowDeleteConfirm(true)
        setIsOpen(false)
      },
      color: "text-destructive",
      section: "maintenance",
    },
  ]

  return (
    <div>
      <Button
        ref={buttonRef}
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
          <div
            ref={menuRef}
            className="fixed w-56 bg-card border border-border rounded-lg shadow-xl z-50 py-1"
            style={{
              top: `${menuPosition.top}px`,
              left: `${menuPosition.left}px`,
            }}
          >
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
                      disabled={item.disabled}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-muted/60 transition-colors",
                        item.highlight && "bg-muted/40",
                        item.disabled && "opacity-50 cursor-not-allowed"
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
                        item.color === "text-destructive" && "hover:bg-destructive/10"
                      )}
                    >
                      <Icon className={cn("h-4 w-4", item.color)} />
                      <span className={cn("text-foreground", item.color === "text-destructive" && "text-destructive")}>
                        {item.label}
                      </span>
                    </button>
                  )
                })}
            </div>
          </div>
        </>
      )}

      {/* Error Logs Modal */}
      <ErrorLogsModal
        isOpen={showErrorLogs}
        onClose={() => setShowErrorLogs(false)}
        sourceName={source.label}
        errors={source.errors}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={showDeleteConfirm}
        onConfirm={() => {
          onDelete?.()
          setShowDeleteConfirm(false)
        }}
        onCancel={() => setShowDeleteConfirm(false)}
        sourceName={source.label}
      />
    </div>
  )
}
