const program = require('commander');
const interactiveget = require('../lib/interactive/retrieve');

program.name('kubesecret get');
program
  .option('-n --namespace <namespace>', 'Namespace to filter by')
  .arguments('[secret-name]')
  .action((secretName) => {
    console.log(`Working with namespace ${program.namespace}`);
    interactiveget.beginWithNamespace({ namespace: program.namespace });
  });

program.parse(process.argv);
