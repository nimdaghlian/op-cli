---
name: op-cli
description: Use when asked to "work on op-cli", "the OP CLI", the "op command", or any change to this command-line interface for the Octothorpes Protocol — adding/modifying commands, flags, output formatting, config loading, or CLI tests.
---

# op-cli

Command-line interface for the Octothorpes Protocol (OP). It is a thin shell
over the core package: commands parse flags, call `octothorpes` (OP core)
client methods, and format the result for a terminal. npm package `op-cli`,
binary `op`.

## Command surface

Defined in `bin/op.js` (commander):

- `op init` — interactive config setup (`-g` for global `~/.config/op/`)
- `op get <what> <by>` — query indexed data (filters `-s -o --not-s --not-o --match --limit --offset --when`; `--as` renders via a core publisher or debug format; `--raw`)
- `op fast <method> [value]` — core's fast SPARQL lookups (terms, domains, backlinks…)
- `op index <uri>` — index a page (`--harmonizer` / `--as` alias)
- `op harmonize <url>` — fetch + harmonize without indexing
- `op register <domain>` — write verified-origin triples via core
- `op link <subject> <object>` — write a link relationship via core's `createIndexer().handleMention` (`--st <subtype>`, default `link`)
- `op describe <uri>` — dump all triples about a URI
- `op publish <publisher> [what] [by]` — render a query (or `--uri <url>`) through a core publisher

### The two `--as` axes (do not conflate)

- `op get --as <format>` / `op publish <publisher>` — **output** axis: which publisher/debug format renders results (relay path `/get/[what]/[by]/[as]`).
- `op index --as <name>` and `op harmonize --as <name>` — **input** axis: alias for `--harmonizer`, matching the relay's `/index?as=` query param. `--harmonizer` wins when both are given.

## File layout

- `bin/op.js` — commander entry; all command/flag declarations and help text
- `commands/*.js` — one file per command; thin async functions `(args, options)`
- `lib/client.js` — `loadConfig()`: resolves config, loads `.env`, returns `{ client, config }` where `client = createClient(...)` from core
- `lib/format.js` — terminal formatters (`formatBlobjects`, `formatPages`, `formatTerms`, `formatDomains`, `formatBindings`, `colorTerm`)
- `test/*.test.js` — vitest suite
- `docs/core-api.md` — pointer to core docs, not a copy

## Core dependency

`package.json` declares `"octothorpes": "file:../octothorp.es/packages/core"` —
a file: link to the local core checkout. Implications:

- The CLI always tracks the current state of local core; no version pinning.
- To learn the client surface, read `/Users/nim/dev/octothorp.es/packages/core/client.js`
  (`createClient` returns `get`, `getfast`, `indexSource`, `harmonize`,
  `publish`, `prepare`, `sparql`, `api`, registries).
- The core repo is the reference, treat it as read-only from here.

## Config resolution

`loadConfig()` checks cwd first, then `~/.config/op/`, for:

- `op.config.json` — `instance` (relay URL), optional `termColor`
- `.env` — `SPARQL_ENDPOINT`, `SPARQL_USER`, `SPARQL_PASSWORD` (lowercase variants accepted; `INSTANCE` can substitute for the json key)

Missing instance or endpoint throws with a pointer to `op init`.

## Testing

- Run with `npx vitest run` (not `npm test` / watch mode). Small suite, runs in under a second.
- Pattern (see `test/register.test.js`, `test/get.test.js`): `vi.mock('../lib/client.js')`,
  then `loadConfig.mockResolvedValue({ client: { ...stubbed methods }, config: {} })`;
  spy on `console.log`/`console.error`; stub global `fetch` where a command fetches
  (`vi.stubGlobal('fetch', ...)`). No live SPARQL endpoint or network in tests.

## Conventions

- **Thin commands, logic in core.** Commands translate flags → core client calls → formatted output. No hand-written SPARQL in the CLI: the original `register` command carried its own SPARQL and drifted from core until it was refactored to delegate to core's `createVerifiedOrigin` (see the register-command git history).
- **Don't copy core documentation into this repo.** Point at the core repo and its skills: `/Users/nim/dev/octothorp.es/.claude/skills/octothorpes/` (harmonizers, publishers, query grammar).
- Errors: print `console.error` and `process.exit(1)`; successful output via `console.log`.
- ESM throughout (`"type": "module"`); absolute imports not used — relative paths.
