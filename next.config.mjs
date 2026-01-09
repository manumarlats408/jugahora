/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n: {
    locales: ['es'],
    defaultLocale: 'es',
  },

  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
      {
        source: "/(.*)", // Aplica las cabeceras a todas las rutas
        headers: [
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; img-src 'self' https://vercel.com; font-src 'self' https://vercel.live;  script-src 'self' 'unsafe-inline' https://vercel.live; frame-src https://vercel.live; style-src 'self' 'unsafe-inline' https://vercel.live/fonts; connect-src 'self' wss://ws-us3.pusher.com https://sockjs-us3.pusher.com; object-src 'none';", // CSP ajustada
          },
          {
            key: "X-Frame-Options",
            value: "DENY", // Previene ataques de clickjacking
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff", // Evita la adivinación del tipo de contenido
          },
          {
            key: "Referrer-Policy",
            value: "no-referrer", // Controla la información enviada en el header Referer
          },
          {
            key: "Permissions-Policy",
            value: "geolocation=(), microphone=(), camera=(), fullscreen=(), payment=()" // bloquea por defecto
          }
          
        ],
      },
    ];
  },
};

export default nextConfig;
