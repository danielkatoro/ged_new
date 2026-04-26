"use client"

import { Shell } from "@/components/shell"
import { Header } from "@/components/header"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import {
  User, Bell, Shield, Key, Database, Globe, RefreshCw,
  Users, Plus, Pencil, Trash2, Check, X, Search,
  AlertTriangle, Download, FileText, Clock, Activity,
  ChevronDown, Lock, Unlock, Archive, Webhook,
} from "lucide-react"
import {
  getUsers, saveUsers, addUser, updateUser, deactivateUser,
  getCurrentUser, type User as GedUser, type UserRole,
} from "@/lib/auth-store"

// ─── Types ────────────────────────────────────────────────────────────────────

type Section =
  | "profil"
  | "notifications"
  | "utilisateurs"
  | "securite"
  | "journal"
  | "rgpd"
  | "integrations"
  | "armoires"

const ROLES: UserRole[] = ["Superadmin", "Admin Armoire", "Contributeur", "Lecteur", "Approbateur"]

const roleStyles: Record<UserRole, string> = {
  "Superadmin":    "bg-foreground text-background",
  "Admin Armoire": "bg-muted text-foreground border border-border",
  "Contributeur":  "bg-muted text-muted-foreground",
  "Approbateur":   "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  "Lecteur":       "bg-muted text-muted-foreground",
}

const NAV: { id: Section; label: string; icon: React.ElementType }[] = [
  { id: "profil",        label: "Mon Profil",          icon: User },
  { id: "notifications", label: "Notifications",        icon: Bell },
  { id: "utilisateurs",  label: "Utilisateurs & Rôles", icon: Users },
  { id: "securite",      label: "Sécurité & Mot de passe", icon: Shield },
  { id: "journal",       label: "Journal d'audit",      icon: FileText },
  { id: "rgpd",          label: "Conformité RGPD",      icon: Lock },
  { id: "integrations",  label: "Intégrations (API)",   icon: Webhook },
  { id: "armoires",      label: "Gérer les Armoires",   icon: Archive },
]

// ─── Simulated audit log ───────────────────────────────────────────────────────
const AUDIT_LOG = [
  { id: 1, action: "Connexion réussie",           user: "c.boka@akieni.com",   date: "26/04/2026 14:32", ip: "41.202.1.5",   type: "auth" },
  { id: 2, action: "Document téléchargé",          user: "m.diallo@akieni.com", date: "26/04/2026 13:11", ip: "41.202.1.8",   type: "doc" },
  { id: 3, action: "Utilisateur désactivé",        user: "c.boka@akieni.com",   date: "26/04/2026 11:55", ip: "41.202.1.5",   type: "admin" },
  { id: 4, action: "Armoire créée : Contentieux",  user: "c.boka@akieni.com",   date: "25/04/2026 17:40", ip: "41.202.1.5",   type: "admin" },
  { id: 5, action: "Document supprimé",            user: "a.mbia@akieni.com",   date: "25/04/2026 16:20", ip: "197.149.2.10",  type: "doc" },
  { id: 6, action: "Connexion échouée (OTP)",      user: "s.nzaba@akieni.com",  date: "25/04/2026 09:05", ip: "197.149.2.15",  type: "auth" },
]

const auditTypeStyle: Record<string, string> = {
  auth:  "bg-blue-500/10 text-blue-700",
  doc:   "bg-muted text-muted-foreground",
  admin: "bg-amber-500/10 text-amber-700",
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function ParametresPage() {
  const [activeSection, setActiveSection] = useState<Section>("profil")
  const [currentUser, setCurrentUser] = useState<GedUser | null>(null)

  useEffect(() => {
    setCurrentUser(getCurrentUser())
    // seed users in localStorage if not already done
    getUsers()
  }, [])

  return (
    <Shell>
      <Header />
      <main className="p-4">
        <div className="max-w-6xl mx-auto">

          {/* Title */}
          <div className="mb-4">
            <h1 className="text-lg font-semibold text-foreground">Console d&apos;Administration</h1>
          </div>

          <div className="flex gap-0 border border-border rounded-xl overflow-hidden bg-card min-h-[600px]">

            {/* Left sidebar nav */}
            <nav className="w-52 flex-shrink-0 border-r border-border bg-muted/20 py-3">
              {NAV.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left transition-colors",
                    activeSection === item.id
                      ? "text-foreground font-medium bg-background border-r-2 border-r-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/60"
                  )}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Right panel */}
            <div className="flex-1 min-w-0 p-6 overflow-auto">
              {activeSection === "profil"        && <ProfilSection currentUser={currentUser} />}
              {activeSection === "notifications"  && <NotificationsSection />}
              {activeSection === "utilisateurs"   && <UtilisateursSection />}
              {activeSection === "securite"       && <SecuriteSection />}
              {activeSection === "journal"        && <JournalSection />}
              {activeSection === "rgpd"           && <RgpdSection />}
              {activeSection === "integrations"   && <IntegrationsSection />}
              {activeSection === "armoires"       && <ArmoiresSection />}
            </div>
          </div>
        </div>
      </main>
    </Shell>
  )
}

// ─── Section: Profil ───────────────────────────────────────────────────────────

function ProfilSection({ currentUser }: { currentUser: GedUser | null }) {
  const [prenom, setPrenom] = useState(currentUser?.prenom ?? "")
  const [nom, setNom]       = useState(currentUser?.nom ?? "")
  const [email, setEmail]   = useState(currentUser?.email ?? "")

  useEffect(() => {
    if (currentUser) {
      setPrenom(currentUser.prenom)
      setNom(currentUser.nom)
      setEmail(currentUser.email)
    }
  }, [currentUser])

  const handleSave = () => {
    if (!currentUser) return
    const updated = { ...currentUser, prenom, nom, email }
    updateUser(updated)
    toast.success("Profil mis à jour")
  }

  return (
    <div className="space-y-6 max-w-lg">
      <SectionHeader title="Mon Profil" description="Gérez vos informations personnelles et de connexion." />

      <div className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-xl bg-foreground text-background flex items-center justify-center font-bold text-lg flex-shrink-0">
          {currentUser?.initials ?? "?"}
        </div>
        <div>
          <p className="font-medium text-sm text-foreground">{currentUser?.prenom} {currentUser?.nom}</p>
          <p className="text-xs text-muted-foreground">{currentUser?.role}</p>
        </div>
        <Button variant="outline" size="sm" className="ml-auto h-8 text-xs">Modifier la photo</Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Prénom</Label>
          <Input value={prenom} onChange={e => setPrenom(e.target.value)} className="h-9 text-sm" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Nom</Label>
          <Input value={nom} onChange={e => setNom(e.target.value)} className="h-9 text-sm" />
        </div>
        <div className="space-y-1.5 col-span-2">
          <Label className="text-xs font-medium">Email</Label>
          <Input value={email} onChange={e => setEmail(e.target.value)} className="h-9 text-sm" type="email" />
        </div>
      </div>

      <Button size="sm" className="h-9 text-sm" onClick={handleSave}>Enregistrer les modifications</Button>
    </div>
  )
}

// ─── Section: Notifications ────────────────────────────────────────────────────

function NotificationsSection() {
  const [settings, setSettings] = useState({
    newDoc:      true,
    validation:  true,
    workflow:    false,
    errorImport: true,
    weeklyReport:false,
  })

  const toggle = (key: keyof typeof settings) =>
    setSettings(s => ({ ...s, [key]: !s[key] }))

  const items: { key: keyof typeof settings; label: string; desc: string }[] = [
    { key: "newDoc",       label: "Nouveau document reçu",     desc: "Notification quand un email importe un nouveau document" },
    { key: "validation",   label: "Demande de validation",     desc: "Quand un document vous est soumis pour approbation" },
    { key: "workflow",     label: "Changement de workflow",    desc: "Mise à jour du statut d'un circuit de validation" },
    { key: "errorImport",  label: "Erreur d'importation",      desc: "Pièce jointe rejetée ou connexion email échouée" },
    { key: "weeklyReport", label: "Rapport hebdomadaire",      desc: "Résumé d'activité chaque lundi matin" },
  ]

  return (
    <div className="space-y-6 max-w-lg">
      <SectionHeader title="Notifications & Alertes" description="Configurez les événements pour lesquels vous souhaitez être notifié par email." />
      <div className="divide-y divide-border border border-border rounded-lg overflow-hidden">
        {items.map(item => (
          <div key={item.key} className="flex items-center justify-between px-4 py-3 bg-card">
            <div>
              <p className="text-sm font-medium text-foreground">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
            <Toggle checked={settings[item.key]} onChange={() => toggle(item.key)} />
          </div>
        ))}
      </div>
      <Button size="sm" className="h-9 text-sm" onClick={() => toast.success("Préférences enregistrées")}>Enregistrer</Button>
    </div>
  )
}

// ─── Section: Utilisateurs ─────────────────────────────────────────────────────

function UtilisateursSection() {
  const [users, setUsers]     = useState<GedUser[]>([])
  const [search, setSearch]   = useState("")
  const [editId, setEditId]   = useState<string | null>(null)
  const [showInvite, setShowInvite] = useState(false)
  const [newEmail, setNewEmail]     = useState("")
  const [newRole, setNewRole]       = useState<UserRole>("Lecteur")
  const [newPrenom, setNewPrenom]   = useState("")
  const [newNom, setNewNom]         = useState("")

  useEffect(() => { setUsers(getUsers()) }, [])

  const refresh = () => setUsers(getUsers())

  const handleRoleChange = (id: string, role: UserRole) => {
    const user = users.find(u => u.id === id)
    if (!user) return
    updateUser({ ...user, role })
    refresh()
    toast.success("Rôle mis à jour")
  }

  const handleDeactivate = (id: string) => {
    deactivateUser(id)
    refresh()
    toast.info("Utilisateur désactivé")
  }

  const handleReactivate = (id: string) => {
    const user = users.find(u => u.id === id)
    if (!user) return
    updateUser({ ...user, actif: true, lastSeen: "Vient d'être réactivé" })
    refresh()
    toast.success("Utilisateur réactivé")
  }

  const handleInvite = () => {
    if (!newEmail || !newPrenom || !newNom) { toast.error("Tous les champs sont requis"); return }
    const id = `u${Date.now()}`
    const initials = (newPrenom[0] + newNom[0]).toUpperCase()
    addUser({
      id, prenom: newPrenom, nom: newNom, email: newEmail, initials,
      role: newRole, armoireAccess: [], actif: true,
      lastSeen: "Jamais connecté", createdAt: new Date().toISOString().split("T")[0],
    })
    refresh()
    setShowInvite(false)
    setNewEmail(""); setNewPrenom(""); setNewNom(""); setNewRole("Lecteur")
    toast.success(`Invitation envoyée à ${newEmail}`)
  }

  const filtered = users.filter(u =>
    `${u.prenom} ${u.nom} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <SectionHeader title="Utilisateurs & Rôles" description="Gérez les comptes, attribuez des rôles et contrôlez les accès par armoire." />

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Rechercher un utilisateur..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-8 pl-9 text-xs"
          />
        </div>
        <Button size="sm" className="h-8 text-xs gap-1.5" onClick={() => setShowInvite(v => !v)}>
          <Plus className="h-3.5 w-3.5" /> Inviter
        </Button>
      </div>

      {/* Invite form */}
      {showInvite && (
        <div className="border border-border rounded-lg p-4 bg-muted/20 space-y-3">
          <p className="text-xs font-semibold text-foreground">Nouvel utilisateur</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[11px]">Prénom</Label>
              <Input value={newPrenom} onChange={e => setNewPrenom(e.target.value)} className="h-8 text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px]">Nom</Label>
              <Input value={newNom} onChange={e => setNewNom(e.target.value)} className="h-8 text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px]">Email</Label>
              <Input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} className="h-8 text-xs" placeholder="prenom.nom@akieni.com" />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px]">Rôle</Label>
              <RoleSelect value={newRole} onChange={v => setNewRole(v)} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="h-8 text-xs" onClick={handleInvite}>Envoyer l&apos;invitation</Button>
            <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setShowInvite(false)}>Annuler</Button>
          </div>
        </div>
      )}

      {/* Users table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="grid grid-cols-[1fr_180px_120px_auto] gap-0 px-4 py-2 bg-muted/40 border-b border-border">
          {["Utilisateur", "Armoires", "Dernière activité", ""].map(h => (
            <p key={h} className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{h}</p>
          ))}
        </div>
        <div className="divide-y divide-border">
          {filtered.map(u => (
            <div key={u.id} className="grid grid-cols-[1fr_180px_120px_auto] gap-0 px-4 py-3 items-center hover:bg-muted/20 group">
              {/* User info */}
              <div className="flex items-center gap-3 min-w-0">
                <div className={cn(
                  "h-8 w-8 rounded-lg flex items-center justify-center text-xs font-semibold flex-shrink-0",
                  u.actif ? "bg-muted text-foreground" : "bg-muted/40 text-muted-foreground line-through"
                )}>
                  {u.initials}
                </div>
                <div className="min-w-0">
                  <p className={cn("text-sm font-medium truncate", !u.actif && "text-muted-foreground line-through")}>{u.prenom} {u.nom}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{u.email}</p>
                </div>
                <div className="ml-1">
                  {editId === u.id ? (
                    <RoleSelect value={u.role} onChange={v => { handleRoleChange(u.id, v); setEditId(null) }} />
                  ) : (
                    <button onClick={() => setEditId(u.id)} className="group/role flex items-center gap-1">
                      <Badge className={cn("text-[10px] px-1.5", roleStyles[u.role])}>{u.role}</Badge>
                      <Pencil className="h-2.5 w-2.5 text-muted-foreground opacity-0 group-hover/role:opacity-100 transition-opacity" />
                    </button>
                  )}
                </div>
              </div>

              {/* Armoire access */}
              <div className="flex flex-wrap gap-1">
                {u.armoireAccess.length === 0 ? (
                  <span className="text-[10px] text-muted-foreground">Toutes</span>
                ) : u.armoireAccess.slice(0, 2).map(a => (
                  <span key={a.armoireId} className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-foreground">{a.armoire}</span>
                ))}
                {u.armoireAccess.length > 2 && (
                  <span className="text-[10px] text-muted-foreground">+{u.armoireAccess.length - 2}</span>
                )}
              </div>

              {/* Last seen */}
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Clock className="h-3 w-3 flex-shrink-0" />
                {u.lastSeen}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {u.actif ? (
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-amber-600" title="Désactiver" onClick={() => handleDeactivate(u.id)}>
                    <Lock className="h-3.5 w-3.5" />
                  </Button>
                ) : (
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-emerald-600" title="Réactiver" onClick={() => handleReactivate(u.id)}>
                    <Unlock className="h-3.5 w-3.5" />
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" title="Supprimer" onClick={() => {
                  const updated = getUsers().filter(uu => uu.id !== u.id)
                  saveUsers(updated)
                  refresh()
                  toast.error("Utilisateur supprimé")
                }}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground">{users.filter(u => u.actif).length} utilisateurs actifs · {users.filter(u => !u.actif).length} désactivés</p>
    </div>
  )
}

// ─── Section: Sécurité ─────────────────────────────────────────────────────────

function SecuriteSection() {
  const [otp2fa, set2fa] = useState(true)
  const [sessionTimeout, setSessionTimeout] = useState("8")

  return (
    <div className="space-y-6 max-w-lg">
      <SectionHeader title="Sécurité & Mot de passe" description="Paramètres d'authentification, sessions et politique de sécurité." />

      <div className="space-y-3">
        <div className="flex items-center justify-between border border-border rounded-lg px-4 py-3 bg-card">
          <div>
            <p className="text-sm font-medium text-foreground">Authentification OTP</p>
            <p className="text-xs text-muted-foreground">Code à usage unique envoyé par email à chaque connexion</p>
          </div>
          <Toggle checked={otp2fa} onChange={() => set2fa(v => !v)} />
        </div>

        <div className="border border-border rounded-lg px-4 py-3 bg-card space-y-2">
          <p className="text-sm font-medium text-foreground">Durée de session</p>
          <div className="flex items-center gap-3">
            {["1","4","8","24"].map(h => (
              <button
                key={h}
                onClick={() => setSessionTimeout(h)}
                className={cn(
                  "text-xs px-3 py-1.5 rounded border transition-colors",
                  sessionTimeout === h
                    ? "bg-foreground text-background border-foreground"
                    : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                {h}h
              </button>
            ))}
          </div>
        </div>

        <div className="border border-border rounded-lg px-4 py-3 bg-card">
          <p className="text-sm font-medium text-foreground mb-2">Sessions actives</p>
          {[
            { device: "Chrome — Brazzaville", ip: "41.202.1.5",  since: "Maintenant" },
            { device: "Mobile Safari — Kinshasa", ip: "197.149.2.10", since: "Il y a 2h" },
          ].map((s, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-t border-border first:border-t-0">
              <div>
                <p className="text-xs font-medium text-foreground">{s.device}</p>
                <p className="text-[10px] text-muted-foreground">{s.ip} · {s.since}</p>
              </div>
              <Button variant="outline" size="sm" className="h-6 text-[10px] text-destructive border-destructive/30 hover:bg-destructive/10">
                Révoquer
              </Button>
            </div>
          ))}
        </div>
      </div>

      <Button size="sm" className="h-9 text-sm" onClick={() => toast.success("Paramètres de sécurité enregistrés")}>Enregistrer</Button>
    </div>
  )
}

// ─── Section: Journal d'audit ──────────────────────────────────────────────────

function JournalSection() {
  const [search, setSearch] = useState("")
  const filtered = AUDIT_LOG.filter(e =>
    `${e.action} ${e.user}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <SectionHeader title="Journal d'audit" description="Piste immuable de toutes les actions effectuées sur la plateforme." />

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="h-8 pl-9 text-xs" />
        </div>
        <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
          <Download className="h-3.5 w-3.5" /> Exporter CSV
        </Button>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <div className="grid grid-cols-[1fr_180px_100px_80px] gap-0 px-4 py-2 bg-muted/40 border-b border-border">
          {["Action", "Utilisateur", "Date", "Type"].map(h => (
            <p key={h} className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{h}</p>
          ))}
        </div>
        <div className="divide-y divide-border">
          {filtered.map(e => (
            <div key={e.id} className="grid grid-cols-[1fr_180px_100px_80px] gap-0 px-4 py-2.5 items-center hover:bg-muted/20">
              <div>
                <p className="text-xs font-medium text-foreground">{e.action}</p>
                <p className="text-[10px] text-muted-foreground">IP: {e.ip}</p>
              </div>
              <p className="text-xs text-muted-foreground truncate">{e.user}</p>
              <p className="text-[10px] text-muted-foreground">{e.date}</p>
              <Badge className={cn("text-[9px] px-1.5 w-fit", auditTypeStyle[e.type])}>{e.type}</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Section: RGPD ────────────────────────────────────────────────────────────

function RgpdSection() {
  const [searchRgpd, setSearchRgpd] = useState("")
  const [launched, setLaunched] = useState(false)

  return (
    <div className="space-y-6 max-w-2xl">
      <SectionHeader title="Conformité RGPD" description="Gérez les demandes d'accès et de suppression des données personnelles." />

      {/* Demande accès */}
      <div className="border border-border rounded-lg p-5 space-y-4 bg-card">
        <div className="flex items-start gap-3">
          <Shield className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-foreground">Demande d&apos;accès ou d&apos;effacement RGPD</p>
            <p className="text-xs text-muted-foreground mt-0.5">Rechercher tous les documents associés à un individu pour export ou suppression définitive.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Input
            placeholder="Nom ou identifiant de la personne..."
            value={searchRgpd}
            onChange={e => setSearchRgpd(e.target.value)}
            className="h-10 text-sm flex-1"
          />
          <Button className="h-10 gap-1.5 text-sm" onClick={() => toast.info("Recherche RGPD lancée...")}>
            <Search className="h-4 w-4" /> Rechercher
          </Button>
        </div>
      </div>

      {/* Hard delete */}
      <div className="border border-destructive/40 rounded-lg p-5 space-y-4 bg-destructive/5">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-destructive">Suppression définitive (hard delete)</p>
            <p className="text-xs text-muted-foreground mt-1">
              Cette action est <strong>irréversible</strong>. Un certificat de suppression sera généré automatiquement et consigné dans le journal de conformité RGPD.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="h-9 text-xs gap-1.5" onClick={() => toast.info("Export ZIP généré")}>
            <Download className="h-3.5 w-3.5" /> Export ZIP des données
          </Button>
          <Button
            className="h-9 text-xs bg-destructive hover:bg-destructive/90 text-white"
            onClick={() => {
              if (!launched) { setLaunched(true); toast.error("Procédure de suppression définitive lancée — certificat généré") }
            }}
          >
            Lancer la procédure
          </Button>
        </div>
        {launched && (
          <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-500/10 border border-emerald-500/20 rounded px-3 py-2">
            <Check className="h-3.5 w-3.5" /> Certificat de suppression généré · Consigné le 26/04/2026 à 15:32
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Section: Intégrations ────────────────────────────────────────────────────

function IntegrationsSection() {
  const apis = [
    { name: "REST API v2",     key: "ged_live_sk_••••••••3f9a", status: true,  calls: "12,430 ce mois" },
    { name: "Webhook Zapier",  key: "whk_••••••••b82c",         status: true,  calls: "530 ce mois" },
    { name: "LDAP Sync",       key: "ldap://dc.akieni.local",    status: false, calls: "Non configuré" },
  ]

  return (
    <div className="space-y-6 max-w-2xl">
      <SectionHeader title="Intégrations (API)" description="Gérez vos tokens d'accès, webhooks et connexions tierces." />

      <div className="divide-y divide-border border border-border rounded-lg overflow-hidden">
        {apis.map((api, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3 bg-card">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-foreground">{api.name}</p>
                <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                  api.status ? "bg-emerald-500/15 text-emerald-700" : "bg-muted text-muted-foreground"
                )}>
                  {api.status ? "Actif" : "Inactif"}
                </span>
              </div>
              <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{api.key}</p>
              <p className="text-[10px] text-muted-foreground">{api.calls}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="h-7 text-xs">Régénérer</Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
            </div>
          </div>
        ))}
      </div>

      <Button size="sm" className="h-9 text-sm gap-1.5" onClick={() => toast.info("Nouveau token créé")}>
        <Plus className="h-4 w-4" /> Créer un nouveau token
      </Button>
    </div>
  )
}

// ─── Section: Armoires ────────────────────────────────────────────────────────

function ArmoiresSection() {
  const armoires = [
    { id: "a1", name: "Finance",    docs: 234, users: 3, retention: "7 ans" },
    { id: "a2", name: "RH",         docs: 156, users: 5, retention: "5 ans" },
    { id: "a3", name: "Juridique",  docs: 89,  users: 2, retention: "10 ans" },
    { id: "a4", name: "Direction",  docs: 45,  users: 1, retention: "3 ans" },
  ]

  return (
    <div className="space-y-4">
      <SectionHeader title="Gérer les Armoires" description="Configurer les armoires, politiques de rétention et permissions d'accès." />

      <div className="border border-border rounded-lg overflow-hidden">
        <div className="grid grid-cols-[1fr_80px_80px_100px_auto] gap-0 px-4 py-2 bg-muted/40 border-b border-border">
          {["Armoire", "Documents", "Utilisateurs", "Rétention", ""].map(h => (
            <p key={h} className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{h}</p>
          ))}
        </div>
        <div className="divide-y divide-border">
          {armoires.map(a => (
            <div key={a.id} className="grid grid-cols-[1fr_80px_80px_100px_auto] gap-0 px-4 py-3 items-center hover:bg-muted/20 group">
              <div className="flex items-center gap-2">
                <Archive className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">{a.name}</p>
              </div>
              <p className="text-sm text-muted-foreground">{a.docs}</p>
              <p className="text-sm text-muted-foreground">{a.users}</p>
              <span className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground w-fit">{a.retention}</span>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground"><Pencil className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Button size="sm" className="h-9 text-sm gap-1.5" onClick={() => toast.info("Formulaire de création d'armoire")}>
        <Plus className="h-4 w-4" /> Nouvelle armoire
      </Button>
    </div>
  )
}

// ─── Shared components ─────────────────────────────────────────────────────────

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="pb-4 border-b border-border">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
    </div>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={cn(
        "relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0",
        checked ? "bg-foreground" : "bg-muted-foreground/30"
      )}
    >
      <span className={cn(
        "inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform",
        checked ? "translate-x-4" : "translate-x-1"
      )} />
    </button>
  )
}

function RoleSelect({ value, onChange }: { value: UserRole; onChange: (v: UserRole) => void }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value as UserRole)}
      className="h-7 text-xs border border-border rounded px-1.5 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
    >
      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
    </select>
  )
}
