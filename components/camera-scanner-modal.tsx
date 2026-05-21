"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import { Camera, RotateCcw, X, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function CameraScannerModal({
  open,
  onClose,
  onCapture,
}: {
  open: boolean
  onClose: () => void
  onCapture: (file: File) => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment")

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }, [])

  const startCamera = useCallback(async (mode: "user" | "environment") => {
    stopCamera()
    setIsLoading(true)
    setError(null)

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      })
      streamRef.current = mediaStream
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === "NotAllowedError") {
          setError("Acces a la camera refuse. Veuillez autoriser l'acces dans les parametres de votre navigateur.")
        } else if (err.name === "NotFoundError") {
          setError("Aucune camera detectee sur cet appareil.")
        } else {
          setError("Impossible d'acceder a la camera. Verifiez vos parametres.")
        }
      }
    } finally {
      setIsLoading(false)
    }
  }, [stopCamera])

  useEffect(() => {
    if (open) {
      startCamera(facingMode)
    } else {
      stopCamera()
      setCapturedImage(null)
      setError(null)
    }
    return () => { stopCamera() }
  }, [open])

  useEffect(() => {
    if (open && !capturedImage) {
      startCamera(facingMode)
    }
  }, [facingMode])

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")
    if (!context) return
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    setCapturedImage(canvas.toDataURL("image/jpeg", 0.92))
    stopCamera()
  }

  const retakePhoto = () => {
    setCapturedImage(null)
    startCamera(facingMode)
  }

  const confirmCapture = () => {
    if (!canvasRef.current) return
    canvasRef.current.toBlob((blob) => {
      if (blob) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
        const file = new File([blob], `scan-${timestamp}.jpg`, { type: "image/jpeg" })
        onCapture(file)
        onClose()
      }
    }, "image/jpeg", 0.92)
  }

  const toggleCamera = () => {
    setFacingMode(prev => prev === "user" ? "environment" : "user")
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="relative bg-card rounded-xl overflow-hidden shadow-2xl w-full max-w-2xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Camera className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">Scanner un document</h3>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Camera View */}
        <div className="relative aspect-[4/3] bg-black">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black">
              <div className="text-center">
                <div className="h-10 w-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-white/70">Initialisation de la camera...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black p-8">
              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-4">
                  <Camera className="h-8 w-8 text-destructive" />
                </div>
                <p className="text-sm text-white/90 mb-4">{error}</p>
                <Button variant="outline" onClick={() => startCamera(facingMode)} className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Reessayer
                </Button>
              </div>
            </div>
          )}

          {capturedImage ? (
            <img src={capturedImage} alt="Captured" className="w-full h-full object-contain" />
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={cn("w-full h-full object-cover", (isLoading || !!error) && "invisible")}
            />
          )}

          {/* Scan frame overlay */}
          {!capturedImage && !error && !isLoading && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-8 border-2 border-white/30 rounded-lg">
                <div className="absolute -top-0.5 -left-0.5 w-8 h-8 border-t-2 border-l-2 border-white rounded-tl-lg" />
                <div className="absolute -top-0.5 -right-0.5 w-8 h-8 border-t-2 border-r-2 border-white rounded-tr-lg" />
                <div className="absolute -bottom-0.5 -left-0.5 w-8 h-8 border-b-2 border-l-2 border-white rounded-bl-lg" />
                <div className="absolute -bottom-0.5 -right-0.5 w-8 h-8 border-b-2 border-r-2 border-white rounded-br-lg" />
              </div>
              <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-white/70 bg-black/50 px-3 py-1 rounded-full whitespace-nowrap">
                Positionnez le document dans le cadre
              </p>
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 p-4 bg-card border-t border-border">
          {capturedImage ? (
            <>
              <Button variant="outline" onClick={retakePhoto} className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Reprendre
              </Button>
              <Button onClick={confirmCapture} className="gap-2">
                <Check className="h-4 w-4" />
                Utiliser cette photo
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-full"
                onClick={toggleCamera}
                disabled={isLoading || !!error}
                title="Changer de camera"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                className="h-14 w-14 rounded-full bg-white hover:bg-white/90 text-black shadow-lg"
                onClick={capturePhoto}
                disabled={isLoading || !!error}
                title="Prendre la photo"
              >
                <Camera className="h-6 w-6" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-full"
                onClick={onClose}
                title="Fermer"
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
