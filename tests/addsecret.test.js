const addKey = require('../lib/addkey');

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

test('Expect secret key to return valid result if key is valid', () => {
  expect(addKey.validateKey('a-new-key', secretToTest))
    .toEqual({ result: 'Valid' });
});

test('Expect to be notified of invalid key', () => {
  expect(addKey.validateKey('', secretToTest))
    .toEqual({ result: 'Invalid' });
  expect(addKey.validateKey('  ', secretToTest))
    .toEqual({ result: 'Invalid' });
  expect(addKey.validateKey('a space', secretToTest))
    .toEqual({ result: 'Invalid' });
});

test('Expect to be notified of duplicate key', () => {
  expect(addKey.validateKey('asecret', secretToTest))
    .toEqual({ result: 'Duplicate key' });
});

test('Expect adding new key to apply ', () => {
  kube.applySecret.mockReturnValueOnce({
    result: 'success',
  });
  expect(addKey.completeAddingKey('a-new-key', 'a value', secretToTest))
    .toEqual({ result: 'success' });
  expect(kube.applySecret.mock.calls.length).toBe(1);
  expect(kube.applySecret.mock.calls[0])
    .toEqual([{
      secret: {
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
          'a-new-key': {
            encoded: 'YSB2YWx1ZQ==',
            decoded: 'a value',
          },
        },
      },
    }]);
});
