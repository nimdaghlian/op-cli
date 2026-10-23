#!/usr/bin/env node

import { program } from 'commander'
import { init } from '../commands/init.js'
import { get } from '../commands/get.js'
import { fast } from '../commands/fast.js'
import { index } from '../commands/index.js'
import { harmonize } from '../commands/harmonize.js'
import { register } from '../commands/register.js'
import { describe } from '../commands/describe.js'
import { publish } from '../commands/publish.js'

program
  .name('op')
  .description('Octothorpes Protocol CLI')
  .version('0.2.0')

program
  .command('init')
  .description('Create OP config files')
  .option('-g, --global', 'Create in ~/.config/op/ instead of current directory')
  .action(init)

program
  .command('get <what> <by>')
  .description('Query indexed data (e.g. op get everything thorped -o demo)')
  .option('-s <subjects>', 'Subject filter (comma-separated)')
  .option('-o <objects>', 'Object filter (comma-separated)')
  .option('--not-s <subjects>', 'Exclude subjects')
  .option('--not-o <objects>', 'Exclude objects')
  .option('--match <strategy>', 'Matching strategy (exact, fuzzy, fuzzy-s, fuzzy-o, very-fuzzy-o)')
  .option('--limit <n>', 'Max results (default: 100)')
  .option('--offset <n>', 'Skip N results')
  .option('--when <filter>', 'Date filter (recent, after-DATE, before-DATE, between-DATE-and-DATE)')
  .option('--as <format>', 'Output format: render via a core publisher (e.g. rss) or debug format (debug, multipass). Not the harmonizer alias — see `op index --as`')
  .option('--raw', 'Output raw JSON')
  .action(get)

program
  .command('fast <method> [value]')
  .description('Fast SPARQL queries (terms, term <name>, domains, domain <uri>, backlinks, bookmarks)')
  .option('--limit <n>', 'Max results (default: 100)')
  .option('--raw', 'Output raw JSON')
  .action(fast)

program
  .command('index <uri>')
  .description('Index a page')
  .option('--harmonizer <name>', 'Harmonizer to use (default, openGraph, ghost, or URL)')
  .option('--as <name>', "Alias for --harmonizer, matching the relay's /index?as= param (unlike `op get --as`, which picks an output format)")
  .action(index)

program
  .command('harmonize <url>')
  .description('Fetch and harmonize a URL without indexing (inspect extracted metadata)')
  .option('--harmonizer <name>', 'Harmonizer to use (default, openGraph, ghost, or URL)')
  .option('--as <name>', "Alias for --harmonizer, matching the relay's /index?as= param (unlike `op get --as`, which picks an output format)")
  .option('--raw', 'Output raw JSON')
  .action(harmonize)

program
  .command('publish <publisher> [what] [by]')
  .description('Render a query or a single page through a core publisher (e.g. op publish rss everything thorped -o demo)')
  .option('--uri <url>', 'Publish one page: fetch, harmonize, and render it instead of running a query')
  .option('--harmonizer <name>', 'Harmonizer for --uri mode (default, openGraph, ghost, or URL)')
  .option('-s <subjects>', 'Subject filter (comma-separated)')
  .option('-o <objects>', 'Object filter (comma-separated)')
  .option('--not-s <subjects>', 'Exclude subjects')
  .option('--not-o <objects>', 'Exclude objects')
  .option('--match <strategy>', 'Matching strategy (exact, fuzzy, fuzzy-s, fuzzy-o, very-fuzzy-o)')
  .option('--limit <n>', 'Max results (default: 100)')
  .option('--offset <n>', 'Skip N results')
  .option('--when <filter>', 'Date filter (recent, after-DATE, before-DATE, between-DATE-and-DATE)')
  .option('--title <title>', 'Feed envelope title')
  .option('--link <url>', 'Feed envelope link')
  .option('--description <text>', 'Feed envelope description')
  .action(publish)

program
  .command('register <domain>')
  .description('Register a domain as a verified origin')
  .action(register)

program
  .command('describe <uri>')
  .description('List all predicate/object pairs for a URI (debug)')
  .action(describe)

program.parse()
