"use client"

import { Shell } from "@/components/shell"
import { Header } from "@/components/header"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { store, type DocFile } from "@/lib/store"
import { cn } from "@/lib/utils"
import {
  FileText, Download, Share2, Send, Printer, ArrowLeft,
  ZoomIn, ZoomOut, RotateCw, ChevronLeft, ChevronRight,
  CheckCircle2, Clock, AlertCircle, XCircle, Eye,
  Calendar, User, Building2, Tag, Hash, Mail, GitBranch,
  History, MessageSquare, Shield, ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"

const statusConfig: Record<string, { icon: typeof CheckCircle2; cls: string; label: string }> = {
  "Approuve": { icon: CheckCircle2, cls: "bg-emerald-100 text-emerald-700", label: "Approuve" },
  "En validation": { icon: Clock, cls: "bg-amber-100 text-amber-700", label: "En validation" },
  "En attente": { icon: AlertCircle, cls: "bg-blue-100 text-blue-700", label: "En attente" },
  "Rejete": { icon: XCircle, cls: "bg-red-100 text-red-700", label: "Rejete" },
}

const typeColor: Record<string, string> = {
  pdf: "bg-red-100 text-red-700",
  docx: "bg-blue-100 text-blue-700",
  xlsx: "bg-emerald-100 text-emerald-700",
  img: "bg-purple-100 text-purple-700",
}

export default function DocumentPage() {
  const params = useParams()
  const router = useRouter()
  const [doc, setDoc] = useState<DocFile | null>(null)
  const [zoom, setZoom] = useState(100)
  const [comment, setComment] = useState("")

  useEffect(() => {
    const found = store.getDocument(params.id as string)
    setDoc(found || null)
  }, [params.id])

  if (!doc) {
    return (
      <Shell>
        <Header />
        <main className="p-4 flex items-center justify-center h-[calc(100vh-56px)]">
          <div className="text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Document non trouve</p>
            <Button variant="outline" className="mt-4 rounded" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </div>
        </main>
      </Shell>
    )
  }

  const status = statusConfig[doc.status] || statusConfig["En attente"]
  const StatusIcon = status.icon

  return (
    <Shell>
      <Header />
      <main className="flex h-[calc(100vh-56px)]">
        {/* Left: Document Viewer */}
        <div className="flex-1 flex flex-col min-w-0 bg-muted/30">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="h-4 w-px bg-border" />
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setZoom(z => Math.max(50, z - 25))}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-xs text-muted-foreground w-12 text-center">{zoom}%</span>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setZoom(z => Math.min(200, z + 25))}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <RotateCw className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs">
                <Download className="h-3.5 w-3.5" />
                Telecharger
              </Button>
              <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs">
                <Share2 className="h-3.5 w-3.5" />
                Partager
              </Button>
              <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs">
                <Printer className="h-3.5 w-3.5" />
                Imprimer
              </Button>
              <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs">
                <Send className="h-3.5 w-3.5" />
                Envoyer vers...
              </Button>
            </div>
          </div>

          {/* Preview area */}
          <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
            <div
              className="bg-card border border-border rounded shadow-lg flex flex-col items-center justify-center"
              style={{
                width: `${(595 * zoom) / 100}px`,
                height: `${(842 * zoom) / 100}px`,
                transition: "width 0.2s, height 0.2s",
              }}
            >
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground text-center px-8">{doc.name}</p>
              <p className="text-xs text-muted-foreground mt-2">Previsualisation du document</p>
            </div>
          </div>

          {/* Page navigation */}
          <div className="flex items-center justify-center gap-4 py-2 border-t border-border bg-card">
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs text-muted-foreground">Page 1 sur 1</span>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Right: Info Panel */}
        <div className="w-96 border-l border-border bg-card flex flex-col">
          {/* Header */}
          <div className="px-4 py-3 border-b border-border">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded bg-muted flex items-center justify-center flex-shrink-0">
                <FileText className="h-5 w-5 text-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground truncate">{doc.name}</p>
                <p className="text-xs text-muted-foreground">{doc.size} · {doc.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={cn("text-[10px] rounded px-2", status.cls)}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {status.label}
              </Badge>
              <Badge className={cn("text-[10px] rounded px-2", typeColor[doc.type])}>
                {doc.type.toUpperCase()}
              </Badge>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="metadata" className="flex-1 flex flex-col">
            <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent px-4 h-10">
              <TabsTrigger value="metadata" className="text-xs rounded-none data-[state=active]:border-b-2 data-[state=active]:border-foreground">
                Metadonnees
              </TabsTrigger>
              <TabsTrigger value="workflow" className="text-xs rounded-none data-[state=active]:border-b-2 data-[state=active]:border-foreground">
                Workflow
              </TabsTrigger>
              <TabsTrigger value="versions" className="text-xs rounded-none data-[state=active]:border-b-2 data-[state=active]:border-foreground">
                Versions
              </TabsTrigger>
              <TabsTrigger value="activity" className="text-xs rounded-none data-[state=active]:border-b-2 data-[state=active]:border-foreground">
                Activite
              </TabsTrigger>
            </TabsList>

            <TabsContent value="metadata" className="flex-1 overflow-y-auto p-4 space-y-4 m-0">
              {/* Index fields */}
              <div className="space-y-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Champs d&apos;index</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { icon: Building2, label: "Direction", value: "Finance" },
                    { icon: Calendar, label: "Date", value: doc.date },
                    { icon: User, label: "Auteur", value: doc.author },
                    { icon: Hash, label: "Confiance OCR", value: `${doc.confidence}%` },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="p-2 bg-muted/40 rounded">
                      <p className="text-[10px] text-muted-foreground mb-0.5">{label}</p>
                      <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                        <Icon className="h-3 w-3 text-muted-foreground" />
                        <span className="truncate">{value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Source */}
              {(doc.linkedEmail || doc.linkedWorkflow || doc.source !== "upload") && (
                <div className="space-y-2 p-3 bg-muted/50 rounded">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Source</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-[10px] rounded px-2 gap-1">
                      {doc.source === "email" && <Mail className="h-2.5 w-2.5" />}
                      {doc.source === "workflow" && <GitBranch className="h-2.5 w-2.5" />}
                      {doc.source === "scan" && <Eye className="h-2.5 w-2.5" />}
                      {doc.source}
                    </Badge>
                  </div>
                  {doc.linkedEmail && (
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                      <Mail className="h-3 w-3" /> {doc.linkedEmail}
                    </p>
                  )}
                  {doc.linkedWorkflow && (
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                      <GitBranch className="h-3 w-3" /> {doc.linkedWorkflow}
                    </p>
                  )}
                </div>
              )}

              {/* Description */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Description</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{doc.description}</p>
              </div>

              {/* Tags */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Tags</p>
                <div className="flex flex-wrap gap-1">
                  {doc.tags.map(tag => (
                    <span key={tag} className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground">
                      <Tag className="h-2.5 w-2.5" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Edit button */}
              <Button variant="outline" className="w-full h-8 text-xs rounded gap-1.5">
                <Shield className="h-3 w-3" />
                Modifier les metadonnees
              </Button>
            </TabsContent>

            <TabsContent value="workflow" className="flex-1 overflow-y-auto p-4 space-y-4 m-0">
              <div className="space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Circuit de validation</p>
                <div className="space-y-3">
                  {[
                    { step: "Verification Comptable", user: "J. Martin", status: "done", date: "22-04-2026" },
                    { step: "Approbation Manager", user: "C. Boka", status: "current", date: "En attente" },
                    { step: "Validation DG", user: "Direction", status: "pending", date: "-" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className={cn(
                        "h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                        item.status === "done" ? "bg-emerald-100 text-emerald-600" :
                        item.status === "current" ? "bg-amber-100 text-amber-600" :
                        "bg-muted text-muted-foreground"
                      )}>
                        {item.status === "done" ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : item.status === "current" ? (
                          <Clock className="h-3.5 w-3.5" />
                        ) : (
                          <span className="text-[10px] font-medium">{i + 1}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground">{item.step}</p>
                        <p className="text-[11px] text-muted-foreground">{item.user} · {item.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-2 border-t border-border">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Actions rapides</p>
                <div className="flex gap-2">
                  <Button className="flex-1 h-8 text-xs rounded gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Approuver
                  </Button>
                  <Button variant="outline" className="flex-1 h-8 text-xs rounded gap-1">
                    <XCircle className="h-3.5 w-3.5" />
                    Rejeter
                  </Button>
                </div>
                <Textarea
                  placeholder="Ajouter un commentaire (obligatoire pour rejet)..."
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  className="text-xs rounded resize-none"
                  rows={2}
                />
              </div>
            </TabsContent>

            <TabsContent value="versions" className="flex-1 overflow-y-auto p-4 space-y-4 m-0">
              <div className="space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Historique des versions</p>
                <div className="space-y-2">
                  {doc.versions.map((v, i) => (
                    <div
                      key={v.version}
                      className={cn(
                        "flex items-center gap-3 p-2.5 rounded border transition-colors",
                        i === 0 ? "border-foreground/20 bg-muted/50" : "border-border hover:bg-muted/30"
                      )}
                    >
                      <div className="h-8 w-8 rounded bg-muted flex items-center justify-center flex-shrink-0">
                        <History className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground">
                          Version {v.version}
                          {i === 0 && <span className="ml-2 text-[10px] text-muted-foreground">(actuelle)</span>}
                        </p>
                        <p className="text-[11px] text-muted-foreground">{v.author} · {v.date}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="activity" className="flex-1 overflow-y-auto p-4 space-y-4 m-0">
              <div className="space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Journal d&apos;audit</p>
                <div className="space-y-0">
                  {doc.activity.map((a, i) => (
                    <div key={i} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                      <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                        <MessageSquare className="h-3 w-3 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-foreground">
                          <span className="font-medium">{a.user}</span>
                          {" "}
                          <span className="text-muted-foreground">{a.action}</span>
                        </p>
                        <p className="text-[10px] text-muted-foreground">{a.date} · IP: {a.ip}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </Shell>
  )
}
