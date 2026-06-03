"use client"

/**
 * FileRegistry — stocke en mémoire les fichiers binaires uploadés,
 * associés à leur docId. Permet de relire un fichier après upload
 * depuis n'importe quelle page (viewer, tampon, etc.)
 */

class FileRegistry {
  private static instance: FileRegistry
  private registry: Map<string, File> = new Map()

  private constructor() {}

  static getInstance(): FileRegistry {
    if (!FileRegistry.instance) {
      FileRegistry.instance = new FileRegistry()
    }
    return FileRegistry.instance
  }

  /** Enregistre un fichier sous un docId */
  register(docId: string, file: File) {
    this.registry.set(docId, file)
  }

  /** Récupère un fichier par docId (undefined si non disponible) */
  get(docId: string): File | undefined {
    return this.registry.get(docId)
  }

  /** Crée une Object URL pour le fichier (à révoquer après usage) */
  createObjectURL(docId: string): string | null {
    const file = this.registry.get(docId)
    if (!file) return null
    return URL.createObjectURL(file)
  }

  /** Vérifie si un fichier est disponible */
  has(docId: string): boolean {
    return this.registry.has(docId)
  }

  /** Supprime un fichier du registre */
  remove(docId: string) {
    this.registry.delete(docId)
  }
}

export const fileRegistry = FileRegistry.getInstance()
