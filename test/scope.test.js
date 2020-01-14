const Scope = require('../src/scope');

describe('Scope', () => {
  it('it can be constructed and used as an object', () => {
    const scope = new Scope();
    scope.aProperty = 1;
    expect(scope.aProperty).toBe(1);
  });

  describe('digest', () => {
    let scope;

    beforeEach(() => {
      scope = new Scope();
    });

    it('calls the listener function on first $digest', () => {
      const watchFn = jest.fn();
      const listenerFn = jest.fn();
      scope.$watch(watchFn, listenerFn);
      scope.$digest();
      expect(listenerFn).toHaveBeenCalled();
      expect(watchFn).toHaveBeenCalledWith(scope);
    });

    it('calls listener when waatch value is first undefined', () => {
      scope.counter = 0;

      scope.$watch(
        scope => scope.undefVal,
        (newVal, oldVal, scope) => {
          scope.counter++;
        },
      );
      scope.$digest();
      expect(scope.counter).toBe(1);
    });

    it('calls the listener function when the scope value changes', () => {
      scope.someVal = 'a';
      scope.counter = 0;

      scope.$watch(
        scope => scope.someVal,
        (newVal, oldVal, scope) => {
          scope.counter++;
        },
      );

      expect(scope.counter).toBe(0);

      scope.$digest();
      expect(scope.counter).toBe(1);

      scope.$digest();
      expect(scope.counter).toBe(1);

      scope.someVal = 'b';
      expect(scope.counter).toBe(1);

      scope.$digest();
      expect(scope.counter).toBe(2);
    });

    it('calls listener with new value as old value for first time', () => {
      const listener = jest.fn();
      const testVal = 'a';
      scope.aProperty = testVal;
      scope.$watch(scope => scope.aProperty, listener);
      scope.$digest();
      expect(listener).toHaveBeenCalledWith(testVal, testVal, scope);
    });

    it('may have watchers that omit the listener function', () => {
      const watcher = jest.fn(() => 'something');
      scope.$watch(watcher);
      scope.$digest();
      expect(watcher).toHaveBeenCalled();
    });

    it('triggers chained watchers in the same digest', () => {
      scope.name = 'Jane';
      scope.$watch(
        scope => scope.nameUpper,
        (newVal, oldVal, scope) => {
          if (newVal) {
            scope.initial = newVal.substring(0, 1) + '.';
          }
        },
      );
      scope.$watch(
        scope => scope.name,
        (newVal, oldVal, scope) => {
          if (newVal) {
            scope.nameUpper = newVal.toUpperCase();
          }
        },
      );
      scope.$digest();
      expect(scope.initial).toBe('J.');
    });

    it('gives up on the watches after 10 iterations', () => {
      scope.counterA = 0;
      scope.counterB = 0;

      scope.$watch(
        scope => scope.counterA,
        (newVal, oldVal, scope) => {
          scope.counterB++;
        },
      );

      scope.$watch(
        scope => scope.counterB,
        (newVal, oldVal, scope) => {
          scope.counterA++;
        },
      );

      expect(() => scope.$digest()).toThrow();
    });

    it('ends the digest when the last watch is clean', () => {
      scope.array = [];
      for (let i = 0; i < 10; i++) scope.array.push(i);
      let watchExecutions = 0;

      for (let i = 0; i < 10; i++) {
        scope.$watch(
          scope => {
            watchExecutions++;
            return scope.array[i];
          },
        );
      }

      expect(watchExecutions).toBe(0);
      scope.$digest();
      expect(watchExecutions).toBe(20);

      scope.array[3] = 420;
      scope.$digest();
      expect(watchExecutions).toBe(34);
    });

    it('does not end digest so that new watches are not run', () => {
      scope.aValue = 'abc';
      scope.counter = 0;

      const listenerFn = jest.fn();

      scope.$watch(
        scope => scope.aValue,
        (newVal, oldVal, scope) => {
          scope.$watch(scope => scope.aValue, listenerFn);
        },
      );

      scope.$digest();
      expect(listenerFn).toHaveBeenCalled();
    });

    it('TODO correctly handles NaNs', () => {
      // TODO
    });

    it('TODO executes $eval\'ed function and returns result', () => {
      // TODO
    });

    it('TODO passes the second argument straight through', () => {
      // TODO
    });

    it('TODO executes $apply\'ed function and starts the digest', () => {
      // TODO
    });

    it('TODO executes $evalAsync\'ed function later in the same cycle', () => {
      // TODO
    });

    it('TODO executes $evalAsync\'ed functions added by watch functions', () => {
      // TODO
    });

    it('TODO executes $evalAsync\'ed functions even when not dirty', () => {
      // TODO
    });

    it('TODO evantually halts $evalAsyncs added by watches', () => {
      // TODO
    });

    it('TODO has $$phase field whose values is the current digest phase', () => {
      // TODO
    });

    it('TODO schedules a digest in $evalAsync', () => {
      // TODO
    });

    it('TODO allows async $apply with $applyAsync', () => {
      // TODO
    });

    it('TODO never executes $applyAsync\'ed functions in the same cycle', () => {
      // TODO
    });

    it('TODO coalesces many calls to $applyAsync', () => {
      // TODO
    });

    it('TODO cancels and flushes $applyAsync if digested first', () => {
      // TODO
    });

    it('TODO runs a $$postDigest function after each digest', () => {
      // TODO
    });

    it('TODO does not include $$postDigest in the digest', () => {
      // TODO
    });

    it('TODO catches exceptions in watch functions and continues', () => {
      // TODO
    });

    it('TODO catches exceptions in listener functions and continues', () => {
      // TODO
    });

    it('TODO catches exceptions in $evalAsync', () => {
      // TODO
    });

    it('TODO catches exceptions in $applyAsync', () => {
      // TODO
    });

    it('TODO catches exceptions in $postDigest', () => {
      // TODO
    });

    it('TODO allows destroying a $watch with a removal function', () => {
      // TODO
    });

    it('TODO allows destroying a $watch during digest', () => {
      // TODO
    });

    it('TODO allows a $watch to destroy another during digest', () => {
      // TODO
    });

    it('TODO allows destroying several $watches during digest', () => {
      // TODO
    });

    it('TODO $watchGroup', () => {
      // TODO
    });

    it('TODO only calls listener once per digest', () => {
      // TODO
    });
  });
});
