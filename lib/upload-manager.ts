const CHUNK_SIZE = 1024 * 1024 // 1MB chunks

export interface UploadProgress {
  fileId: string
  fileName: string
  fileSize: number
  uploadedSize: number
  progress: number
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error'
  error?: string
}

export class UploadManager {
  private static instance: UploadManager
  private uploads: Map<string, UploadProgress> = new Map()
  private listeners: Set<(uploads: UploadProgress[]) => void> = new Set()

  private constructor() {}

  static getInstance(): UploadManager {
    if (!UploadManager.instance) {
      UploadManager.instance = new UploadManager()
    }
    return UploadManager.instance
  }

  subscribe(listener: (uploads: UploadProgress[]) => void) {
    this.listeners.add(listener)
    return () => { this.listeners.delete(listener) }
  }

  private notifyListeners() {
    const uploads = Array.from(this.uploads.values())
    this.listeners.forEach(listener => listener(uploads))
  }

  async uploadFile(file: File, fileId: string): Promise<void> {
    const upload: UploadProgress = {
      fileId,
      fileName: file.name,
      fileSize: file.size,
      uploadedSize: 0,
      progress: 0,
      status: 'uploading',
    }

    this.uploads.set(fileId, upload)
    this.notifyListeners()

    try {
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE)

      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const start = chunkIndex * CHUNK_SIZE
        const end = Math.min(start + CHUNK_SIZE, file.size)
        const chunk = file.slice(start, end)

        // Simulate chunk upload delay
        await new Promise(resolve => setTimeout(resolve, 200))

        upload.uploadedSize = end
        upload.progress = (end / file.size) * 100
        this.uploads.set(fileId, { ...upload })
        this.notifyListeners()
      }

      // Processing phase
      upload.status = 'processing'
      this.uploads.set(fileId, { ...upload })
      this.notifyListeners()

      // Simulate OCR and metadata extraction
      await new Promise(resolve => setTimeout(resolve, 1500))

      upload.status = 'completed'
      this.uploads.set(fileId, { ...upload })
      this.notifyListeners()

      // Auto-remove after 3 seconds
      setTimeout(() => {
        this.uploads.delete(fileId)
        this.notifyListeners()
      }, 3000)
    } catch (error) {
      upload.status = 'error'
      upload.error = error instanceof Error ? error.message : 'Upload failed'
      this.uploads.set(fileId, { ...upload })
      this.notifyListeners()
    }
  }

  getUploads(): UploadProgress[] {
    return Array.from(this.uploads.values())
  }

  removeUpload(fileId: string): void {
    this.uploads.delete(fileId)
    this.notifyListeners()
  }

  cancelUpload(fileId: string): void {
    this.uploads.delete(fileId)
    this.notifyListeners()
  }
}

export const uploadManager = UploadManager.getInstance()
