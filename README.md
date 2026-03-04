# op-cli

Command-line interface for the [Octothorpes Protocol](https://octothorp.es/). Alpha release.

## Prerequisites

- Node.js 18+
- Access to an OP instance (local or hosted)
- A SPARQL endpoint (e.g. [Oxigraph](https://github.com/oxigraph/oxigraph))

## Install

```sh
git clone <this repo>
cd op-cli
npm install
npm link   # makes `op` available globally
```

## Setup

Run the interactive setup to create your config files:

```sh
op init           # creates op.config.json and .env in the current directory
op init --global  # creates config in ~/.config/op/ (applies everywhere)
```

You'll be prompted for:
- Your OP instance URL (e.g. `https://octothorp.es/` or `http://localhost:5173/`)
- SPARQL endpoint, username, and password

Or create the files manually:

**`.env`**
```
sparql_endpoint=http://0.0.0.0:7878
sparql_user=youruser
sparql_password=yourpassword
instance=http://localhost:5173/
```

**`op.config.json`**
```json
{
  "instance": "http://localhost:5173/"
}
```

Config in the current directory takes precedence over global config.

## Commands

### `op get <what> <by>`

Query indexed data.

```sh
op get everything thorped                  # all thorped content
op get everything thorped -o demo          # filter by object "demo"
op get pages posted -s https://example.com # pages posted by a subject
op get terms used --limit 50
```

**`<what>`** options: `everything`, `pages`, `terms`, `domains`
**`<by>`** options: `thorped`, `posted`, `used`, etc.

Options: `-s`, `-o`, `--not-s`, `--not-o`, `--match`, `--limit`, `--offset`, `--when`, `--raw`

Default limit: 100.

---

### `op fast <method> [value]`

Fast queries that return raw SPARQL bindings.

```sh
op fast terms
op fast term "#news"
op fast domains
op fast domain "example.com"
op fast backlinks
op fast bookmarks
```

Options: `--limit`, `--raw`

---

### `op index <url>`

Fetch a page and index its metadata into the SPARQL store.

```sh
op index https://example.com/my-post
op index https://example.com/my-post --harmonizer openGraph
```

Harmonizer options: `default`, `openGraph`, `ghost`, or a URL pointing to a custom harmonizer schema.

---

### `op harmonize <url>`

Preview what metadata would be extracted from a URL, without indexing it.

```sh
op harmonize https://example.com/my-post
op harmonize https://example.com/my-post --raw   # JSON output
```

---

### `op register <domain>`

Mark a domain as a verified origin in the SPARQL store.

```sh
op register https://example.com
```

---

## Troubleshooting

- Run any command with `--raw` to see the underlying data.
- Check `docs/core-api.md` for details on the query and harmonization system.
