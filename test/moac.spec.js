const chai = require('chai');
const expect = chai.expect;
const Moac = require('../lib/moac').default;
const BigNumber = require('bignumber.js');
const sinon = require('sinon');
const sandbox = sinon.createSandbox();
const config = require("./config");

describe('test moac', function() {
  describe('test constructor', function() {
    it("create successfully", function() {
      let inst = new Moac(config.MOCK_NODE, true)
      expect(inst._node).to.equal(config.MOCK_NODE);
      expect(inst._network).to.equal(99);
      inst = new Moac(config.MOCK_NODE, false);
      expect(inst._network).to.equal(101);
    });
  })

  describe('test setter and getter', function() {
    let inst;
    before(() => {
      inst = new Moac(config.MOCK_NODE, true)
    })
    it('property of _minGasPrice', function() {
      inst.minGasPrice = 1;
      expect(inst._minGasPrice).to.equal(1)
      expect(inst.minGasPrice).to.equal(1)
    })

    it('property of _gasLimit', function() {
      inst.gasLimit = 1;
      expect(inst.gasLimit).to.equal(1)
      expect(inst._gasLimit).to.equal(1)
    })
  })

  describe('test isValidAddress', function() {

    it('return true if the moac address is valid', function() {
      let valid = Moac.isValidAddress(config.MOAC_ADDRESS);
      expect(valid).to.equal(true);
    })

    it('return false if the moac address is invalid', function() {
      let valid = Moac.isValidAddress(config.MOAC_ADDRESS.substring(1));
      expect(valid).to.equal(false);
    })
  })

  describe('test isValidSecret', function() {

    it('return true if the moac secret is valid', function() {
      let valid = Moac.isValidSecret(config.MOAC_SECRET);
      expect(valid).to.equal(true);
    })

    it('return false if the moac secret is invalid', function() {
      let valid = Moac.isValidSecret(config.MOAC_SECRET.substring(1));
      expect(valid).to.equal(false);
    })
  })

  describe("test prefix0x", function() {
    it("return itself", function() {
      expect(Moac.prefix0x("0x")).to.equal("0x");
    })
    it("return ''", function() {
      expect(Moac.prefix0x("")).to.equal("");
    })
  })

  describe('test getAddress', function() {

    it('return right address if the moac secret is valid', function() {
      let address = Moac.getAddress(config.MOAC_SECRET);
      expect(address).to.equal('0x' + config.MOAC_ADDRESS);
    })

    it('return null if the moac secret is invalid', function() {
      let address = Moac.getAddress(config.MOAC_SECRET.substring(1));
      expect(address).to.equal(null);
    })
  })

  describe('test create wallet', function() {

    it('test create', function() {
      let wallet = Moac.createWallet();
      let valid = Moac.isValidSecret(wallet.secret);
      expect(valid).to.equal(true);
    })
  })

  describe("test initChain3", function() {
    let inst;
    beforeEach(() => {
      inst = new Moac(config.MOCK_NODE, true)
      inst.initChain3();
    })

    it("instance of chain3 had been initialied", function() {
      let _chain3 = inst._chain3;
      expect(_chain3).to.not.null;
      inst.initChain3();
      expect(_chain3).to.deep.equal(inst._chain3);
    })

    it("instance of chain3 had not been initialied", function() {
      let _chain3 = inst._chain3;
      expect(_chain3).to.not.null;
      inst.destroyChain3();
      expect(inst._chain3).to.be.null;
      inst.initChain3();
      expect(inst._chain3).to.not.null;
      expect(_chain3).to.not.deep.equal(inst._chain3);
    })
  })

  describe('test destroyChain3', function() {
    it('_chian3 is null', function() {
      let inst = new Moac(config.MOCK_NODE, true);
      inst.initChain3();
      expect(inst._chain3).to.not.equal(null);
      inst.destroyChain3();
      expect(inst._chain3).to.equal(null);
    })
  })

  describe('test getBalance', function() {
    let inst;
    before(() => {
      inst = new Moac(config.MOCK_NODE, true)
      inst.initChain3();
    })
    afterEach(() => {
      sandbox.restore();
    })
    it('get balance successfully', async function() {
      let stub = sandbox.stub(inst._chain3.mc, "getBalance");
      stub.resolves(new BigNumber(1e0));
      let balance = await inst.getBalance(config.MOAC_ADDRESS);
      let args = stub.getCall(0).args;
      expect(args.length).to.equal(1);
      expect(args[0]).to.equal(config.MOAC_ADDRESS);
      expect(balance).to.equal('0.000000000000000001');
    })

    it('get balance in error', async function() {
      let stub = sandbox.stub(inst._chain3.mc, "getBalance");
      stub.rejects(new Error('address is invalid'));
      let balance = await inst.getBalance(config.MOAC_ADDRESS);
      expect(balance).to.equal('0');
    })
  })

  describe('test getGasPrice', function() {
    let inst;
    before(() => {
      inst = new Moac(config.MOCK_NODE, true)
      inst.initChain3();
    })
    afterEach(() => {
      sandbox.restore();
    })
    it('call getGasPrice successfully', function(done) {
      let stub = sandbox.stub(inst._chain3.mc, "getGasPrice");
      stub.yields(null, config.MOCK_GAS);
      inst.getGasPrice(config.MOCK_GAS_LIMIT).then(gas => {
        expect(gas).to.equal(config.MOCK_GAS_LIMIT.toString());
        let args = stub.getCall(0).args;
        expect(args.length).to.equal(1);
        expect(args[0]).to.be.a('function');
        done()
      });
    })

    it('return default gas price if call getGasPrice in error', function(done) {
      let stub = sandbox.stub(inst._chain3.mc, "getGasPrice");
      stub.yields(new Error('connect node net in error'), undefined)
      inst.getGasPrice(config.MOCK_GAS).then(res => {
        expect(res).to.equal(config.MOCK_GAS_PRICE);
        done()
      });
    })
  })

  describe('test getNonce', function() {
    let inst;
    before(() => {
      inst = new Moac(config.MOCK_NODE, true)
      inst.initChain3();
    })
    afterEach(() => {
      sandbox.restore();
    })
    it('get nonce successfully with no pending', function(done) {
      let stub = sandbox.stub(inst._chain3.mc, "getTransactionCount");
      stub.yields(null, config.MOCK_NONCE);
      let s = sandbox.stub(inst._chain3.currentProvider, "sendAsync");
      s.yields(null, {
        jsonrpc: '2.0',
        id: 1536822829875,
        result: {}
      })
      inst.getNonce(config.MOAC_ADDRESS).then(nonce => {
        expect(nonce).to.equal(config.MOCK_NONCE)
        let args = stub.getCall(0).args;
        expect(args.length).to.equal(2);
        expect(args[0]).to.equal(config.MOAC_ADDRESS);
        expect(args[1]).to.be.a('function');
        args = s.getCall(0).args;
        expect(args.length).to.equal(2);
        expect(args[0].method).to.equal("txpool_content");
        expect(args[0].params).to.deep.equal([]);
        expect(args[0].jsonrpc).to.equal("2.0");
        expect(args[0].id).to.be.a('number');
        expect(args[1]).to.be.a('function');
        done()
      })
    })

    describe('test signTransaction', function() {
      let inst;
      before(() => {
        inst = new Moac(config.MOCK_NODE, true)
        inst.initChain3();
      })
      afterEach(() => {
        sandbox.restore();
      })
      it('get sign successfully', function() {
        var signed = inst.signTransaction(config.MOCK_TX, config.MOAC_SECRET);
        var _chain3 = inst.getChain3();
        var signed2 = _chain3.signTransaction(config.MOCK_TX, config.MOAC_SECRET);
        expect(signed).to.equal(signed2);
        expect(signed).to.equal(config.MOCK_TX_SIGN2);
      })
    })

    it('get nonce successfully with pending', function(done) {
      let stub = sandbox.stub(inst._chain3.mc, "getTransactionCount");
      stub.yields(null, config.MOCK_NONCE);
      stub = sandbox.stub(inst._chain3.currentProvider, "sendAsync");
      let data = {
        jsonrpc: '2.0',
        id: 1536822829875,
        result: {
          pending: {
            "xxx": []
          },
          queued: {}
        }
      }
      data.result.pending[config.MOAC_TO_ADDRESS] = [{
        '1': {}
      }, {
        '2': {}
      }]
      stub.yields(null, data)
      inst.getNonce(config.MOAC_TO_ADDRESS).then(nonce => {
        expect(nonce).to.equal(config.MOCK_NONCE + 2);
        done()
      })
    })

    it('throw error if call getTransactionCount in error', function(done) {
      let stub = sandbox.stub(inst._chain3.mc, "getTransactionCount");
      stub.yields(new Error('moac address is invalid'), null);
      let spy = sandbox.stub(inst._chain3.currentProvider, "sendAsync");
      inst.getNonce(config.MOAC_ADDRESS).catch(err => {
        expect(err.message).to.equal('moac address is invalid');
        expect(spy.called).to.be.false;
        done()
      })
    })

    it('throw error if call sendAsync in error', function(done) {
      let stub = sandbox.stub(inst._chain3.mc, "getTransactionCount");
      stub.yields(null, config.MOCK_NONCE);
      stub = sandbox.stub(inst._chain3.currentProvider, "sendAsync");
      stub.yields(new Error('connect node net in error'), null);
      inst.getNonce(config.MOAC_ADDRESS).catch(err => {
        expect(err.message).to.equal('connect node net in error');
        done()
      })
    })
  })

  describe('test getTx', function() {
    let inst;
    before(() => {
      inst = new Moac(config.MOCK_NODE, true)
      inst.initChain3()
    })
    it('if calldata is not empty', function() {
      let from = config.MOAC_ADDRESS;
      let to = config.MOAC_TO_ADDRESS;
      let nonce = config.MOCK_NONCE;
      let gasLimit = config.MOCK_GAS_LIMIT;
      let gasPrice = config.MOCK_GAS_PRICE;
      let value = config.MOCK_DEPOSIT_VALUE_STR;
      let calldata = "0xaa";
      let tx = inst.getTx(from, to, nonce, gasLimit, gasPrice, value, calldata);
      let data = Object.assign({}, config.MOCK_TX, {
        data: calldata
      })
      expect(tx).to.deep.equal(data);
    })

    it('if calldata is empty', function() {
      let from = config.MOAC_ADDRESS;
      let to = config.MOAC_TO_ADDRESS;
      let nonce = config.MOCK_NONCE;
      let gasLimit = config.MOCK_GAS_LIMIT;
      let gasPrice = config.MOCK_GAS_PRICE;
      let value = config.MOCK_DEPOSIT_VALUE_STR;
      let tx = inst.getTx(from, to, nonce, gasLimit, gasPrice, value);
      expect(tx).to.deep.equal(config.MOCK_TX);
    })
  })

  describe('test sendRawSignedTransaction', function() {
    let inst;
    before(() => {
      inst = new Moac(config.MOCK_NODE, true)
      inst.initChain3();
    })

    afterEach(() => {
      sandbox.restore();
    })

    it('send transaction successfully', function(done) {
      let signedTransaction = "test";
      let stub = sandbox.stub(inst._chain3.mc, "sendRawTransaction");
      stub.yields(null, config.MOCK_HASH);
      inst.sendRawSignedTransaction(signedTransaction).then(hash => {
        expect(hash).to.equal(config.MOCK_HASH);
        let args = stub.getCall(0).args;
        expect(args.length).to.equal(2);
        expect(args[0]).to.equal(signedTransaction);
        expect(args[1]).to.be.a('function');
        done();
      })
    })

    it('send transaction in error', function(done) {
      let signedTransaction = "test";
      let stub = sandbox.stub(inst._chain3.mc, "sendRawTransaction");
      stub.yields(new Error('connect net in error'), null);
      inst.sendRawSignedTransaction(signedTransaction).catch(err => {
        expect(err.message).to.equal('connect net in error');
        done();
      })
    })
  })

  describe('test get Transaction', function() {
    let inst;
    before(() => {
      inst = new Moac(config.MOCK_NODE, true)
      inst.initChain3();
    })

    afterEach(() => {
      sandbox.restore();
    })

    it('get transaction successfully', function(done) {
      let stub = sandbox.stub(inst._chain3.mc, "getTransaction");
      stub.yields(null, config.MOCK_HASH_TRANSACTION);
      inst.getTransaction(config.MOCK_HASH).then(data => {
        expect(data).to.equal(config.MOCK_HASH_TRANSACTION);
        done();
      })
    })

    it('get transaction in error', function(done) {
      let stub = sandbox.stub(inst._chain3.mc, "getTransaction");
      stub.yields(new Error('connect net in error'), null);
      inst.getTransaction(config.MOCK_HASH).catch(err => {
        expect(err.message).to.equal('connect net in error');
        done();
      })
    })
  })

  describe('test get Transaction receipt', function() {
    let inst;
    before(() => {
      inst = new Moac(config.MOCK_NODE, true)
      inst.initChain3();
    })

    afterEach(() => {
      sandbox.restore();
    })

    it('get transaction receipt successfully', function(done) {
      let stub = sandbox.stub(inst._chain3.mc, "getTransactionReceipt");
      stub.yields(null, config.MOCK_HASH_TRANSACTION_RECEIPT);
      inst.getTransactionReceipt(config.MOCK_HASH).then(data => {
        expect(data).to.equal(config.MOCK_HASH_TRANSACTION_RECEIPT);
        done();
      })
    })

    it('get transaction receipt in error', function(done) {
      let stub = sandbox.stub(inst._chain3.mc, "getTransactionReceipt");
      stub.yields(new Error('connect net in error'), null);
      inst.getTransactionReceipt(config.MOCK_HASH).catch(err => {
        expect(err.message).to.equal('connect net in error');
        done();
      })
    })
  })
});