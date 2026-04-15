import { Mic2, Sparkles, Users } from "lucide-react"
import Link from "next/link"

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-background pb-16 pt-12 sm:pb-20 sm:pt-16">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">Over 100+ audio to explore</span>
          </div>

          {/* Heading */}
          <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Discover audio that{" "}
            <span className="text-primary">inspires</span> your <span className="text-primary">spiritiual</span> journey
          </h1>

          {/* Description */}
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
            Immerse yourself in Islamic lectures and reflections from ulama, inspired by the teachings of the Qur’an to nurture faith and spiritual growth
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a href="#lectures" className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 sm:w-auto">
              Start Listening
            </a>
            {/* <button className="flex w-full items-center justify-center gap-2 rounded-full border border-border bg-card px-8 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary sm:w-auto">
              Browse Categories
            </button> */}
          </div>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-3 gap-8 border-t border-border pt-8">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 text-primary">
                <Mic2 className="h-5 w-5" />
                <span className="text-2xl font-bold">100+</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">Audio</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 text-primary">
                <Users className="h-5 w-5" />
                <span className="text-2xl font-bold">10+</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">Creators</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 text-primary">
                <Sparkles className="h-5 w-5" />
                <span className="text-2xl font-bold">10+</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">Categories</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
