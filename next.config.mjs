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
        // Se alguém tentar acessar QUALQUER coisa dentro de /admin fisicamente...
        source: '/admin/:path*',
        // ...será barrado e expulso para a página inicial do seu site
        destination: '/',
        permanent: true,
      },
    ];
  },

  // 🎭 MÁSCARA DA URL SECRETA
  async rewrites() {
    return [
      {
        // Tudo o que você acessar usando /matrix-entry-adm/qualquer-coisa...
        source: '/matrix-entry-adm/:path*',
        // ...o Next.js vai ler por baixo dos panos na pasta física /admin/qualquer-coisa
        destination: '/admin/:path*',
      },
    ];
  },
}

export default nextConfig
