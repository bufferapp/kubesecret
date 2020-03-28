const program = require('commander');
const interactiveget = require('../lib/interactive/retrieve');
const { red } = require('chalk');

program.name('kubesecret get');
program
  .option('-n --namespace <namespace>', 'Namespace to filter by')
  .arguments('[secret-name]')
  .action(async (secretName) => {
    try {
      await interactiveget.beginWithNamespace({
        namespace: program.namespace,
        secretName,
      });
    } catch (err) {
      console.log(red(`${err.message}`));
      process.exit(1);
    }
  });

program.parse(process.argv);
