/**
 * Technology recognition: when a label names a real technology, the node gets
 * that technology's mark instead of the archetype's generic glyph. Keywords are
 * matched as whole words, so "Order Service" stays generic while "Postgres
 * primary" becomes a Postgres node.
 *
 * Deliberately excluded: words that are ordinary English before they are
 * products ("next", "node", "segment", "linear", "actions"), which would misfire
 * on kanban columns and flowchart steps.
 */
const TECH_ICONS: ReadonlyArray<readonly [string, readonly string[]]> = [
  // Data stores
  ['tech:postgresql', ['postgres', 'postgresql', 'psql', 'rds']],
  ['tech:mysql', ['mysql']],
  ['tech:mariadb', ['mariadb']],
  ['tech:mongodb', ['mongo', 'mongodb']],
  ['tech:redis', ['redis']],
  ['tech:sqlite', ['sqlite']],
  ['tech:cassandra', ['cassandra']],
  ['tech:elasticsearch', ['elasticsearch', 'opensearch']],
  ['tech:neo4j', ['neo4j']],
  ['tech:snowflake', ['snowflake']],
  ['tech:databricks', ['databricks']],
  ['tech:prisma', ['prisma']],
  // Messaging
  ['tech:kafka', ['kafka']],
  ['tech:rabbitmq', ['rabbitmq', 'rabbit']],
  ['tech:nats', ['nats']],
  // Infrastructure
  ['tech:nginx', ['nginx']],
  ['tech:envoy', ['envoy']],
  ['tech:kubernetes', ['kubernetes', 'k8s', 'eks', 'gke', 'aks']],
  ['tech:docker', ['docker']],
  ['tech:helm', ['helm']],
  ['tech:terraform', ['terraform']],
  ['tech:ansible', ['ansible']],
  ['tech:jenkins', ['jenkins']],
  ['tech:gitlab', ['gitlab']],
  ['tech:bitbucket', ['bitbucket']],
  ['tech:github', ['github']],
  ['tech:gcp', ['gcp']],
  ['tech:azure', ['azure']],
  ['tech:heroku', ['heroku']],
  ['tech:vercel', ['vercel']],
  ['tech:netlify', ['netlify']],
  ['tech:cloudflare', ['cloudflare']],
  // Observability
  ['tech:datadog', ['datadog']],
  ['tech:sentry', ['sentry']],
  ['tech:grafana', ['grafana']],
  ['tech:prometheus', ['prometheus']],
  ['tech:opentelemetry', ['opentelemetry', 'otel']],
  // Third parties
  ['tech:stripe', ['stripe']],
  ['tech:twilio', ['twilio']],
  ['tech:sendgrid', ['sendgrid']],
  ['tech:mailgun', ['mailgun']],
  ['tech:paypal', ['paypal']],
  ['tech:auth0', ['auth0']],
  ['tech:okta', ['okta']],
  ['tech:firebase', ['firebase']],
  ['tech:supabase', ['supabase']],
  ['tech:algolia', ['algolia']],
  ['tech:shopify', ['shopify']],
  ['tech:salesforce', ['salesforce']],
  ['tech:hubspot', ['hubspot']],
  ['tech:zapier', ['zapier']],
  ['tech:slack', ['slack']],
  ['tech:notion', ['notion']],
  ['tech:figma', ['figma']],
  ['tech:jira', ['jira']],
  ['tech:openai', ['openai', 'gpt']],
  // Languages and frameworks — javascript before java so it wins the token
  ['tech:javascript', ['javascript']],
  ['tech:typescript', ['typescript']],
  ['tech:nextjs', ['nextjs']],
  ['tech:react', ['react']],
  ['tech:vue', ['vue']],
  ['tech:angular', ['angular']],
  ['tech:svelte', ['svelte']],
  ['tech:nodejs', ['nodejs']],
  ['tech:deno', ['deno']],
  ['tech:bun', ['bun']],
  ['tech:python', ['python', 'django', 'flask', 'fastapi']],
  ['tech:rust', ['rust']],
  ['tech:java', ['java', 'spring']],
  ['tech:kotlin', ['kotlin']],
  ['tech:swift', ['swift']],
  ['tech:php', ['php', 'laravel']],
  ['tech:ruby', ['ruby', 'rails']],
  ['tech:dotnet', ['dotnet']],
  ['tech:graphql', ['graphql']],
  ['tech:redux', ['redux']],
  ['tech:tailwind', ['tailwind']],
  ['tech:vite', ['vite']],
  ['tech:webpack', ['webpack']],
  ['tech:jest', ['jest']],
  ['tech:playwright', ['playwright']],
  ['tech:storybook', ['storybook']],
  // Platforms
  ['tech:android', ['android']],
  ['tech:apple', ['apple', 'ios']],
  ['tech:chrome', ['chrome']],
  ['tech:firefox', ['firefox']],
  ['tech:safari', ['safari']],
  ['tech:linux', ['linux']],
  ['tech:ubuntu', ['ubuntu']],
  ['tech:debian', ['debian']],
]

/** AWS service marks, matched on the service name appearing in the label. */
const AWS_SERVICES = [
  'lambda', 's3', 'dynamodb', 'sqs', 'sns', 'ec2', 'ecs', 'eks', 'rds', 'aurora', 'redshift',
  'cloudfront', 'route53', 'cloudwatch', 'kinesis', 'athena', 'glue', 'cognito', 'fargate',
  'api-gateway', 'step-functions', 'elasticache', 'sagemaker', 'amplify', 'appsync',
] as const

/**
 * Label tokens, plus adjacent pairs joined, so punctuated product names survive:
 * "Next.js" splits to next + js and rejoins as "nextjs".
 */
function words(label: string): Set<string> {
  const parts = label.toLowerCase().split(/[^a-z0-9-]+/).filter(Boolean)
  const tokens = new Set(parts)
  for (let i = 0; i < parts.length - 1; i++) tokens.add(parts[i]! + parts[i + 1]!)
  return tokens
}

/** The technology mark a label names, if any. */
export function inferIcon(label: string): string | undefined {
  const tokens = words(label)
  for (const [icon, keywords] of TECH_ICONS) {
    if (keywords.some((k) => tokens.has(k))) return icon
  }
  // AWS marks only when the label also says AWS, so "Lambda function" in a
  // non-AWS diagram is not silently branded.
  if (tokens.has('aws')) {
    for (const service of AWS_SERVICES) {
      if (tokens.has(service) || tokens.has(service.replace(/-/g, ''))) return `aws:${service}`
    }
  }
  return undefined
}
