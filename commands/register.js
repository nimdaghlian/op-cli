import { loadConfig } from '../lib/client.js'

/**
 * Builds the SPARQL INSERT query for domain registration.
 * Exported for testing.
 */
export function buildRegisterQuery(domain) {
  const clean = domain.replace(/\/$/, '')
  return `<${clean}> octo:verified 'true' .\n<${clean}> rdf:type <octo:Origin> .`
}

export async function register(domain, options) {
  const { client } = await loadConfig()

  try {
    const query = buildRegisterQuery(domain)
    await client.sparql.insert(query)
    console.log(`Registered: ${domain.replace(/\/$/, '')}`)
  } catch (err) {
    console.error(`Failed to register ${domain}: ${err.message}`)
    process.exit(1)
  }
}
