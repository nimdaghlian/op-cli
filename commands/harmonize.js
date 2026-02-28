import { loadConfig } from '../lib/client.js'
import { formatBlobjects } from '../lib/format.js'

export async function harmonize(url, options) {
  const { client, config } = await loadConfig()
  const termColor = config.termColor || 'magenta'
  const harmonizerName = options.harmonizer || 'default'

  try {
    const response = await fetch(url)
    if (!response.ok) {
      console.error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`)
      process.exit(1)
    }
    const html = await response.text()
    const blobject = await client.harmonize(html, harmonizerName)

    if (options.raw) {
      console.log(JSON.stringify(blobject, null, 2))
      return
    }

    console.log(formatBlobjects([blobject], termColor))
  } catch (err) {
    console.error(`Failed to harmonize ${url}: ${err.message}`)
    process.exit(1)
  }
}
