"use client"

import { Upload, FileUp, FileText } from "lucide-react"
import { Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useCallback, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { DocumentPanel } from "@/components/document-panel"
import { uploadManager } from "@/lib/upload-manager"
import { CameraScannerModal } from "@/components/camera-scanner-modal"

interface RecentDocument {
  id: string
  name: string
  type: string
  size: string
  date: string
  status: "En attente" | "En validation" | "Approuve" | "Rejete"
  source: "upload" | "scan"
}

export function UploadZone() {
  const [isDragging, setIsDragging] = useState(false)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<{ name: string; url: string | null; type: string; file: File | null } | null>(null)
  const [recentDocuments, setRecentDocuments] = useState<RecentDocument[]>([])
  const [scannerOpen, setScannerOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load recent documents from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentDocuments')
    if (saved) {
      try {
        setRecentDocuments(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to parse recent documents', e)
      }
    }
  }, [])

  // Save recent documents to localStorage
  const saveToRecent = (doc: RecentDocument) => {
    const updated = [doc, ...recentDocuments.slice(0, 9)]
    setRecentDocuments(updated)
    localStorage.setItem('recentDocuments', JSON.stringify(updated))
  }

  // Handle file upload with chunks
  const handleUpload = (file: File, source: 'upload' | 'scan' = 'upload') => {
    const fileId = `${Date.now()}-${Math.random()}`
    
    // Add to recent documents immediately
    const newDoc: RecentDocument = {
      id: fileId,
      name: file.name,
      type: file.type.split('/')[1].toUpperCase() || 'FILE',
      size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
      date: new Date().toLocaleDateString('fr-FR'),
      status: 'En attente',
      source,
    }
    saveToRecent(newDoc)

    // Start chunked upload in background
    uploadManager.uploadFile(file, fileId)

    // Also show panel for first file
    if (!isPanelOpen) {
      const url = URL.createObjectURL(file)
      setSelectedFile({ name: file.name, url, type: file.type, file })
      setIsPanelOpen(true)
    }
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      Array.from(files).forEach(file => handleUpload(file))
    }
  }, [])

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      Array.from(files).forEach(file => handleUpload(file))
    }
  }

  const handleScanCapture = (file: File) => {
    handleUpload(file, 'scan')
  }

  const handleClosePanel = () => {
    if (selectedFile?.url) {
      URL.revokeObjectURL(selectedFile.url)
    }
    setIsPanelOpen(false)
    setSelectedFile(null)
  }

  return (
    <>
      <div className="rounded-3xl bg-card overflow-hidden">
        <div className="">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
            multiple
            accept=".pdf,.docx,.xlsx,.jpg,.jpeg,.png,.tiff"
          />
          <div
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "relative rounded-3xl border border-dashed transition-all flex flex-col items-center justify-center py-16 cursor-pointer gap-5",
              isDragging
                ? "border-foreground bg-foreground/5 scale-[1.005]"
                : "border-border hover:border-foreground/30"
            )}
          >
            {/* Corner decorations */}
            <div className="absolute top-3 left-3 w-6 h-6 border-l-2 border-t-2 border-muted-foreground/30 rounded-tl-2xl" />
            <div className="absolute top-3 right-3 w-6 h-6 border-r-2 border-t-2 border-muted-foreground/30 rounded-tr-lg" />
            <div className="absolute bottom-3 left-3 w-6 h-6 border-l-2 border-b-2 border-muted-foreground/30 rounded-bl-lg" />
            <div className="absolute bottom-3 right-3 w-6 h-6 border-r-2 border-b-2 border-muted-foreground/30 rounded-br-lg" />

            <div className={cn(
              "h-12 w-12 rounded-xl flex items-center justify-center transition-all duration-200",
              isDragging ? "bg-foreground text-background scale-110" : "bg-muted text-foreground"
            )}>
              <Upload className="h-5 w-5" />
            </div>

            <div className="text-center space-y-1">
              <p className="text-base font-semibold text-foreground">Deposer vos documents ici</p>
              <p className="text-sm text-muted-foreground">
                PDF, DOCX, XLSX, JPG, PNG, TIFF - {"jusqu'a"} 500 Mo par lot
              </p>
            </div>

            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                className="mt-2 gap-2 rounded-full px-5 h-10"
                onClick={(e) => {
                  e.stopPropagation()
                  handleClick()
                }}
              >
                <FileUp className="h-4 w-4" />
                Choisir des fichiers
              </Button>
              <Button
                type="button"
                variant="outline"
                className="gap-2 rounded-full px-5 h-10"
                onClick={(e) => {
                  e.stopPropagation()
                  setScannerOpen(true)
                }}
              >
                <Camera className="h-4 w-4" />
                Scanner un document
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Documents Table */}
      {/* {recentDocuments.length > 0 && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Documents chargés</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-2">Document</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-2">Type</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-2">Taille</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-2">Date</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-2">Statut</th>
                </tr>
              </thead>
              <tbody>
                {recentDocuments.map((doc) => (
                  <tr key={doc.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground truncate max-w-[200px]">{doc.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-muted-foreground uppercase">{doc.type}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-muted-foreground">{doc.size}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-muted-foreground">{doc.date}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                        doc.status === "Approuve" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" :
                        doc.status === "En validation" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" :
                        doc.status === "Rejete" ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" :
                        "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                      )}>
                        {doc.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )} */}

      <DocumentPanel
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
        fileName={selectedFile?.name}
        fileUrl={selectedFile?.url ?? undefined}
        fileType={selectedFile?.type}
        file={selectedFile?.file ?? undefined}
      />

      <CameraScannerModal
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onCapture={handleScanCapture}
      />
    </>
  )
}
