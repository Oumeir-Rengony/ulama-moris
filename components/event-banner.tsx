"use client"

import Image from "next/image"
import { Calendar, MapPin, ArrowRight } from "lucide-react"

interface EventBannerProps {
  title?: string
  subtitle?: string
  date?: string
  location?: string
  imageSrc?: string
  ctaText?: string
  ctaHref?: string
}

export function EventBanner({
  title = "Upcoming Gathering",
  subtitle = "Join us for a special community program featuring inspiring lectures and spiritual reflections",
  date = "Coming Soon",
  location = "Community Center",
  imageSrc = "/images/event-banner.jpg",
  ctaText = "Learn More",
  ctaHref = "#",
}: EventBannerProps) {
  return (
    <section className="relative w-full bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
        <div className="relative overflow-hidden rounded-2xl bg-foreground shadow-2xl">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0">
            <Image
              src={imageSrc}
              alt={title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1280px"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-foreground/95 via-foreground/80 to-foreground/40" />
          </div>

          {/* Content */}
          <div className="relative flex flex-col justify-center px-6 py-12 sm:px-10 sm:py-16 lg:min-h-[400px] lg:px-16 lg:py-20">
            {/* Badge */}
            <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 backdrop-blur-sm">
              <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
              <span className="text-xs font-medium uppercase tracking-wider text-primary-foreground/90">
                Special Event
              </span>
            </div>

            {/* Title */}
            <h2 className="max-w-2xl text-balance text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl lg:text-5xl">
              {title}
            </h2>

            {/* Subtitle */}
            <p className="mt-4 max-w-xl text-pretty text-base leading-relaxed text-primary-foreground/80 sm:text-lg">
              {subtitle}
            </p>

            {/* Event Details */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
              <div className="flex items-center gap-2 text-primary-foreground/70">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">{date}</span>
              </div>
              <div className="flex items-center gap-2 text-primary-foreground/70">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">{location}</span>
              </div>
            </div>

            {/* CTA Button */}
            <div className="mt-8">
              <a
                href={ctaHref}
                className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25"
              >
                {ctaText}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
