// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['dl.airtable.com', 'v5.airtableusercontent.com'],
    unoptimized: true,
  },
  // Lägg till konfiguration för statiska resurser
  assetPrefix: '',
  publicRuntimeConfig: {
    staticFolder: '/assets',
  },
}

module.exports = nextConfig