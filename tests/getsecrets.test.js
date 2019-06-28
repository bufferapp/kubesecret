const processsecret = require('../lib/processsecret.js');

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
  expect(processsecret.processSecrets(kubernetesOutput))
    .toEqual({
      result: 'No secrets found',
      reason: '',
      secrets: {},
    });
});

test('Expect notifying of error', () => {
  const kubernetesOutput = {
    stdout: '',
    stderr: 'Unable to connect to the server: dial tcp 111.111.111.111:443: i/o timeout\n',
  };
  expect(processsecret.processSecrets(kubernetesOutput))
    .toEqual({
      result: 'error',
      reason: 'Unable to connect to the server: dial tcp 111.111.111.111:443: i/o timeout',
      secrets: {},
    });
});

test('Expect correct formatting when actual objects are present', () => {
  const kubernetesOutput = {
    stdout: JSON.stringify({
      apiVersion: 'v1',
      items: [
        {
          apiVersion: 'v1',
          data: {
            'callback-url': 'aHR0cHM6Ly9leGFtcGxlLmNvbS9hdXRoL2NhbGxiYWNr',
            'client-id': 'aGVsbG93b3JsZC5hcHBzLm15Y29udGVudC5jb20=',
            'client-secret': 'SGtqbGxramFkZkhkc2FmOTh1MzJrZjQ=',
          },
          kind: 'Secret',
          metadata: {
            creationTimestamp: '2017-07-12T08:52:51Z',
            name: 'test-a',
            namespace: 'test',
            resourceVersion: '10947437',
            selfLink: '/api/v1/namespaces/test/secrets/test-a',
            uid: '123456789-1',
          },
          type: 'Opaque',
        },
        {
          apiVersion: 'v1',
          data: {
            'email-key': 'YTAza24zMDFrYjkzbjEzMDI4ZDM3OTg=',
          },
          kind: 'Secret',
          metadata: {
            creationTimestamp: '2017-11-10T21:14:32Z',
            name: 'test-b',
            namespace: 'test',
            resourceVersion: '34202325',
            selfLink: '/api/v1/namespaces/test/secrets/test-b',
            uid: '123456789-2',
          },
          type: 'Opaque',
        },
        {
          apiVersion: 'v1',
          data: {
            'minimum-review-bot.private-key.pem': 'VGhpcyBjZXJ0IGRvZXMgbm90IGV4aXN0',
          },
          kind: 'Secret',
          metadata: {
            creationTimestamp: '2018-07-31T22:43:50Z',
            name: 'test-c',
            namespace: 'test',
            resourceVersion: '237223584',
            selfLink: '/api/v1/namespaces/test/secrets/test-c',
            uid: '123456789-6',
          },
          type: 'Opaque',
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
  const expectedOutput = {
    result: 'success',
    reason: '',
    secrets: {
      'test-a': {
        metadata: {
          name: 'test-a',
          namespace: 'test',
        },
        data: {
          'callback-url': {
            encoded: 'aHR0cHM6Ly9leGFtcGxlLmNvbS9hdXRoL2NhbGxiYWNr',
            decoded: 'https://example.com/auth/callback',
          },
          'client-id': {
            encoded: 'aGVsbG93b3JsZC5hcHBzLm15Y29udGVudC5jb20=',
            decoded: 'helloworld.apps.mycontent.com',
          },
          'client-secret': {
            encoded: 'SGtqbGxramFkZkhkc2FmOTh1MzJrZjQ=',
            decoded: 'HkjllkjadfHdsaf98u32kf4',
          },
        },
      },
      'test-b': {
        metadata: {
          name: 'test-b',
          namespace: 'test',
        },
        data: {
          'email-key': {
            encoded: 'YTAza24zMDFrYjkzbjEzMDI4ZDM3OTg=',
            decoded: 'a03kn301kb93n13028d3798',
          },
        },
      },
      'test-c': {
        metadata: {
          name: 'test-c',
          namespace: 'test',
        },
        data: {
          'minimum-review-bot.private-key.pem': {
            encoded: 'VGhpcyBjZXJ0IGRvZXMgbm90IGV4aXN0',
            decoded: 'This cert does not exist',
          },
        },
      },
    },
  };
  expect(processsecret.processSecrets(kubernetesOutput))
    .toEqual(expectedOutput);
});

test('Expect non Opaque type secrets to be excluded', () => {
  const kubernetesOutput = {
    stdout: JSON.stringify({
      apiVersion: 'v1',
      items: [
        {
          apiVersion: 'v1',
          data: {
            'callback-url': 'aHR0cHM6Ly9leGFtcGxlLmNvbS9hdXRoL2NhbGxiYWNr',
            'client-id': 'aGVsbG93b3JsZC5hcHBzLm15Y29udGVudC5jb20=',
            'client-secret': 'SGtqbGxramFkZkhkc2FmOTh1MzJrZjQ=',
          },
          kind: 'Secret',
          metadata: {
            creationTimestamp: '2017-07-12T08:52:51Z',
            name: 'test-a',
            namespace: 'test',
            resourceVersion: '10947437',
            selfLink: '/api/v1/namespaces/test/secrets/test-a',
            uid: '123456789-1',
          },
          type: 'Opaque',
        },
        {
          apiVersion: 'v1',
          data: {
            'email-key': 'YTAza24zMDFrYjkzbjEzMDI4ZDM3OTg=',
          },
          kind: 'Secret',
          metadata: {
            creationTimestamp: '2017-11-10T21:14:32Z',
            name: 'test-b',
            namespace: 'test',
            resourceVersion: '34202325',
            selfLink: '/api/v1/namespaces/test/secrets/test-b',
            uid: '123456789-2',
          },
          type: 'Opaque',
        },
        {
          apiVersion: 'v1',
          data: {
            'ca.crt': 'VGhpcyBjZXJ0IGRvZXMgbm90IGV4aXN0',
            namespace: 'dGVzdA==',
            token: 'QW5kIHRoaXMgdG9rZW4gZG9lcyBub3QgZXhpc3QgZWl0aGVyLiBObyBsZWFrcyBoZXJlIDpE',
          },
          kind: 'Secret',
          metadata: {
            annotations: {
              'kubernetes.io/service-account.name': 'default',
              'kubernetes.io/service-account.uid': '123456789-3',
            },
            creationTimestamp: '2017-07-11T15:41:26Z',
            name: 'default-token-abc3h',
            namespace: 'test',
            resourceVersion: '12240245',
            selfLink: '/api/v1/namespaces/test/secrets/default-token-abc3h',
            uid: '123456789-3',
          },
          type: 'kubernetes.io/service-account-token',
        },
        {
          apiVersion: 'v1',
          data: {
            '.dockerconfigjson': 'eyJhdXRocyI6eyJodHRwczovL2luZGV4LmRvY2tlci5pby92MS8iOnsidXNlcm5hbWUiOiJub3RyZWFsIiwicGFzc3dvcmQiOiJ0aGlzaXNub3RyZWFsZWl0aGVyIiwiZW1haWwiOiJub3RhcmVhbGFjY291bnRAbm90YXJlYWxkb21haW4uY29tIiwiYXV0aCI6Im5vdGFyZWFsYXV0aGVpdGhlciJ9fX0==',
          },
          kind: 'Secret',
          metadata: {
            creationTimestamp: '2019-01-23T19:37:49Z',
            name: 'dhtoken',
            namespace: 'test',
            resourceVersion: '122803456',
            selfLink: '/api/v1/namespaces/te/secrets/dhtoken',
            uid: '123456789-4',
          },
          type: 'kubernetes.io/dockerconfigjson',
        },
        {
          apiVersion: 'v1',
          data: {
            'cert-chain.pem': 'VGhpcyBjZXJ0IGRvZXMgbm90IGV4aXN0',
            'key.pem': 'VGhpcyBjZXJ0IGRvZXMgbm90IGV4aXN0',
            'root-cert.pem': 'VGhpcyBjZXJ0IGRvZXMgbm90IGV4aXN0',
          },
          kind: 'Secret',
          metadata: {
            annotations: {
              'istio.io/service-account.name': 'default',
            },
            creationTimestamp: '2018-02-14T23:44:58Z',
            name: 'istio.default',
            namespace: 'test',
            resourceVersion: '462102150',
            selfLink: '/api/v1/namespaces/test/secrets/istio.default',
            uid: '123456789-5',
          },
          type: 'istio.io/key-and-cert',
        },
        {
          apiVersion: 'v1',
          data: {
            'minimum-review-bot.private-key.pem': 'VGhpcyBjZXJ0IGRvZXMgbm90IGV4aXN0',
          },
          kind: 'Secret',
          metadata: {
            creationTimestamp: '2018-07-31T22:43:50Z',
            name: 'test-c',
            namespace: 'test',
            resourceVersion: '237223584',
            selfLink: '/api/v1/namespaces/test/secrets/test-c',
            uid: '123456789-6',
          },
          type: 'Opaque',
        },
        {
          apiVersion: 'v1',
          data: {},
          kind: 'Secret',
          metadata: {
            creationTimestamp: '2017-11-10T21:14:32Z',
            name: 'test-d',
            namespace: 'test',
            resourceVersion: '237223521',
            selfLink: '/api/v1/namespaces/test/secrets/test-d',
            uid: '123456789-7',
          },
          type: 'Opaque',
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
  const expectedOutput = {
    result: 'success',
    reason: '',
    secrets: {
      'test-a': {
        metadata: {
          name: 'test-a',
          namespace: 'test',
        },
        data: {
          'callback-url': {
            encoded: 'aHR0cHM6Ly9leGFtcGxlLmNvbS9hdXRoL2NhbGxiYWNr',
            decoded: 'https://example.com/auth/callback',
          },
          'client-id': {
            encoded: 'aGVsbG93b3JsZC5hcHBzLm15Y29udGVudC5jb20=',
            decoded: 'helloworld.apps.mycontent.com',
          },
          'client-secret': {
            encoded: 'SGtqbGxramFkZkhkc2FmOTh1MzJrZjQ=',
            decoded: 'HkjllkjadfHdsaf98u32kf4',
          },
        },
      },
      'test-b': {
        metadata: {
          name: 'test-b',
          namespace: 'test',
        },
        data: {
          'email-key': {
            encoded: 'YTAza24zMDFrYjkzbjEzMDI4ZDM3OTg=',
            decoded: 'a03kn301kb93n13028d3798',
          },
        },
      },
      'test-c': {
        metadata: {
          name: 'test-c',
          namespace: 'test',
        },
        data: {
          'minimum-review-bot.private-key.pem': {
            encoded: 'VGhpcyBjZXJ0IGRvZXMgbm90IGV4aXN0',
            decoded: 'This cert does not exist',
          },
        },
      },
      'test-d': {
        metadata: {
          name: 'test-d',
          namespace: 'test',
        },
        data: {
        },
      },
    },
  };
  expect(processsecret.processSecrets(kubernetesOutput))
    .toEqual(expectedOutput);
});

test('Expect to be alerted when no Opaque secrets are present', () => {
  const kubernetesOutput = {
    stdout: JSON.stringify({
      apiVersion: 'v1',
      items: [
        {
          apiVersion: 'v1',
          data: {
            'ca.crt': 'VGhpcyBjZXJ0IGRvZXMgbm90IGV4aXN0',
            namespace: 'dGVzdA==',
            token: 'QW5kIHRoaXMgdG9rZW4gZG9lcyBub3QgZXhpc3QgZWl0aGVyLiBObyBsZWFrcyBoZXJlIDpE',
          },
          kind: 'Secret',
          metadata: {
            annotations: {
              'kubernetes.io/service-account.name': 'default',
              'kubernetes.io/service-account.uid': '123456789-3',
            },
            creationTimestamp: '2017-07-11T15:41:26Z',
            name: 'default-token-abc3h',
            namespace: 'test',
            resourceVersion: '12240245',
            selfLink: '/api/v1/namespaces/test/secrets/default-token-abc3h',
            uid: '123456789-3',
          },
          type: 'kubernetes.io/service-account-token',
        },
        {
          apiVersion: 'v1',
          data: {
            '.dockerconfigjson': 'eyJhdXRocyI6eyJodHRwczovL2luZGV4LmRvY2tlci5pby92MS8iOnsidXNlcm5hbWUiOiJub3RyZWFsIiwicGFzc3dvcmQiOiJ0aGlzaXNub3RyZWFsZWl0aGVyIiwiZW1haWwiOiJub3RhcmVhbGFjY291bnRAbm90YXJlYWxkb21haW4uY29tIiwiYXV0aCI6Im5vdGFyZWFsYXV0aGVpdGhlciJ9fX0==',
          },
          kind: 'Secret',
          metadata: {
            creationTimestamp: '2019-01-23T19:37:49Z',
            name: 'dhtoken',
            namespace: 'test',
            resourceVersion: '122803456',
            selfLink: '/api/v1/namespaces/te/secrets/dhtoken',
            uid: '123456789-4',
          },
          type: 'kubernetes.io/dockerconfigjson',
        },
        {
          apiVersion: 'v1',
          data: {
            'cert-chain.pem': 'VGhpcyBjZXJ0IGRvZXMgbm90IGV4aXN0',
            'key.pem': 'VGhpcyBjZXJ0IGRvZXMgbm90IGV4aXN0',
            'root-cert.pem': 'VGhpcyBjZXJ0IGRvZXMgbm90IGV4aXN0',
          },
          kind: 'Secret',
          metadata: {
            annotations: {
              'istio.io/service-account.name': 'default',
            },
            creationTimestamp: '2018-02-14T23:44:58Z',
            name: 'istio.default',
            namespace: 'test',
            resourceVersion: '462102150',
            selfLink: '/api/v1/namespaces/test/secrets/istio.default',
            uid: '123456789-5',
          },
          type: 'istio.io/key-and-cert',
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
  const expectedOutput = {
    result: 'error',
    reason: 'No Opaque type secrets found',
    secrets: {},
  };
  expect(processsecret.processSecrets(kubernetesOutput))
    .toEqual(expectedOutput);
});


test('Expect correct error message when secret does not exist', () => {
  const kubernetesOutput = {
    stdout: '',
    stderr: 'Error from server (NotFound): secrets "a-new-secreta" not found\n',
  };
  expect(processsecret.processSingleSecret(kubernetesOutput))
    .toEqual({
      result: 'error',
      reason: 'Error from server (NotFound): secrets "a-new-secreta" not found',
      secret: {},
    });
});

test('Expect single secret to be processed correctly', () => {
  const kubernetesOutput = {
    stdout: JSON.stringify({
      apiVersion: 'v1',
      data: {
        asecret: 'aGVsbG8=',
        bsecret: 'd29ybGQ=',
      },
      kind: 'Secret',
      metadata: {
        annotations: {
          'kubectl.kubernetes.io/last-applied-configuration': '{"apiVersion":"v1","data":{"asecret":"aGVsbG8=","bsecret":"d29ybGQ="},"kind":"Secret","metadata":{"annotations":{},"name":"a-new-secret","namespace":"test"},"type":"Opaque"}\n',
        },
        creationTimestamp: '2019-02-12T00:23:46Z',
        name: 'a-new-secret',
        namespace: 'test',
        resourceVersion: '362323657',
        selfLink: '/api/v1/namespaces/test/secrets/a-new-secret',
        uid: '123456789-1',
      },
      type: 'Opaque',
    }),
    stderr: '',
  };
  const expectedResult = {
    result: 'success',
    reason: '',
    secret: {
      metadata: {
        name: 'a-new-secret',
        namespace: 'test',
      },
      data: {
        asecret: {
          encoded: 'aGVsbG8=',
          decoded: 'hello',
        },
        bsecret: {
          encoded: 'd29ybGQ=',
          decoded: 'world',
        },
      },
    },
  };
  expect(processsecret.processSingleSecret(kubernetesOutput))
    .toEqual(expectedResult);
});

test('Expect single secret with no data to be processed correctly', () => {
  const kubernetesOutput = {
    stdout: JSON.stringify({
      apiVersion: 'v1',
      kind: 'Secret',
      metadata: {
        creationTimestamp: '2019-02-12T00:23:46Z',
        name: 'a-new-secret',
        namespace: 'test',
        resourceVersion: '362323657',
        selfLink: '/api/v1/namespaces/test/secrets/a-new-secret',
        uid: '123456789-1',
      },
      type: 'Opaque',
    }),
    stderr: '',
  };
  const expectedResult = {
    result: 'success',
    reason: '',
    secret: {
      metadata: {
        name: 'a-new-secret',
        namespace: 'test',
      },
      data: {},
    },
  };
  expect(processsecret.processSingleSecret(kubernetesOutput))
    .toEqual(expectedResult);
});
