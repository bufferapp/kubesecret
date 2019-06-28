const kube = require('../lib/kube');

test('Kube converts a secret correctly back to YAML', () => {
  expect(kube.convertSecretToYaml({
    secret: {
      metadata: {
        name: 'a-new-secret',
        namespace: 'test',
      },
      data: {
        asecret: {
          encoded: 'b2xh',
          decoded: 'ola',
        },
        bsecret: {
          encoded: 'd29ybGQ=',
          decoded: 'world',
        },
      },
    },
  }))
    .toEqual(`apiVersion: v1
kind: Secret
type: Opaque
metadata:
  name: a-new-secret
  namespace: test
data:
  asecret: b2xh
  bsecret: d29ybGQ=
`);
});
