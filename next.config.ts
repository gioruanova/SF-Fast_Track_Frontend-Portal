import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuración para paquetes externos en server components
  serverExternalPackages: ['axios'],
  // Configuración para evitar problemas de hidratación
  transpilePackages: [],
  
  // Optimizaciones de rendimiento
  compress: true, // Habilitar compresión gzip
  poweredByHeader: false, // Remover header X-Powered-By para seguridad
  
  // Optimizaciones de imágenes
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  
  // Configuración de headers para evitar problemas de CORS
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
};

export default nextConfig;
