const fs = require('fs')
const path = require('path')

const distDir = path.join(__dirname, '..', 'dist')
const indexPath = path.join(distDir, 'index.html')

const routes = [
  'mentors',
  'community',
  'faq',
  'contact',
  'get-started',
  'login',
  'register',
  'mentor-register',
  'forgot-password',
  'onboarding',
  'dashboard',
  'sessions',
  'settings',
  'mentor-portal',
  'admin',
]

if (!fs.existsSync(indexPath)) {
  console.error('dist/index.html not found. Run vite build first.')
  process.exit(1)
}

const indexHtml = fs.readFileSync(indexPath)

for (const route of routes) {
  const routeDir = path.join(distDir, route)
  fs.mkdirSync(routeDir, { recursive: true })
  fs.writeFileSync(path.join(routeDir, 'index.html'), indexHtml)
}

console.log(`Created static SPA fallbacks for ${routes.length} routes.`)
