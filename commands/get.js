import { loadConfig } from '../lib/client.js'
import { formatBlobjects, formatPages, formatTerms, formatDomains } from '../lib/format.js'

// Map `what` values to their result format type
const RESULT_FORMATS = {
  everything: 'blobjects',
  blobjects: 'blobjects',
  whatever: 'blobjects',
  pages: 'pages',
  links: 'pages',
  mentions: 'pages',
  backlinks: 'pages',
  citations: 'pages',
  bookmarks: 'pages',
  thorpes: 'terms',
  octothorpes: 'terms',
  tags: 'terms',
  terms: 'terms',
  domains: 'domains',
}

export async function get(what, by, options) {
  const { client, config } = await loadConfig()
  const termColor = config.termColor || 'magenta'

  const queryOptions = {}
  if (options.s) queryOptions.s = options.s
  if (options.o) queryOptions.o = options.o
  if (options.notS) queryOptions['not-s'] = options.notS
  if (options.notO) queryOptions['not-o'] = options.notO
  if (options.match) queryOptions.match = options.match
  if (options.limit) queryOptions.limit = options.limit
  if (options.offset) queryOptions.offset = options.offset
  if (options.when) queryOptions.when = options.when

  // --as hands the results to a core publisher (e.g. rss) or the core debug
  // formats (debug, multipass). Publisher output is printed as-is.
  if (options.as) {
    const rendered = await client.get({ what, by, as: options.as, ...queryOptions })
    if (typeof rendered === 'string') {
      console.log(rendered)
    } else {
      console.log(JSON.stringify(rendered, null, 2))
    }
    return
  }

  const result = await client.get({ what, by, ...queryOptions })

  if (options.raw) {
    console.log(JSON.stringify(result, null, 2))
    return
  }

  const format = RESULT_FORMATS[what] || 'pages'
  switch (format) {
    case 'blobjects':
      console.log(formatBlobjects(result.results, termColor))
      break
    case 'terms':
      console.log(formatTerms(result.results, termColor))
      break
    case 'domains':
      console.log(formatDomains(result.results))
      break
    case 'pages':
    default:
      console.log(formatPages(result.results))
      break
  }
}
