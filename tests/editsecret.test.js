const editsecret = require('../lib/editsecret');

jest.mock('../lib/kube');
const kube = require('../lib/kube');

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

// test('Can mock kube', () => {
//   kube.getResource.mockReturnValueOnce(1);
//   kube.getResource.mockReturnValueOnce(3);
//   expect(editsecret.completeEdit({}))
//     .toBe(3);
// });

test('Expect secret application to pass when secret on server has not changed', () => {
  kube.applySecret.mockReturnValueOnce({
    result: 'success',
  });

  kube.getResource.mockReturnValueOnce({
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
  });
  expect(editsecret.applyEdit({
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
    .toEqual({
      result: 'Applied',
    });
  expect(kube.getResource.mock.calls.length).toBe(1);
  expect(kube.getResource.mock.calls[0])
    .toEqual([{
      namespace: 'test',
      name: 'a-new-secret',
    }]);
  expect(kube.applySecret.mock.calls.length).toBe(1);
  expect(kube.applySecret.mock.calls[0])
    .toEqual([{
      secret: {
        metadata: {
          name: 'a-new-secret',
          namespace: 'test',
        },
        data: {
          asecret: {
            encoded: 'aGk=',
            decoded: 'hi',
          },
          bsecret: {
            encoded: 'd29ybGQ=',
            decoded: 'world',
          },
        },
      },
    }]);
});

test('Expect secret to not be applied when value has changed', () => {
  kube.getResource.mockClear();
  kube.getResource.mockReturnValueOnce({
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
          decoded: 'ola',
        },
        bsecret: {
          encoded: 'd29ybGQ=',
          decoded: 'world',
        },
      },
    },
  });
  expect(editsecret.applyEdit({
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
    .toEqual({
      result: 'Failed',
      reason: 'Secret has been modified',
      newSecret: {
        metadata: {
          name: 'a-new-secret',
          namespace: 'test',
        },
        data: {
          asecret: {
            encoded: 'aGVsbG8=',
            decoded: 'ola',
          },
          bsecret: {
            encoded: 'd29ybGQ=',
            decoded: 'world',
          },
        },
      },
      updatingKey: 'asecret',
      newValue: 'hi',
      previousValue: 'hello',
    });
  expect(kube.getResource.mock.calls.length).toBe(1);
});
