"use client"

import { Upload, FileUp, ScanLine, Camera, X, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useCallback, useRef } from "react"
import { cn } from "@/lib/utils"
import { DocumentPanel } from "@/components/document-panel"
import { uploadManager } from "@/lib/upload-manager"

export function UploadZone() {
  const [isDragging, setIsDragging] = useState(false)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [isScanPanelOpen, setIsScanPanelOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<{ name: string; url: string | null; type: string; file: File | null } | null>(null)
  const [scanStatus, setScanStatus] = useState<"idle" | "scanning" | "done">("idle")
  const [scannedPages, setScannedPages] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Handle file upload with chunks
  const handleUpload = (file: File) => {
    const fileId = `${Date.now()}-${Math.random()}`
    uploadManager.uploadFile(file, fileId)
    if (!isPanelOpen) {
      const url = URL.createObjectURL(file)
      setSelectedFile({ name: file.name, url, type: file.type, file })
      setIsPanelOpen(true)
    }
  }

  const handleStartScan = () => {
    setScanStatus("scanning")
    setScannedPages(0)
    let count = 0
    const interval = setInterval(() => {
      count++
      setScannedPages(count)
      if (count >= 3) {
        clearInterval(interval)
        setScanStatus("done")
      }
    }, 1200)
  }

  const handleCloseScan = () => {
    setIsScanPanelOpen(false)
    setScanStatus("idle")
    setScannedPages(0)
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
              "relative rounded-3xl border border-dashed transition-all flex flex-col items-center justify-center py-12 cursor-pointer gap-5",
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

            <div className="flex items-center gap-3" onClick={e => e.stopPropagation()}>
              <Button
                type="button"
                variant="outline"
                className="gap-2 rounded-full px-5 h-10"
                onClick={handleClick}
              >
                <FileUp className="h-4 w-4" />
                Choisir des fichiers
              </Button>
              <Button
                type="button"
                variant="outline"
                className="gap-2 rounded-full px-5 h-10"
                onClick={() => setIsScanPanelOpen(true)}
              >
                <ScanLine className="h-4 w-4" />
                Scanner
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Scanner panel overlay */}
      {isScanPanelOpen && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40" onClick={handleCloseScan} />
          <div className="fixed top-0 right-0 h-full w-[440px] bg-card border-l border-border z-50 flex flex-col shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Numerisation de document</h3>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCloseScan}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 p-5 space-y-4 overflow-y-auto">
              <div className="rounded-lg border border-border p-8 flex flex-col items-center gap-4 bg-muted/20">
                <div className={cn(
                  "h-20 w-20 rounded-2xl flex items-center justify-center transition-all",
                  scanStatus === "scanning" ? "bg-primary/10 animate-pulse" : "bg-muted"
                )}>
                  {scanStatus === "scanning"
                    ? <ScanLine className="h-10 w-10 text-primary" />
                    : scanStatus === "done"
                      ? <Check className="h-10 w-10 text-emerald-600" />
                      : <Camera className="h-10 w-10 text-muted-foreground" />
                  }
                </div>
                <div className="text-center">
                  {scanStatus === "idle" && (
                    <>
                      <p className="text-sm font-medium text-foreground">Pret a scanner</p>
                      <p className="text-xs text-muted-foreground mt-1">Placez le document dans le scanner puis lancez la numerisation</p>
                    </>
                  )}
                  {scanStatus === "scanning" && (
                    <>
                      <p className="text-sm font-medium text-foreground">Numerisation en cours...</p>
                      <p className="text-xs text-muted-foreground mt-1">{scannedPages} page{scannedPages > 1 ? "s" : ""} numerisee{scannedPages > 1 ? "s" : ""}</p>
                    </>
                  )}
                  {scanStatus === "done" && (
                    <>
                      <p className="text-sm font-medium text-emerald-600">Numerisation terminee</p>
                      <p className="text-xs text-muted-foreground mt-1">{scannedPages} page{scannedPages > 1 ? "s" : ""} prete{scannedPages > 1 ? "s" : ""} a l&apos;import</p>
                    </>
                  )}
                </div>
                {scanStatus === "idle" && (
                  <Button className="gap-2 rounded" onClick={handleStartScan}>
                    <ScanLine className="h-4 w-4" />
                    Lancer la numerisation
                  </Button>
                )}
                {scanStatus === "scanning" && (
                  <Button variant="outline" className="gap-2 rounded" onClick={() => setScanStatus("idle")}>
                    <X className="h-4 w-4" />
                    Annuler
                  </Button>
                )}
                {scanStatus === "done" && (
                  <Button variant="outline" className="gap-2 rounded" onClick={() => { setScanStatus("idle"); setScannedPages(0) }}>
                    Nouvelle numerisation
                  </Button>
                )}
              </div>

              <div className="space-y-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Parametres</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded border border-border bg-muted/20">
                    <p className="text-muted-foreground">Resolution</p>
                    <p className="font-medium text-foreground mt-0.5">300 DPI</p>
                  </div>
                  <div className="p-3 rounded border border-border bg-muted/20">
                    <p className="text-muted-foreground">Format</p>
                    <p className="font-medium text-foreground mt-0.5">PDF / A4</p>
                  </div>
                  <div className="p-3 rounded border border-border bg-muted/20">
                    <p className="text-muted-foreground">Couleur</p>
                    <p className="font-medium text-foreground mt-0.5">Noir & Blanc</p>
                  </div>
                  <div className="p-3 rounded border border-border bg-muted/20">
                    <p className="text-muted-foreground">OCR</p>
                    <p className="font-medium text-foreground mt-0.5">Actif</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-5 border-t border-border flex gap-2">
              <Button variant="outline" className="flex-1 h-9 text-sm rounded" onClick={handleCloseScan}>
                Annuler
              </Button>
              <Button
                className="flex-1 h-9 text-sm rounded"
                disabled={scanStatus !== "done"}
                onClick={handleCloseScan}
              >
                <ScanLine className="h-3.5 w-3.5 mr-1.5" />
                Importer le scan
              </Button>
            </div>
          </div>
        </>
      )}

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
    </>
  )
}
