"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { Mail, ArrowRight, ShieldCheck, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react"
import {
  getUserByEmail,
  generateOtp,
  verifyOtp,
  createSession,
  getSession,
} from "@/lib/auth-store"

type Step = "email" | "otp" | "success"

export default function LoginPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>("email")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [simulatedCode, setSimulatedCode] = useState("")
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Already logged in → redirect
  useEffect(() => {
    if (getSession()) router.replace("/")
  }, [router])

  // Resend countdown
  useEffect(() => {
    if (resendCooldown <= 0) return
    const t = setTimeout(() => setResendCooldown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [resendCooldown])

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!email.trim()) { setError("Veuillez saisir votre email."); return }
    const user = getUserByEmail(email.trim())
    if (!user) { setError("Aucun compte trouvé pour cet email."); return }
    if (!user.actif) { setError("Ce compte est désactivé. Contactez votre administrateur."); return }

    setLoading(true)
    await new Promise(r => setTimeout(r, 600))
    const code = generateOtp(email.trim())
    setSimulatedCode(code) // show in UI since no real email server
    setLoading(false)
    setStep("otp")
    setResendCooldown(60)
    setTimeout(() => inputRefs.current[0]?.focus(), 100)
  }

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    const next = [...otp]
    next[index] = value.slice(-1)
    setOtp(next)
    setError("")
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
    // Auto-submit when all filled
    if (next.every(d => d !== "") && value) {
      handleOtpSubmit(next.join(""))
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    if (paste.length === 6) {
      setOtp(paste.split(""))
      handleOtpSubmit(paste)
    }
  }

  const handleOtpSubmit = async (code?: string) => {
    const finalCode = code ?? otp.join("")
    if (finalCode.length < 6) { setError("Veuillez saisir les 6 chiffres du code."); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 500))
    const valid = verifyOtp(email.trim(), finalCode)
    if (!valid) {
      setError("Code invalide ou expiré. Veuillez réessayer.")
      setOtp(["", "", "", "", "", ""])
      setLoading(false)
      setTimeout(() => inputRefs.current[0]?.focus(), 50)
      return
    }
    const user = getUserByEmail(email.trim())!
    createSession(user.id, user.email)
    setStep("success")
    setLoading(false)
    await new Promise(r => setTimeout(r, 1200))
    router.replace("/")
  }

  const handleResend = () => {
    if (resendCooldown > 0) return
    const code = generateOtp(email.trim())
    setSimulatedCode(code)
    setOtp(["", "", "", "", "", ""])
    setError("")
    setResendCooldown(60)
    setTimeout(() => inputRefs.current[0]?.focus(), 100)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">

        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-foreground text-background flex items-center justify-center font-bold text-xl">
            A
          </div>
          <div className="text-center">
            <h1 className="text-xl font-semibold text-foreground tracking-tight">Akieni GED</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Gestion Electronique de Documents</p>
          </div>
        </div>

        {/* Card */}
        <div className="border border-border rounded-xl bg-card shadow-sm">

          {/* Step: Email */}
          {step === "email" && (
            <form onSubmit={handleEmailSubmit} className="p-6 space-y-5">
              <div className="space-y-1">
                <h2 className="text-sm font-semibold text-foreground">Connexion</h2>
                <p className="text-xs text-muted-foreground">Saisissez votre email professionnel pour recevoir un code de connexion.</p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Email professionnel</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="vous@akieni.com"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError("") }}
                    className="h-10 pl-9 text-sm"
                    autoFocus
                    autoComplete="email"
                    disabled={loading}
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                  <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full h-10 text-sm" disabled={loading}>
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <>Envoyer le code <ArrowRight className="ml-2 h-4 w-4" /></>
                )}
              </Button>

              <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
                Comptes de démo : c.boka@akieni.com · m.diallo@akieni.com · a.mbia@akieni.com
              </p>
            </form>
          )}

          {/* Step: OTP */}
          {step === "otp" && (
            <div className="p-6 space-y-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-foreground" />
                  <h2 className="text-sm font-semibold text-foreground">Vérification</h2>
                </div>
                <p className="text-xs text-muted-foreground">
                  Un code à 6 chiffres a été envoyé à <span className="font-medium text-foreground">{email}</span>
                </p>
              </div>

              {/* Simulated OTP hint (no real email server) */}
              {simulatedCode && (
                <div className="flex items-center gap-2 text-xs bg-muted rounded-lg px-3 py-2 border border-border">
                  <span className="text-muted-foreground">Code de démonstration :</span>
                  <span className="font-mono font-bold text-foreground tracking-widest">{simulatedCode}</span>
                </div>
              )}

              {/* OTP inputs */}
              <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => { inputRefs.current[i] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    disabled={loading}
                    className={cn(
                      "h-12 w-10 rounded-lg border text-center text-lg font-semibold transition-all outline-none",
                      "bg-background text-foreground",
                      digit ? "border-foreground" : "border-border",
                      "focus:border-foreground focus:ring-2 focus:ring-foreground/10",
                      error && "border-destructive focus:border-destructive focus:ring-destructive/10"
                    )}
                  />
                ))}
              </div>

              {error && (
                <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                  <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                  {error}
                </div>
              )}

              <Button
                className="w-full h-10 text-sm"
                onClick={() => handleOtpSubmit()}
                disabled={loading || otp.some(d => !d)}
              >
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Vérifier et se connecter"}
              </Button>

              <div className="flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => { setStep("email"); setOtp(["","","","","",""]); setError("") }}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Changer d&apos;email
                </button>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCooldown > 0}
                  className={cn(
                    "transition-colors",
                    resendCooldown > 0 ? "text-muted-foreground cursor-not-allowed" : "text-foreground hover:underline"
                  )}
                >
                  {resendCooldown > 0 ? `Renvoyer (${resendCooldown}s)` : "Renvoyer le code"}
                </button>
              </div>
            </div>
          )}

          {/* Step: Success */}
          {step === "success" && (
            <div className="p-8 flex flex-col items-center gap-3 text-center">
              <div className="h-12 w-12 rounded-full bg-emerald-500/15 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              </div>
              <p className="text-sm font-semibold text-foreground">Connexion réussie</p>
              <p className="text-xs text-muted-foreground">Redirection en cours...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
