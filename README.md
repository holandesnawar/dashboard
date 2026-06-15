# Panel Holandés Nawar

Panel de control interno (privado) para dirección y dirección académica.
Reúne en un solo sitio:

- **Leads** de la web principal (`holandesnawar.com`) → leídos de **systeme.io** (CRM).
- **Academia** (`academia.holandesnawar.nl`) → KPIs de **LearnHouse** (matrículas, alumnos, actividad, lecciones).
- **Encuestas / calidad académica** → sección preparada, se cablea cuando existan las encuestas.

Hecho con **Next.js** (App Router), desplegado en **Vercel**, pensado para
**embeberse dentro de Nextcloud** y protegido con un **login de admin** sencillo
(contraseña única + cookie firmada + honeypot/rate-limit anti-bots).

---

## Puesta en marcha (Vercel)

1. Conecta este repo a un proyecto de Vercel (framework: **Next.js**, detectado solo).
2. En **Settings → Environment Variables**, añade (ver `.env.example`):

   | Variable | Para qué | Cómo obtenerla |
   |---|---|---|
   | `DASHBOARD_PASSWORD` | Contraseña de acceso al panel | La eliges tú |
   | `DASHBOARD_SESSION_SECRET` | Firmar la cookie de sesión | `openssl rand -hex 32` |
   | `SYSTEME_API_KEY` | Leer leads de systeme.io | La misma que usa `nawar-web` |
   | `LEARNHOUSE_API_BASE` | Base de la API de la academia | `https://academia.holandesnawar.nl` |
   | `LEARNHOUSE_DASHBOARD_API_KEY` | Clave compartida con el backend | `openssl rand -hex 32` (la **misma** en Railway) |
   | `NEXTCLOUD_ORIGIN` | Permitir el iframe en tu Nextcloud | Ej. `https://cloud.holandesnawar.com` |

3. En **Railway → servicio `learnhouse`**, añade la variable
   `LEARNHOUSE_DASHBOARD_API_KEY` con **exactamente el mismo valor** que pusiste
   en Vercel. (Habilita el endpoint `/api/v1/dashboard/overview`.)
4. Deploy. Entra a la URL del proyecto → te pedirá la contraseña.

## Embeber en Nextcloud

Una vez configurado `NEXTCLOUD_ORIGIN`, mete el panel en Nextcloud con un iframe
(app "External sites" o un widget HTML), apuntando a la URL del panel en Vercel.
Solo ese origen podrá embeberlo (lo fuerza la cabecera `Content-Security-Policy:
frame-ancestors`). La cookie de sesión usa `SameSite=None; Secure` para funcionar
dentro del iframe.

## Desarrollo local

```bash
cp .env.example .env.local   # rellena los valores
npm install
npm run dev                  # http://localhost:3000
```

## Estructura

```
app/
  page.tsx          Resumen (leads + academia)
  leads/            Detalle de leads (systeme.io)
  academia/         Detalle de la academia (LearnHouse)
  login/            Pantalla de acceso
  api/login         Verifica contraseña → cookie
  api/logout        Cierra sesión
lib/
  auth.ts           Cookie firmada (HMAC) + verificación de contraseña
  systeme.ts        Cliente de systeme.io (leads)
  learnhouse.ts     Cliente del endpoint de la academia
middleware.ts       Protege todo salvo /login
```

## Pendiente / fase 2

- Métricas de email/campañas de systeme.io (según lo que exponga su API).
- Encuestas de alumnos y calidad académica (requiere crearlas en LearnHouse).
- KPIs de ingresos de Stripe (clave de solo lectura).
- Rate-limit del login con Redis/Upstash (ahora es en memoria).
