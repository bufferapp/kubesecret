/* eslint-disable no-param-reassign */
const kube = require('./kube');

const deleteKey = (keyToDelete, secret) => {
  const secretBeforeDeleting = JSON.stringify(secret);
  delete secret.data[keyToDelete];
  const appliedResult = kube.applySecret({ secret });
  if (appliedResult.result !== 'success') {
    secret = JSON.parse(secretBeforeDeleting);
  }
  return appliedResult;
};

module.exports = {
  deleteKey,
};
