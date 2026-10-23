#!/usr/bin/env node

import { program } from 'commander'
import { init } from '../commands/init.js'
import { get } from '../commands/get.js'
import { fast } from '../commands/fast.js'
import { index } from '../commands/index.js'
import { harmonize } from '../commands/harmonize.js'
import { register } from '../commands/register.js'
import { describe } from '../commands/describe.js'

program
  .name('op')
  .description('Octothorpes Protocol CLI')
  .version('0.1.0')

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
  .option('--as <format>', 'Render via a core publisher (e.g. rss) or debug format (debug, multipass)')
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
  .action(index)

program
  .command('harmonize <url>')
  .description('Fetch and harmonize a URL without indexing (inspect extracted metadata)')
  .option('--harmonizer <name>', 'Harmonizer to use (default, openGraph, ghost, or URL)', 'default')
  .option('--raw', 'Output raw JSON')
  .action(harmonize)

program
  .command('register <domain>')
  .description('Register a domain as a verified origin')
  .action(register)

program
  .command('describe <uri>')
  .description('List all predicate/object pairs for a URI (debug)')
  .action(describe)

program.parse()
