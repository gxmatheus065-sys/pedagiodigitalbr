/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },

  // 🔒 BLOQUEIO DE ACESSO DIRETO
  async redirects() {
    return [
      {
        // Se alguém tentar acessar a pasta física /admin diretamente...
        source: '/admin/:path*',
        // ...será barrado e jogado para a página inicial (Home)
        destination: '/',
        permanent: true,
      },
    ];
  },

  // 🎭 MÁSCARA DA URL SECRETA
  async rewrites() {
    return [
      {
        // Tudo o que você acessar usando /matrix-entry-adm/...
        source: '/matrix-entry-adm/:path*',
        // ...o Next.js vai ler por baixo dos panos na pasta física /admin/...
        destination: '/admin/:path*',
      },
    ];
  },
}

export default nextConfig
