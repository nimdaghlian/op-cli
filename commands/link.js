import { createIndexer, resolveSubtype } from 'octothorpes'
import { loadConfig } from '../lib/client.js'

export async function link(subject, object, options = {}) {
  const { client, instance } = await loadConfig()

  try {
    for (const u of [subject, object]) new URL(u)
    const subtype = resolveSubtype(options.st || 'link')
    // Core API: handleMention is the same write the indexer performs for a
    // typed link entry in a blobject. It writes the flat mention triple plus a
    // subtyped relationship node; no page/documentRecord writes.
    const indexer = createIndexer({
      insert: client.sparql.insert,
      query: client.sparql.query,
      queryBoolean: client.sparql.queryBoolean,
      queryArray: client.sparql.queryArray,
      instance,
    })
    await indexer.handleMention(subject, object, subtype, [], { instance })
    console.log(`Linked (${subtype}): ${subject} -> ${object}`)
  } catch (err) {
    console.error(`Failed to link ${subject} -> ${object}: ${err.message}`)
    process.exit(1)
  }
}
