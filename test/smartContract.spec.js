const chai = require("chai");
const expect = chai.expect;
const SmartContract = require("../lib").smartContract;
const Moac = require("../lib").Moac;
const sinon = require("sinon");
const sandbox = sinon.createSandbox();
const BigNumber = require("bignumber.js");
const config = require("./config");
describe("test smartContract", function() {
  describe("test constructor", function() {
    it("create successfully", function() {
      let moac = new Moac(config.MOCK_NODE, true);
      moac.initChain3();
      let inst = new SmartContract();
      inst.init(config.MOAC_ERC20_ADDRESS, moac, config.MOAC_ERC20_ABI);
      expect(inst._address).to.equal(config.MOAC_ERC20_ADDRESS);
    });
  });

  describe("test init smartContract", function() {
    let inst;
    let moac;
    beforeEach(() => {
      moac = new Moac(config.MOCK_NODE, true);
      moac.initChain3();
      inst = new SmartContract();
    });

    afterEach(() => {
      moac.destroyChain3();
      inst.destroy();
    });

    it("instance of contract had been not initialied", function() {
      inst.init(config.MOAC_ERC20_ADDRESS, moac, config.MOAC_ERC20_ABI);
      let instance = inst._contract;
      expect(instance).to.not.null;
      inst.init(config.MOAC_SMART_CONTRACT_ADDRESS, moac, config.MOAC_ERC20_ABI);
      expect(inst._contract).to.not.null;
      expect(inst._contract).to.not.deep.equal(instance);
    });

    it("instance of contract had been initialied", function() {
      inst.init(config.MOAC_ERC20_ADDRESS, moac, config.MOAC_ERC20_ABI);
      let instance = inst._contract;
      expect(instance).to.not.null;
      inst.init(config.MOAC_ERC20_ADDRESS, moac, config.MOAC_ERC20_ABI);
      expect(inst._contract).to.not.null;
      expect(inst._contract).to.deep.equal(instance);
    });

    it("throws error if init error", function() {
      let stub = sandbox.stub(moac, "contract");
      stub.throws(new Error("create smart contract instance in error"));
      expect(() => inst.init(config.MOAC_ERC20_ADDRESS, moac, config.MOAC_ERC20_ABI)).throw("create smart contract instance in error");
    });
  });

  describe("test close", function() {
    it("close", function() {
      let moac = new Moac(config.MOCK_NODE, true);
      moac.initChain3();
      let inst = new SmartContract();
      inst.init(config.MOAC_ERC20_ADDRESS, moac, config.MOAC_ERC20_ABI);
      moac.destroyChain3();
      inst.destroy();
      expect(inst._contract).to.null;
      expect(moac._chain3).to.null;
    });
  });
});
