import { describe, it, expect } from 'vitest'
import { formatBlobjects, formatPages, formatTerms, formatDomains, formatBindings, colorTerm } from '../lib/format.js'

describe('colorTerm', () => {
  it('should wrap term in magenta ANSI codes by default', () => {
    const result = colorTerm('demo')
    expect(result).toBe('\x1b[35mdemo\x1b[0m')
  })

  it('should use custom color when provided', () => {
    const result = colorTerm('demo', 'cyan')
    expect(result).toBe('\x1b[36mdemo\x1b[0m')
  })
})

describe('formatTerms', () => {
  it('should format term results as colored term + date lines', () => {
    const terms = [
      { term: 'demo', date: 1705276800000 },
      { term: 'javascript', date: 1704672000000 },
    ]
    const output = formatTerms(terms)
    expect(output).toContain('demo')
    expect(output).toContain('javascript')
    expect(output).toContain('2 results')
  })
})

describe('formatPages', () => {
  it('should format page results as role + uri + title lines', () => {
    const pages = [
      { role: 'subject', uri: 'https://example.com/post', title: 'Post Title', description: null, date: 1705276800000, image: null },
    ]
    const output = formatPages(pages)
    expect(output).toContain('[subject]')
    expect(output).toContain('https://example.com/post')
    expect(output).toContain('Post Title')
    expect(output).toContain('1 result')
  })
})

describe('formatBlobjects', () => {
  it('should format blobjects as card blocks', () => {
    const blobjects = [
      {
        '@id': 'https://example.com/post',
        title: 'Post Title',
        description: 'A post about things.',
        image: null,
        date: 1705276800000,
        octothorpes: ['demo', { type: 'link', uri: 'https://other.com' }],
      },
    ]
    const output = formatBlobjects(blobjects)
    expect(output).toContain('https://example.com/post')
    expect(output).toContain('Post Title')
    expect(output).toContain('A post about things.')
    expect(output).toContain('demo')
    expect(output).toContain('https://other.com (link)')
    expect(output).toContain('1 result')
  })
})

describe('formatDomains', () => {
  it('should format domains as plain URI list', () => {
    const domains = [
      { role: 'subject', uri: 'https://example.com', title: null, description: null, date: null, image: null },
    ]
    const output = formatDomains(domains)
    expect(output).toContain('https://example.com')
    expect(output).toContain('1 result')
  })
})

describe('formatBindings', () => {
  it('should format raw SPARQL bindings as numbered cards', () => {
    const bindings = [
      { s: { value: 'https://example.com/post' }, o: { value: 'https://other.com' }, time: { value: '1740179856134' } },
    ]
    const output = formatBindings(bindings)
    expect(output).toContain('── 1 ──')
    expect(output).toContain('s:')
    expect(output).toContain('https://example.com/post')
    expect(output).toContain('1 result')
  })
})
