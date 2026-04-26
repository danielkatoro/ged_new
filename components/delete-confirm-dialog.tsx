"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DeleteConfirmDialogProps {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
  sourceName: string
}

export function DeleteConfirmDialog({
  isOpen,
  onConfirm,
  onCancel,
  sourceName,
}: DeleteConfirmDialogProps) {
  if (!isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-40 transition-opacity duration-200"
        onClick={onCancel}
      />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[380px] bg-background z-50 shadow-2xl rounded-lg animate-in fade-in duration-300 border border-border flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Supprimer la source</h3>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onCancel}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="px-4 py-4 space-y-3">
          <p className="text-sm text-foreground">
            Êtes-vous sûr de vouloir supprimer la source{" "}
            <span className="font-semibold">{sourceName}</span> ?
          </p>
          <div className="p-3 rounded bg-destructive/5 border border-destructive/20">
            <p className="text-xs text-destructive font-medium">
              Cette action est irréversible. Tous les paramètres de cette source seront supprimés.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-border bg-muted/30">
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="text-xs h-8"
          >
            Annuler
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={onConfirm}
            className="text-xs h-8"
          >
            Supprimer
          </Button>
        </div>
      </div>
    </>
  )
}
