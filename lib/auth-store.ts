// Auth store using localStorage — local state only, no backend

export type UserRole = "Superadmin" | "Admin Armoire" | "Contributeur" | "Lecteur" | "Approbateur"

export interface ArmoireAccess {
  armoireId: string
  armoire: string
  role: UserRole
}

export interface User {
  id: string
  nom: string
  prenom: string
  email: string
  initials: string
  role: UserRole
  armoireAccess: ArmoireAccess[]
  actif: boolean
  lastSeen: string
  createdAt: string
}

export interface AuthSession {
  userId: string
  email: string
  expiresAt: number // timestamp ms
}

const SESSION_KEY = "ged_session"
const USERS_KEY = "ged_users"
const OTP_KEY = "ged_otp"

// Seed users — pre-loaded into localStorage on first run
const SEED_USERS: User[] = [
  {
    id: "u1",
    nom: "Boka",
    prenom: "Christophe",
    email: "c.boka@akieni.com",
    initials: "CB",
    role: "Superadmin",
    armoireAccess: [],
    actif: true,
    lastSeen: "Actif maintenant",
    createdAt: "2025-01-10",
  },
  {
    id: "u2",
    nom: "Diallo",
    prenom: "Mamadou",
    email: "m.diallo@akieni.com",
    initials: "MD",
    role: "Admin Armoire",
    armoireAccess: [
      { armoireId: "a1", armoire: "Finance", role: "Admin Armoire" },
      { armoireId: "a2", armoire: "RH", role: "Lecteur" },
    ],
    actif: true,
    lastSeen: "Il y a 2h",
    createdAt: "2025-02-14",
  },
  {
    id: "u3",
    nom: "Mbia",
    prenom: "Alexis",
    email: "a.mbia@akieni.com",
    initials: "AM",
    role: "Contributeur",
    armoireAccess: [
      { armoireId: "a2", armoire: "RH", role: "Contributeur" },
    ],
    actif: true,
    lastSeen: "Il y a 1j",
    createdAt: "2025-03-01",
  },
  {
    id: "u4",
    nom: "Kama",
    prenom: "Larissa",
    email: "l.kama@akieni.com",
    initials: "LK",
    role: "Approbateur",
    armoireAccess: [
      { armoireId: "a3", armoire: "Juridique", role: "Approbateur" },
    ],
    actif: true,
    lastSeen: "Il y a 3h",
    createdAt: "2025-03-15",
  },
  {
    id: "u5",
    nom: "Nzaba",
    prenom: "Serge",
    email: "s.nzaba@akieni.com",
    initials: "SN",
    role: "Lecteur",
    armoireAccess: [
      { armoireId: "a1", armoire: "Finance", role: "Lecteur" },
    ],
    actif: false,
    lastSeen: "Il y a 5j",
    createdAt: "2025-04-02",
  },
]

function isBrowser() {
  return typeof window !== "undefined"
}

// --- Users ---
export function getUsers(): User[] {
  if (!isBrowser()) return SEED_USERS
  const raw = localStorage.getItem(USERS_KEY)
  if (!raw) {
    localStorage.setItem(USERS_KEY, JSON.stringify(SEED_USERS))
    return SEED_USERS
  }
  try { return JSON.parse(raw) } catch { return SEED_USERS }
}

export function saveUsers(users: User[]) {
  if (!isBrowser()) return
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export function getUserByEmail(email: string): User | undefined {
  return getUsers().find(u => u.email.toLowerCase() === email.toLowerCase())
}

export function addUser(user: User) {
  const users = getUsers()
  saveUsers([...users, user])
}

export function updateUser(updated: User) {
  const users = getUsers()
  saveUsers(users.map(u => u.id === updated.id ? updated : u))
}

export function deactivateUser(id: string) {
  const users = getUsers()
  saveUsers(users.map(u => u.id === id ? { ...u, actif: false, lastSeen: "Désactivé" } : u))
}

// --- OTP ---
export function generateOtp(email: string): string {
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  const payload = { email, code, expiresAt: Date.now() + 5 * 60 * 1000 }
  if (isBrowser()) localStorage.setItem(OTP_KEY, JSON.stringify(payload))
  return code
}

export function verifyOtp(email: string, code: string): boolean {
  if (!isBrowser()) return false
  const raw = localStorage.getItem(OTP_KEY)
  if (!raw) return false
  try {
    const payload = JSON.parse(raw)
    if (payload.email !== email) return false
    if (Date.now() > payload.expiresAt) return false
    if (payload.code !== code) return false
    localStorage.removeItem(OTP_KEY)
    return true
  } catch {
    return false
  }
}

// --- Session ---
export function createSession(userId: string, email: string) {
  const session: AuthSession = {
    userId,
    email,
    expiresAt: Date.now() + 8 * 60 * 60 * 1000, // 8h
  }
  if (isBrowser()) localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function getSession(): AuthSession | null {
  if (!isBrowser()) return null
  const raw = localStorage.getItem(SESSION_KEY)
  if (!raw) return null
  try {
    const session: AuthSession = JSON.parse(raw)
    if (Date.now() > session.expiresAt) {
      localStorage.removeItem(SESSION_KEY)
      return null
    }
    return session
  } catch {
    return null
  }
}

export function destroySession() {
  if (isBrowser()) localStorage.removeItem(SESSION_KEY)
}

export function getCurrentUser(): User | null {
  const session = getSession()
  if (!session) return null
  return getUserByEmail(session.email) ?? null
}
