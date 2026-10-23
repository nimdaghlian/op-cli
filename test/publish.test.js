import { describe, it, expect, vi, afterEach } from 'vitest'

vi.mock('../lib/client.js', () => ({
  loadConfig: vi.fn(),
}))

import { loadConfig } from '../lib/client.js'
import { publish } from '../commands/publish.js'

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('publish (query mode)', () => {
  it('delegates to client.get with as=<publisher> and prints string output as-is', async () => {
    const clientGet = vi.fn().mockResolvedValue('<rss>feed</rss>')
    loadConfig.mockResolvedValue({ client: { get: clientGet }, config: {} })
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})

    await publish('rss', 'everything', 'thorped', { o: 'demo' })

    expect(clientGet).toHaveBeenCalledWith(
      expect.objectContaining({ what: 'everything', by: 'thorped', as: 'rss', o: 'demo' })
    )
    expect(log).toHaveBeenCalledWith('<rss>feed</rss>')
  })

  it('passes envelope flags through as pubDefs', async () => {
    const clientGet = vi.fn().mockResolvedValue('<rss/>')
    loadConfig.mockResolvedValue({ client: { get: clientGet }, config: {} })
    vi.spyOn(console, 'log').mockImplementation(() => {})

    await publish('rss', 'everything', 'thorped', {
      title: 'My Feed',
      link: 'https://example.com/feed',
    })

    expect(clientGet).toHaveBeenCalledWith(
      expect.objectContaining({
        pubDefs: { title: 'My Feed', link: 'https://example.com/feed' },
      })
    )
  })

  it('JSON-prints non-string publisher output', async () => {
    const record = { text: 'a bluesky post' }
    const clientGet = vi.fn().mockResolvedValue(record)
    loadConfig.mockResolvedValue({ client: { get: clientGet }, config: {} })
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})

    await publish('bluesky', 'everything', 'thorped', {})

    expect(log).toHaveBeenCalledWith(JSON.stringify(record, null, 2))
  })

  it('errors on unknown publisher (surfaced from core) and exits 1', async () => {
    const clientGet = vi.fn().mockRejectedValue(new Error('unknown publisher: nope'))
    loadConfig.mockResolvedValue({ client: { get: clientGet }, config: {} })
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    const exit = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('exit')
    })

    await expect(publish('nope', 'everything', 'thorped', {})).rejects.toThrow('exit')
    expect(error).toHaveBeenCalledWith('Failed to publish: unknown publisher: nope')
    expect(exit).toHaveBeenCalledWith(1)
  })

  it('exits 1 when neither a query nor --uri is given', async () => {
    loadConfig.mockResolvedValue({ client: {}, config: {} })
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const exit = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('exit')
    })

    await expect(publish('rss', undefined, undefined, {})).rejects.toThrow('exit')
    expect(exit).toHaveBeenCalledWith(1)
  })
})

describe('publish --uri mode', () => {
  it('fetches, harmonizes, and renders via client.publish', async () => {
    const blobject = { '@id': 'https://example.com/post', title: 'Post' }
    const harmonize = vi.fn().mockResolvedValue(blobject)
    const clientPublish = vi.fn().mockResolvedValue('<rss>one item</rss>')
    loadConfig.mockResolvedValue({ client: { harmonize, publish: clientPublish }, config: {} })
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve('<html></html>') })
    )
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})

    await publish('rss', undefined, undefined, {
      uri: 'https://example.com/post',
      harmonizer: 'openGraph',
      title: 'One Post',
    })

    expect(harmonize).toHaveBeenCalledWith('<html></html>', 'openGraph')
    expect(clientPublish).toHaveBeenCalledWith([blobject], 'rss', { title: 'One Post' })
    expect(log).toHaveBeenCalledWith('<rss>one item</rss>')
  })
})
