// Extracts small icon packs from the Iconify JSON sets into src/core/icons/packs/.
// Run: node scripts/build-icons.mjs   (re-run when the curated list changes)
import { readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)

const lucide = require('@iconify-json/lucide/icons.json')
const logos = require('@iconify-json/logos/icons.json')

const GENERAL = `server database layers hard-drive user users globe cloud cpu box package mail bell lock key shield
settings zap activity chart-bar pie-chart file file-text folder image video message-square phone smartphone monitor
laptop tablet terminal code git-branch git-commit-horizontal git-merge network wifi radio rss share-2 link external-link search
filter list list-ordered calendar clock timer map map-pin navigation truck plane house building store shopping-cart
credit-card dollar-sign wallet briefcase clipboard check circle-check x circle-x triangle-alert circle-alert info
circle-help sticky-note bookmark tag flag star heart eye pencil trash download upload refresh-cw rotate-cw repeat
shuffle play pause square circle triangle hexagon workflow boxes container webhook plug cable router bot brain
sparkles flame droplet thermometer gauge sliders-horizontal inbox send archive printer camera mic headphones cast
table grid-2x2 layout-dashboard panel-left component puzzle wrench hammer scroll-text book lightbulb rocket
fingerprint scan-face scan-line qr-code binary square-function variable braces regex cookie table-properties
database-zap server-cog server-crash cloud-cog cloud-upload cloud-download arrow-right arrow-left-right
message-circle mails bell-ring lock-keyhole shield-check shield-alert key-round log-in log-out user-check
user-cog contact id-card languages globe-lock earth radar satellite anchor ship bus car bike train-front warehouse
factory landmark hospital school university library gavel scale`.split(/\s+/).filter(Boolean)

function pick(set, names, { prefix = '', strip = '' } = {}) {
  const out = {}
  const missing = []
  for (const name of names) {
    const key = prefix + name
    const icon = set.icons[key]
    if (!icon) { missing.push(key); continue }
    const short = strip ? key.replace(strip, '') : name
    out[short] = { body: icon.body, width: icon.width ?? set.width, height: icon.height ?? set.height }
  }
  return { out, missing }
}

function byPrefix(set, prefix, strip) {
  const names = Object.keys(set.icons).filter((k) => k.startsWith(prefix)).map((k) => k.slice(prefix.length ? 0 : 0))
  return pick(set, names, { strip })
}

// Technology marks: pack name -> Iconify `logos` key. Names are the plain
// technology so `%%mp: node db icon=tech:postgresql` reads naturally.
const TECH = {
  postgresql: 'postgresql', mysql: 'mysql', mariadb: 'mariadb', mongodb: 'mongodb', redis: 'redis',
  sqlite: 'sqlite', cassandra: 'cassandra', elasticsearch: 'elasticsearch', neo4j: 'neo4j',
  snowflake: 'snowflake-icon', databricks: 'databricks', prisma: 'prisma',
  kafka: 'kafka-icon', rabbitmq: 'rabbitmq-icon', nats: 'nats-icon',
  nginx: 'nginx', envoy: 'envoyproxy',
  docker: 'docker-icon', kubernetes: 'kubernetes', helm: 'helm', terraform: 'terraform-icon',
  ansible: 'ansible', jenkins: 'jenkins', 'github-actions': 'github-actions',
  github: 'github-icon', gitlab: 'gitlab', bitbucket: 'bitbucket',
  gcp: 'google-cloud', azure: 'microsoft-azure', heroku: 'heroku-icon', vercel: 'vercel-icon',
  netlify: 'netlify-icon', cloudflare: 'cloudflare-icon',
  stripe: 'stripe', twilio: 'twilio-icon', sendgrid: 'sendgrid-icon', mailgun: 'mailgun-icon',
  paypal: 'paypal', visa: 'visa', mastercard: 'mastercard',
  auth0: 'auth0-icon', okta: 'okta', firebase: 'firebase', supabase: 'supabase-icon',
  algolia: 'algolia', datadog: 'datadog', sentry: 'sentry-icon', grafana: 'grafana',
  prometheus: 'prometheus', opentelemetry: 'opentelemetry',
  react: 'react', vue: 'vue', angular: 'angular-icon', svelte: 'svelte-icon', nextjs: 'nextjs-icon',
  nodejs: 'nodejs-icon', deno: 'deno', bun: 'bun', python: 'python', rust: 'rust', java: 'java',
  kotlin: 'kotlin-icon', swift: 'swift', php: 'php', ruby: 'ruby', dotnet: 'dotnet',
  typescript: 'typescript-icon', javascript: 'javascript', graphql: 'graphql', redux: 'redux',
  tailwind: 'tailwindcss-icon', vite: 'vitejs', webpack: 'webpack', jest: 'jest',
  playwright: 'playwright', storybook: 'storybook-icon',
  openai: 'openai', slack: 'slack-icon', notion: 'notion-icon', figma: 'figma', jira: 'jira',
  shopify: 'shopify', salesforce: 'salesforce', hubspot: 'hubspot', zapier: 'zapier-icon',
  apple: 'apple', android: 'android-icon', chrome: 'chrome', firefox: 'firefox', safari: 'safari',
  linux: 'linux-tux', ubuntu: 'ubuntu', debian: 'debian',
}

function pickMapped(set, mapping) {
  const out = {}
  const missing = []
  for (const [name, key] of Object.entries(mapping)) {
    const icon = set.icons[key]
    if (!icon) { missing.push(key); continue }
    out[name] = { body: icon.body, width: icon.width ?? set.width, height: icon.height ?? set.height }
  }
  return { out, missing }
}

const packs = {
  tech: { monochrome: false, ...pickMapped(logos, TECH) },
  general: { monochrome: true, ...pick(lucide, GENERAL) },
  aws: { monochrome: false, ...byPrefix(logos, 'aws-', /^aws-/) },
  gcp: { monochrome: false, ...byPrefix(logos, 'google-cloud', /^google-cloud-?/) },
  azure: { monochrome: false, ...pick(logos, ['microsoft-azure', 'azure', 'azure-icon']) },
  k8s: { monochrome: false, ...pick(logos, ['kubernetes', 'helm', 'prometheus', 'grafana', 'docker-icon', 'terraform-icon', 'nginx', 'redis', 'postgresql', 'mongodb', 'kafka', 'rabbitmq-icon', 'elasticsearch']) },
}

// Add the bare vendor marks under short aliases so `aws:aws` / `aws:logo` work.
if (logos.icons['aws']) packs.aws.out['logo'] = { body: logos.icons['aws'].body, width: logos.icons['aws'].width ?? logos.width, height: logos.icons['aws'].height ?? logos.height }
if (packs.gcp.out['']) { packs.gcp.out['logo'] = packs.gcp.out['']; delete packs.gcp.out[''] }

for (const [name, pack] of Object.entries(packs)) {
  const json = { pack: name, monochrome: pack.monochrome, icons: pack.out }
  writeFileSync(`src/core/icons/packs/${name}.json`, JSON.stringify(json))
  const size = readFileSync(`src/core/icons/packs/${name}.json`).length
  console.log(`${name}: ${Object.keys(pack.out).length} icons, ${(size / 1024).toFixed(0)} KB${pack.missing.length ? `, missing: ${pack.missing.join(', ')}` : ''}`)
}
