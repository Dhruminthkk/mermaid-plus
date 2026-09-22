import type { Archetype } from '@/core/ir'

/** Shapes that carry unambiguous meaning. Others (stadium, circle, ...) only suggest geometry. */
const SHAPE_ARCHETYPES: Record<string, Archetype> = {
  cylinder: 'database',
  hexagon: 'queue',
  diamond: 'decision',
  odd: 'note',
}

/** Ordered: the first group with a whole-word hit wins. */
const KEYWORD_ARCHETYPES: ReadonlyArray<readonly [Archetype, readonly string[]]> = [
  ['database', ['db', 'database', 'postgres', 'postgresql', 'mysql', 'mongo',
                'mongodb', 'redis', 'cache', 'dynamodb', 'sqlite', 'rds']],
  ['queue', ['queue', 'kafka', 'sqs', 'rabbitmq', 'topic', 'stream', 'pubsub', 'broker']],
  ['storage', ['s3', 'bucket', 'blob', 'storage', 'filesystem', 'cdn']],
  ['user', ['user', 'client', 'browser', 'customer', 'actor', 'person']],
  ['external', ['external', 'third-party', 'vendor', 'stripe', 'twilio', 'github']],
  ['service', ['service', 'api', 'server', 'worker', 'lambda', 'gateway',
               'handler', 'microservice', 'daemon', 'job']],
]

export function inferArchetype(input: { shapeHint?: string; label: string }): Archetype {
  const fromShape = input.shapeHint ? SHAPE_ARCHETYPES[input.shapeHint] : undefined
  if (fromShape) return fromShape

  const words = new Set(input.label.toLowerCase().split(/[^a-z0-9-]+/).filter(Boolean))
  for (const [archetype, keywords] of KEYWORD_ARCHETYPES) {
    if (keywords.some((keyword) => words.has(keyword))) return archetype
  }

  return 'default'
}

const VALID: ReadonlySet<string> = new Set<Archetype>([
  'service', 'database', 'queue', 'storage', 'user',
  'external', 'process', 'decision', 'note', 'default',
])

export function isArchetype(value: string): value is Archetype {
  return VALID.has(value)
}
