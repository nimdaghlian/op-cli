const ANSI_COLORS = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
}
const RESET = '\x1b[0m'

/**
 * Wraps a string in ANSI color codes.
 * @param {string} text
 * @param {string} [color='magenta']
 * @returns {string}
 */
export function colorTerm(text, color = 'magenta') {
  const code = ANSI_COLORS[color] || ANSI_COLORS.magenta
  return `${code}${text}${RESET}`
}

function formatDate(timestamp) {
  if (!timestamp || isNaN(timestamp)) return ''
  return new Date(timestamp).toISOString().split('T')[0]
}

function resultCount(n) {
  return `${n} result${n === 1 ? '' : 's'}`
}

/**
 * Format blobject results as card blocks.
 * @param {Array} blobjects
 * @param {string} [termColor='magenta']
 * @returns {string}
 */
export function formatBlobjects(blobjects, termColor = 'magenta') {
  const cards = blobjects.map((b) => {
    const lines = []
    lines.push(`── ${b['@id']} ──`)
    if (b.title) lines.push(`Title:       ${b.title}`)
    if (b.description) lines.push(`Description: ${b.description}`)

    const terms = []
    const links = []
    if (b.octothorpes) {
      for (const o of b.octothorpes) {
        if (typeof o === 'string') terms.push(colorTerm(o, termColor))
        else if (o.uri) links.push(`${o.uri} (${o.type})`)
      }
    }
    if (terms.length) lines.push(`Terms:       ${terms.join(', ')}`)
    if (links.length) lines.push(`Links:       ${links.join(', ')}`)

    const date = formatDate(b.date || b.postDate)
    if (date) lines.push(`Indexed:     ${date}`)

    return lines.join('\n')
  })

  return cards.join('\n\n') + '\n\n' + resultCount(blobjects.length)
}

/**
 * Format page/link results as compact lines.
 * @param {Array} pages
 * @returns {string}
 */
export function formatPages(pages) {
  const lines = pages.map((p) => {
    const role = `[${p.role}]`.padEnd(10)
    const title = p.title ? `"${p.title}"` : ''
    const date = formatDate(p.date)
    return `${role}${p.uri}  ${title}  ${date}`.trimEnd()
  })

  return lines.join('\n') + '\n\n' + resultCount(pages.length)
}

/**
 * Format term results as colored term + date lines.
 * @param {Array} terms
 * @param {string} [termColor='magenta']
 * @returns {string}
 */
export function formatTerms(terms, termColor = 'magenta') {
  const lines = terms.map((t) => {
    const term = colorTerm(t.term, termColor).padEnd(30)
    const date = formatDate(t.date)
    return `${term}${date}`
  })

  return lines.join('\n') + '\n\n' + resultCount(terms.length)
}

/**
 * Format domain results as plain URI list.
 * @param {Array} domains
 * @returns {string}
 */
export function formatDomains(domains) {
  const lines = domains.map((d) => d.uri || d.d?.value || String(d))

  return lines.join('\n') + '\n\n' + resultCount(domains.length)
}

/**
 * Format raw SPARQL bindings as numbered key-value cards.
 * @param {Array} bindings
 * @returns {string}
 */
export function formatBindings(bindings) {
  const cards = bindings.map((b, i) => {
    const lines = [`── ${i + 1} ──`]
    for (const [key, val] of Object.entries(b)) {
      lines.push(`${key}:`.padEnd(10) + (val?.value ?? String(val)))
    }
    return lines.join('\n')
  })

  return cards.join('\n\n') + '\n\n' + resultCount(bindings.length)
}
