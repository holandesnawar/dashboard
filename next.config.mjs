/**
 * El panel se embebe dentro de Nextcloud. Por seguridad, SOLO permitimos que
 * lo embeba el dominio de tu Nextcloud (variable NEXTCLOUD_ORIGIN). Cualquier
 * otro sitio que intente meterlo en un iframe será bloqueado por el navegador.
 *
 * NEXTCLOUD_ORIGIN debe ser el origen completo, p.ej. https://cloud.holandesnawar.com
 * (sin barra final). Si no se define, solo se permite a sí mismo ('self').
 */
const nextcloudOrigin = process.env.NEXTCLOUD_ORIGIN?.trim();
const frameAncestors = ["'self'", nextcloudOrigin].filter(Boolean).join(' ');

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `frame-ancestors ${frameAncestors};`,
          },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
