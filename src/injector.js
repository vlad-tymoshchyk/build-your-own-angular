module.exports = {
  createInjector(modulesToLoad) {
    const cache = {};

    const $provide = {
      constant(key, value) {
        if (key === "hasOwnProperty") {
          throw "hasOwnProperty is not a valid constant name";
        }
        cache[key] = value;
      }
    };

    modulesToLoad.forEach(moduleName => {
      const module = angular.module(moduleName);
      module._invokeQueue.forEach(invokeArgs => {
        const method = invokeArgs[0];
        const args = invokeArgs[1];
        $provide[method].apply($provide, args);
      });
    });
    return {
      has(key) {
        return cache.hasOwnProperty(key);
      },
      get(key) {
        return cache[key];
      }
    };
  }
};
