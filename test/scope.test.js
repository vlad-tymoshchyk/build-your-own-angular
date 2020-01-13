const Scope = require('../src/scope');

describe('Scope', () => {
  test('it can be constructed and used as an object', () => {
    const scope = new Scope();
    scope.aProperty = 1;
    expect(scope.aProperty).toBe(1);
  });

  describe('digest', () => {
    let scope;

    beforeEach(() => {
      scope = new Scope();
    });

    test('calls the listener function on first $digest', () => {
      const watchFn = jest.fn();
      const listenerFn = jest.fn();
      scope.$watch(watchFn, listenerFn);
      scope.$digest();
      expect(listenerFn).toHaveBeenCalled();
      expect(watchFn).toHaveBeenCalledWith(scope);
    });

    test('calls the listener function when the scope value changes', () => {
      scope.someVal = 'a';
      scope.counter = 0;

      scope.$watch(
        scope => scope.someVal,
        (newVal, oldVal, scope) => { scope.counter++ },
      );

      expect(scope.counter).toBe(0);
      scope.$digest();
      expect(scope.counter).toBe(1);
      scope.someVal = 'b';
      expect(scope.counter).toBe(1);
      scope.$digest();
      expect(scope.counter).toBe(2);
      // scope.$digest();
      // expect(scope.counter).toBe(2);
    })
    test('calls listener with new valu as old value for first time', () => {


    })
  });
});
