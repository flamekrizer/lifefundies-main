const fs = require('fs')
const path = require('path')

const buildDir = path.join(__dirname, '..', process.env.VITE_BUILD_DIR || 'build')
const indexPath = path.join(buildDir, 'index.html')

const routes = [
  'mentors',
  'community',
  'faq',
  'contact',
  'about',
  'team',
  'services',
  'terms',
  'refund',
  'privacy',
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
  console.error(`${path.relative(path.join(__dirname, '..'), indexPath)} not found. Run vite build first.`)
  process.exit(1)
}

const indexHtml = fs.readFileSync(indexPath)

for (const route of routes) {
  const routeDir = path.join(buildDir, route)
  fs.mkdirSync(routeDir, { recursive: true })
  fs.writeFileSync(path.join(routeDir, 'index.html'), indexHtml)
}

console.log(`Created static SPA fallbacks for ${routes.length} routes.`)
