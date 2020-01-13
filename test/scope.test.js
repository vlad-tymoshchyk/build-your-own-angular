const angular = require('../src/scope');

describe('test', () => {
  test('angular.module is a function', () => {
    expect(typeof angular.module).toBe('function');
  });
});

