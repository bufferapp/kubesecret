#!/usr/bin/env node
const program = require('commander');
const { version } = require('../package.json')

process.env.NODE_PATH = `${__dirname}/../node_modules`;

program.version(version);
program.name('kubesecret');
program.usage('\nGet started by running ./kubesecret get -n <namespace>');
program.command('get', 'Starts the process of getting secret(s) and performing operations on it');
program.command('create', 'Starts the process of creating a secret');
program.parse(process.argv);
