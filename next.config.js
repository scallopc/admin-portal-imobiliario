/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve = config.resolve || {}
      config.resolve.fallback = {
        ...(config.resolve.fallback || {}),
        undici: false,
      }
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        undici: false,
      }
    }
    return config
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        pathname: "/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/lancamentos",
        destination: "/releases",
      },
      {
        source: "/imoveis",
        destination: "/property",
      },
      {
        source: "/locacao",
        destination: "/rental",
      },
      {
        source: "/quem-somos",
        destination: "/about",
      },
    ];
  },
};

module.exports = nextConfig;
