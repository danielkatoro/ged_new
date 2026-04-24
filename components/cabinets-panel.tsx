import { Building2, ChevronRight } from "lucide-react"
import Link from "next/link"

const directions = [
  { name: "Finance", docs: 843, membres: 8 },
  { name: "Ressources Humaines", docs: 512, membres: 5 },
  { name: "Juridique", docs: 278, membres: 3 },
  { name: "Direction Generale", docs: 194, membres: 4 },
  { name: "Informatique", docs: 156, membres: 6 },
]

export function CabinetsPanel() {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Directions</h2>
        <Link href="/direction" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          Voir tout
        </Link>
      </div>
      <div className="p-2 space-y-0.5">
        {directions.map((dir, i) => (
          <Link
            key={i}
            href="/direction"
            className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-muted transition-colors group"
          >
            <div className="h-7 w-7 rounded bg-muted group-hover:bg-foreground group-hover:text-background flex items-center justify-center flex-shrink-0 transition-colors">
              <Building2 className="h-3.5 w-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{dir.name}</p>
              <p className="text-[10px] text-muted-foreground">{dir.docs.toLocaleString()} docs · {dir.membres} membres</p>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        ))}
      </div>
    </div>
  )
}
