const kube = require('./kube');

const validateKey = (keyToAdd, secret) => {
  if (keyToAdd in secret.data) {
    return { result: 'Duplicate key' };
  }
  if (keyToAdd.trim() === '' || keyToAdd.trim().indexOf(' ') !== -1) {
    return { result: 'Invalid' };
  }
  return { result: 'Valid' };
};

const completeAddingKey = (keyToAdd, valueToAssign, secret) => {
  // eslint-disable-next-line no-param-reassign
  secret.data[keyToAdd] = {
    decoded: valueToAssign,
    encoded: Buffer.from(valueToAssign).toString('base64'),
  };
  return kube.applySecret({ secret });
};

module.exports = {
  validateKey,
  completeAddingKey,
};
