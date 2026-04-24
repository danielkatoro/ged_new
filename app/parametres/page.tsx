import { Shell } from "@/components/shell"
import { Header } from "@/components/header"
import { User, Bell, Shield, Globe, ChevronRight, Users, Key, Database, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

const utilisateurs = [
  { nom: "C. Boka", email: "c.boka@akieni.com", role: "Superadmin", lastSeen: "Actif maintenant", initials: "CB" },
  { nom: "M. Diallo", email: "m.diallo@akieni.com", role: "Admin Armoire", lastSeen: "Il y a 2h", initials: "MD" },
  { nom: "A. Mbia", email: "a.mbia@akieni.com", role: "Contributeur", lastSeen: "Il y a 1j", initials: "AM" },
  { nom: "L. Kama", email: "l.kama@akieni.com", role: "Approbateur", lastSeen: "Il y a 3h", initials: "LK" },
  { nom: "S. Nzaba", email: "s.nzaba@akieni.com", role: "Lecteur", lastSeen: "Il y a 5j", initials: "SN" },
]

const roleStyles: Record<string, string> = {
  "Superadmin": "bg-foreground text-background",
  "Admin Armoire": "bg-muted text-foreground",
  "Contributeur": "bg-muted text-muted-foreground",
  "Approbateur": "bg-amber-100 text-amber-700",
  "Lecteur": "bg-muted text-muted-foreground",
}

const settingSections = [
  { icon: Bell, label: "Notifications & Alertes", description: "Alertes email et notifications in-app par evenement" },
  { icon: Shield, label: "Securite & Acces", description: "Authentification, sessions actives, journal de connexion" },
  { icon: Key, label: "Cles API & Webhooks", description: "Tokens OAuth 2.0, webhooks et acces API REST" },
  { icon: Database, label: "Stockage & Retention", description: "Politiques d'archivage et de suppression par armoire" },
  { icon: Globe, label: "Langue & Region", description: "Fuseau horaire, localisation et format des dates" },
  { icon: RefreshCw, label: "Synchronisation LDAP / AD", description: "Import et synchro des utilisateurs depuis l'annuaire" },
]

export default function ParametresPage() {
  return (
    <Shell>
      <Header />
      <main className="p-6 space-y-6 max-w-4xl">

        {/* Profile */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-5">
          <h2 className="text-sm font-semibold text-foreground">Profil utilisateur</h2>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-foreground text-background font-bold text-lg flex-shrink-0">
              CB
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground">C. Boka</p>
              <p className="text-xs text-muted-foreground">Superadmin · c.boka@akieni.com</p>
            </div>
            <Button variant="outline" size="sm" className="h-8 text-xs rounded-lg">
              Modifier la photo
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground">Prenom</Label>
              <Input defaultValue="Christophe" className="h-9 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground">Nom</Label>
              <Input defaultValue="Boka" className="h-9 text-sm" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs font-medium text-foreground">Email</Label>
              <Input defaultValue="c.boka@akieni.com" className="h-9 text-sm" />
            </div>
          </div>

          <div className="flex justify-end">
            <Button size="sm" className="h-8 text-xs rounded-lg">
              Enregistrer
            </Button>
          </div>
        </div>

        {/* Users table */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Utilisateurs & Roles</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{utilisateurs.length} comptes actifs · Roles : Superadmin, Admin Armoire, Contributeur, Lecteur, Approbateur</p>
            </div>
            <Button size="sm" className="h-8 gap-1.5 text-xs rounded-lg">
              <Users className="h-3.5 w-3.5" />
              Inviter
            </Button>
          </div>
          <div className="divide-y divide-border">
            {utilisateurs.map((u, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/40 transition-colors group">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-foreground font-medium text-xs flex-shrink-0">
                  {u.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{u.nom}</p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-muted-foreground hidden sm:block">{u.lastSeen}</span>
                  <Badge className={`${roleStyles[u.role]} text-[10px]`}>{u.role}</Badge>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Other settings */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Configuration avancee</h2>
          </div>
          <div className="divide-y divide-border">
            {settingSections.map((section, i) => (
              <button
                key={i}
                className="w-full flex items-center gap-4 px-5 py-4 hover:bg-muted/40 transition-colors group text-left"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted group-hover:bg-foreground group-hover:text-background transition-colors flex-shrink-0">
                  <section.icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{section.label}</p>
                  <p className="text-xs text-muted-foreground">{section.description}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </main>
    </Shell>
  )
}
