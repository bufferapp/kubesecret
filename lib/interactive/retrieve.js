const inq = require('inquirer');
const shell = require('shelljs');
const { green, blue } = require('chalk');
const processsecret = require('../processsecret');

const chooseNextActionWithGivenSecret = (chosenSecret) => {
  console.log(blue(`Using ${chosenSecret.metadata.name}`));
  inq.prompt([
    {
      type: 'list',
      name: 'retrieveAction',
      choices: [
        'View all keys',
        'View a specific key',
        'Edit secret (TODO)',
        'Remove secret (TODO)',
        'Exit',
      ],
      message: 'Choose next action:',
    },
  ]).then((specificSecretNextAction) => {
    switch (specificSecretNextAction.retrieveAction) {
      case 'View all keys':
        Object.keys(chosenSecret.data).forEach((secretKey) => {
          console.log(`${green(secretKey)}: ${chosenSecret.data[secretKey].decoded}`);
        });
        chooseNextActionWithGivenSecret(chosenSecret);
        break;
      case 'View a specific key':
        inq.prompt([
          {
            type: 'rawlist',
            name: 'secretKeyChoice',
            choices: Object.keys(chosenSecret.data),
            message: 'Choose a key to view',
          },
        ]).then((specificKeyNextAction) => {
          console.log(`${green('Decoded value')}: ${chosenSecret.data[specificKeyNextAction.secretKeyChoice].decoded}\n`);
          chooseNextActionWithGivenSecret(chosenSecret);
        });
        break;
      default:
        console.log('Bye :)');
        process.exit(0);
    }
  });
};

const beginWithNamespace = ({
  namespace = 'default',
}) => {
  const kubectlOutput = shell.exec(`kubectl get secrets -n ${namespace} -o json`, { silent: true });
  const secrets = processsecret.processSecrets(kubectlOutput);
  if (secrets.result === 'success') {
    inq.prompt([
      {
        type: 'rawlist',
        name: 'secretName',
        choices: Object.keys(secrets.secrets),
        message: 'Choose a secret to work with:',
        pageSize: 200,
      },
    ]).then((secretListChoice) => {
      chooseNextActionWithGivenSecret(secrets.secrets[secretListChoice.secretName]);
    });
  }
};

module.exports = {
  beginWithNamespace,
};
