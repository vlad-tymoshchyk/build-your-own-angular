module.exports = {
  setupModuleLoader(window) {
    const ensure = (obj, name, factory) => {
      return obj[name] || (obj[name] = factory());
    };

    const angular = ensure(window, "angular", Object);

    ensure(angular, "module", () => {
      const modules = {};
      return (name, requires) => {
        if (requires) {
          return createModule(name, requires, modules);
        } else {
          return getModule(name, modules);
        }
      };
    });

    function createModule(name, requires, modules) {
      if (name === "hasOwnProperty") {
        throw "hasOwnProperty is not a valid module name";
      }
      const invokeQueue = [];
      const moduleInstance = {
        name,
        requires,
        constant(key, value) {
          invokeQueue.push(["constant", [key, value]]);
        },
        _invokeQueue: invokeQueue
      };
      modules[name] = moduleInstance;
      return moduleInstance;
    }
    function getModule(name, modules) {
      if (modules.hasOwnProperty(name)) {
        return modules[name];
      } else {
        throw "Module " + name + " is not available";
      }
    }
  }
};
