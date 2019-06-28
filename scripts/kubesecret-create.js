const program = require('commander');
const interactiveCreate = require('../lib/interactive/create.js');

program.name('kubesecret create');

program.parse(process.argv);
interactiveCreate.beginCreate();
