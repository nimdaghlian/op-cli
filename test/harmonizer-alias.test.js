import { describe, it, expect, vi, afterEach } from 'vitest'

vi.mock('../lib/client.js', () => ({
  loadConfig: vi.fn(),
}))

import { loadConfig } from '../lib/client.js'
import { index } from '../commands/index.js'
import { harmonize } from '../commands/harmonize.js'

afterEach(() => vi.restoreAllMocks())

describe('index --as harmonizer alias', () => {
  function mockClient() {
    const indexSource = vi
      .fn()
      .mockResolvedValue({ uri: 'https://example.com/', indexed_at: Date.now() })
    loadConfig.mockResolvedValue({ client: { indexSource }, config: {} })
    vi.spyOn(console, 'log').mockImplementation(() => {})
    return indexSource
  }

  it('passes --as through as the harmonizer', async () => {
    const indexSource = mockClient()
    await index('https://example.com/', { as: 'openGraph' })
    expect(indexSource).toHaveBeenCalledWith('https://example.com/', { harmonizer: 'openGraph' })
  })

  it('--harmonizer still works and wins over --as', async () => {
    const indexSource = mockClient()
    await index('https://example.com/', { harmonizer: 'ghost', as: 'openGraph' })
    expect(indexSource).toHaveBeenCalledWith('https://example.com/', { harmonizer: 'ghost' })
  })

  it('omits harmonizer when neither flag is given', async () => {
    const indexSource = mockClient()
    await index('https://example.com/', {})
    expect(indexSource).toHaveBeenCalledWith('https://example.com/', {})
  })
})

describe('harmonize --as harmonizer alias', () => {
  function mockHarmonize() {
    const clientHarmonize = vi.fn().mockResolvedValue({ '@id': 'https://example.com/' })
    loadConfig.mockResolvedValue({ client: { harmonize: clientHarmonize }, config: {} })
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve('<html></html>') })
    )
    return clientHarmonize
  }

  afterEach(() => vi.unstubAllGlobals())

  it('passes --as through as the harmonizer name', async () => {
    const clientHarmonize = mockHarmonize()
    await harmonize('https://example.com/', { as: 'openGraph' })
    expect(clientHarmonize).toHaveBeenCalledWith('<html></html>', 'openGraph')
  })

  it('falls back to default when neither flag is given', async () => {
    const clientHarmonize = mockHarmonize()
    await harmonize('https://example.com/', {})
    expect(clientHarmonize).toHaveBeenCalledWith('<html></html>', 'default')
  })
})
