const shell = require('shelljs');
const yaml = require('js-yaml');

const getResource = ({
  namespace,
  name,
}) => 2;

const convertSecretToYaml = ({
  secret,
}) => {
  const secretToConvert = {
    apiVersion: 'v1',
    kind: 'Secret',
    metadata: {
      name: '',
      namespace: '',
      type: 'Opaque',
    },
    data: {},
  };
  secretToConvert.metadata.name = secret.metadata.name;
  secretToConvert.metadata.namespace = secret.metadata.name;
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
  const secretInYamlForm = convertSecretToYaml(secret);
  return { result: 'success' }
};

module.exports = {
  getResource,
  applySecret,
  convertSecretToYaml,
};
