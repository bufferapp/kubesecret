/* eslint-disable no-use-before-define */
const inq = require('inquirer');
const shell = require('shelljs');
const {
  green, blue, red, yellow,
} = require('chalk');
const processsecret = require('../processsecret');
const editSecrect = require('../editsecret');
const addKey = require('../addkey');
const deleteKey = require('../deletekey');
const { getCurrentContextNamespace } = require('../kube');

const beginDeletingKey = (chosenSecret) => {
  inq.prompt([
    {
      type: 'rawlist',
      name: 'keyToDelete',
      message: 'Choose a key to delete',
      choices: Object.keys(chosenSecret.data).concat([new inq.Separator(), 'Go back']),
    },
  ]).then((answerA) => {
    switch (answerA.keyToDelete) {
      case 'Go back':
        editGivenSecret({ chosenSecret });
        break;
      default:
        console.log(`${yellow('Deleting the following key and its contents:')}
key name: ${blue(answerA.keyToDelete)}
value: ${blue(chosenSecret.data[answerA.keyToDelete].decoded)}`);
        inq.prompt([
          {
            type: 'confirm',
            message: 'Do you wish to proceeed?:',
            name: 'validationPrompt',
          },
        ]).then((answerB) => {
          if (answerB.validationPrompt) {
            console.log(deleteKey.deleteKey(answerA.keyToDelete, chosenSecret));
          }
          editGivenSecret({ chosenSecret });
        });
        break;
    }
  });
};

const beginAddingKey = (chosenSecret) => {
  inq.prompt([
    {
      type: 'input',
      name: 'newKeyName',
      message: 'Enter new key name:',
    },
  ]).then((answerA) => {
    const validationResult = addKey.validateKey(answerA.newKeyName, chosenSecret);
    if (validationResult.result === 'Valid') {
      inq.prompt([
        {
          type: 'input',
          name: 'newKeyValue',
          message: 'Enter value for new key:',
        },
      ]).then((answerB) => {
        const applyResult = addKey.completeAddingKey(
          answerA.newKeyName,
          answerB.newKeyValue,
          chosenSecret,
        );
        console.log(applyResult);
        editGivenSecret({ chosenSecret });
      });
    } else if (validationResult.result === 'Duplicate key') {
      console.log(yellow(`${answerA.newKeyValue} already exists in ${chosenSecret.metadata.name}. Please enter another key name!`));
      beginAddingKey(chosenSecret);
    } else if (validationResult.result === 'Invalid') {
      console.log(red('Key was invalid. Please ensure it is non empty or does not contain invalid characters'));
      beginAddingKey(chosenSecret);
    }
  });
};

const applyEdit = (chosenSecret, secretKeyChoice, newValue) => {
  const appliedResult = editSecrect.applyEdit({
    secret: chosenSecret,
    updatingKey: secretKeyChoice,
    newValue,
  });
  if (appliedResult.result === 'Failed' && appliedResult.reason === 'Secret has been modified') {
    console.log(`${red('The secret has been modfied since you started editing:')}
${blue('New value:')} ${appliedResult.newSecret.data[secretKeyChoice].decoded}
${green('Value to apply:')} ${appliedResult.newValue}
${yellow('Previous value:')} ${appliedResult.previousValue}`);
    inq.prompt([
      {
        type: 'confirm',
        name: 'proceed',
        message: 'Still go ahead with change? :',
      },
    ]).then((answerA) => {
      if (answerA.proceed) {
        applyEdit(appliedResult.newSecret, secretKeyChoice, newValue);
      } else {
        editGivenSecret({ chosenSecret: appliedResult.newSecret });
      }
    });
  } else if (appliedResult.result === 'Applied') {
    editGivenSecret({ chosenSecret });
  }
};

const editGivenSecretKey = (chosenSecret, secretKeyChoice) => {
  inq.prompt([
    {
      type: 'input',
      name: 'newValue',
      message: `Please input the new value for "${secretKeyChoice}":`,
    },
  ]).then((answerA) => {
    const finalizedSecret = editSecrect.finalizeEdit({
      secret: chosenSecret,
      updatingKey: secretKeyChoice,
      newValue: answerA.newValue,
    });
    console.log(`Here are the changes:
Old value: ${finalizedSecret.oldValue}
New value: ${finalizedSecret.newValue}
`);
    inq.prompt([
      {
        type: 'confirm',
        name: 'proceed',
        message: 'Proceed with change:',
      },
    ]).then((answerB) => {
      if (answerB.proceed) {
        applyEdit(finalizedSecret.secret, finalizedSecret.updatingKey, finalizedSecret.newValue);
      }
    });
  });
};

const editGivenSecret = ({
  chosenSecret,
  secretCreationMode = false,
}) => {
  console.log(blue(`Using ${chosenSecret.metadata.name}`));
  const choices = [
    'Edit a key',
    'Add a key',
    'Delete a key',
  ];
  if (secretCreationMode) {
    choices.push('Complete Creating Secret');
  } else {
    choices.push('Go back');
  }
  inq.prompt([
    {
      type: 'list',
      name: 'editAction',
      choices,
      message: 'What change do you want to make?',
    },
  ]).then((answerA) => {
    switch (answerA.editAction) {
      case 'Edit a key':
        if (Object.keys(chosenSecret.data).length === 0) {
          console.log(red('No data to edit'));
          editGivenSecret({ chosenSecret });
          break;
        } else {
          inq.prompt([
            {
              type: 'rawlist',
              name: 'secretKeyChoice',
              choices: Object.keys(chosenSecret.data).concat('Go back'),
              message: 'Choose a key to edit',
            },
          ]).then((answerB) => {
            switch (answerB.secretKeyChoice) {
              case 'Go back':
                editGivenSecret({ chosenSecret });
                break;
              default:
                editGivenSecretKey(chosenSecret, answerB.secretKeyChoice);
                break;
            }
          });
        }
        break;
      case 'Add a key':
        beginAddingKey(chosenSecret);
        break;
      case 'Delete a key':
        if (Object.keys(chosenSecret.data).length === 0) {
          console.log(red('No keys to delete'));
          editGivenSecret({ chosenSecret });
          break;
        } else {
          beginDeletingKey(chosenSecret);
          break;
        }
      default:
        chooseNextActionWithGivenSecret(chosenSecret);
        break;
    }
  });
};

const chooseNextActionWithGivenSecret = (chosenSecret) => {
  console.log(blue(`Using ${chosenSecret.metadata.name}`));
  inq.prompt([
    {
      type: 'list',
      name: 'retrieveAction',
      choices: [
        'View all keys',
        'View a specific key',
        'Edit secret',
        'Remove secret (TODO)',
        'Exit',
      ],
      message: 'Choose next action:',
    },
  ]).then((specificSecretNextAction) => {
    switch (specificSecretNextAction.retrieveAction) {
      case 'View all keys':
        if (Object.keys(chosenSecret.data).length === 0) {
          console.log(red('This secret has no data. Please add data before viewing :)'));
        } else {
          Object.keys(chosenSecret.data).forEach((secretKey) => {
            console.log(`${green(secretKey)}: ${chosenSecret.data[secretKey].decoded}`);
          });
        }
        chooseNextActionWithGivenSecret(chosenSecret);
        break;
      case 'View a specific key':
        if (Object.keys(chosenSecret.data).length === 0) {
          console.log(red('This secret has no data yet'));
          chooseNextActionWithGivenSecret(chosenSecret);
          break;
        } else {
          inq.prompt([
            {
              type: 'rawlist',
              name: 'secretKeyChoice',
              choices: Object.keys(chosenSecret.data),
              message: 'Choose a key to view',
              pageSize: 200,
            },
          ]).then((specificKeyNextAction) => {
            console.log(`${green('Decoded value')}: ${chosenSecret.data[specificKeyNextAction.secretKeyChoice].decoded}\n`);
            chooseNextActionWithGivenSecret(chosenSecret);
          });
          break;
        }
      case 'Edit secret':
        editGivenSecret({ chosenSecret });
        break;
      default:
        console.log('Bye :)');
        process.exit(0);
    }
  });
};

const beginWithNamespace = async ({
  namespace,
  secretName,
}) => {
  let selectedNamespace = namespace;
  let selectedSecretName = secretName;

  if (!selectedNamespace) {
    selectedNamespace = getCurrentContextNamespace() || 'default';
  }
  console.log(`Namespace: ${selectedNamespace}`);

  const options = namespace ? `-n ${namespace}` : '';
  const kubectlOutput = shell.exec(`kubectl get secrets ${options} -o json`, { silent: true });
  const secrets = processsecret.processSecrets(kubectlOutput);

  if (secrets.result !== 'success') {
    return;
  }

  if (!selectedSecretName) {
    const secretListChoice = await inq.prompt([
      {
        type: 'rawlist',
        name: 'secretName',
        choices: Object.keys(secrets.secrets),
        message: 'Choose a secret to work with:',
        pageSize: 200,
      },
    ]);
    selectedSecretName = secretListChoice.secretName;
  }

  if (!(selectedSecretName in secrets.secrets)) {
    throw new Error(`Secret "${selectedSecretName}" not found in namespace "${selectedNamespace}"`);
  }

  if (selectedSecretName) {
    chooseNextActionWithGivenSecret(secrets.secrets[selectedSecretName]);
  }
};

module.exports = {
  beginWithNamespace,
  chooseNextActionWithGivenSecret,
};
