/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      's2.glbimg.com',
      'finger.ind.br',
      'classic.exame.com',
      'consultoriodehipnose.com.br',
      'img.freepik.com',
      'images.unsplash.com'
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig 