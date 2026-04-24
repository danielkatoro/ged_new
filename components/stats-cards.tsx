import { FileText, Clock, Zap, Users } from "lucide-react"

const stats = [
  {
    title: "DOCUMENTS TOTAL",
    value: "1 248",
    sub: "+12 aujourd'hui",
    icon: FileText,
    accent: true,
  },
  {
    title: "EN ATTENTE VALIDATION",
    value: "34",
    sub: "3 urgents",
    icon: Clock,
  },
  {
    title: "INDEXES CETTE SEMAINE",
    value: "127",
    sub: "OCR: 94% precision",
    icon: Zap,
  },
  {
    title: "UTILISATEURS ACTIFS",
    value: "18",
    sub: "sur 24 comptes",
    icon: Users,
  },
]

export function StatsCards() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <div
          key={i}
          className={
            stat.accent
              ? "relative rounded-xl p-4 bg-foreground text-background overflow-hidden transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg"
              : "relative rounded-xl p-4 bg-card border border-border overflow-hidden transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg"
          }
        >
          {/* Content */}
          <div className="relative z-10">
            <p className={
              stat.accent
                ? "text-[10px] font-medium uppercase tracking-wider text-background/60 mb-3"
                : "text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-3"
            }>
              {stat.title}
            </p>
            <p className={
              stat.accent
                ? "text-3xl font-bold text-background"
                : "text-3xl font-bold text-foreground"
            }>
              {stat.value}
            </p>
            <p className={
              stat.accent
                ? "text-xs text-background/50 mt-1"
                : "text-xs text-muted-foreground mt-1"
            }>
              {stat.sub}
            </p>
          </div>

          {/* Icon in top right */}
          <div className={
            stat.accent
              ? "absolute top-3 right-3 h-7 w-7 rounded-xl bg-background/10 flex items-center justify-center"
              : "absolute top-3 right-3 h-7 w-7 rounded-xl bg-muted flex items-center justify-center"
          }>
            <stat.icon className={
              stat.accent
                ? "h-4 w-4 text-background"
                : "h-4 w-4 text-foreground"
            } />
          </div>

          {/* Decorative circle */}
          <div className={
            stat.accent
              ? "absolute -bottom-8 -right-8 h-28 w-28 rounded-full bg-background/5"
              : "absolute -bottom-8 -right-8 h-28 w-28 rounded-full bg-muted/80"
          } />
        </div>
      ))}
    </div>
  )
}
