const chai = require('chai');
const expect = chai.expect;
const MoacFingate = require('../lib').MoacFingate;
const sinon = require('sinon');
const sandbox = sinon.createSandbox();
const BigNumber = require('bignumber.js');
const config = require("./config");
describe('test MoacFingate', function() {

  describe("test constructor", function() {
    it("create successfully", function() {
      let inst = new MoacFingate(config.MOCK_NODE, true)
      inst.initMoacContract(config.MOAC_SMART_CONTRACT_ADDRESS);
      expect(inst._fingateAddress).to.equal(config.MOAC_SMART_CONTRACT_ADDRESS);
      expect(inst.gasLimit).to.equal(config.MOCK_GAS_LIMIT);
      inst.gasLimit = config.MOCK_GAS;
      expect(inst.gasLimit).to.equal(config.MOCK_GAS);
    })
  })

  describe('test initMoacContract', function() {
    let inst;
    before(() => {
      inst = new MoacFingate(config.MOCK_NODE, true)
    })
    afterEach(() => {
      inst.close();
    })

    it("instance of moac contract had been not initialied", function() {
      inst.initMoacContract(config.MOAC_SMART_CONTRACT_ADDRESS);
      let instance = inst.moacContractInstance;
      expect(instance).to.not.null;
      expect(inst._chain3).to.not.null;
      inst.initMoacContract(config.SNRC_CONTRACT_ADDRESS);
      expect(inst.moacContractInstance).to.not.null;
      expect(instance).to.not.deep.equal(inst.moacContractInstance);
    })

    it("instance of moac contract had been initialied", function() {
      inst.initMoacContract(config.MOAC_SMART_CONTRACT_ADDRESS);
      let instance = inst.moacContractInstance;
      expect(instance).to.not.null;
      inst.initMoacContract(config.MOAC_SMART_CONTRACT_ADDRESS);
      expect(inst.moacContractInstance).to.not.null;
      expect(instance).to.deep.equal(inst.moacContractInstance);
    })

    it("if the address of moac fingate is invalid", function() {
      expect(() => inst.initMoacContract(config.MOAC_SMART_CONTRACT_ADDRESS.substring(1))).throw(`${config.MOAC_SMART_CONTRACT_ADDRESS.substring(1)} is invalid moac address.`)
    })

    it('throws error if init error', function() {
      let stub = sandbox.stub(inst, "contract");
      stub.throws(new Error("create moac fingate instance in error"));
      expect(() => inst.initMoacContract(config.SNRC_CONTRACT_ADDRESS)).throw("create moac fingate instance in error");
    })
  })

  describe("test close", function() {
    it("close", function() {
      let inst = new MoacFingate(config.MOCK_NODE, true)
      inst.initMoacContract(config.MOAC_SMART_CONTRACT_ADDRESS);
      inst.close();
      expect(inst._moacContractInstance).to.null;
      expect(inst._chain3).to.null;
    })
  })

  describe('test depositState', function() {
    let inst;
    before(function() {
      inst = new MoacFingate(config.MOCK_NODE, true)
      inst.initMoacContract(config.MOAC_SMART_CONTRACT_ADDRESS);
    })

    afterEach(() => {
      sandbox.restore();
    })

    it('request state successfully', async function() {
      let stub = sandbox.stub(inst._moacContractInstance, "depositState");
      stub.returns([new BigNumber(0), '', new BigNumber(0)]);
      let state = await inst.depositState(config.MOAC_ADDRESS);
      expect(state).to.deep.equal([new BigNumber(0), '', new BigNumber(0)]);
      let args = stub.getCall(0).args;
      expect(args.length).to.equal(2);
      expect(args[0]).to.equal("0x0000000000000000000000000000000000000000");
      expect(args[1]).to.equal(`0x${config.MOAC_ADDRESS}`);
      state = await inst.depositState(config.MOAC_ADDRESS, config.MOAC_SMART_CONTRACT_ADDRESS);
      args = stub.getCall(1).args;
      expect(args[0]).to.equal(config.MOAC_SMART_CONTRACT_ADDRESS);
      expect(args[1]).to.equal(`0x${config.MOAC_ADDRESS}`);
    })

    it("if the moac address is invalid", function() {
      expect(() => inst.depositState(config.MOAC_TO_ADDRESS.substring(1)).throw(`${config.MOAC_TO_ADDRESS.substring(1)} is invalid moac address.`))
    })

    it("if the smart contract address is invalid", function() {
      expect(() => inst.depositState(config.MOAC_ADDRESS, config.MOAC_SMART_CONTRACT_ADDRESS.substring(1)).throw(`${config.MOAC_SMART_CONTRACT_ADDRESS.substring(1)} is invalid moac address.`))
    })

    it("if get deposit state error", function(done) {
      let stub = sandbox.stub(inst._moacContractInstance, "depositState");
      stub.throws(new Error("get errror"));
      inst.depositState(config.MOAC_ADDRESS).catch(error => {
        expect(error.message).to.equal("get errror");
        done();
      })
    })
  })

  describe('test isPending', function() {
    let inst;
    before(function() {
      inst = new MoacFingate(config.MOCK_NODE, true)
    })

    it('return true if the deposit state is pending', function() {
      let pending = inst.isPending([new BigNumber(1), '', new BigNumber(1)]);
      expect(pending).to.equal(true);
      pending = inst.isPending([new BigNumber(0), '1', new BigNumber(1)]);
      expect(pending).to.equal(true);
    })
    it('return false if the deposit state is not pending', function() {
      let pending = inst.isPending([new BigNumber(0), '', new BigNumber(0)]);
      expect(pending).to.equal(false);
    })
  })

  describe('test deposit', function() {
    let inst;
    before(function() {
      inst = new MoacFingate(config.MOCK_NODE, true)
      inst.initMoacContract(config.MOAC_SMART_CONTRACT_ADDRESS);
    })

    afterEach(() => {
      sandbox.restore();
    })

    it('deposit successfully', async function() {
      let stub = sandbox.stub(inst._chain3.mc, "getGasPrice");
      stub.yields(null, config.MOCK_GAS);
      stub = sandbox.stub(inst._chain3.mc, "getTransactionCount");
      stub.yields(null, config.MOCK_NONCE);
      stub = sandbox.stub(inst._chain3.currentProvider, "sendAsync");
      stub.yields(null, {
        jsonrpc: '2.0',
        id: 1536822829875,
        result: {}
      })
      stub = sandbox.stub(inst._chain3.mc, "sendRawTransaction");
      stub.yields(null, config.MOCK_HASH);
      stub = sandbox.stub(inst._moacContractInstance.deposit, "getData");
      stub.returns("0xaa")
      let spy = sandbox.spy(inst, "sendRawSignedTransaction");
      let hash = await inst.deposit(config.JINGTUM_ADDRESS, config.MOCK_DEPOSIT_VALUE, config.MOAC_SECRET);
      expect(spy.args[0][0]).to.equal(config.MOCK_TX_SIGN);
      expect(hash).to.equal(config.MOCK_HASH)
    })

    it('jingtum address is invalid', function() {
      expect(() => inst.deposit(config.JINGTUM_ADDRESS.substring(1), config.MOCK_DEPOSIT_VALUE, config.MOAC_SECRET).throw(`${config.JINGTUM_ADDRESS.substring(1)} is invalid jingtum address.`))
    })

    it('amount is invalid', function() {
      expect(() => inst.deposit(config.JINGTUM_ADDRESS, 0, config.MOAC_SECRET).throw(error.message).to.equal(`0 is invalid amount.`))
    })

    it('moac secret is invalid', function() {
      expect(() => inst.deposit(config.JINGTUM_ADDRESS, config.MOCK_DEPOSIT_VALUE, config.MOAC_SECRET.substring(1))).throw(`${config.MOAC_SECRET.substring(1)} is invalid moac secret.`)
    })

    it('deposit in error', function(done) {
      let stub = sandbox.stub(inst._chain3.mc, "getTransactionCount");
      stub.yields(new Error('request nonce in error'), null);
      inst.deposit(config.JINGTUM_ADDRESS, config.MOCK_DEPOSIT_VALUE, config.MOAC_SECRET).catch(error => {
        expect(error.message).to.equal('request nonce in error')
        done()
      })
    })
  })
});