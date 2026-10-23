import { writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import { createInterface } from 'readline'

function ask(rl, question, defaultValue = '') {
  const prompt = defaultValue ? `${question} [${defaultValue}]: ` : `${question}: `
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer.trim() || defaultValue)
    })
  })
}

export async function init(options) {
  const dir = options.global
    ? join((await import('os')).homedir(), '.config', 'op')
    : process.cwd()

  const configPath = join(dir, 'op.config.json')
  const envPath = join(dir, '.env')

  if (existsSync(configPath) || existsSync(envPath)) {
    const rl = createInterface({ input: process.stdin, output: process.stdout })
    const overwrite = await ask(rl, 'Config files already exist. Overwrite? (y/N)', 'N')
    if (overwrite.toLowerCase() !== 'y') {
      rl.close()
      console.log('Cancelled.')
      return
    }
    rl.close()
  }

  const rl = createInterface({ input: process.stdin, output: process.stdout })

  console.log('\nOP CLI Setup\n')

  const instance = await ask(rl, 'OP instance URL (with trailing slash)', 'https://octothorp.es/')
  const endpoint = await ask(rl, 'SPARQL endpoint', 'http://0.0.0.0:7878')
  const user = await ask(rl, 'SPARQL username (leave blank if none)', '')
  const password = await ask(rl, 'SPARQL password (leave blank if none)', '')

  rl.close()

  // Ensure directory exists
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }

  // Write op.config.json
  const config = {
    instance,
    termColor: 'magenta',
  }
  writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n')
  console.log(`\nWrote ${configPath}`)

  // Write .env
  const envContent = [
    `SPARQL_ENDPOINT=${endpoint}`,
    `SPARQL_USER=${user}`,
    `SPARQL_PASSWORD=${password}`,
    '',
  ].join('\n')
  writeFileSync(envPath, envContent)
  console.log(`Wrote ${envPath}`)

  console.log('\nDone. Run `op get terms posted` to test your connection.')
}
