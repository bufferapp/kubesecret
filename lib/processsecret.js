const processSecrets = (kubectlOutput) => {
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
          name: secret.metadata.name,
          namespace: secret.metadata.namespace,
          labels: secret.metadata.labels,
        },
        data: {},
      };
      if ('data' in secret) {
        Object.keys(secret.data).forEach((singleSecret) => {
          const secretInformation = secret.data[singleSecret];
          processedOutput.secrets[secret.metadata.name].data[singleSecret] = {
            encoded: secretInformation,
            decoded: Buffer.from(secretInformation, 'base64').toString(),
          };
        });
      } else {
        processedOutput.secrets[secret.metadata.name].data = {};
      }
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

const processSingleSecret = (kubectlOutput) => {
  if (kubectlOutput.stderr !== '') {
    return {
      result: 'error',
      reason: kubectlOutput.stderr.trim(),
      secret: {},
    };
  }
  const secret = JSON.parse(kubectlOutput.stdout);
  const processedOutput = {
    metadata: {
      name: secret.metadata.name,
      namespace: secret.metadata.namespace,
      labels: secret.metadata.labels,
    },
    data: {},
  };
  if ('data' in secret) {
    Object.keys(secret.data).forEach((singleSecret) => {
      const secretInformation = secret.data[singleSecret];
      processedOutput.data[singleSecret] = {
        encoded: secretInformation,
        decoded: Buffer.from(secretInformation, 'base64').toString(),
      };
    });
  }
  return {
    result: 'success',
    reason: '',
    secret: processedOutput,
  };
};

module.exports = {
  processSecrets,
  processSingleSecret,
};
