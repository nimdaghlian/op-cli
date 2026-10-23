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

  it('--harmonizer-file loads the JSON and passes the definition inline, winning over --as', async () => {
    const indexSource = mockClient()
    const file = new URL('./fixtures/harmonizer.json', import.meta.url).pathname
    await index('https://example.com/', { harmonizerFile: file, as: 'openGraph' })
    expect(indexSource).toHaveBeenCalledWith('https://example.com/', {
      harmonizer: expect.objectContaining({ id: 'harmonizer/fixture', mode: 'html' }),
    })
  })

  it('--harmonizer-file with a missing file exits with an error', async () => {
    mockClient()
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit') })
    await expect(index('https://example.com/', { harmonizerFile: '/nope/missing.json' })).rejects.toThrow('exit')
    expect(exitSpy).toHaveBeenCalledWith(1)
    expect(errSpy).toHaveBeenCalled()
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
