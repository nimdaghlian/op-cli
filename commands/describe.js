import { loadConfig } from '../lib/client.js'

/**
 * Builds the SELECT query listing every predicate/object pair for a URI.
 * Not a SPARQL DESCRIBE: the core sparql client only speaks SELECT/ASK/UPDATE
 * (queryArray returns JSON bindings), so we enumerate ?p ?o instead.
 * Exported for testing.
 */
export function buildDescribeQuery(uri) {
  return `SELECT ?p ?o WHERE { <${uri}> ?p ?o }`
}

export async function describe(uri) {
  try {
    new URL(uri)
  } catch {
    console.error(`Not a valid URI: ${uri}`)
    process.exit(1)
  }

  const { client } = await loadConfig()

  try {
    const result = await client.sparql.queryArray(buildDescribeQuery(uri))
    console.log(JSON.stringify(result, null, 2))
  } catch (err) {
    console.error(`Failed to describe ${uri}: ${err.message}`)
    process.exit(1)
  }
}
