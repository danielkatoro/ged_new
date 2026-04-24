"use client"

import { X, FileText, Check, Calendar, Building2, Hash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface DocumentPanelProps {
  isOpen: boolean
  onClose: () => void
  fileName?: string
  fileUrl?: string
  fileType?: string
  file?: File
}

const detectedFields = [
  { label: "Fournisseur", value: "SARL Exemple", confidence: 95, icon: Building2 },
  { label: "Montant TTC", value: "1200000", confidence: 95, icon: Hash },
  { label: "Date de facture", value: "23 / 04 / 2026", confidence: 95, icon: Calendar },
]

export function DocumentPanel({ isOpen, onClose, fileName = "Document.pdf", fileUrl, fileType, file }: DocumentPanelProps) {
  const router = useRouter()
  const [docxContent, setDocxContent] = useState<string | null>(null)
  const [selectedDirection, setSelectedDirection] = useState("finance")
  const [selectedArmoire, setSelectedArmoire] = useState("factures")
  const isImage = fileType?.startsWith("image/")
  const isPdf = fileType === "application/pdf"
  const isDocx = fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || fileName?.endsWith(".docx")

  // For DOCX files, we'll show a preview message since browser can't render them directly
  useEffect(() => {
    if (file && isDocx) {
      // For DOCX, we just acknowledge the file - full rendering would require a library like mammoth.js
      setDocxContent(`Document Word: ${file.name}`)
    } else {
      setDocxContent(null)
    }
  }, [file, isDocx])

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-full max-w-[1100px] bg-background z-50 shadow-2xl transition-transform duration-300 ease-out flex",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Preview Area - White background */}
        <div className="flex-1 bg-muted/30 flex flex-col min-w-0">
          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-background">
            <h2 className="text-sm font-semibold text-foreground truncate">
               {fileName}
            </h2>
          </div>

          {/* Preview content */}
          <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
            {fileUrl && isImage ? (
              <img
                src={fileUrl}
                alt={fileName}
                className="max-w-full max-h-full object-contain rounded-xl shadow-lg border border-border"
                crossOrigin="anonymous"
              />
            ) : fileUrl && isPdf ? (
              <iframe
                src={fileUrl}
                className="w-full h-full rounded-xl bg-white border border-border shadow-lg"
                title={fileName}
              />
            ) : isDocx ? (
              <div className="flex flex-col items-center gap-4 text-muted-foreground bg-background rounded-xl border border-border p-12 shadow-sm">
                <div className="h-20 w-20 rounded-2xl bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 flex items-center justify-center">
                  <FileText className="h-10 w-10 text-blue-500" />
                </div>
                <div className="text-center">
                  <p className="text-base font-medium text-foreground">{fileName}</p>
                  <p className="text-sm text-muted-foreground mt-1">Document Word</p>
                </div>
                <p className="text-xs text-muted-foreground/70">
                  La previsualisation Word sera disponible apres traitement
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 text-muted-foreground bg-background rounded-xl border border-border p-12 shadow-sm">
                <div className="h-20 w-20 rounded-2xl bg-muted border border-border flex items-center justify-center">
                  <FileText className="h-10 w-10" />
                </div>
                <p className="text-sm">Previsualisation du document</p>
                {fileName && (
                  <p className="text-xs text-muted-foreground/70">{fileName}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Metadata Form */}
        <div className="w-[340px] border-l border-border bg-background flex flex-col">
          <div className="px-5 py-5 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Classification & Metadonnees</h3>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Document Type */}
            <div className="space-y-2">
              <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                Type de document
              </Label>
              <Select defaultValue="facture">
                <SelectTrigger className="h-10 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="facture">Facture Fournisseur</SelectItem>
                  <SelectItem value="contrat">Contrat</SelectItem>
                  <SelectItem value="bon_commande">Bon de commande</SelectItem>
                  <SelectItem value="note">Note de service</SelectItem>
                  <SelectItem value="rapport">Rapport</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Direction */}
            <div className="space-y-2">
              <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                Direction
              </Label>
              <Select value={selectedDirection} onValueChange={setSelectedDirection}>
                <SelectTrigger className="h-10 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="rh">Ressources Humaines</SelectItem>
                  <SelectItem value="juridique">Juridique</SelectItem>
                  <SelectItem value="direction">Direction Generale</SelectItem>
                  <SelectItem value="it">Informatique</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Armoire */}
            <div className="space-y-2">
              <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                Armoire
              </Label>
              <Select value={selectedArmoire} onValueChange={setSelectedArmoire}>
                <SelectTrigger className="h-10 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="factures">Factures Fournisseurs</SelectItem>
                  <SelectItem value="contrats">Contrats</SelectItem>
                  <SelectItem value="paie">Paie & RH</SelectItem>
                  <SelectItem value="juridique">Documents Juridiques</SelectItem>
                  <SelectItem value="compta">Comptabilite</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* OCR Detected Fields */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                  Champs detectes (OCR)
                </Label>
                <span className="text-[10px] text-emerald-500 font-medium">Finance</span>
              </div>

              <div className="space-y-2.5">
                {detectedFields.map((field, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                        {field.label}
                        <span className="text-destructive">*</span>
                      </Label>
                      <span className="flex items-center gap-1 text-[10px] text-emerald-500 font-medium">
                        <Check className="h-3 w-3" />
                        {field.confidence}%
                      </span>
                    </div>
                    <div className="relative">
                      <Input
                        defaultValue={field.value}
                        className="h-9 text-sm pr-8 bg-muted/50 border-border focus:bg-background"
                      />
                      <field.icon className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional fields */}
            <div className="space-y-3 pt-2 border-t border-border">
              <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                Informations complementaires
              </Label>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-foreground">Notes / Commentaires</Label>
                <textarea
                  placeholder="Ajouter une note..."
                  className="w-full h-20 rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm resize-none focus:bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-foreground">Tags</Label>
                <Input placeholder="Ajouter des tags..." className="h-9 text-sm bg-muted/50" />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-5 border-t border-border bg-muted/30">
            <div className="flex gap-3">
              
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 h-11 text-sm font-medium rounded-xl"
              >
                Annuler
              </Button>
              <Button
                className="flex-1 h-11 text-sm font-medium rounded-xl"
                onClick={() => {
                  // Rediriger vers la direction avec les paramètres sélectionnés
                  router.push(`/direction?direction=${selectedDirection}&armoire=${selectedArmoire}`)
                  onClose()
                }}
              >
                Valider & Classer
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground text-center mt-2">
              Le document sera indexe et accessible dans la direction selectionnee
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
