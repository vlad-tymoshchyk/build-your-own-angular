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

    it('calls listener when watch value is first undefined', () => {
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
        scope.$watch(scope => {
          watchExecutions++;
          return scope.array[i];
        });
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

    it('compares based on value if enabled', () => {
      scope.aValue = [1, 2, 3];
      const listener = jest.fn();
      scope.$watch(scope => scope.aValue, listener, true);

      scope.$digest();
      expect(listener).toHaveBeenCalledTimes(1);

      scope.aValue.push(4);
      scope.$digest();
      expect(listener).toHaveBeenCalledTimes(2);
    });

    it('correctly handles NaNs', () => {
      scope.number = 0 / 0;
      const listenerFn = jest.fn();
      scope.$watch(scope => scope.number, listenerFn);

      scope.$digest();
      expect(listenerFn).toHaveBeenCalledTimes(1);

      scope.$digest();
      expect(listenerFn).toHaveBeenCalledTimes(1);
    });

    it("executes $eval'ed function and returns result", () => {
      scope.aValue = 42;
      const result = scope.$eval(scope => scope.aValue);
      expect(result).toBe(42);
    });

    it('passes the second argument straight through', () => {
      scope.aValue = 55;
      const result = scope.$eval((scope, arg) => scope.aValue + arg, 6);
      expect(result).toBe(61);
    });

    it("executes $apply'ed function and starts the digest", () => {
      scope.aValue = 'one';
      const listenerFn = jest.fn();
      const applyFn = jest.fn(scope => {
        scope.aValue = 'two';
      });
      scope.$watch(scope => scope.aValue, listenerFn);
      scope.$digest();
      expect(listenerFn).toHaveBeenCalledTimes(1);
      scope.$apply(applyFn);
      expect(applyFn).toHaveBeenCalled();
      expect(listenerFn).toHaveBeenCalledTimes(2);
    });

    it("executes $evalAsync'ed function later in the same cycle", () => {
      scope.aValue = [1, 2, 3];
      scope.asyncEvaluated = false;
      scope.asyncEvaluatedImmediately = false;

      scope.$watch(
        scope => scope.aValue,
        (newVal, oldVal, scope) => {
          scope.$evalAsync(scope => (scope.asyncEvaluated = true));
          scope.asyncEvaluatedImmediately = scope.asyncEvaluated;
        },
      );
      scope.$digest();
      expect(scope.asyncEvaluated).toBeTruthy();
      expect(scope.asyncEvaluatedImmediately).toBeFalsy();
    });

    it("executes $evalAsync'ed functions added by watch functions", () => {
      scope.aValue = [1, 2, 3];
      scope.asyncEvaluated = false;

      scope.$watch(
        scope => {
          if (!scope.asyncEvaluated) {
            scope.$evalAsync(scope => {
              scope.asyncEvaluated = true;
            });
          }
          return scope.aValue;
        },
        (newVal, oldVal, scope) => {},
      );

      scope.$digest();

      expect(scope.asyncEvaluated).toBeTruthy();
    });

    it("executes $evalAsync'ed functions even when not dirty", () => {
      scope.aValue = [1, 2, 3];
      scope.asyncEvaluatedTimes = 0;

      scope.$watch(
        scope => {
          if (scope.asyncEvaluatedTimes < 2) {
            scope.$evalAsync(scope => scope.asyncEvaluatedTimes++);
          }
          return scope.aValue;
        },
        (newVal, oldVal, scope) => {},
      );

      scope.$digest();

      expect(scope.asyncEvaluatedTimes).toBe(2);
    });

    it('evantually halts $evalAsyncs added by watches', () => {
      scope.aValue = [1, 2, 3];

      scope.$watch(
        scope => {
          scope.$evalAsync(() => {});
          return scope.aValue;
        },
        (newVal, oldVal, scope) => {},
      );

      expect(() => {
        scope.$digest();
      }).toThrow();
    });

    it('has $$phase field whose values is the current digest phase', () => {
      scope.aValue = [1, 2, 3];
      scope.phaseInWatchFunction = undefined;
      scope.phaseInListenerFunction = undefined;
      scope.phaseInApplyFunction = undefined;

      scope.$watch(
        scope => {
          scope.phaseInWatchFunction = scope.$$phase;
          return scope.aValue;
        },
        (newVal, oldVal, scope) => {
          scope.phaseInListenerFunction = scope.$$phase;
        },
      );

      scope.$apply(scope => (scope.phaseInApplyFunction = scope.$$phase));

      expect(scope.phaseInWatchFunction).toBe('$digest');
      expect(scope.phaseInListenerFunction).toBe('$digest');
      expect(scope.phaseInApplyFunction).toBe('$apply');
    });

    // it('TODO schedules a digest in $evalAsync', () => {
    //   // TODO
    // });

    // it('TODO allows async $apply with $applyAsync', () => {
    //   // TODO
    // });

    // it('TODO never executes $applyAsync\'ed functions in the same cycle', () => {
    //   // TODO
    // });

    // it('TODO coalesces many calls to $applyAsync', () => {
    //   // TODO
    // });

    // it('TODO cancels and flushes $applyAsync if digested first', () => {
    //   // TODO
    // });

    // it('TODO runs a $$postDigest function after each digest', () => {
    //   // TODO
    // });

    // it('TODO does not include $$postDigest in the digest', () => {
    //   // TODO
    // });

    // it('TODO catches exceptions in watch functions and continues', () => {
    //   // TODO
    // });

    // it('TODO catches exceptions in listener functions and continues', () => {
    //   // TODO
    // });

    // it('TODO catches exceptions in $evalAsync', () => {
    //   // TODO
    // });

    // it('TODO catches exceptions in $applyAsync', () => {
    //   // TODO
    // });

    // it('TODO catches exceptions in $postDigest', () => {
    //   // TODO
    // });

    // it('TODO allows destroying a $watch with a removal function', () => {
    //   // TODO
    // });

    // it('TODO allows destroying a $watch during digest', () => {
    //   // TODO
    // });

    // it('TODO allows a $watch to destroy another during digest', () => {
    //   // TODO
    // });

    // it('TODO allows destroying several $watches during digest', () => {
    //   // TODO
    // });

    // it('TODO $watchGroup', () => {
    //   // TODO
    // });

    // it('TODO only calls listener once per digest', () => {
    //   // TODO
    // });
  });
});
