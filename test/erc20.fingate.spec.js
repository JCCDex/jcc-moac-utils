const chai = require('chai');
const expect = chai.expect;
const ERC20Fingate = require('../lib').ERC20Fingate;
const sinon = require('sinon');
const sandbox = sinon.createSandbox();
const BigNumber = require('bignumber.js');
const config = require("./config");
describe('test ERC20Fingate', function () {

  describe("test constructor", function () {
    it("create successfully", function () {
      let inst = new ERC20Fingate(config.MOCK_NODE, true)
      inst.initErc20Contract(config.MOAC_SMART_CONTRACT_ADDRESS, config.SNRC_CONTRACT_ADDRESS);
      expect(inst._fingateAddress).to.equal(config.MOAC_SMART_CONTRACT_ADDRESS);
      expect(inst.gasLimit).to.equal(config.MOCK_GAS_LIMIT);
      inst.gasLimit = config.MOCK_GAS;
      expect(inst.gasLimit).to.equal(config.MOCK_GAS);
      inst = new ERC20Fingate(config.MOCK_NODE, false)
      expect(inst._network).to.equal(101);
    })
  })

  describe('test initErc20Contract', function () {
    let inst
    before(() => {
      inst = new ERC20Fingate(config.MOCK_NODE, true);
    })

    afterEach(() => {
      inst.close();
    });

    it("instance of erc20 contract had been not initialied", function () {
      inst.initErc20Contract(config.MOAC_SMART_CONTRACT_ADDRESS, config.SNRC_CONTRACT_ADDRESS);
      let instance = inst._erc20ContractInstance;
      expect(instance).to.not.null;
      expect(inst._moacContractInstance).to.not.null;
      inst.initErc20Contract(config.MOAC_SMART_CONTRACT_ADDRESS, config.MOAC_SMART_CONTRACT_ADDRESS);
      expect(inst._erc20ContractInstance).to.not.null;
      expect(inst._erc20ContractInstance).to.not.deep.equal(instance);
    })

    it("instance of erc20 contract had been initialied", function () {
      inst.initErc20Contract(config.MOAC_SMART_CONTRACT_ADDRESS, config.SNRC_CONTRACT_ADDRESS);
      let instance = inst._erc20ContractInstance;
      expect(instance).to.not.null;
      inst.initErc20Contract(config.MOAC_SMART_CONTRACT_ADDRESS, config.SNRC_CONTRACT_ADDRESS);
      expect(inst._erc20ContractInstance).to.not.null;
      expect(inst._erc20ContractInstance).to.deep.equal(instance);
    })

    it("if the address of moac fingate is invalid", function () {
      expect(() => inst.initErc20Contract(config.MOAC_SMART_CONTRACT_ADDRESS.substring(1), config.SNRC_CONTRACT_ADDRESS)).throw(`${config.MOAC_SMART_CONTRACT_ADDRESS.substring(1)} is invalid moac address.`)
    })

    it("if the address of erc20 contract is invalid", function () {
      expect(() => inst.initErc20Contract(config.MOAC_SMART_CONTRACT_ADDRESS, config.SNRC_CONTRACT_ADDRESS.substring(1))).throw(`${config.SNRC_CONTRACT_ADDRESS.substring(1)} is invalid moac address.`)
    })

    it('throws error if init error', function () {
      let stub = sandbox.stub(inst, "contract");
      stub.throws(new Error("create moac fingate instance in error"));
      expect(() => inst.initErc20Contract(config.MOAC_SMART_CONTRACT_ADDRESS, config.SNRC_CONTRACT_ADDRESS)).throw("create moac fingate instance in error");
    })
  })

  describe("test close", function () {
    it("close", function () {
      let inst = new ERC20Fingate(config.MOCK_NODE, true)
      inst.initErc20Contract(config.MOAC_SMART_CONTRACT_ADDRESS, config.SNRC_CONTRACT_ADDRESS);
      inst.close();
      expect(inst._moacContractInstance).to.null;
      expect(inst._erc20ContractInstance).to.null;
      expect(inst._chain3).to.null;
    })
  })

  describe('test getBalance', function () {
    let inst;
    before(() => {
      inst = new ERC20Fingate(config.MOCK_NODE, true)
      inst.initErc20Contract(config.MOAC_SMART_CONTRACT_ADDRESS, config.SNRC_CONTRACT_ADDRESS);
    })

    afterEach(() => {
      sandbox.restore();
    })

    it('get balance successfully', async function () {
      let stub = sandbox.stub(inst._erc20ContractInstance, "balanceOf");
      stub.resolves(new BigNumber(1e19));
      let s = sandbox.stub(inst._erc20ContractInstance, "decimals");
      s.returns(18);
      let balance = await inst.balanceOf(config.MOAC_ADDRESS);
      let args = stub.getCall(0).args;
      expect(args.length).to.equal(1);
      expect(args[0]).to.equal(config.MOAC_ADDRESS);
      expect(balance).to.equal('10');
    })

    it('get balance in error', async function () {
      let stub = sandbox.stub(inst._erc20ContractInstance, "balanceOf");
      stub.rejects(new Error('address is invalid'));
      let balance = await inst.balanceOf(config.MOAC_ADDRESS);
      expect(balance).to.equal('0');
    })
  })

  describe('test transfer', function () {
    let inst;
    before(() => {
      inst = new ERC20Fingate(config.MOCK_NODE, true)
      inst.initErc20Contract(config.MOAC_SMART_CONTRACT_ADDRESS, config.SNRC_CONTRACT_ADDRESS);
    })

    afterEach(() => {
      sandbox.restore();
    });

    it('transfer successfully', async function () {
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
      stub = sandbox.stub(inst._erc20ContractInstance.transfer, "getData");
      stub.returns("0xaa")
      stub = sandbox.stub(inst._erc20ContractInstance, "decimals");
      stub.returns(18);
      let spy = sandbox.spy(inst, "sendRawSignedTransaction");
      let hash = await inst.transfer(config.MOCK_DEPOSIT_VALUE, config.MOAC_SECRET);
      expect(spy.args[0][0]).to.equal(config.MOCK_TRANSFER_TX_SIGN);
      expect(hash).to.equal(config.MOCK_HASH)
    })

    it('amount is invalid', function () {
      expect(() => inst.transfer(0, config.MOAC_SECRET)).throw(`0 is invalid amount.`);
    })

    it('moac secret is invalid', function () {
      expect(() => inst.transfer(config.MOCK_DEPOSIT_VALUE, config.MOAC_SECRET.substring(1))).throw(`${config.MOAC_SECRET.substring(1)} is invalid moac secret.`)
    })

    it('deposit in error', function (done) {
      let stub = sandbox.stub(inst._chain3.mc, "getTransactionCount");
      stub.yields(new Error('request nonce in error'), null);
      inst.transfer(config.MOCK_DEPOSIT_VALUE, config.MOAC_SECRET).catch(error => {
        expect(error.message).to.equal('request nonce in error')
        done()
      })
    })
  })

  describe('test depositToken', function () {
    let inst;
    before(function () {
      inst = new ERC20Fingate(config.MOCK_NODE, true)
      inst.initErc20Contract(config.MOAC_SMART_CONTRACT_ADDRESS, config.SNRC_CONTRACT_ADDRESS);
    })

    afterEach(() => {
      sandbox.restore();
    })

    it('deposit successfully', async function () {
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
      let hash = await inst.depositToken(config.JINGTUM_ADDRESS, config.MOCK_DEPOSIT_VALUE, config.MOCK_HASH, config.MOAC_SECRET);
      expect(spy.args[0][0]).to.equal(config.MOCK_ERC20_TX_SIGN1);
      expect(hash).to.equal(config.MOCK_HASH)
    })

    it('jingtum address is invalid', function () {
      expect(() => inst.depositToken(config.JINGTUM_ADDRESS.substring(1), config.MOCK_DEPOSIT_VALUE, config.MOCK_HASH, config.MOAC_SECRET)).throw(`${config.JINGTUM_ADDRESS.substring(1)} is invalid jingtum address.`);
    })

    it('amount is invalid', function done() {
      expect(() => inst.depositToken(config.JINGTUM_ADDRESS, 0, config.MOCK_HASH, config.MOAC_SECRET)).throw(`0 is invalid amount.`)
    })

    it('hash is invalid', function () {
      expect(() => inst.depositToken(config.JINGTUM_ADDRESS, config.MOCK_DEPOSIT_VALUE, config.MOCK_HASH.substring(1), config.MOAC_ADDRESS, config.MOAC_SECRET)).throw(`${config.MOCK_HASH.substring(1)} is invalid hash.`)
    })

    it('moac secret is invalid', function () {
      expect(() => inst.depositToken(config.JINGTUM_ADDRESS, config.MOCK_DEPOSIT_VALUE, config.MOCK_HASH, config.MOAC_SECRET.substring(1))).throw(`${config.MOAC_SECRET.substring(1)} is invalid moac secret.`)
    })

    it('deposit in error', function (done) {
      let stub = sandbox.stub(inst._chain3.mc, "getTransactionCount");
      stub.yields(new Error('request nonce in error'), null);
      inst.depositToken(config.JINGTUM_ADDRESS, config.MOCK_DEPOSIT_VALUE, config.MOCK_HASH, config.MOAC_SECRET).catch(error => {
        expect(error.message).to.equal('request nonce in error')
        done()
      })
    })
  })
});