import { Header } from "@/components/header"
import { BookOpen, Users, Mic, Globe, Heart, Mail } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">      
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-primary py-16 sm:py-24">
          {/* Decorative Background */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-white blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 h-48 w-48 rounded-full bg-white blur-3xl" />
          </div>
          
          <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
            {/* <p className="mb-4 font-serif text-2xl text-primary-foreground/80 sm:text-3xl">
             BISMILLAH
            </p> */}
            <h1 className="mb-6 text-3xl font-bold tracking-tight text-primary-foreground sm:text-5xl">
              About Ulama Moris
            </h1>
            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-primary-foreground/90">
              Preserving and sharing Islamic knowledge through authentic audio lectures 
              from the respected scholars of Mauritius.
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div>
                <h2 className="mb-6 text-2xl font-bold text-foreground sm:text-3xl">
                  Our Mission
                </h2>
                <p className="mb-4 leading-relaxed text-muted-foreground">
                  Ulama Moris is dedicated to making authentic Islamic knowledge accessible 
                  to everyone. We believe that the teachings of Islam should be available 
                  to all Muslims, regardless of their location or circumstances.
                </p>
                <p className="mb-4 leading-relaxed text-muted-foreground">
                  Our platform serves as a digital archive of lectures, bayaans, and 
                  Islamic teachings from the esteemed scholars of Mauritius. Through 
                  modern technology, we aim to preserve these valuable teachings for 
                  current and future generations.
                </p>
                <p className="leading-relaxed text-muted-foreground">
                  Whether you are seeking guidance on daily matters, looking to deepen 
                  your understanding of the Quran and Hadith, or simply want to listen 
                  to inspiring reminders, Ulama Moris is here to serve you.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <Mic className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 font-semibold text-foreground">100+</h3>
                  <p className="text-sm text-muted-foreground">Audio Lectures</p>
                </div>
                <div className="rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 font-semibold text-foreground">10+</h3>
                  <p className="text-sm text-muted-foreground">Respected Scholars</p>
                </div>
                <div className="rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 font-semibold text-foreground">10+</h3>
                  <p className="text-sm text-muted-foreground">Masajid Featured</p>
                </div>
                <div className="rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <Globe className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 font-semibold text-foreground">Mauritius</h3>
                  <p className="text-sm text-muted-foreground">Listeners across the island</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="bg-secondary/50 py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-2xl font-bold text-foreground sm:text-3xl">
                Our Values
              </h2>
              <p className="mx-auto max-w-2xl text-muted-foreground">
                Guided by the principles of Islam, we strive to uphold these core values 
                in everything we do.
              </p>
            </div>
            
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-2xl bg-card p-8 shadow-sm ring-1 ring-border">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary">
                  <BookOpen className="h-7 w-7 text-primary-foreground" />
                </div>
                <h3 className="mb-3 text-lg font-semibold text-foreground">Authenticity</h3>
                <p className="leading-relaxed text-muted-foreground">
                  All content is sourced from verified scholars following the Quran 
                  and Sunnah according to the understanding of the Salaf.
                </p>
              </div>
              
              <div className="rounded-2xl bg-card p-8 shadow-sm ring-1 ring-border">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary">
                  <Users className="h-7 w-7 text-primary-foreground" />
                </div>
                <h3 className="mb-3 text-lg font-semibold text-foreground">Accessibility</h3>
                <p className="leading-relaxed text-muted-foreground">
                  Free access to all audio content, ensuring Islamic knowledge 
                  reaches everyone who seeks it.
                </p>
              </div>
              
              <div className="rounded-2xl bg-card p-8 shadow-sm ring-1 ring-border">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary">
                  <Heart className="h-7 w-7 text-primary-foreground" />
                </div>
                <h3 className="mb-3 text-lg font-semibold text-foreground">Community</h3>
                <p className="leading-relaxed text-muted-foreground">
                  Building bridges between scholars and the community, fostering 
                  a love for learning and spiritual growth.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
            <h2 className="mb-4 text-2xl font-bold text-foreground sm:text-3xl">
              Get in Touch
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-muted-foreground">
              Have questions about Islam? Want to suggest a topic or submit audio content? 
              We would love to hear from you.
            </p>
            <a 
              href="mailto:ulama.moris@gmail.com"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Mail className="h-5 w-5" />
              Contact Us
            </a>
          </div>
        </section>
      </main>

    </div>
  )
}
