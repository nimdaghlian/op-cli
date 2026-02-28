import { loadConfig } from '../lib/client.js'
import { formatBindings } from '../lib/format.js'

const VALID_METHODS = ['terms', 'term', 'domains', 'domain', 'backlinks', 'bookmarks']

export async function fast(method, value, options) {
  if (!VALID_METHODS.includes(method)) {
    console.error(`Unknown fast method: ${method}`)
    console.error(`Valid methods: ${VALID_METHODS.join(', ')}`)
    process.exit(1)
  }

  const needsValue = ['term', 'domain']
  if (needsValue.includes(method) && !value) {
    console.error(`op fast ${method} requires a value argument`)
    process.exit(1)
  }

  const { client } = await loadConfig()

  const result = needsValue.includes(method)
    ? await client.getfast[method](value)
    : await client.getfast[method]()

  const limit = parseInt(options.limit) || 100

  if (options.raw) {
    const trimmed = Array.isArray(result) ? result.slice(0, limit) : result
    console.log(JSON.stringify(trimmed, null, 2))
    return
  }

  // fast.term() and fast.domain() return { pages, bookmarks } or { backlinks, bookmarks }
  if (typeof result === 'object' && !Array.isArray(result)) {
    for (const [key, bindings] of Object.entries(result)) {
      if (Array.isArray(bindings) && bindings.length > 0) {
        console.log(`\n${key}:\n`)
        console.log(formatBindings(bindings.slice(0, limit)))
      } else if (Array.isArray(bindings)) {
        console.log(`\n${key}: (none)`)
      }
    }
    return
  }

  // Everything else returns a flat bindings array
  console.log(formatBindings(result.slice(0, limit)))
}
