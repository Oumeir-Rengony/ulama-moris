"use client"

import { Mail, Menu, X } from "lucide-react"
import { usePathname } from "next/navigation"
import { useState } from "react"

const desktopLinkClassName = "text-sm font-medium transition-colors"
const desktopActiveClassName = "text-foreground hover:text-primary"
const desktopInactiveClassName = "text-muted-foreground hover:text-foreground"

const mobileLinkClassName = "rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary"
const mobileActiveClassName = "text-foreground"
const mobileInactiveClassName = "text-muted-foreground hover:text-foreground"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const isHomeActive = pathname === "/" || pathname.startsWith("/audio")
  const isEventsActive = pathname.startsWith("/events")
  const isAboutActive = pathname.startsWith("/about")

  function getDesktopLinkClassName(isActive: boolean) {
    if (isActive) {
      return `${desktopLinkClassName} ${desktopActiveClassName}`
    }
    return `${desktopLinkClassName} ${desktopInactiveClassName}`
  }

  function getMobileLinkClassName(isActive: boolean) {
    if (isActive) {
      return `${mobileLinkClassName} ${mobileActiveClassName}`
    }
    return `${mobileLinkClassName} ${mobileInactiveClassName}`
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:h-20 sm:px-6">
        {/* Logo */}
        <a href="/" className="flex items-center gap-3 text-foreground transition-colors hover:text-primary">
          <div className="w-12 sm:w-15">
            <img src="/logo.webp" />
          </div>

          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight sm:text-xl">Ulama Moris</span>
            <span className="hidden text-xs text-muted-foreground sm:block">Islamic Audio Library</span>
          </div>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          <a
            href="/"
            aria-current={isHomeActive ? "page" : undefined}
            className={getDesktopLinkClassName(isHomeActive)}
          >
            Home
          </a>
          <a
            href="/events"
            aria-current={isEventsActive ? "page" : undefined}
            className={getDesktopLinkClassName(isEventsActive)}
          >
            Events
          </a>
          {/* <a
            href="/"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Lectures
          </a>
          <a
            href="#"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Scholars
          </a> */}
          <a
            href="/about"
            aria-current={isAboutActive ? "page" : undefined}
            className={getDesktopLinkClassName(isAboutActive)}
          >
            About
          </a>
        </nav>

        {/* CTA & Mobile Menu */}
        <div className="flex items-center gap-3">
          <a 
            href="https://www.mufti.mu"
            target="_blank"
            className="hidden items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:flex"
          >
            <Mail className="h-4 w-4" />
            Ask a Question
          </a>
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-secondary md:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-border bg-background px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            <a href="/" aria-current={isHomeActive ? "page" : undefined} className={getMobileLinkClassName(isHomeActive)}>
              Home
            </a>
            <a href="/events" aria-current={isEventsActive ? "page" : undefined} className={getMobileLinkClassName(isEventsActive)}>
              Events
            </a>
            {/* <a href="#" className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
              Lectures
            </a>
            <a href="#" className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
              Scholars
            </a> */}
            <a href="/about" aria-current={isAboutActive ? "page" : undefined} className={getMobileLinkClassName(isAboutActive)}>
              About
            </a>
            <a 
              href="https://www.mufti.mu"
              target="_blank"
              className="mt-2 flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Mail className="h-4 w-4" />
              Ask a Question
            </a>
          </nav>
        </div>
      )}
    </header>
  )
}
