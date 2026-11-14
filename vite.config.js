import process from 'node:process'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { handle, publish, signUpload } from './server/admin.js'
import { getSiteUrl } from './src/siteConfig.js'

// En producción /api/upload-signature y /api/publish son funciones de Cloudflare (functions/api/);
// en npm run dev las imita este plugin con la misma lógica (server/admin.js)
function adminApi(env) {
  const route = (action) => async (req, res) => {
    const { status, body } = await handle(() => action(req.headers.authorization, env))
    res.statusCode = status
    res.setHeader('content-type', 'application/json')
    res.end(JSON.stringify(body))
  }
  return {
    name: 'admin-api',
    configureServer(server) {
      server.middlewares.use('/api/upload-signature', route(signUpload))
      server.middlewares.use('/api/publish', route(publish))
    },
  }
}

// Completa %SITE_URL% en index.html (links absolutos de SEO y vista previa al compartir)
function siteUrl(url) {
  return { name: 'site-url', transformIndexHtml: (html) => html.replaceAll('%SITE_URL%', url) }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Sin prefijo: trae las variables de .env.local (CLOUDINARY_*, DEPLOY_HOOK_URL, SITE_URL), que no llegan al navegador
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [tailwindcss(), react(), adminApi(env), siteUrl(getSiteUrl(env))],
  }
})
