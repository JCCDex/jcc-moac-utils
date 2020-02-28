const chai = require("chai");
const expect = chai.expect;
const Fingate = require("../lib").Fingate;
const Moac = require("../lib").Moac;
const sinon = require("sinon");
const sandbox = sinon.createSandbox();
const BigNumber = require("bignumber.js");
const config = require("./config");
describe("test Fingate", function() {
  describe("test constructor", function() {
    it("create successfully", function() {
      let moac = new Moac(config.MOCK_NODE, true);
      moac.initChain3();
      expect(moac._node).to.equal(config.MOCK_NODE);
      let inst = new Fingate();
      inst.init(config.MOAC_SMART_CONTRACT_ADDRESS, moac);
      expect(inst._address).to.equal(config.MOAC_SMART_CONTRACT_ADDRESS);
    });
  });

  describe("test initMoacContract", function() {
    let inst;
    let moac;
    beforeEach(() => {
      moac = new Moac(config.MOCK_NODE, true);
      moac.initChain3();
      inst = new Fingate();
    });
    afterEach(() => {
      moac.destroyChain3();
      inst.destroy();
    });

    it("instance of moac contract had been not initialied", function() {
      inst.init(config.MOAC_SMART_CONTRACT_ADDRESS, moac);
      let instance = inst.contract;
      expect(instance).to.not.null;
      inst.init(config.SNRC_CONTRACT_ADDRESS, moac);
      expect(inst.contract).to.not.null;
      expect(instance).to.not.deep.equal(inst.contract);
    });

    it("instance of moac contract had been initialied", function() {
      inst.init(config.MOAC_SMART_CONTRACT_ADDRESS, moac);
      let instance = inst.contract;
      expect(instance).to.not.null;
      inst.init(config.MOAC_SMART_CONTRACT_ADDRESS, moac);
      expect(inst.contract).to.not.null;
      expect(instance).to.deep.equal(inst.contract);
    });

    it("if the address of moac fingate is invalid", function() {
      expect(() => inst.init(config.MOAC_SMART_CONTRACT_ADDRESS.substring(1), moac)).throw(`${config.MOAC_SMART_CONTRACT_ADDRESS.substring(1)} is invalid moac address.`);
    });

    it("throws error if init error", function() {
      let stub = sandbox.stub(moac, "contract");
      stub.throws(new Error("create moac fingate instance in error"));
      expect(() => inst.init(config.SNRC_CONTRACT_ADDRESS, moac)).throw("create moac fingate instance in error");
    });
  });

  describe("test close", function() {
    it("close", function() {
      let moac = new Moac(config.MOCK_NODE, true);
      moac.initChain3();
      let inst = new Fingate();
      inst.init(config.MOAC_SMART_CONTRACT_ADDRESS, moac);
      inst.destroy();
      expect(inst.contract).to.null;
    });
  });

  describe("test depositState", function() {
    let inst;
    before(function() {
      let moac = new Moac(config.MOCK_NODE, true);
      moac.initChain3();
      inst = new Fingate();
      inst.init(config.MOAC_SMART_CONTRACT_ADDRESS, moac);
    });

    afterEach(() => {
      sandbox.restore();
    });

    it("request state successfully", async function() {
      let stub = sandbox.stub(inst.contract, "depositState");
      stub.returns([new BigNumber(0), "", new BigNumber(0)]);
      let state = await inst.depositState(config.MOAC_ADDRESS);
      expect(state).to.deep.equal([new BigNumber(0), "", new BigNumber(0)]);
      let args = stub.getCall(0).args;
      expect(args.length).to.equal(2);
      expect(args[0]).to.equal("0x0000000000000000000000000000000000000000");
      expect(args[1]).to.equal(`0x${config.MOAC_ADDRESS}`);
      state = await inst.depositState(config.MOAC_ADDRESS, config.MOAC_SMART_CONTRACT_ADDRESS);
      args = stub.getCall(1).args;
      expect(args[0]).to.equal(config.MOAC_SMART_CONTRACT_ADDRESS);
      expect(args[1]).to.equal(`0x${config.MOAC_ADDRESS}`);
    });

    it("if the moac address is invalid", function() {
      expect(() => inst.depositState(config.MOAC_TO_ADDRESS.substring(1)).throw(`${config.MOAC_TO_ADDRESS.substring(1)} is invalid moac address.`));
    });

    it("if the smart contract address is invalid", function() {
      expect(() => inst.depositState(config.MOAC_ADDRESS, config.MOAC_SMART_CONTRACT_ADDRESS.substring(1)).throw(`${config.MOAC_SMART_CONTRACT_ADDRESS.substring(1)} is invalid moac address.`));
    });

    it("if get deposit state error", function(done) {
      let stub = sandbox.stub(inst.contract, "depositState");
      stub.throws(new Error("get errror"));
      inst.depositState(config.MOAC_ADDRESS).catch((error) => {
        expect(error.message).to.equal("get errror");
        done();
      });
    });
  });

  describe("test isPending", function() {
    let inst;
    before(function() {
      let moac = new Moac(config.MOCK_NODE, true);
      moac.initChain3();
      inst = new Fingate();
    });

    it("return true if the deposit state is pending", function() {
      let pending = inst.isPending([new BigNumber(1), "", new BigNumber(1)]);
      expect(pending).to.equal(true);
      pending = inst.isPending([new BigNumber(0), "1", new BigNumber(1)]);
      expect(pending).to.equal(true);
    });
    it("return false if the deposit state is not pending", function() {
      let pending = inst.isPending([new BigNumber(0), "", new BigNumber(0)]);
      expect(pending).to.equal(false);
    });
  });

  describe("test deposit", function() {
    let inst;
    let moac;
    before(function() {
      moac = new Moac(config.MOCK_NODE, true);
      moac.initChain3();
      inst = new Fingate();
      inst.init(config.MOAC_SMART_CONTRACT_ADDRESS, moac);
    });

    afterEach(() => {
      sandbox.restore();
    });

    it("deposit successfully", async function() {
      let stub = sandbox.stub(moac._chain3.mc, "getGasPrice");
      stub.yields(null, config.MOCK_GAS);
      stub = sandbox.stub(moac._chain3.mc, "getTransactionCount");
      stub.yields(null, config.MOCK_NONCE);
      stub = sandbox.stub(moac._chain3.currentProvider, "sendAsync");
      stub.yields(null, {
        jsonrpc: "2.0",
        id: 1536822829875,
        result: {}
      });
      stub = sandbox.stub(moac._chain3.mc, "sendRawTransaction");
      stub.yields(null, config.MOCK_HASH);
      stub = sandbox.stub(inst.contract.deposit, "getData");
      stub.returns("0xaa");
      let spy = sandbox.spy(moac, "sendSignedTransaction");
      let hash = await inst.deposit(config.JINGTUM_ADDRESS, config.MOCK_DEPOSIT_VALUE, config.MOAC_SECRET);
      expect(spy.args[0][0]).to.equal(config.MOCK_TX_SIGN);
      expect(hash).to.equal(config.MOCK_HASH);
    });

    it("jingtum address is invalid", function() {
      expect(() => inst.deposit(config.JINGTUM_ADDRESS.substring(1), config.MOCK_DEPOSIT_VALUE, config.MOAC_SECRET).throw(`${config.JINGTUM_ADDRESS.substring(1)} is invalid jingtum address.`));
    });

    it("amount is invalid", function() {
      expect(() =>
        inst
          .deposit(config.JINGTUM_ADDRESS, -1, config.MOAC_SECRET)
          .throw(error.message)
          .to.equal(`-1 is invalid amount.`)
      );
    });

    it("moac secret is invalid", function() {
      expect(() => inst.deposit(config.JINGTUM_ADDRESS, config.MOCK_DEPOSIT_VALUE, config.MOAC_SECRET.substring(1))).throw(`${config.MOAC_SECRET.substring(1)} is invalid moac secret.`);
    });

    it("deposit in error", function(done) {
      let stub = sandbox.stub(moac._chain3.mc, "getTransactionCount");
      stub.yields(new Error("request nonce in error"), null);
      inst.deposit(config.JINGTUM_ADDRESS, config.MOCK_DEPOSIT_VALUE, config.MOAC_SECRET).catch((error) => {
        expect(error.message).to.equal("request nonce in error");
        done();
      });
    });
  });

  describe("test depositToken", function() {
    let inst;
    let moac;
    before(function() {
      moac = new Moac(config.MOCK_NODE, true);
      moac.initChain3();
      inst = new Fingate();
      inst.init(config.MOAC_SMART_CONTRACT_ADDRESS, moac);
    });

    afterEach(() => {
      sandbox.restore();
    });

    it("deposit successfully", async function() {
      let stub = sandbox.stub(moac._chain3.mc, "getGasPrice");
      stub.yields(null, config.MOCK_GAS);
      stub = sandbox.stub(moac._chain3.mc, "getTransactionCount");
      stub.yields(null, config.MOCK_NONCE);
      stub = sandbox.stub(moac._chain3.currentProvider, "sendAsync");
      stub.yields(null, {
        jsonrpc: "2.0",
        id: 1536822829875,
        result: {}
      });
      stub = sandbox.stub(moac._chain3.mc, "sendRawTransaction");
      stub.yields(null, config.MOCK_HASH);
      stub = sandbox.stub(inst.contract.deposit, "getData");
      stub.returns("0xaa");
      let spy = sandbox.spy(moac, "sendSignedTransaction");
      let hash = await inst.depositToken(config.JINGTUM_ADDRESS, config.SNRC_CONTRACT_ADDRESS, 18, config.MOCK_DEPOSIT_VALUE, config.MOCK_HASH.toLowerCase(), config.MOAC_SECRET);
      expect(spy.args[0][0]).to.equal(config.MOCK_ERC20_TX_SIGN1);
      expect(hash).to.equal(config.MOCK_HASH);
    });

    it("jingtum address is invalid", function() {
      expect(() => inst.depositToken(config.JINGTUM_ADDRESS.substring(1), config.SNRC_CONTRACT_ADDRESS, 18, config.MOCK_DEPOSIT_VALUE, config.MOCK_HASH, config.MOAC_SECRET)).throw(`${config.JINGTUM_ADDRESS.substring(1)} is invalid jingtum address.`);
    });

    it("amount is invalid", function done() {
      expect(() => inst.depositToken(config.JINGTUM_ADDRESS, config.SNRC_CONTRACT_ADDRESS, 18, -1, config.MOCK_HASH, config.MOAC_SECRET)).throw(`-1 is invalid amount.`);
    });

    it("hash is invalid", function() {
      expect(() => inst.depositToken(config.JINGTUM_ADDRESS, config.SNRC_CONTRACT_ADDRESS, 18, config.MOCK_DEPOSIT_VALUE, config.MOCK_HASH.substring(1), config.MOAC_ADDRESS, config.MOAC_SECRET)).throw(`${config.MOCK_HASH.substring(1)} is invalid hash.`);
    });

    it("moac secret is invalid", function() {
      expect(() => inst.depositToken(config.JINGTUM_ADDRESS, config.SNRC_CONTRACT_ADDRESS, 18, config.MOCK_DEPOSIT_VALUE, config.MOCK_HASH, config.MOAC_SECRET.substring(1))).throw(`${config.MOAC_SECRET.substring(1)} is invalid moac secret.`);
    });

    it("deposit in error", function(done) {
      let stub = sandbox.stub(moac._chain3.mc, "getTransactionCount");
      stub.yields(new Error("request nonce in error"), null);
      inst.depositToken(config.JINGTUM_ADDRESS, config.SNRC_CONTRACT_ADDRESS, 18, config.MOCK_DEPOSIT_VALUE, config.MOCK_HASH, config.MOAC_SECRET).catch((error) => {
        expect(error.message).to.equal("request nonce in error");
        done();
      });
    });
  });
});
