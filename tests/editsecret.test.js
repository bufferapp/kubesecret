const editsecret = require('../lib/editsecret');

test('Expect final return value to match expected result', () => {
  const expectedOutput = {
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
    oldValue: 'hello',
    newValue: 'hi',
    updatingKey: 'asecret',
    notes: '',
  };
  expect(editsecret.finalizeEdit({
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
    updatingKey: 'asecret',
    newValue: 'hi',
  }))
    .toEqual(expectedOutput);
});

test('Expect final return value to strip newlines', () => {
  const expectedOutput = {
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
    oldValue: 'hello',
    newValue: 'hi',
    updatingKey: 'asecret',
    notes: 'Trimmed spaces and newlines before applying',
  };
  expect(editsecret.finalizeEdit({
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
    updatingKey: 'asecret',
    newValue: 'hi\n\n',
  }))
    .toEqual(expectedOutput);
});