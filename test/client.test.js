import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { resolve } from 'path'
import { readFileSync, existsSync } from 'fs'

// We'll test the config resolution logic by mocking fs
// The actual createClient call requires a live SPARQL endpoint,
// so we test config loading separately

describe('loadConfig', () => {
  it('should throw if no config files found', async () => {
    const { loadConfig } = await import('../lib/client.js')
    // When run from a dir with no .env or op.config.json, and no ~/.config/op/
    // it should throw a helpful error
    await expect(loadConfig('/nonexistent/path')).rejects.toThrow()
  })
})
