/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pages render at request time unless a function or component opts in with "use cache".
  // Contentful data is cached in the services (see lib/cache.ts).
  cacheComponents: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Event pages used to live at /event/:slug, and those links may already be shared.
  async redirects() {
    return [
      {
        source: "/event/:slug",
        destination: "/events/:slug",
        permanent: true,
      },
    ]
  },
}

export default nextConfig
