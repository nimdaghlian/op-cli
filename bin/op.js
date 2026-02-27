#!/usr/bin/env node

import { program } from 'commander'
import { init } from '../commands/init.js'

program
  .name('op')
  .description('Octothorpes Protocol CLI')
  .version('0.1.0')

program
  .command('init')
  .description('Create OP config files')
  .option('-g, --global', 'Create in ~/.config/op/ instead of current directory')
  .action(init)

program.parse()
