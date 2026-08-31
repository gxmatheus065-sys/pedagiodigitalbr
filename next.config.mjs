/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },

  // 🎭 MÁSCARA DA URL SECRETA (Processada antes de qualquer checagem de arquivo)
  async rewrites() {
    return {
      beforeFiles: [
        {
          // Mapeia o acesso secreto para as pastas internas reais
          source: '/matrix-entry-adm/:path*',
          destination: '/admin/:path*',
        },
      ],
    };
  },

  // 🔒 BLOQUEIO DA PASTA FÍSICA SE ALGUÉM TENTAR ENTRAR DIRETO
  async redirects() {
    return [
      {
        source: '/admin/:path*',
        destination: '/',
        permanent: true,
      },
    ];
  },
}

export default nextConfig
