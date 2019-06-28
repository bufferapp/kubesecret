const processNamespaces = (kubectlOutput) => {
  if (kubectlOutput.stderr !== '') {
    return {
      result: 'error',
      reason: kubectlOutput.stderr.trim(),
      namespaces: [],
    };
  }
  const returnedValue = JSON.parse(kubectlOutput.stdout);
  if (returnedValue.items.length === 0) {
    return {
      result: 'No namespaces found',
      reason: '',
      namespaces: [],
    };
  }
  const processedOutput = {
    result: 'success',
    reason: '',
    namespaces: [],
  };
  returnedValue.items.forEach((namespace) => {
    processedOutput.namespaces.push(namespace.metadata.name);
  });
  return processedOutput;
};

module.exports = {
  processNamespaces,
}