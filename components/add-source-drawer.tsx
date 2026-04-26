"use client"

import { X, Mail, CheckCircle2, AlertCircle, Toggle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface AddSourceDrawerProps {
  isOpen: boolean
  onClose: () => void
  editingSource?: {
    id: number
    label: string
    address: string
    direction: string
    armoire: string
    autoTrigger: boolean
  }
}

const providers = [
  { id: "gmail", name: "Gmail", icon: "📧" },
  { id: "outlook", name: "Outlook", icon: "📨" },
  { id: "yahoo", name: "Yahoo", icon: "📬" },
  { id: "imap", name: "Custom IMAP", icon: "🔧" },
]

export function AddSourceDrawer({ isOpen, onClose, editingSource }: AddSourceDrawerProps) {
  const isEditing = !!editingSource
  const [step, setStep] = useState<"provider" | "connection" | "configuration" | "success">(
    isEditing ? "configuration" : "provider"
  )
  const [selectedProvider, setSelectedProvider] = useState(isEditing ? "gmail" : "")
  const [email, setEmail] = useState(isEditing ? editingSource.address : "")
  const [autoTrigger, setAutoTrigger] = useState(isEditing ? editingSource.autoTrigger : false)
  const [selectedArmoire, setSelectedArmoire] = useState(isEditing ? editingSource.armoire : "")
  const [selectedDirection, setSelectedDirection] = useState(isEditing ? editingSource.direction : "")

  const handleBack = () => {
    if (step === "connection") setStep("provider")
    else if (step === "configuration") setStep("connection")
  }

  const handleNext = () => {
    if (step === "provider" && selectedProvider) setStep("connection")
    else if (step === "connection" && email) setStep("configuration")
    else if (step === "configuration" && selectedDirection && selectedArmoire) setStep("success")
  }

  const handleClose = () => {
    setStep("provider")
    setSelectedProvider("")
    setEmail("")
    setAutoTrigger(false)
    setSelectedArmoire("")
    setSelectedDirection("")
    onClose()
  }

  const handleSuccess = () => {
    handleClose()
  }

  const isProviderValid = selectedProvider
  const isConnectionValid = email && email.includes("@")
  const isConfigurationValid = selectedDirection && selectedArmoire

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/40 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={handleClose}
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed right-0 top-0 h-screen w-full max-w-[420px] bg-background border-l border-border shadow-2xl z-50 flex flex-col transition-transform duration-300",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {isEditing ? "Modifier la source" : "Ajouter une source"}
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              {isEditing ? "Mettez à jour les paramètres" : `Etape ${["provider", "connection", "configuration"].includes(step) ? (["provider", "connection", "configuration"].indexOf(step) + 1) : 3} sur 3`}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Step 1: Provider Selection */}
          {step === "provider" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Sélectionnez votre fournisseur de messagerie:</p>
              <div className="grid grid-cols-2 gap-3">
                {providers.map((provider) => (
                  <button
                    key={provider.id}
                    onClick={() => setSelectedProvider(provider.id)}
                    className={cn(
                      "p-4 rounded-lg border-2 transition-all text-center space-y-2",
                      selectedProvider === provider.id
                        ? "border-foreground bg-muted/50"
                        : "border-border hover:border-border/60 hover:bg-muted/30"
                    )}
                  >
                    <span className="text-3xl block">{provider.icon}</span>
                    <span className="text-sm font-medium text-foreground">{provider.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Connection */}
          {step === "connection" && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-foreground mb-2 block">Email</Label>
                <Input
                  type="email"
                  placeholder="votre.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 text-sm rounded-lg"
                />
              </div>

              <div className="space-y-3 mt-6">
                <p className="text-sm text-muted-foreground">Cliquez sur le bouton ci-dessous pour autoriser Akieni GED à accéder à votre messagerie:</p>
                <Button
                  className="w-full h-10 text-sm font-medium rounded-lg"
                  onClick={() => {
                    // Simulated authorization
                  }}
                >
                  Autoriser Akieni GED
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Configuration */}
          {step === "configuration" && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-foreground mb-2 block">Direction</Label>
                <Select value={selectedDirection} onValueChange={setSelectedDirection}>
                  <SelectTrigger className="h-10 text-sm rounded-lg">
                    <SelectValue placeholder="Sélectionner une direction" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="rh">RH</SelectItem>
                    <SelectItem value="juridique">Juridique</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium text-foreground mb-2 block">Armoire de destination</Label>
                <Select value={selectedArmoire} onValueChange={setSelectedArmoire}>
                  <SelectTrigger className="h-10 text-sm rounded-lg">
                    <SelectValue placeholder="Sélectionner une armoire" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedDirection === "finance" && (
                      <>
                        <SelectItem value="factures">Factures</SelectItem>
                        <SelectItem value="devis">Devis</SelectItem>
                      </>
                    )}
                    {selectedDirection === "rh" && (
                      <>
                        <SelectItem value="contrats">Contrats</SelectItem>
                        <SelectItem value="dossiers">Dossiers</SelectItem>
                      </>
                    )}
                    {selectedDirection === "juridique" && (
                      <>
                        <SelectItem value="contrats">Contrats</SelectItem>
                        <SelectItem value="litiges">Litiges</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border/50">
                <Label className="text-sm font-medium text-foreground cursor-pointer">Auto-trigger Workflow</Label>
                <button
                  onClick={() => setAutoTrigger(!autoTrigger)}
                  className={cn(
                    "relative inline-flex h-6 w-10 items-center rounded-full transition-colors",
                    autoTrigger ? "bg-foreground" : "bg-border"
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-background transition-transform",
                      autoTrigger ? "translate-x-5" : "translate-x-1"
                    )}
                  />
                </button>
              </div>

              <Alert className="border-amber-200 bg-amber-50 text-amber-900">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-xs">
                  Seuls les fichiers PDF, Docs, XLS, PNG et JPG seront importés.
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Success State */}
          {step === "success" && (
            <div className="flex flex-col items-center justify-center h-full gap-4 py-12">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 bg-green-100 rounded-full animate-pulse" />
                <div className="relative h-full flex items-center justify-center">
                  <CheckCircle2 className="h-16 w-16 text-green-600 animate-bounce" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold text-foreground">Source connectée avec succès!</h3>
                <p className="text-sm text-muted-foreground">
                  Votre source de messagerie est maintenant configurée et prête à recevoir les documents.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border bg-muted/30 px-6 py-4 flex gap-3">
          {step !== "success" ? (
            <>
              <Button
                variant="outline"
                className="flex-1 h-10 text-sm font-medium rounded-lg"
                onClick={step === "provider" && !isEditing ? handleClose : handleBack}
              >
                {step === "provider" && !isEditing ? "Annuler" : "Précédent"}
              </Button>
              <Button
                className="flex-1 h-10 text-sm font-medium rounded-lg"
                disabled={
                  (!isEditing && step === "provider" && !isProviderValid) ||
                  (!isEditing && step === "connection" && !isConnectionValid) ||
                  (step === "configuration" && !isConfigurationValid)
                }
                onClick={handleNext}
              >
                {step === "configuration" ? (isEditing ? "Enregistrer" : "Terminer") : "Suivant"}
              </Button>
            </>
          ) : (
            <Button
              className="w-full h-10 text-sm font-medium rounded-lg"
              onClick={handleSuccess}
            >
              Fermer
            </Button>
          )}
        </div>
      </>
    )
  }
}
