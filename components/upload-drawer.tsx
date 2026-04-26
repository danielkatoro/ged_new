"use client"

import { useEffect, useState } from "react"
import { uploadManager, UploadProgress } from "@/lib/upload-manager"
import { ChevronUp, X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function UploadDrawer() {
  const [uploads, setUploads] = useState<UploadProgress[]>([])
  const [isExpanded, setIsExpanded] = useState(true)

  useEffect(() => {
    const unsubscribe = uploadManager.subscribe((updatedUploads) => {
      setUploads(updatedUploads)
      if (updatedUploads.length > 0) {
        setIsExpanded(true)
      }
    })

    return unsubscribe
  }, [])

  if (uploads.length === 0) return null

  const isProcessing = uploads.some(u => u.status === 'processing')
  const hasErrors = uploads.some(u => u.status === 'error')
  const completedCount = uploads.filter(u => u.status === 'completed').length
  const totalCount = uploads.length

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40">
      {/* Collapsed Header */}
      <div
        className={cn(
          "bg-card border-t border-border transition-all",
          isExpanded ? "hidden" : "block"
        )}
      >
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center">
              <Loader2 className="h-3 w-3 text-primary animate-spin" />
            </div>
            <span className="text-sm font-medium text-foreground">
              {completedCount}/{totalCount} uploads complétés
            </span>
          </div>
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* Expanded Drawer */}
      {isExpanded && (
        <>
          <div className="bg-card border-t border-border">
            {/* Header */}
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-foreground">Uploads en cours</h3>
                <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
                  {completedCount}/{totalCount}
                </span>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
            </div>

            {/* Upload Items */}
            <div className="divide-y divide-border max-h-80 overflow-y-auto">
              {uploads.map((upload) => (
                <div key={upload.fileId} className="px-4 py-3 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground truncate">
                          {upload.fileName}
                        </p>
                        {upload.status === 'completed' && (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                        )}
                        {upload.status === 'error' && (
                          <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                        )}
                        {upload.status === 'uploading' && (
                          <Loader2 className="h-4 w-4 text-primary animate-spin flex-shrink-0" />
                        )}
                        {upload.status === 'processing' && (
                          <Loader2 className="h-4 w-4 text-primary animate-spin flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {upload.status === 'uploading' && `${upload.progress.toFixed(0)}% • ${(upload.uploadedSize / 1024 / 1024).toFixed(1)}/${(upload.fileSize / 1024 / 1024).toFixed(1)} MB`}
                        {upload.status === 'processing' && 'Traitement en cours...'}
                        {upload.status === 'completed' && 'Upload complété'}
                        {upload.status === 'error' && upload.error}
                      </p>
                    </div>
                    {(upload.status === 'error' || upload.status === 'completed') && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => uploadManager.removeUpload(upload.fileId)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {/* Progress Bar */}
                  {(upload.status === 'uploading' || upload.status === 'processing') && (
                    <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-300",
                          upload.status === 'processing'
                            ? "bg-primary/50"
                            : "bg-primary"
                        )}
                        style={{ width: `${Math.min(upload.progress, 100)}%` }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
