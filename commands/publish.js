import { loadConfig } from '../lib/client.js'

/**
 * Prints rendered publisher output: strings as-is, objects as JSON.
 */
function printRendered(rendered) {
  if (typeof rendered === 'string') {
    console.log(rendered)
  } else {
    console.log(JSON.stringify(rendered, null, 2))
  }
}

/**
 * Collects envelope / pubDefs values from CLI flags. Core reads the canonical
 * envelope keys (title, link, description, feedDate) from pubDefs.
 */
function buildPubDefs(options) {
  const pubDefs = {}
  if (options.title) pubDefs.title = options.title
  if (options.link) pubDefs.link = options.link
  if (options.description) pubDefs.description = options.description
  return pubDefs
}

/**
 * op publish <publisher> [what] [by] — run a query (or a single --uri) through
 * a named core publisher and print the rendered output.
 *
 * Query mode delegates to client.get({ as: publisher }), which shares the
 * render contract with the relay's /get/[what]/[by]/[as] route. --uri mode
 * fetches and harmonizes one page, then renders it via client.publish.
 */
export async function publish(publisherName, what, by, options) {
  const { client } = await loadConfig()
  const pubDefs = buildPubDefs(options)

  try {
    if (options.uri) {
      const response = await fetch(options.uri)
      if (!response.ok) {
        console.error(`Failed to fetch ${options.uri}: ${response.status} ${response.statusText}`)
        process.exit(1)
      }
      const html = await response.text()
      const blobject = await client.harmonize(html, options.harmonizer || 'default')
      if (!blobject['@id']) blobject['@id'] = options.uri
      const rendered = await client.publish([blobject], publisherName, pubDefs)
      printRendered(rendered)
      return
    }

    if (!what || !by) {
      console.error('op publish needs a query (<what> <by>, like op get) or --uri <url>')
      process.exit(1)
    }

    const queryOptions = {}
    if (options.s) queryOptions.s = options.s
    if (options.o) queryOptions.o = options.o
    if (options.notS) queryOptions['not-s'] = options.notS
    if (options.notO) queryOptions['not-o'] = options.notO
    if (options.match) queryOptions.match = options.match
    if (options.limit) queryOptions.limit = options.limit
    if (options.offset) queryOptions.offset = options.offset
    if (options.when) queryOptions.when = options.when

    const rendered = await client.get({ what, by, as: publisherName, pubDefs, ...queryOptions })
    printRendered(rendered)
  } catch (err) {
    console.error(`Failed to publish: ${err.message}`)
    process.exit(1)
  }
}
