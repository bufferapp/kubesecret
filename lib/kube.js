const shell = require('shelljs');
const yaml = require('js-yaml');
const fs = require('fs');
const processSecret = require('./processsecret');

const getCurrentContextNamespace = () =>
  shell.exec('kubectl config view --minify --output \'jsonpath={..namespace}\'', { silent: true });

const getSingleSecret = ({
  namespace,
  name,
}) => processSecret.processSingleSecret(shell.exec(`kubectl get secret/${name} -n ${namespace} -o json`, { silent: true }));

const convertSecretToYaml = ({
  secret,
}) => {
  const secretToConvert = {
    apiVersion: 'v1',
    kind: 'Secret',
    type: 'Opaque',
    metadata: {
      name: '',
      namespace: '',
    },
    data: {},
  };
  secretToConvert.metadata.name = secret.metadata.name;
  secretToConvert.metadata.namespace = secret.metadata.namespace;
  if (typeof secret.metadata.labels !== 'undefined') {
    secretToConvert.metadata.labels = {};
    Object.keys(secret.metadata.labels).forEach((label) => {
      secretToConvert.metadata.labels[label] = secret.metadata.labels[label];
    });
  }
  Object.keys(secret.data).forEach((secretKey) => {
    secretToConvert.data[secretKey] = secret.data[secretKey].encoded;
  });
  return yaml.safeDump(secretToConvert);
};

const applySecret = ({
  secret,
}) => {
  const secretInYamlForm = convertSecretToYaml({ secret });
  console.log(`Applying:

${secretInYamlForm}`);
  fs.writeFileSync(`.tmp${secret.metadata.name}.yaml`, secretInYamlForm);
  shell.exec(`kubectl apply -f .tmp${secret.metadata.name}.yaml`);
  fs.unlinkSync(`.tmp${secret.metadata.name}.yaml`);
  return { result: 'success' };
};

module.exports = {
  getCurrentContextNamespace,
  getSingleSecret,
  applySecret,
  convertSecretToYaml,
};
