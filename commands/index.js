import { loadConfig } from '../lib/client.js'

export async function index(uri, options) {
  const { client } = await loadConfig()

  const indexOptions = {}
  if (options.harmonizer) indexOptions.harmonizer = options.harmonizer

  try {
    const result = await client.indexSource(uri, indexOptions)
    console.log(`Indexed: ${result.uri}`)
    console.log(`At:      ${new Date(result.indexed_at).toISOString()}`)
  } catch (err) {
    console.error(`Failed to index ${uri}: ${err.message}`)
    process.exit(1)
  }
}
