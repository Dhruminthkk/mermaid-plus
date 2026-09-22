import { describe, expect, it } from 'vitest'
import { inferIcon } from '@/core/enrich/icon'
import { resolveIcons } from '@/core/icons'

describe('inferIcon', () => {
  it.each([
    ['Postgres primary', 'tech:postgresql'],
    ['Orders DB (MySQL)', 'tech:mysql'],
    ['Redis cache', 'tech:redis'],
    ['Kafka topic', 'tech:kafka'],
    ['Kubernetes cluster', 'tech:kubernetes'],
    ['Deployed on Vercel', 'tech:vercel'],
    ['Stripe', 'tech:stripe'],
    ['Grafana dashboards', 'tech:grafana'],
    ['Next.js storefront', 'tech:nextjs'],
    ['Node.js service', 'tech:nodejs'],
    ['Spring Boot API', 'tech:java'],
  ] as const)('recognises %s', (label, icon) => {
    expect(inferIcon(label)).toBe(icon)
  })

  it('prefers javascript over java for the javascript token', () => {
    expect(inferIcon('JavaScript bundle')).toBe('tech:javascript')
  })

  it('matches whole words only', () => {
    expect(inferIcon('Rusty pipeline')).toBeUndefined()
    expect(inferIcon('Reactor core')).toBeUndefined()
  })

  it('leaves ordinary labels alone, including words that are also products', () => {
    for (const label of ['Order Service', 'Next', 'Segment customers', 'Linear regression', 'Done', 'Review',
      'A longer node label than usual', 'Node', 'Leaf node']) {
      expect(inferIcon(label), label).toBeUndefined()
    }
  })

  it('brands AWS services only when the label says AWS', () => {
    expect(inferIcon('AWS Lambda handler')).toBe('aws:lambda')
    expect(inferIcon('AWS S3 bucket')).toBe('aws:s3')
    expect(inferIcon('Lambda handler')).toBeUndefined()
  })

  it('only names icons that actually resolve', async () => {
    const refs = new Set<string>()
    for (const label of ['postgres', 'mysql', 'mongodb', 'redis', 'kafka', 'kubernetes', 'docker', 'terraform',
      'stripe', 'twilio', 'auth0', 'firebase', 'datadog', 'sentry', 'grafana', 'prometheus', 'react', 'vue',
      'python', 'rust', 'java', 'ruby', 'php', 'graphql', 'openai', 'slack', 'figma', 'ubuntu', 'aws lambda', 'aws s3']) {
      const icon = inferIcon(label)
      if (icon) refs.add(icon)
    }
    const { missing } = await resolveIcons(refs)
    expect(missing).toEqual([])
  })
})
