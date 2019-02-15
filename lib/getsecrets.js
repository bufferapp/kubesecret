const getSecrets = (kubectlOutput) => {
  if (kubectlOutput.stderr !== '') {
    return {
      result: 'error',
      reason: kubectlOutput.stderr.trim(),
      secrets: {},
    };
  }
  const returnedValue = JSON.parse(kubectlOutput.stdout);
  if (returnedValue.items.length === 0) {
    return {
      result: 'No secrets found',
      reason: '',
      secrets: {},
    };
  }
  const processedOutput = {
    result: 'success',
    reason: '',
    secrets: {},
  };
  returnedValue.items.forEach((secret) => {
    if (secret.type === 'Opaque') {
      processedOutput.secrets[secret.metadata.name] = {
        metadata: {
          namespace: secret.metadata.namespace,
        },
        data: {},
      };
      Object.keys(secret.data).forEach((singleSecret) => {
        const secretInformation = secret.data[singleSecret];
        processedOutput.secrets[secret.metadata.name].data[singleSecret] = {
          encoded: secretInformation,
          decoded: Buffer.from(secretInformation, 'base64').toString(),
        };
      });
    }
  });
  if (Object.keys(processedOutput.secrets).length === 0) {
    return {
      result: 'error',
      reason: 'No Opaque type secrets found',
      secrets: {},
    };
  }
  return processedOutput;
};

module.exports = {
  getSecrets,
};
