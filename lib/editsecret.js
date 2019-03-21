/* eslint-disable no-param-reassign */
const kube = require('./kube');

const finalizeEdit = ({
  secret,
  updatingKey,
  newValue,
}) => {
  const finalValue = newValue.trim();
  let notes = '';
  if (finalValue.length < newValue.length) {
    notes = 'Trimmed spaces and newlines before applying';
  }
  return {
    secret,
    updatingKey,
    oldValue: secret.data[updatingKey].decoded,
    newValue: finalValue,
    notes,
  };
};

const applyEdit = ({
  secret,
  updatingKey,
  newValue,
}) => {
  const currentSecretValue = kube.getSingleSecret({
    namespace: secret.metadata.namespace,
    name: secret.metadata.name,
  });
  if (currentSecretValue.secret.data[updatingKey].decoded === secret.data[updatingKey].decoded) {
    secret.data[updatingKey].decoded = newValue;
    secret.data[updatingKey].encoded = Buffer.from(newValue).toString('base64');
    const appliedResult = kube.applySecret({
      secret,
    });
    return { result: 'Applied' };
  }
  return {
    result: 'Failed',
    reason: 'Secret has been modified',
    newSecret: currentSecretValue.secret,
    updatingKey: 'asecret',
    newValue: 'hi',
    previousValue: 'hello',
  };
};

module.exports = {
  finalizeEdit,
  applyEdit,
};
