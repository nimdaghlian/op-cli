import { loadConfig } from '../lib/client.js'

export async function index(uri, options) {
  const { client } = await loadConfig()

  const indexOptions = {}
  // --as is an alias for --harmonizer (the relay's /index?as= vocabulary).
  // An explicit --harmonizer wins when both are given.
  const harmonizer = options.harmonizer || options.as
  if (harmonizer) indexOptions.harmonizer = harmonizer

  try {
    const result = await client.indexSource(uri, indexOptions)
    console.log(`Indexed: ${result.uri}`)
    console.log(`At:      ${new Date(result.indexed_at).toISOString()}`)
  } catch (err) {
    console.error(`Failed to index ${uri}: ${err.message}`)
    process.exit(1)
  }
}
