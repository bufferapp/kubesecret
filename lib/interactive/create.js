/* eslint-disable no-use-before-define */
const inq = require('inquirer');
const shell = require('shelljs');
const {
  green, blue, red, yellow,
} = require('chalk');
const processsecret = require('../processsecret');
const kube = require('../kube');
const processNamespaces = require('../processnamespace');
const interactiveGet = require('./retrieve');

const getBasicSecretDetails = async (namespaceList) => {
  const secretPrep = await inq.prompt([
    {
      type: 'rawlist',
      name: 'namespaceToCreateSecretIn',
      message: 'Choose a namespace to create the secret in',
      choices: namespaceList.namespaces,
    },
    {
      type: 'input',
      name: 'secretName',
      message: 'Give your secret a name (must match regex /^[a-zA-Z][a-zA-Z0-9\\-]+[a-zA-Z0-9]$/)',
      validate: userInput => /^[a-zA-Z][a-zA-Z0-9\-]+[a-zA-Z0-9]$/.exec(userInput) !== null,
    },
  ]);
  console.log(green(`Below are the details you entered:

Namespace:   ${secretPrep.namespaceToCreateSecretIn}
Secret Name: ${secretPrep.secretName}`));
  const repeatDetails = await inq.prompt([
    {
      type: 'confirm',
      name: 'repeatDetailsChoice',
      message: 'Do you wish to proceed?',
    },
  ]);
  if (!repeatDetails.repeatDetailsChoice) {
    return getBasicSecretDetails(namespaceList);
  }
  console.log('Checking if secret already exists');
  const kubectlSecretOutput = shell.exec(`kubectl get secrets -n ${secretPrep.namespaceToCreateSecretIn} -o json`, { silent: true });
  const secrets = processsecret.processSecrets(kubectlSecretOutput);
  let secretExists = false;
  Object.keys(secrets.secrets).forEach((secretName) => {
    if (secretName === secretPrep.secretName) {
      secretExists = true;
    }
  });
  if (secretExists) {
    console.log(red('Secret already exists. Please choose another secret name'));
    return getBasicSecretDetails(namespaceList);
  }
  return secretPrep;
};

const beginCreate = async () => {
  console.log('Getting a list of namespaces');
  const kubectlNamespaceOutput = shell.exec('kubectl get namespaces -o json', { silent: true });
  const namespaceList = processNamespaces.processNamespaces(kubectlNamespaceOutput);
  const secretPrep = await getBasicSecretDetails(namespaceList);
  console.log('Creating secret with placeholder');
  const secretToCreate = {
    metadata: {
      name: secretPrep.secretName,
      namespace: secretPrep.namespaceToCreateSecretIn,
    },
    data: {
      temporaryPlaceHolder: {
        encoded: 'dGVtcA==',
        decoded: 'temp',
      },
    },
  };
  kube.applySecret({
    secret: secretToCreate,
  });
  interactiveGet.chooseNextActionWithGivenSecret(secretToCreate);
};

module.exports = {
  beginCreate,
};
