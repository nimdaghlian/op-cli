import { describe, it, expect } from 'vitest'
import { buildDescribeQuery } from '../commands/describe.js'

describe('buildDescribeQuery', () => {
  it('should build a SELECT ?p ?o query for the URI', () => {
    const query = buildDescribeQuery('https://example.com/page')
    expect(query).toContain('SELECT ?p ?o')
    expect(query).toContain('<https://example.com/page> ?p ?o')
  })
})
