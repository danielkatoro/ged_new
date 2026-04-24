"use client"

import { Upload, FileUp, CheckCircle, Clock, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useCallback, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { DocumentPanel } from "@/components/document-panel"

interface RecentDocument {
  id: string
  name: string
  type: string
  size: string
  date: string
  status: "En attente" | "En validation" | "Approuve" | "Rejete"
}

const PROGRESS_STEPS = [
  { label: "Uploading...", duration: 1000 },
  { label: "OCR Analysis...", duration: 1500 },
  { label: "Extracting Metadata...", duration: 500 },
]

export function UploadZone() {
  const [isDragging, setIsDragging] = useState(false)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<{ name: string; url: string | null; type: string; file: File | null } | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [recentDocuments, setRecentDocuments] = useState<RecentDocument[]>([])
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
    const updated = [doc, ...recentDocuments.slice(0, 9)] // Keep only 10 most recent
    setRecentDocuments(updated)
    localStorage.setItem('recentDocuments', JSON.stringify(updated))
  }

  // Simulate upload progress
  const simulateUpload = (file: File) => {
    setIsUploading(true)
    setCurrentStep(0)
    setProgress(0)

    let totalDuration = 0
    PROGRESS_STEPS.forEach(step => totalDuration += step.duration)

    PROGRESS_STEPS.forEach((step, index) => {
      setTimeout(() => {
        setCurrentStep(index)
        setProgress((index + 1) / PROGRESS_STEPS.length * 100)
      }, PROGRESS_STEPS.slice(0, index + 1).reduce((sum, s) => sum + s.duration, 0))
    })

    // After all steps complete, open verification panel
    setTimeout(() => {
      setIsUploading(false)
      setIsPanelOpen(true)

      // Add to recent documents
      const newDoc: RecentDocument = {
        id: Date.now().toString(),
        name: file.name,
        type: file.type.split('/')[1].toUpperCase() || 'FILE',
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        date: new Date().toLocaleDateString('fr-FR'),
        status: 'En attente'
      }
      saveToRecent(newDoc)
    }, totalDuration)
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
      const file = files[0]
      const url = URL.createObjectURL(file)
      setSelectedFile({ name: file.name, url, type: file.type, file })
      simulateUpload(file)
    }
  }, [])

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]
      const url = URL.createObjectURL(file)
      setSelectedFile({ name: file.name, url, type: file.type, file })
      simulateUpload(file)
    }
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
          </div>
        </div>
      </div>

      {/* Progress Overlay */}
      {isUploading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center">
          <div className="bg-background rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border border-border">
            <div className="text-center space-y-6">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                <Upload className="h-8 w-8 text-primary animate-pulse" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">Traitement du document</h3>
                <p className="text-sm text-muted-foreground">{PROGRESS_STEPS[currentStep]?.label}</p>
              </div>

              <div className="space-y-3">
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="flex justify-between text-xs text-muted-foreground">
                  {PROGRESS_STEPS.map((step, index) => (
                    <div key={index} className={cn(
                      "flex items-center gap-1",
                      index <= currentStep ? "text-primary" : "text-muted-foreground"
                    )}>
                      {index < currentStep ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : index === currentStep ? (
                        <Clock className="h-3 w-3 animate-spin" />
                      ) : (
                        <div className="h-3 w-3 rounded-full border border-current" />
                      )}
                      <span className="hidden sm:inline">{step.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Documents Table */}
      {recentDocuments.length > 0 && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Documents recents</h3>
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
      )}

      <DocumentPanel
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
        fileName={selectedFile?.name}
        fileUrl={selectedFile?.url ?? undefined}
        fileType={selectedFile?.type}
        file={selectedFile?.file ?? undefined}
      />
    </>
  )
}
