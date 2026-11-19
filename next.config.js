/** @type {import('next').NextConfig} */
const nextConfig = {
  // ============================================
  // Security Headers
  // ============================================
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      },
      {
        // Block search engines from indexing admin pages
        source: '/admin/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow'
          }
        ]
      }
    ]
  },

  // ============================================
  // Image Optimization
  // ============================================
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: '**.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      }
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400,
  },

  // ============================================
  // Performance
  // ============================================
  compress: true,
  poweredByHeader: false,

  // ============================================
  // Redirects: www → non-www (or vice versa)
  // ============================================
  async redirects() {
    return [
      // Add your domain redirects here before go-live
      // Example: www.kashafa.com → kashafa.com
      // {
      //   source: '/:path*',
      //   has: [{ type: 'host', value: 'www.kashafa.com' }],
      //   destination: 'https://kashafa.com/:path*',
      //   permanent: true,
      // }
    ]
  },
}

module.exports = nextConfig
