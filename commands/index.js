import { readFileSync } from 'fs'
import { loadConfig } from '../lib/client.js'

export async function index(uri, options) {
  const { client } = await loadConfig()

  const indexOptions = {}
  // --harmonizer-file loads a local JSON harmonizer definition and passes it
  // inline (core's indexSource accepts an object harmonizer); it wins over
  // --harmonizer/--as, which name a registry id or remote URL.
  // An explicit --harmonizer wins over --as when both are given.
  if (options.harmonizerFile) {
    try {
      indexOptions.harmonizer = JSON.parse(readFileSync(options.harmonizerFile, 'utf-8'))
    } catch (err) {
      console.error(`Failed to load harmonizer file ${options.harmonizerFile}: ${err.message}`)
      process.exit(1)
    }
  } else {
    const harmonizer = options.harmonizer || options.as
    if (harmonizer) indexOptions.harmonizer = harmonizer
  }

  try {
    const result = await client.indexSource(uri, indexOptions)
    console.log(`Indexed: ${result.uri}`)
    console.log(`At:      ${new Date(result.indexed_at).toISOString()}`)
  } catch (err) {
    console.error(`Failed to index ${uri}: ${err.message}`)
    process.exit(1)
  }
}
