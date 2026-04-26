"use client"

import { X, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ErrorLogsModalProps {
  isOpen: boolean
  onClose: () => void
  sourceName: string
  errors: number
}

const simulatedErrors = [
  {
    time: "14:32:45",
    type: "Invalid attachment format",
    description: "File 'invoice_2024.rar' was rejected - RAR format not supported",
    severity: "warning"
  },
  {
    time: "14:15:22",
    type: "Connection timeout",
    description: "IMAP server connection exceeded 30s timeout. Retrying...",
    severity: "error"
  },
  {
    time: "13:48:10",
    type: "Invalid attachment format",
    description: "File 'document.exe' was rejected - Executable files not allowed",
    severity: "warning"
  },
]

export function ErrorLogsModal({ isOpen, onClose, sourceName, errors }: ErrorLogsModalProps) {
  if (!isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-40 transition-opacity duration-200"
        onClick={onClose}
      />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[500px] bg-background z-50 shadow-2xl rounded-lg animate-in fade-in duration-300 border border-border flex flex-col max-h-[70vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Logs d&apos;erreurs</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{sourceName}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded bg-amber-500/10 border border-amber-500/20">
            <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0" />
            <p className="text-xs text-amber-700">
              <span className="font-semibold">{errors} erreurs</span> detectées lors des dernières synchronisations
            </p>
          </div>

          {simulatedErrors.map((error, i) => (
            <div
              key={i}
              className={cn(
                "p-3 rounded border",
                error.severity === "error"
                  ? "bg-destructive/5 border-destructive/20"
                  : "bg-amber-500/5 border-amber-500/20"
              )}
            >
              <div className="flex items-start gap-2">
                <AlertCircle
                  className={cn(
                    "h-4 w-4 mt-0.5 flex-shrink-0",
                    error.severity === "error"
                      ? "text-destructive"
                      : "text-amber-500"
                  )}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-foreground">{error.type}</p>
                    <span className="text-[10px] text-muted-foreground flex-shrink-0">{error.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{error.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 px-4 py-3 border-t border-border bg-muted/30">
          <p className="text-xs text-muted-foreground">Derniere vérification: Il y a 2 min</p>
          <Button
            size="sm"
            variant="outline"
            onClick={onClose}
            className="text-xs h-8"
          >
            Fermer
          </Button>
        </div>
      </div>
    </>
  )
}
