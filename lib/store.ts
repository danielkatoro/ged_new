"use client"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DocFile {
  id: string
  name: string
  type: "pdf" | "docx" | "xlsx" | "img"
  size: string
  date: string
  status: "En attente" | "En validation" | "Approuve" | "Rejete"
  confidence: number
  author: string
  description: string
  tags: string[]
  source: "upload" | "email" | "scan" | "workflow"
  linkedEmail?: string
  linkedWorkflow?: string
  // Invoice / supplier fields
  fournisseur?: string
  montant?: number
  numero?: string
  ocrContent?: string  // Full-text OCR content for search
  versions: { version: number; date: string; author: string }[]
  activity: { action: string; user: string; date: string; ip?: string }[]
}

export interface Dossier {
  id: string
  name: string
  date: string
  description?: string
  files: DocFile[]
}

export interface Armoire {
  id: string
  name: string
  date: string
  description?: string
  icon?: string
  dossiers: Dossier[]
}

export interface Agence {
  id: string
  name: string
  ville: string
  quartier?: string
  date: string
  description?: string
  responsable?: string
  armoires: Armoire[]
}

export interface Direction {
  id: string
  name: string
  date: string
  description?: string
  members: number
  access: "Restreint" | "Interne" | "Public"
  armoires: Armoire[]
  agences: Agence[]
}

export interface User {
  id: string
  name: string
  email: string
  role: "Superadmin" | "Admin Armoire" | "Contributeur" | "Lecteur" | "Approbateur"
  avatar?: string
  lastLogin: string
  status: "Actif" | "Inactif"
  directions: string[]
}

export interface SourceEmail {
  id: string
  email: string
  direction: string
  armoire: string
  active: boolean
  createdAt: string
  lastReceived?: string
  docsReceived: number
}

export interface TypeDoc {
  id: string
  name: string
  description: string
  fields: { name: string; type: string; required: boolean }[]
  armoire?: string
  count: number
}

export interface Workflow {
  id: string
  name: string
  description: string
  steps: { name: string; role: string; delay: number }[]
  docTypes: string[]
  active: boolean
  executions: number
}

export interface AuditLog {
  id: string
  action: string
  user: string
  target: string
  targetType: "document" | "dossier" | "armoire" | "direction" | "user" | "workflow"
  date: string
  ip: string
  details?: string
}

export interface Notification {
  id: string
  type: "info" | "warning" | "success" | "error"
  title: string
  message: string
  date: string
  read: boolean
  link?: string
}

// ─── Initial Mock Data ────────────────────────────────────────────────────────

const createActivity = (actions: string[]) => actions.map((action, i) => ({
  action,
  user: ["C. Boka", "J. Martin", "A. Diallo"][i % 3],
  date: `${20 - i}-04-2026`,
  ip: "192.168.1." + (100 + i),
}))

const createVersions = (count: number) => Array.from({ length: count }, (_, i) => ({
  version: count - i,
  date: `${20 - i * 2}-04-2026`,
  author: ["C. Boka", "J. Martin"][i % 2],
}))

const INITIAL_DIRECTIONS: Direction[] = [
  {
    id: "akieni",
    name: "Akieni",
    date: "25-03-2026",
    description: "Direction principale du groupe",
    members: 12,
    access: "Restreint",
    agences: [
      {
        id: "agence-poto-poto",
        name: "Agence Poto-Poto",
        ville: "Brazzaville",
        quartier: "Poto-Poto",
        date: "01-01-2026",
        description: "Agence principale centre-ville",
        responsable: "M. Brou",
        armoires: [],
      },
      {
        id: "agence-bacongo",
        name: "Agence Bacongo",
        ville: "Brazzaville",
        quartier: "Bacongo",
        date: "15-02-2026",
        description: "Agence secteur commercial",
        responsable: "K. Assi",
        armoires: [],
      },
    ],
    armoires: [
      {
        id: "finance",
        name: "Finance",
        date: "25-03-2026",
        description: "Documents comptables et financiers",
        dossiers: [
          {
            id: "factures-2026",
            name: "Factures 2026",
            date: "01-01-2026",
            description: "Factures fournisseurs et clients",
            files: [
              {
                id: "doc-001",
                name: "Facture_TOTAL_Energie_Avr2026.pdf",
                type: "pdf",
                size: "1.2 MB",
                date: "23-04-2026",
                status: "Approuve",
                confidence: 97,
                author: "C. Boka",
                description: "Facture mensuelle TOTAL pour la consommation energie du siege.",
                tags: ["facture", "energie", "total", "2026"],
                source: "email",
                linkedEmail: "factures@akieni.com",
                fournisseur: "TOTAL Energie",
                montant: 4820.50,
                numero: "FAC-2026-0041",
                ocrContent: "TOTAL Energie SA - Facture numero FAC-2026-0041 - Periode avril 2026 - Consommation electrique siege 4820.50 FCFA - Client Akieni Group - TVA 18%",
                versions: createVersions(2),
                activity: createActivity(["Approuve", "Valide", "Cree"]),
              },
              {
                id: "doc-002",
                name: "Budget_Q1_2026.xlsx",
                type: "xlsx",
                size: "340 KB",
                date: "15-04-2026",
                status: "En validation",
                confidence: 91,
                author: "J. Martin",
                description: "Budget previsionnel premier trimestre 2026.",
                tags: ["budget", "q1", "previsionnel"],
                source: "upload",
                ocrContent: "Budget previsionnel Q1 2026 - Charges operationnelles 12 500 000 FCFA - Investissements 3 200 000 FCFA - Masse salariale 8 450 000 FCFA",
                versions: createVersions(3),
                activity: createActivity(["Modifie", "Telecharge", "Cree"]),
              },
              {
                id: "doc-003",
                name: "Rapport_Financier_Q1.pdf",
                type: "pdf",
                size: "2.1 MB",
                date: "10-04-2026",
                status: "Approuve",
                confidence: 95,
                author: "A. Diallo",
                description: "Rapport financier consolide du premier trimestre.",
                tags: ["rapport", "finance", "q1"],
                source: "workflow",
                linkedWorkflow: "Validation Rapports",
                ocrContent: "Rapport financier consolide Q1 2026 - Chiffre d affaires 45 200 000 FCFA - EBITDA 12 300 000 FCFA - Resultat net 8 750 000 FCFA - Tresorerie 22 100 000 FCFA",
                versions: createVersions(4),
                activity: createActivity(["Approuve", "Valide", "Revise", "Cree"]),
              },
              {
                id: "doc-011",
                name: "Facture_Orange_Mar2026.pdf",
                type: "pdf",
                size: "890 KB",
                date: "05-03-2026",
                status: "Approuve",
                confidence: 98,
                author: "Systeme",
                description: "Facture telephonie mobile Orange - flotte entreprise.",
                tags: ["facture", "telecom", "orange", "2026"],
                source: "email",
                linkedEmail: "factures@orange.ci",
                fournisseur: "Orange CI",
                montant: 1250000,
                numero: "FAC-2026-0032",
                ocrContent: "Orange Cote d Ivoire - Facture numero FAC-2026-0032 - Flotte mobile entreprise 45 lignes - Mars 2026 - Montant HT 1 059 322 FCFA - TVA 18% 190 678 FCFA - Total TTC 1 250 000 FCFA",
                versions: createVersions(1),
                activity: createActivity(["Importe", "Cree"]),
              },
              {
                id: "doc-012",
                name: "Facture_Orange_Avr2026.pdf",
                type: "pdf",
                size: "910 KB",
                date: "05-04-2026",
                status: "En validation",
                confidence: 96,
                author: "Systeme",
                description: "Facture telephonie mobile Orange - flotte entreprise avril 2026.",
                tags: ["facture", "telecom", "orange", "2026"],
                source: "email",
                linkedEmail: "factures@orange.ci",
                fournisseur: "Orange CI",
                montant: 1310000,
                numero: "FAC-2026-0041",
                ocrContent: "Orange Cote d Ivoire - Facture numero FAC-2026-0041 - Flotte mobile entreprise 47 lignes - Avril 2026 - Montant HT 1 110 169 FCFA - TVA 18% 199 831 FCFA - Total TTC 1 310 000 FCFA",
                versions: createVersions(1),
                activity: createActivity(["En attente validation", "Importe"]),
              },
              {
                id: "doc-013",
                name: "Facture_MTN_Mar2026.pdf",
                type: "pdf",
                size: "750 KB",
                date: "08-03-2026",
                status: "Approuve",
                confidence: 94,
                author: "Systeme",
                description: "Facture internet fibre MTN Business mars 2026.",
                tags: ["facture", "internet", "mtn", "2026"],
                source: "email",
                linkedEmail: "billing@mtn.ci",
                fournisseur: "MTN Business",
                montant: 850000,
                numero: "MTN-BIZ-2026-0087",
                ocrContent: "MTN Business Cote d Ivoire - Facture MTN-BIZ-2026-0087 - Connexion fibre entreprise 1 Gbps - Mars 2026 - Abonnement mensuel 850 000 FCFA TTC",
                versions: createVersions(1),
                activity: createActivity(["Approuve", "Cree"]),
              },
              {
                id: "doc-014",
                name: "Facture_Ecowater_Jan2026.pdf",
                type: "pdf",
                size: "620 KB",
                date: "15-01-2026",
                status: "Approuve",
                confidence: 99,
                author: "Systeme",
                description: "Facture eau et maintenance fontaines janvier 2026.",
                tags: ["facture", "eau", "maintenance"],
                source: "scan",
                fournisseur: "Ecowater Services",
                montant: 225000,
                numero: "ECO-2026-0008",
                ocrContent: "Ecowater Services - Facture ECO-2026-0008 - Maintenance fontaines et bonbonnes eau - Janvier 2026 - 225 000 FCFA",
                versions: createVersions(1),
                activity: createActivity(["Approuve", "Scanne"]),
              },
            ],
          },
          {
            id: "contrats-fournisseurs",
            name: "Contrats Fournisseurs",
            date: "01-02-2026",
            description: "Contrats et accords fournisseurs",
            files: [
              {
                id: "doc-004",
                name: "Contrat_Fourniture_IT.pdf",
                type: "pdf",
                size: "890 KB",
                date: "22-03-2026",
                status: "Approuve",
                confidence: 88,
                author: "C. Boka",
                description: "Contrat de fourniture materiel informatique annuel.",
                tags: ["contrat", "it", "fourniture"],
                source: "scan",
                versions: createVersions(1),
                activity: createActivity(["Signe", "Cree"]),
              },
            ],
          },
        ],
      },
      {
        id: "rh",
        name: "RH",
        date: "25-03-2026",
        description: "Ressources humaines et gestion du personnel",
        dossiers: [
          {
            id: "contrats-cdi",
            name: "Contrats CDI",
            date: "01-02-2026",
            files: [
              {
                id: "doc-005",
                name: "CDI_Jean_Marc_Boka.docx",
                type: "docx",
                size: "340 KB",
                date: "22-04-2026",
                status: "En attente",
                confidence: 91,
                author: "HR Manager",
                description: "Contrat a duree indeterminee - Jean-Marc Boka",
                tags: ["contrat", "cdi", "embauche"],
                source: "workflow",
                linkedWorkflow: "Signature Contrats",
                versions: createVersions(2),
                activity: createActivity(["En attente signature", "Cree"]),
              },
            ],
          },
          {
            id: "fiches-paie",
            name: "Fiches de Paie",
            date: "01-03-2026",
            files: [
              {
                id: "doc-006",
                name: "Paie_Mars_2026.pdf",
                type: "pdf",
                size: "180 KB",
                date: "31-03-2026",
                status: "Approuve",
                confidence: 99,
                author: "Systeme",
                description: "Bulletin de paie Mars 2026",
                tags: ["paie", "mars", "2026"],
                source: "upload",
                versions: createVersions(1),
                activity: createActivity(["Genere"]),
              },
            ],
          },
        ],
      },
      {
        id: "juridique",
        name: "Juridique",
        date: "25-03-2026",
        description: "Documents legaux et conformite",
        dossiers: [
          {
            id: "nda",
            name: "Accords NDA",
            date: "10-01-2026",
            files: [
              {
                id: "doc-007",
                name: "NDA_Partenaire_X.pdf",
                type: "pdf",
                size: "670 KB",
                date: "12-04-2026",
                status: "En attente",
                confidence: 84,
                author: "Legal Team",
                description: "Accord de confidentialite avec Partenaire X",
                tags: ["nda", "confidentialite", "partenaire"],
                source: "email",
                linkedEmail: "legal@akieni.com",
                versions: createVersions(3),
                activity: createActivity(["En revision", "Modifie", "Cree"]),
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "silicon",
    name: "Silicon",
    date: "25-03-2026",
    description: "Division technologique",
    members: 8,
    access: "Interne",
    agences: [
      {
        id: "agence-marcory",
        name: "Agence Moungali",
        ville: "Brazzaville",
        quartier: "Moungali",
        date: "01-03-2026",
        responsable: "T. Goli",
        armoires: [],
      },
    ],
    armoires: [
      {
        id: "projets-tech",
        name: "Projets",
        date: "25-03-2026",
        dossiers: [],
      },
      {
        id: "clients-silicon",
        name: "Clients",
        date: "25-03-2026",
        dossiers: [],
      },
    ],
  },
  {
    id: "yao",
    name: "YAO",
    date: "25-03-2026",
    description: "Operations internationales",
    members: 6,
    access: "Restreint",
    agences: [],
    armoires: [
      {
        id: "ops-yao",
        name: "Operations",
        date: "25-03-2026",
        dossiers: [],
      },
      {
        id: "archives-yao",
        name: "Archives",
        date: "25-03-2026",
        dossiers: [],
      },
    ],
  },
  {
    id: "services-centraux",
    name: "Services Centraux",
    date: "25-03-2026",
    description: "Services support et administratifs",
    members: 15,
    access: "Interne",
    agences: [],
    armoires: [],
  },
  {
    id: "logistique",
    name: "Logistique & Ops",
    date: "25-03-2026",
    description: "Logistique et operations",
    members: 10,
    access: "Interne",
    agences: [],
    armoires: [],
  },
  {
    id: "ressources-humaines",
    name: "Ressources Humaines",
    date: "25-03-2026",
    description: "Direction RH centrale",
    members: 5,
    access: "Restreint",
    agences: [],
    armoires: [],
  },
]

const INITIAL_USERS: User[] = [
  { id: "u1", name: "C. Boka", email: "c.boka@akieni.com", role: "Superadmin", lastLogin: "24-04-2026 09:32", status: "Actif", directions: ["akieni", "silicon", "yao"] },
  { id: "u2", name: "J. Martin", email: "j.martin@akieni.com", role: "Admin Armoire", lastLogin: "24-04-2026 08:15", status: "Actif", directions: ["akieni"] },
  { id: "u3", name: "A. Diallo", email: "a.diallo@akieni.com", role: "Contributeur", lastLogin: "23-04-2026 17:42", status: "Actif", directions: ["akieni", "silicon"] },
  { id: "u4", name: "M. Kouame", email: "m.kouame@akieni.com", role: "Lecteur", lastLogin: "22-04-2026 14:20", status: "Actif", directions: ["logistique"] },
  { id: "u5", name: "S. Traore", email: "s.traore@akieni.com", role: "Approbateur", lastLogin: "21-04-2026 11:05", status: "Inactif", directions: ["services-centraux"] },
]

const INITIAL_SOURCE_EMAILS: SourceEmail[] = [
  { id: "se1", email: "factures@akieni.com", direction: "Akieni", armoire: "Finance", active: true, createdAt: "01-01-2026", lastReceived: "23-04-2026", docsReceived: 145 },
  { id: "se2", email: "rh@akieni.com", direction: "Akieni", armoire: "RH", active: true, createdAt: "01-01-2026", lastReceived: "22-04-2026", docsReceived: 78 },
  { id: "se3", email: "legal@akieni.com", direction: "Akieni", armoire: "Juridique", active: true, createdAt: "15-02-2026", lastReceived: "20-04-2026", docsReceived: 34 },
  { id: "se4", email: "scan@silicon.com", direction: "Silicon", armoire: "Projets", active: false, createdAt: "01-03-2026", docsReceived: 12 },
]

const INITIAL_TYPE_DOCS: TypeDoc[] = [
  { id: "td1", name: "Facture Fournisseur", description: "Factures recues des fournisseurs", fields: [
    { name: "Numero Facture", type: "text", required: true },
    { name: "Fournisseur", type: "text", required: true },
    { name: "Montant TTC", type: "number", required: true },
    { name: "Date Facture", type: "date", required: true },
  ], armoire: "Finance", count: 342 },
  { id: "td2", name: "Contrat CDI", description: "Contrats a duree indeterminee", fields: [
    { name: "Nom Salarie", type: "text", required: true },
    { name: "Poste", type: "text", required: true },
    { name: "Date Debut", type: "date", required: true },
    { name: "Salaire", type: "number", required: false },
  ], armoire: "RH", count: 89 },
  { id: "td3", name: "Accord NDA", description: "Accords de confidentialite", fields: [
    { name: "Partie", type: "text", required: true },
    { name: "Date Signature", type: "date", required: true },
    { name: "Duree", type: "text", required: true },
  ], armoire: "Juridique", count: 23 },
  { id: "td4", name: "Rapport", description: "Rapports internes", fields: [
    { name: "Titre", type: "text", required: true },
    { name: "Auteur", type: "text", required: true },
    { name: "Date", type: "date", required: true },
  ], count: 156 },
  { id: "td5", name: "Bon de Commande", description: "Bons de commande fournisseurs", fields: [
    { name: "Numero BC", type: "text", required: true },
    { name: "Fournisseur", type: "text", required: true },
    { name: "Montant", type: "number", required: true },
  ], armoire: "Finance", count: 234 },
]

const INITIAL_WORKFLOWS: Workflow[] = [
  {
    id: "wf1",
    name: "Validation Factures",
    description: "Circuit de validation des factures fournisseurs",
    steps: [
      { name: "Verification Comptable", role: "Contributeur", delay: 24 },
      { name: "Approbation Manager", role: "Approbateur", delay: 48 },
      { name: "Validation DG", role: "Admin Armoire", delay: 72 },
    ],
    docTypes: ["Facture Fournisseur"],
    active: true,
    executions: 234,
  },
  {
    id: "wf2",
    name: "Signature Contrats",
    description: "Workflow de signature multi-parties pour contrats",
    steps: [
      { name: "Revision Juridique", role: "Admin Armoire", delay: 48 },
      { name: "Signature Salarie", role: "Externe", delay: 72 },
      { name: "Signature RH", role: "Admin Armoire", delay: 24 },
      { name: "Signature DG", role: "Superadmin", delay: 24 },
    ],
    docTypes: ["Contrat CDI"],
    active: true,
    executions: 45,
  },
  {
    id: "wf3",
    name: "Validation Rapports",
    description: "Approbation des rapports avant publication",
    steps: [
      { name: "Relecture", role: "Contributeur", delay: 24 },
      { name: "Validation", role: "Approbateur", delay: 48 },
    ],
    docTypes: ["Rapport"],
    active: true,
    executions: 89,
  },
]

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  { id: "al1", action: "Document approuve", user: "C. Boka", target: "Facture_TOTAL_Energie_Avr2026.pdf", targetType: "document", date: "24-04-2026 09:32", ip: "192.168.1.100", details: "Workflow Validation Factures termine" },
  { id: "al2", action: "Document telecharge", user: "J. Martin", target: "Budget_Q1_2026.xlsx", targetType: "document", date: "24-04-2026 08:15", ip: "192.168.1.105" },
  { id: "al3", action: "Utilisateur cree", user: "C. Boka", target: "M. Kouame", targetType: "user", date: "23-04-2026 14:20", ip: "192.168.1.100" },
  { id: "al4", action: "Armoire creee", user: "C. Boka", target: "Projets", targetType: "armoire", date: "22-04-2026 10:00", ip: "192.168.1.100" },
  { id: "al5", action: "Document modifie", user: "A. Diallo", target: "Rapport_Financier_Q1.pdf", targetType: "document", date: "21-04-2026 16:45", ip: "192.168.1.110" },
  { id: "al6", action: "Workflow lance", user: "HR Manager", target: "CDI_Jean_Marc_Boka.docx", targetType: "document", date: "20-04-2026 11:30", ip: "192.168.1.115", details: "Workflow Signature Contrats" },
]

const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: "n1", type: "info", title: "Nouveau document", message: "Facture TOTAL recue par email", date: "24-04-2026 09:00", read: false, link: "/recherche" },
  { id: "n2", type: "warning", title: "Approbation en attente", message: "3 documents en attente de validation depuis 48h", date: "23-04-2026 14:00", read: false, link: "/workflows" },
  { id: "n3", type: "success", title: "Workflow termine", message: "Contrat CDI signe par toutes les parties", date: "22-04-2026 16:30", read: true },
]

// ─── Store Class ──────────────────────────────────���───────────────────────────

class Store {
  private directions: Direction[] = [...INITIAL_DIRECTIONS]
  private users: User[] = [...INITIAL_USERS]
  private sourceEmails: SourceEmail[] = [...INITIAL_SOURCE_EMAILS]
  private typeDocs: TypeDoc[] = [...INITIAL_TYPE_DOCS]
  private workflows: Workflow[] = [...INITIAL_WORKFLOWS]
  private auditLogs: AuditLog[] = [...INITIAL_AUDIT_LOGS]
  private notifications: Notification[] = [...INITIAL_NOTIFICATIONS]
  private trash: DocFile[] = []
  private listeners: Set<() => void> = new Set()

  // Subscribe to changes
  subscribe(listener: () => void) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private notify() {
    this.listeners.forEach(l => l())
  }

  // ─── Directions ─────────────────────────────────────────────────────────────

  getDirections() { return this.directions }

  addDirection(name: string) {
    const dir: Direction = {
      id: `dir-${Date.now()}`,
      name,
      date: new Date().toLocaleDateString("fr-FR").replace(/\//g, "-"),
      members: 0,
      access: "Interne",
      armoires: [],
      agences: [],
    }
    this.directions = [...this.directions, dir]
    this.addAuditLog("Direction creee", "C. Boka", name, "direction")
    this.notify()
    return dir
  }

  updateDirection(id: string, updates: Partial<Direction>) {
    this.directions = this.directions.map(d => d.id === id ? { ...d, ...updates } : d)
    this.notify()
  }

  deleteDirection(id: string) {
    const dir = this.directions.find(d => d.id === id)
    this.directions = this.directions.filter(d => d.id !== id)
    if (dir) this.addAuditLog("Direction supprimee", "C. Boka", dir.name, "direction")
    this.notify()
  }

  // ─── Agences ────────────────────────────────────────────────────────────────

  addAgence(directionId: string, data: { name: string; ville: string; quartier?: string; description?: string; responsable?: string }) {
    const agence: Agence = {
      id: `agence-${Date.now()}`,
      name: data.name,
      ville: data.ville,
      quartier: data.quartier,
      date: new Date().toLocaleDateString("fr-FR").replace(/\//g, "-"),
      description: data.description,
      responsable: data.responsable,
      armoires: [],
    }
    this.directions = this.directions.map(d =>
      d.id === directionId ? { ...d, agences: [...(d.agences ?? []), agence] } : d
    )
    this.addAuditLog("Agence creee", "C. Boka", data.name, "direction")
    this.notify()
    return agence
  }

  updateAgence(directionId: string, agenceId: string, updates: Partial<Agence>) {
    this.directions = this.directions.map(d =>
      d.id === directionId
        ? { ...d, agences: (d.agences ?? []).map(a => a.id === agenceId ? { ...a, ...updates } : a) }
        : d
    )
    this.notify()
  }

  deleteAgence(directionId: string, agenceId: string) {
    this.directions = this.directions.map(d =>
      d.id === directionId
        ? { ...d, agences: (d.agences ?? []).filter(a => a.id !== agenceId) }
        : d
    )
    this.notify()
  }

  addArmoireToAgence(directionId: string, agenceId: string, name: string) {
    const armoire: Armoire = {
      id: `arm-${Date.now()}`,
      name,
      date: new Date().toLocaleDateString("fr-FR").replace(/\//g, "-"),
      dossiers: [],
    }
    this.directions = this.directions.map(d =>
      d.id === directionId
        ? {
            ...d,
            agences: (d.agences ?? []).map(a =>
              a.id === agenceId ? { ...a, armoires: [...a.armoires, armoire] } : a
            ),
          }
        : d
    )
    this.addAuditLog("Armoire creee", "C. Boka", name, "armoire")
    this.notify()
    return armoire
  }

  // ─── Armoires ───────────────────────────────────────────────────────────────

  addArmoire(directionId: string, name: string) {
    const armoire: Armoire = {
      id: `arm-${Date.now()}`,
      name,
      date: new Date().toLocaleDateString("fr-FR").replace(/\//g, "-"),
      dossiers: [],
    }
    this.directions = this.directions.map(d =>
      d.id === directionId ? { ...d, armoires: [...d.armoires, armoire] } : d
    )
    this.addAuditLog("Armoire creee", "C. Boka", name, "armoire")
    this.notify()
    return armoire
  }

  deleteArmoire(directionId: string, armoireId: string) {
    this.directions = this.directions.map(d =>
      d.id === directionId
        ? { ...d, armoires: d.armoires.filter(a => a.id !== armoireId) }
        : d
    )
    this.notify()
  }

  // ─── Dossiers ───────────────────────────────────────────────────────────────

  addDossier(directionId: string, armoireId: string, name: string) {
    const dossier: Dossier = {
      id: `dos-${Date.now()}`,
      name,
      date: new Date().toLocaleDateString("fr-FR").replace(/\//g, "-"),
      files: [],
    }
    this.directions = this.directions.map(d =>
      d.id === directionId
        ? {
            ...d,
            armoires: d.armoires.map(a =>
              a.id === armoireId ? { ...a, dossiers: [...a.dossiers, dossier] } : a
            ),
          }
        : d
    )
    this.addAuditLog("Dossier cree", "C. Boka", name, "dossier")
    this.notify()
    return dossier
  }

  deleteDossier(directionId: string, armoireId: string, dossierId: string) {
    this.directions = this.directions.map(d =>
      d.id === directionId
        ? {
            ...d,
            armoires: d.armoires.map(a =>
              a.id === armoireId
                ? { ...a, dossiers: a.dossiers.filter(dos => dos.id !== dossierId) }
                : a
            ),
          }
        : d
    )
    this.notify()
  }

  // ─── Documents ──────────────────────────────────────────────────────────────

  getAllDocuments(): DocFile[] {
    const docs: DocFile[] = []
    for (const dir of this.directions) {
      for (const arm of dir.armoires) {
        for (const dos of arm.dossiers) {
          docs.push(...dos.files)
        }
      }
    }
    return docs
  }

  getDocument(id: string): DocFile | undefined {
    return this.getAllDocuments().find(d => d.id === id)
  }

  deleteDocument(docId: string) {
    const doc = this.getDocument(docId)
    if (doc) {
      this.trash = [...this.trash, doc]
      this.addAuditLog("Document supprime", "C. Boka", doc.name, "document")
    }
    this.directions = this.directions.map(d => ({
      ...d,
      armoires: d.armoires.map(a => ({
        ...a,
        dossiers: a.dossiers.map(dos => ({
          ...dos,
          files: dos.files.filter(f => f.id !== docId),
        })),
      })),
    }))
    this.notify()
  }

  // ─── Trash ──────────────────────────────────────────────────────────────────

  getTrash() { return this.trash }

  restoreFromTrash(docId: string) {
    const doc = this.trash.find(d => d.id === docId)
    if (doc) {
      this.trash = this.trash.filter(d => d.id !== docId)
      this.addAuditLog("Document restaure", "C. Boka", doc.name, "document")
      this.notify()
    }
  }

  emptyTrash() {
    this.trash = []
    this.addAuditLog("Corbeille videe", "C. Boka", "Tous les documents", "document")
    this.notify()
  }

  // ─── Users ──────────────────────────────────────────────────────────────────

  getUsers() { return this.users }

  addUser(user: Omit<User, "id">) {
    const newUser: User = { ...user, id: `u-${Date.now()}` }
    this.users = [...this.users, newUser]
    this.addAuditLog("Utilisateur cree", "C. Boka", user.name, "user")
    this.notify()
    return newUser
  }

  updateUser(id: string, updates: Partial<User>) {
    this.users = this.users.map(u => u.id === id ? { ...u, ...updates } : u)
    this.notify()
  }

  deleteUser(id: string) {
    const user = this.users.find(u => u.id === id)
    this.users = this.users.filter(u => u.id !== id)
    if (user) this.addAuditLog("Utilisateur supprime", "C. Boka", user.name, "user")
    this.notify()
  }

  // ─── Source Emails ──────────────────────────────────────────────────────────

  getSourceEmails() { return this.sourceEmails }

  addSourceEmail(email: Omit<SourceEmail, "id" | "createdAt" | "docsReceived">) {
    const se: SourceEmail = {
      ...email,
      id: `se-${Date.now()}`,
      createdAt: new Date().toLocaleDateString("fr-FR").replace(/\//g, "-"),
      docsReceived: 0,
    }
    this.sourceEmails = [...this.sourceEmails, se]
    this.notify()
    return se
  }

  updateSourceEmail(id: string, updates: Partial<SourceEmail>) {
    this.sourceEmails = this.sourceEmails.map(se => se.id === id ? { ...se, ...updates } : se)
    this.notify()
  }

  deleteSourceEmail(id: string) {
    this.sourceEmails = this.sourceEmails.filter(se => se.id !== id)
    this.notify()
  }

  // ─── Type Docs ──────────────────────────────────────────────────────────────

  getTypeDocs() { return this.typeDocs }

  addTypeDoc(td: Omit<TypeDoc, "id" | "count">) {
    const newTd: TypeDoc = { ...td, id: `td-${Date.now()}`, count: 0 }
    this.typeDocs = [...this.typeDocs, newTd]
    this.notify()
    return newTd
  }

  updateTypeDoc(id: string, updates: Partial<TypeDoc>) {
    this.typeDocs = this.typeDocs.map(td => td.id === id ? { ...td, ...updates } : td)
    this.notify()
  }

  deleteTypeDoc(id: string) {
    this.typeDocs = this.typeDocs.filter(td => td.id !== id)
    this.notify()
  }

  // ─── Workflows ──────────────────────────────────────────────────────────────

  getWorkflows() { return this.workflows }

  addWorkflow(wf: Omit<Workflow, "id" | "executions">) {
    const newWf: Workflow = { ...wf, id: `wf-${Date.now()}`, executions: 0 }
    this.workflows = [...this.workflows, newWf]
    this.addAuditLog("Workflow cree", "C. Boka", wf.name, "workflow")
    this.notify()
    return newWf
  }

  updateWorkflow(id: string, updates: Partial<Workflow>) {
    this.workflows = this.workflows.map(wf => wf.id === id ? { ...wf, ...updates } : wf)
    this.notify()
  }

  deleteWorkflow(id: string) {
    const wf = this.workflows.find(w => w.id === id)
    this.workflows = this.workflows.filter(w => w.id !== id)
    if (wf) this.addAuditLog("Workflow supprime", "C. Boka", wf.name, "workflow")
    this.notify()
  }

  // ─── Audit Logs ─────────────────────────────────────────────────────────────

  getAuditLogs() { return this.auditLogs }

  addAuditLog(action: string, user: string, target: string, targetType: AuditLog["targetType"], details?: string) {
    const log: AuditLog = {
      id: `al-${Date.now()}`,
      action,
      user,
      target,
      targetType,
      date: new Date().toLocaleString("fr-FR").replace(/\//g, "-"),
      ip: "192.168.1." + Math.floor(Math.random() * 155 + 100),
      details,
    }
    this.auditLogs = [log, ...this.auditLogs]
    // Don't notify here to avoid infinite loop
  }

  // ─── Notifications ──────────────────────────────────────────────────────────

  getNotifications() { return this.notifications }

  markNotificationRead(id: string) {
    this.notifications = this.notifications.map(n => n.id === id ? { ...n, read: true } : n)
    this.notify()
  }

  markAllNotificationsRead() {
    this.notifications = this.notifications.map(n => ({ ...n, read: true }))
    this.notify()
  }

  // ─── Documents with context (direction + armoire + dossier info) ─────────────

  getAllDocumentsWithContext() {
    const result: (DocFile & { directionId: string; directionName: string; armoireId: string; armoireName: string; dossierId: string; dossierName: string })[] = []
    for (const dir of this.directions) {
      for (const arm of dir.armoires) {
        for (const dos of arm.dossiers) {
          for (const file of dos.files) {
            result.push({
              ...file,
              directionId: dir.id,
              directionName: dir.name,
              armoireId: arm.id,
              armoireName: arm.name,
              dossierId: dos.id,
              dossierName: dos.name,
            })
          }
        }
      }
    }
    return result
  }

  getFournisseurs() {
    const set = new Set<string>()
    for (const dir of this.directions) {
      for (const arm of dir.armoires) {
        for (const dos of arm.dossiers) {
          for (const file of dos.files) {
            if (file.fournisseur) set.add(file.fournisseur)
          }
        }
      }
    }
    return Array.from(set).sort()
  }

  // ─── Stats ──────────────────────────────────────────────────────────────────

  getStats() {
    const allDocs = this.getAllDocuments()
    return {
      totalDocs: allDocs.length,
      totalDirections: this.directions.length,
      totalArmoires: this.directions.reduce((a, d) => a + d.armoires.length, 0),
      totalDossiers: this.directions.reduce((a, d) => a + d.armoires.reduce((b, arm) => b + arm.dossiers.length, 0), 0),
      totalUsers: this.users.length,
      activeWorkflows: this.workflows.filter(w => w.active).length,
      pendingDocs: allDocs.filter(d => d.status === "En attente" || d.status === "En validation").length,
      trashCount: this.trash.length,
      unreadNotifications: this.notifications.filter(n => !n.read).length,
    }
  }
}

// Singleton export
export const store = new Store()
