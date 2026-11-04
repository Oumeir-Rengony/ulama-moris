/** @type {import('next').NextConfig} */
const nextConfig = {
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
