"use client"

import { Shell } from "@/components/shell"
import { Header } from "@/components/header"
import { useState, useEffect } from "react"
import { store, type DocFile } from "@/lib/store"
import { Trash2, RotateCcw, Trash, FileText, FileSpreadsheet, File, Image, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

function FileTypeIcon({ type }: { type: DocFile["type"] }) {
  if (type === "pdf") return <FileText className="h-4 w-4 text-red-500" />
  if (type === "xlsx") return <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
  if (type === "img") return <Image className="h-4 w-4 text-blue-500" />
  return <File className="h-4 w-4 text-blue-600" />
}

export default function CorbeillePage() {
  const [trash, setTrash] = useState<DocFile[]>([])

  useEffect(() => {
    setTrash(store.getTrash())
    return store.subscribe(() => setTrash(store.getTrash()))
  }, [])

  const handleRestore = (id: string) => {
    store.restoreFromTrash(id)
  }

  const handleEmpty = () => {
    store.emptyTrash()
  }

  return (
    <Shell>
      <Header />
      <main className="p-4">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center px-3 py-1.5 rounded bg-muted text-sm font-medium text-foreground">
              <Trash2 className="h-4 w-4 mr-2" />
              Corbeille
            </span>
            <span className="text-xs text-muted-foreground">{trash.length} elements</span>
          </div>
          {trash.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="h-8 gap-2 text-xs rounded">
                  <Trash className="h-3.5 w-3.5" />
                  Vider la corbeille
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    Confirmer la suppression definitive
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action est irreversible. Tous les documents dans la corbeille seront
                    definitivement supprimes et ne pourront plus etre recuperes.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded">Annuler</AlertDialogCancel>
                  <AlertDialogAction className="rounded bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleEmpty}>
                    Supprimer definitivement
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        {trash.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Trash2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-medium text-foreground mb-1">La corbeille est vide</h3>
            <p className="text-xs text-muted-foreground max-w-xs">
              Les documents supprimes apparaitront ici et seront conserves pendant 30 jours avant suppression definitive.
            </p>
          </div>
        ) : (
          <div className="border border-border rounded bg-card overflow-hidden">
            <div className="divide-y divide-border">
              {trash.map(doc => (
                <div key={doc.id} className="flex items-center gap-4 px-4 py-3 hover:bg-muted/30 transition-colors">
                  <div className="flex h-9 w-9 items-center justify-center rounded bg-muted flex-shrink-0">
                    <FileTypeIcon type={doc.type} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{doc.size}</span>
                      <span>·</span>
                      <span>Supprime le {doc.date}</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 gap-1.5 text-xs rounded"
                    onClick={() => handleRestore(doc.id)}
                  >
                    <RotateCcw className="h-3 w-3" />
                    Restaurer
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </Shell>
  )
}
