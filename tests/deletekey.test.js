const deleteKey = require('../lib/deletekey');

jest.mock('../lib/kube');
const kube = require('../lib/kube');

const secretToTest = {
  metadata: {
    name: 'test',
    namespace: 'testing-ns',
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
};

test('Expect valid flow on deleting key', () => {
  kube.applySecret.mockReturnValueOnce({
    result: 'success',
  });
  expect(deleteKey.deleteKey('bsecret', secretToTest))
    .toEqual({ result: 'success' });
});
