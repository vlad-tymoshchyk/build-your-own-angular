const { setupModuleLoader } = require("../src/loader");
const { createInjector } = require("../src/injector");

describe("injector", () => {
  beforeEach(() => {
    delete window.angular;
    setupModuleLoader(window);
  });

  it("can be created", () => {
    const injector = createInjector([]);
    expect(injector).toBeDefined();
  });

  it("has a constant that has been registered to a module", () => {
    const module = angular.module("myModule", []);
    module.constant("aConstant", 42);
    const injector = createInjector(["myModule"]);
    expect(injector.has("aConstant")).toBeTruthy();
  });

  it("does not have a non-registered constant", () => {
    const module = angular.module("myModule", []);
    const injector = createInjector(["myModule"]);
    expect(injector.has("aConstant")).toBeFalsy();
  });

  it("does not allow a constant called hasOwnProperty", () => {
    const module = angular.module("myModule", []);
    module.constant("hasOwnProperty", "abc");
    expect(() => {
      createInjector(["myModule"]);
    }).toThrow();
  });

  it('can return a registered constant', () => {
    const module = angular.module('myModule', []);
    module.constant('aConstant', 42);
    const injector = createInjector(['myModule']);
    expect(injector.get('aConstant')).toBe(42);
  });
});
