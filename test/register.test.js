import { describe, it, expect } from 'vitest'
import { buildRegisterQuery } from '../commands/register.js'

describe('buildRegisterQuery', () => {
  it('should build correct SPARQL INSERT for a domain', () => {
    const query = buildRegisterQuery('https://example.com')
    expect(query).toContain('<https://example.com>')
    expect(query).toContain("octo:verified 'true'")
    expect(query).toContain('rdf:type <octo:Origin>')
  })

  it('should strip trailing slash from domain', () => {
    const query = buildRegisterQuery('https://example.com/')
    expect(query).toContain('<https://example.com>')
    expect(query).not.toContain('<https://example.com/>')
  })
})
