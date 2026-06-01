"use client"

import { useState, useEffect } from "react"
import { Eye, Download, MoreHorizontal, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { store, type DocFile } from "@/lib/store"
import { DocumentDetailPanel } from "@/components/document-detail-panel"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Get recent documents from store with context
function getRecentDocuments() {
  const allDocs = store.getAllDocumentsWithContext()
  return allDocs.slice(0, 5)
}

const statusStyles: Record<string, string> = {
  "Approuve": "bg-foreground text-background",
  "En validation": "bg-amber-100 text-amber-700 border-amber-200",
  "En attente": "bg-muted text-muted-foreground",
  "Rejete": "bg-red-50 text-red-600 border-red-100",
}

export function DocumentsTable() {
  const [selectedFile, setSelectedFile] = useState<DocFile | null>(null)
  const [selectedContext, setSelectedContext] = useState<{ direction: string; armoire: string; dossier: string } | null>(null)
  const [documents, setDocuments] = useState<any[]>([])

  useEffect(() => {
    setDocuments(getRecentDocuments())
  }, [])

  const handleOpenFile = (docId: string, doc: any) => {
    const docFile = store.getDocument(docId)
    if (docFile) {
      setSelectedFile(docFile)
      setSelectedContext({
        direction: doc.directionName,
        armoire: doc.armoireName,
        dossier: doc.dossierName,
      })
    }
  }

  if (documents.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Documents recents</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Derniers documents integres dans la GED</p>
          </div>
        </div>
        <div className="px-5 py-8 text-center text-sm text-muted-foreground">
          Aucun document trouve
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Documents recents</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Derniers documents integres dans la GED</p>
        </div>
        <Button variant="ghost" size="sm" className="text-xs h-7 text-muted-foreground hover:text-foreground">
          Voir tout →
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">N° Unique</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-3 py-3">Document</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-3 py-3 hidden md:table-cell">Nature</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-3 py-3 hidden lg:table-cell">Direction</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-3 py-3 hidden xl:table-cell">Chemin d&apos;accès</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-3 py-3 hidden sm:table-cell">Source</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-3 py-3">Statut</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {documents.map((doc, i) => (
              <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors group">
                <td className="px-5 py-3.5">
                  <span className="font-mono text-xs font-semibold text-foreground">{doc.id}</span>
                </td>
                <td className="px-3 py-3.5">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-foreground text-xs truncate max-w-55">{doc.name}</span>
                  </div>
                </td>
                <td className="px-3 py-3.5 hidden md:table-cell">
                  <Badge variant="outline" className="text-[10px] font-normal">{doc.type}</Badge>
                </td>
                <td className="px-3 py-3.5 hidden lg:table-cell">
                  <Badge variant="outline" className="text-[10px] font-normal">{doc.armoireName}</Badge>
                </td>
                <td className="px-3 py-3.5 hidden xl:table-cell">
                  <span className="text-xs text-muted-foreground truncate max-w-45">{doc.directionName}/{doc.armoireName}/{doc.dossierName}</span>
                </td>
                <td className="px-3 py-3.5 hidden sm:table-cell">
                  {doc.source === "email" && (
                    <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground border border-border rounded px-1 py-0.5 w-fit">
                      <Mail className="h-2.5 w-2.5" /> email
                    </span>
                  )}
                  {doc.source === "upload" && (
                    <span className="text-[10px] text-muted-foreground px-1 py-0.5">Upload</span>
                  )}
                </td>
                <td className="px-3 py-3.5">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium border ${statusStyles[doc.status]}`}>
                    {doc.status}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      onClick={() => handleOpenFile(doc.id, doc)}
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="text-xs">
                        <DropdownMenuItem>Voir les détails</DropdownMenuItem>
                        <DropdownMenuItem>Envoyer en validation</DropdownMenuItem>
                        <DropdownMenuItem>Voir l&apos;historique</DropdownMenuItem>
                        <DropdownMenuItem>Telecharger</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Supprimer</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedFile && selectedContext && (
        <DocumentDetailPanel 
          file={selectedFile} 
          context={selectedContext}
          onClose={() => {
            setSelectedFile(null)
            setSelectedContext(null)
          }}
        />
      )}
    </div>
  )
}
