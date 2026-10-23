import { describe, it, expect, vi } from 'vitest'

// register now delegates to core's createVerifiedOrigin; stub loadConfig to
// capture what gets written without a live SPARQL endpoint.
vi.mock('../lib/client.js', () => ({
  loadConfig: vi.fn(),
}))

import { loadConfig } from '../lib/client.js'
import { register } from '../commands/register.js'

describe('register', () => {
  it('canonicalizes the domain and writes verified-origin triples via core', async () => {
    const insert = vi.fn().mockResolvedValue(undefined)
    const query = vi.fn().mockResolvedValue(undefined)
    loadConfig.mockResolvedValue({ client: { sparql: { insert, query } } })

    await register('https://example.com/', {})

    expect(insert).toHaveBeenCalledTimes(1)
    const written = insert.mock.calls[0][0]
    expect(written).toContain('<https://example.com>')
    expect(written).toContain('octo:verified "true"')
    // siteNum mint goes through query()
    expect(query).toHaveBeenCalledTimes(1)
    expect(query.mock.calls[0][0]).toContain('octo:siteNum')
  })
})
