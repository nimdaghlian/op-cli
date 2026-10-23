import { describe, it, expect, vi, afterEach } from 'vitest'

vi.mock('../lib/client.js', () => ({
  loadConfig: vi.fn(),
}))

import { loadConfig } from '../lib/client.js'
import { get } from '../commands/get.js'

afterEach(() => vi.restoreAllMocks())

describe('get --as', () => {
  it('passes as through to client.get and prints publisher output as-is', async () => {
    const clientGet = vi.fn().mockResolvedValue('<rss>feed</rss>')
    loadConfig.mockResolvedValue({ client: { get: clientGet }, config: {} })
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})

    await get('everything', 'thorped', { o: 'demo', as: 'rss' })

    expect(clientGet).toHaveBeenCalledWith(
      expect.objectContaining({ what: 'everything', by: 'thorped', as: 'rss', o: 'demo' })
    )
    expect(log).toHaveBeenCalledWith('<rss>feed</rss>')
  })

  it('JSON-prints non-string debug output', async () => {
    const debugResult = { multiPass: {}, query: 'SELECT ...' }
    const clientGet = vi.fn().mockResolvedValue(debugResult)
    loadConfig.mockResolvedValue({ client: { get: clientGet }, config: {} })
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})

    await get('everything', 'thorped', { as: 'debug' })

    expect(log).toHaveBeenCalledWith(JSON.stringify(debugResult, null, 2))
  })
})
