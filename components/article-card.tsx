"use client"

import { Calendar, User, ArrowRight } from "lucide-react"
import Link from "next/link"
import dayjs from "dayjs"
import { arrayify } from "@/lib/utils"
import CONFIG from "@/config/config.json"
import Image from "next/image"

interface ArticleCardProps {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  author: string;
  date: string;
  category?: string[];
  coverImage?: {
    url: string;
    title?: string;
    width?: number;
    height?: number;
  };
}

export function ArticleCard({
  id,
  title,
  slug,
  excerpt,
  author,
  date,
  category,
  coverImage
}: ArticleCardProps) {
  return (
    <article className="group relative overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
      {/* Cover Image */}
      {coverImage?.url && (
        <Link href={`/articles/${slug}`} prefetch={false} className="block aspect-video overflow-hidden">
          <Image
            src={coverImage.url}
            alt={coverImage.title || title}
            width={coverImage.width || 600}
            height={coverImage.height || 340}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
      )}

      {/* Category Badge */}
      {category && category?.length > 0 && (
        <div className="flex justify-between border-b border-border bg-secondary/30 px-5 py-2.5 md:py-3">
          <div className="flex items-center gap-2">
            {arrayify(category).slice(0, 3).map((tag, idx) => (
              <span key={idx} className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium bg-secondary text-secondary-foreground border-border">
                {category}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-5">
        {/* Title - Links to detail page */}
        <Link href={`/articles/${slug}`} prefetch={false} className="block">
          <h3 className="mb-3 text-lg font-semibold leading-tight text-foreground transition-colors group-hover:text-primary hover:underline line-clamp-2">
            {title}
          </h3>
        </Link>

        {/* Excerpt */}
        {excerpt && (
          <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {excerpt}
          </p>
        )}

        {/* Metadata */}
        <div className="mb-4 space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4 shrink-0 text-primary" />
            <span className="font-medium text-foreground">{author}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 shrink-0 text-primary" />
            <time>{dayjs(date).format(CONFIG.bayaan.displayFormat)}</time>
          </div>
        </div>

        {/* Read More Link */}
        <Link
          href={`/articles/${slug}`}
          prefetch={false}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
        >
          Read More
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </article>
  )
}
