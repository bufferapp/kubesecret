const processNamespace = require('../lib/processnamespace');

test('Expect correct value for an empty reply from kubectl', () => {
  const kubernetesOutput = {
    stdout: JSON.stringify({
      apiVersion: 'v1',
      items: [],
      kind: 'List',
      metadata: {
        resourceVersion: '',
        selfLink: '',
      },
    }),
    stderr: '',
  };
  expect(processNamespace.processNamespaces(kubernetesOutput))
    .toEqual({
      result: 'No namespaces found',
      reason: '',
      namespaces: [],
    });
});

test('Expect correct formatting when actual objects are present', () => {
  const kubernetesOutput = {
    stdout: JSON.stringify({
      apiVersion: 'v1',
      items: [
        {
          apiVersion: 'v1',
          kind: 'Namespace',
          metadata: {
            creationTimestamp: '2018-10-16T19:04:45Z',
            name: 'namespace-a',
            resourceVersion: '1',
            selfLink: '/api/v1/namespaces/namespace-a',
            uid: '123456789-1',
          },
          spec: {
            finalizers: [
              'kubernetes',
            ],
          },
          status: {
            phase: 'Active',
          },
        },
        {
          apiVersion: 'v1',
          kind: 'Namespace',
          metadata: {
            creationTimestamp: '2018-10-16T19:04:45Z',
            name: 'namespace-b',
            resourceVersion: '1',
            selfLink: '/api/v1/namespaces/namespace-b',
            uid: '123456789-2',
          },
          spec: {
            finalizers: [
              'kubernetes',
            ],
          },
          status: {
            phase: 'Active',
          },
        },
      ],
      kind: 'List',
      metadata: {
        resourceVersion: '',
        selfLink: '',
      },
    }),
    stderr: '',
  };
  expect(processNamespace.processNamespaces(kubernetesOutput))
    .toEqual({
      result: 'success',
      reason: '',
      namespaces: [
        'namespace-a',
        'namespace-b',
      ],
    });
});
