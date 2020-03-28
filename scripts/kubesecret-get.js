const program = require('commander');
const interactiveget = require('../lib/interactive/retrieve');

program.name('kubesecret get');
program
  .option('-n --namespace <namespace>', 'Namespace to filter by')
  .arguments('[secret-name]')
  .action((secretName) => {
    interactiveget.beginWithNamespace({
      namespace: program.namespace,
      secretName,
    });
  });

program.parse(process.argv);
