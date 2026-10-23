import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('../lib/client.js', () => ({
  loadConfig: vi.fn(),
}))

import { loadConfig } from '../lib/client.js'
import { link } from '../commands/link.js'

const S = 'https://a.example/page'
const O = 'https://b.example/other'

function stubClient({ insert = vi.fn().mockResolvedValue(undefined) } = {}) {
  const sparql = {
    insert,
    query: vi.fn().mockResolvedValue(undefined),
    queryBoolean: vi.fn().mockResolvedValue(false),
    queryArray: vi.fn().mockResolvedValue({ results: { bindings: [] } }),
  }
  loadConfig.mockResolvedValue({ client: { sparql }, config: {}, instance: 'https://relay.example/' })
  return sparql
}

describe('link', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(process, 'exit').mockImplementation(() => {})
  })
  afterEach(() => vi.restoreAllMocks())

  it('writes a plain octo:Link by default', async () => {
    const { insert } = stubClient()
    await link(S, O, {})
    expect(insert).toHaveBeenCalledTimes(1)
    const written = insert.mock.calls[0][0]
    expect(written).toContain(`<${S}> octo:octothorpes <${O}>`)
    expect(written).toContain('rdf:type <octo:Link>')
    expect(process.exit).not.toHaveBeenCalled()
  })

  it('writes a subtyped link with --st aliasOf', async () => {
    const { insert } = stubClient()
    await link(S, O, { st: 'aliasOf' })
    const written = insert.mock.calls[0][0]
    expect(written).toContain('rdf:type <octo:AliasOf>')
    expect(written).toContain(`octo:url <${O}>`)
  })

  it('reports errors and exits 1', async () => {
    stubClient({ insert: vi.fn().mockRejectedValue(new Error('boom')) })
    await link(S, O, {})
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('boom'))
    expect(process.exit).toHaveBeenCalledWith(1)
  })

  it('rejects a non-URL argument', async () => {
    const { insert } = stubClient()
    await link('not a url', O, {})
    expect(insert).not.toHaveBeenCalled()
    expect(process.exit).toHaveBeenCalledWith(1)
  })
})
