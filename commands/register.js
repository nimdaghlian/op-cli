import { createVerifiedOrigin, canonicalOrigin } from 'octothorpes'
import { loadConfig } from '../lib/client.js'

export async function register(domain, options) {
  const { client } = await loadConfig()

  try {
    const origin = canonicalOrigin(domain)
    // Core API: writes the verified-origin triples and mints a siteNum,
    // mirroring exactly what the relay's indexer writes.
    await createVerifiedOrigin(origin, {
      insert: client.sparql.insert,
      query: client.sparql.query,
    })
    console.log(`Registered: ${origin}`)
  } catch (err) {
    console.error(`Failed to register ${domain}: ${err.message}`)
    process.exit(1)
  }
}
