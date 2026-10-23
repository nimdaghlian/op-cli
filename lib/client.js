import { createClient } from 'octothorpes'
import { readFileSync, existsSync } from 'fs'
import { resolve, join } from 'path'
import { homedir } from 'os'
import { config as loadDotenv } from 'dotenv'

const CONFIG_FILENAME = 'op.config.json'
const ENV_FILENAME = '.env'

/**
 * Resolves config file paths. Checks cwd first, then ~/.config/op/.
 * @param {string} cwd - Directory to check first
 * @returns {{ configPath: string|null, envPath: string|null }}
 */
function resolveConfigPaths(cwd) {
  const globalDir = join(homedir(), '.config', 'op')
  const candidates = [cwd, globalDir]

  let configPath = null
  let envPath = null

  for (const dir of candidates) {
    const cp = join(dir, CONFIG_FILENAME)
    if (!configPath && existsSync(cp)) configPath = cp
    const ep = join(dir, ENV_FILENAME)
    if (!envPath && existsSync(ep)) envPath = ep
  }

  return { configPath, envPath }
}

/**
 * Loads config from op.config.json and .env, creates an OP client.
 * @param {string} [cwd=process.cwd()] - Working directory to search for config
 * @returns {Promise<{ client: Object, config: Object, instance: string }>}
 */
export async function loadConfig(cwd = process.cwd()) {
  const { configPath, envPath } = resolveConfigPaths(cwd)

  if (!configPath && !envPath) {
    throw new Error(
      'No OP config found. Run `op init` to create one, or check that .env and op.config.json exist in the current directory or ~/.config/op/'
    )
  }

  // Load .env if found
  if (envPath) {
    loadDotenv({ path: envPath })
  }

  // Load op.config.json if found
  let opConfig = {}
  if (configPath) {
    opConfig = JSON.parse(readFileSync(configPath, 'utf-8'))
  }

  const instance = opConfig.instance || process.env.INSTANCE || process.env.instance
  const endpoint = process.env.SPARQL_ENDPOINT || process.env.sparql_endpoint
  const user = process.env.SPARQL_USER || process.env.sparql_user || ''
  const password = process.env.SPARQL_PASSWORD || process.env.sparql_password || ''

  if (!instance) {
    throw new Error('Missing "instance" in op.config.json or .env')
  }
  if (!endpoint) {
    throw new Error('Missing SPARQL_ENDPOINT or sparql_endpoint in .env')
  }

  const client = createClient({
    instance,
    sparql: { endpoint, user, password },
  })

  return { client, config: opConfig, instance }
}
