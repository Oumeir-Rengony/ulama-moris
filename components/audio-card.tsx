"use client"


import { MapPin, Calendar, User, Download } from "lucide-react"
import { AudioCardPlayer } from "./audio-player"
import Link from "next/link"
import dayjs from "dayjs"
import { arrayify, cleanDescription, cn, toTitleCase } from "@/lib/utils"
import CONFIG from "@/config/config.json"
import { WhatsApp } from "@/components/icons"

interface AudioCardProps {
  id: string;
  title: string
  slug: string
  description: string
  author: string
  masjid?: string
  masjidLocation?: string
  duration: string;
  date: string
  audioSrc: string
  category: "local" | "international"
  whatsAppLink?: string;
}

export function AudioCard({
  id,
  title,
  slug,
  description,
  author,
  masjid,
  masjidLocation,
  duration,
  date,
  audioSrc,
  category,
  whatsAppLink
}: AudioCardProps) {

  return (
    <article className="group relative overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
      
      {/* Category Badge & Play Button Header */}
      { category?.length &&
        <div className="flex justify-between border-b border-border bg-secondary/30 px-5 py-2.5 md:py-3">
          <div className="flex items-center gap-2">
            {
              arrayify(category).map((cat, idx) => (
                <span key={idx} className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium bg-secondary text-secondary-foreground border-border`}>
                  {cat}
                </span>
              ))
            }
          </div>
        </div>
      }

      {/* Content */}
      <div className="p-5">

        {/* Title - Links to detail page */}
        <Link href={`/audio/${slug}`} prefetch={false} className="block">
          <h3 className="mb-3 text-lg font-semibold leading-tight text-foreground transition-colors group-hover:text-primary hover:underline">
            {title}
          </h3>
        </Link>

        {/* Description */}
        {
          description && <div className="mb-4 line-clamp-2 text-sm leading-relaxed text-muted-foreground" dangerouslySetInnerHTML={{__html: cleanDescription(description) as string }}/>
        }

        {/* Metadata */}
        <div className="mb-5 space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4 shrink-0 text-primary" />
            <span className="font-medium text-foreground">{author}</span>
          </div>
          {masjid && (
            <a href={masjidLocation || "#"} className="flex items-center gap-2 text-sm text-muted-foreground pointer-events-none">
              <MapPin className="h-4 w-4 shrink-0 text-primary" />
              <span>{toTitleCase(masjid)}</span>
            </a>
          )}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 shrink-0 text-primary" />
            <time>{dayjs(date).format(CONFIG.bayaan.displayFormat)}</time>
          </div>

        </div>
       

        {/* Audio Player */}
        <AudioCardPlayer id={id} audioSrc={audioSrc} duration={duration}/>

      </div>


      <div className="flex justify-end gap-2 border-t border-border bg-secondary/30 px-5 py-2.5">
        <a 
          href={audioSrc} 
          download 
          className="flex items-center gap-1.5 text-green-700 bg-green-50 p-1.5 rounded-lg hover:bg-green-100 transition-colors" 
          title="Download Audio"
        >
          <Download className="h-4 w-4" />
          <span className="text-xs font-bold tracking-wider">Download</span>
        </a>
        <Link prefetch={false} href={whatsAppLink || "#"} className="flex items-center gap-1.5 text-green-700 bg-green-50 p-1.5 rounded-lg hover:bg-green-100 transition-colors" title="Share on WhatsApp">
          <WhatsApp />
          <span className="text-xs font-bold tracking-wider">Share</span>
        </Link>
      </div>

    </article>
  )
}
