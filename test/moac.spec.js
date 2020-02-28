const chai = require("chai");
const expect = chai.expect;
const Moac = require("../lib/moac").default;
const BigNumber = require("bignumber.js");
const sinon = require("sinon");
const sandbox = sinon.createSandbox();
const config = require("./config");

describe("test moac", function() {
  describe("test constructor", function() {
    it("create successfully", function() {
      let inst = new Moac(config.MOCK_NODE, true);
      expect(inst._node).to.equal(config.MOCK_NODE);
      expect(inst._network).to.equal(99);
      inst = new Moac(config.MOCK_NODE, false);
      expect(inst._network).to.equal(101);
    });
  });

  describe("test setter and getter", function() {
    let inst;
    before(() => {
      inst = new Moac(config.MOCK_NODE, true);
    });
    it("property of _minGasPrice", function() {
      inst.minGasPrice = 1;
      expect(inst._minGasPrice).to.equal(1);
      expect(inst.minGasPrice).to.equal(1);
    });

    it("property of _gasLimit", function() {
      inst.gasLimit = 1;
      expect(inst.gasLimit).to.equal(1);
      expect(inst._gasLimit).to.equal(1);
    });
  });

  describe("test isValidAddress", function() {
    it("return true if the moac address is valid", function() {
      let valid = Moac.isValidAddress(config.MOAC_ADDRESS);
      expect(valid).to.equal(true);
    });

    it("return false if the moac address is invalid", function() {
      let valid = Moac.isValidAddress(config.MOAC_ADDRESS.substring(1));
      expect(valid).to.equal(false);
    });
  });

  describe("test isValidSecret", function() {
    it("return true if the moac secret is valid", function() {
      let valid = Moac.isValidSecret(config.MOAC_SECRET);
      expect(valid).to.equal(true);
    });

    it("return false if the moac secret is invalid", function() {
      let valid = Moac.isValidSecret(config.MOAC_SECRET.substring(1));
      expect(valid).to.equal(false);
    });
  });

  describe("test prefix0x", function() {
    it("return itself", function() {
      expect(Moac.prefix0x("0x")).to.equal("0x");
    });
    it("return ''", function() {
      expect(Moac.prefix0x("")).to.equal("");
    });
  });

  describe("test getAddress", function() {
    it("return right address if the moac secret is valid", function() {
      let address = Moac.getAddress(config.MOAC_SECRET);
      expect(address).to.equal("0x" + config.MOAC_ADDRESS);
    });

    it("return null if the moac secret is invalid", function() {
      let address = Moac.getAddress(config.MOAC_SECRET.substring(1));
      expect(address).to.equal(null);
    });
  });

  describe("test create wallet", function() {
    it("test create", function() {
      let wallet = Moac.createWallet();
      let valid = Moac.isValidSecret(wallet.secret);
      expect(valid).to.equal(true);
    });
  });

  describe("test initChain3", function() {
    let inst;
    beforeEach(() => {
      inst = new Moac(config.MOCK_NODE, true);
      inst.initChain3();
    });

    it("instance of chain3 had been initialied", function() {
      let _chain3 = inst._chain3;
      expect(_chain3).to.not.null;
      inst.initChain3();
      expect(_chain3).to.deep.equal(inst._chain3);
    });

    it("instance of chain3 had not been initialied", function() {
      let _chain3 = inst._chain3;
      expect(_chain3).to.not.null;
      inst.destroyChain3();
      expect(inst._chain3).to.be.null;
      inst.initChain3();
      expect(inst._chain3).to.not.null;
      expect(_chain3).to.not.deep.equal(inst._chain3);
    });
  });

  describe("test destroyChain3", function() {
    it("_chian3 is null", function() {
      let inst = new Moac(config.MOCK_NODE, true);
      inst.initChain3();
      expect(inst._chain3).to.not.equal(null);
      inst.destroyChain3();
      expect(inst._chain3).to.equal(null);
    });
  });

  describe("test getBalance", function() {
    let inst;
    before(() => {
      inst = new Moac(config.MOCK_NODE, true);
      inst.initChain3();
    });
    afterEach(() => {
      sandbox.restore();
    });
    it("get balance successfully", async function() {
      let stub = sandbox.stub(inst._chain3.mc, "getBalance");
      stub.resolves(new BigNumber(1));
      let balance = await inst.getBalance(config.MOAC_ADDRESS);
      let args = stub.getCall(0).args;
      expect(args.length).to.equal(1);
      expect(args[0]).to.equal(config.MOAC_ADDRESS);
      expect(balance).to.equal("0.000000000000000001");
    });
  });

  describe("test getGasPrice", function() {
    let inst;
    before(() => {
      inst = new Moac(config.MOCK_NODE, true);
      inst.initChain3();
    });
    afterEach(() => {
      sandbox.restore();
    });
    it("call getGasPrice successfully", function(done) {
      let stub = sandbox.stub(inst._chain3.mc, "getGasPrice");
      stub.yields(null, config.MOCK_GAS);
      inst.getGasPrice(config.MOCK_GAS_LIMIT).then((gas) => {
        expect(gas).to.equal(config.MOCK_GAS_LIMIT.toString());
        let args = stub.getCall(0).args;
        expect(args.length).to.equal(1);
        expect(args[0]).to.be.a("function");
        done();
      });
    });

    it("return default gas price if call getGasPrice in error", function(done) {
      let stub = sandbox.stub(inst._chain3.mc, "getGasPrice");
      stub.yields(new Error("connect node net in error"), undefined);
      inst.getGasPrice(config.MOCK_GAS).then((res) => {
        expect(res).to.equal(config.MOCK_GAS_PRICE);
        done();
      });
    });
  });

  describe("test getTransactionCount", function() {
    let inst;
    before(() => {
      inst = new Moac(config.MOCK_NODE, true);
      inst.initChain3();
    });
    afterEach(() => {
      sandbox.restore();
    });
    it("call getTransactionCount successfully", function(done) {
      let stub = sandbox.stub(inst._chain3.mc, "getTransactionCount");
      stub.yields(null, config.MOCK_TARANSNUM);
      inst.getTransactionCount(config.MOAC_ADDRESS).then((count) => {
        expect(count).to.equal(config.MOCK_TARANSNUM);
        done();
      });
    });

    it("call getTransactionCount failed", function(done) {
      let stub = sandbox.stub(inst._chain3.mc, "getTransactionCount");
      stub.yields(new Error("moac address invalid"), null);
      inst.getTransactionCount(config.MOAC_ADDRESS).catch((err) => {
        expect(err.message).to.equal("moac address invalid");
        done();
      });
    });

    it("call getTransactionCount failed when connect node error", function(done) {
      let stub = sandbox.stub(inst._chain3.mc, "getTransactionCount");
      stub.yields(new Error("connect node net in error"), null);
      inst.getTransactionCount(config.MOAC_ADDRESS).catch((err) => {
        expect(err.message).to.equal("connect node net in error");
        done();
      });
    });
  });

  describe("test getNonce", function() {
    let inst;
    before(() => {
      inst = new Moac(config.MOCK_NODE, true);
      inst.initChain3();
    });
    afterEach(() => {
      sandbox.restore();
    });
    it("get nonce successfully with no pending", function(done) {
      let stub = sandbox.stub(inst._chain3.mc, "getTransactionCount");
      stub.yields(null, config.MOCK_NONCE);
      let s = sandbox.stub(inst._chain3.currentProvider, "sendAsync");
      s.yields(null, {
        jsonrpc: "2.0",
        id: 1536822829875,
        result: {}
      });
      inst.getNonce(config.MOAC_ADDRESS).then((nonce) => {
        expect(nonce).to.equal(config.MOCK_NONCE);
        let args = stub.getCall(0).args;
        expect(args.length).to.equal(2);
        expect(args[0]).to.equal(config.MOAC_ADDRESS);
        expect(args[1]).to.be.a("function");
        args = s.getCall(0).args;
        expect(args.length).to.equal(2);
        expect(args[0].method).to.equal("txpool_content");
        expect(args[0].params).to.deep.equal([]);
        expect(args[0].jsonrpc).to.equal("2.0");
        expect(args[0].id).to.be.a("number");
        expect(args[1]).to.be.a("function");
        done();
      });
    });

    describe("test signTransaction", function() {
      let inst;
      before(() => {
        inst = new Moac(config.MOCK_NODE, true);
        inst.initChain3();
      });
      afterEach(() => {
        sandbox.restore();
      });
      it("get sign successfully", function() {
        var signed = inst.signTransaction(config.MOCK_TX, config.MOAC_SECRET);
        var _chain3 = inst.getChain3();
        var signed2 = _chain3.signTransaction(config.MOCK_TX, config.MOAC_SECRET);
        expect(signed).to.equal(signed2);
        expect(signed).to.equal(config.MOCK_TX_SIGN2);
      });
    });

    it("get nonce successfully with pending", function(done) {
      let stub = sandbox.stub(inst._chain3.mc, "getTransactionCount");
      stub.yields(null, config.MOCK_NONCE);
      stub = sandbox.stub(inst._chain3.currentProvider, "sendAsync");
      let data = {
        jsonrpc: "2.0",
        id: 1536822829875,
        result: {
          pending: {
            xxx: []
          },
          queued: {}
        }
      };
      data.result.pending[config.MOAC_TO_ADDRESS] = [
        {
          "1": {}
        },
        {
          "2": {}
        }
      ];
      stub.yields(null, data);
      inst.getNonce(config.MOAC_TO_ADDRESS).then((nonce) => {
        expect(nonce).to.equal(config.MOCK_NONCE + 2);
        done();
      });
    });

    it("throw error if call getTransactionCount in error", function(done) {
      let stub = sandbox.stub(inst._chain3.mc, "getTransactionCount");
      stub.yields(new Error("moac address is invalid"), null);
      let spy = sandbox.stub(inst._chain3.currentProvider, "sendAsync");
      inst.getNonce(config.MOAC_ADDRESS).catch((err) => {
        expect(err.message).to.equal("moac address is invalid");
        expect(spy.called).to.be.false;
        done();
      });
    });

    it("throw error if call sendAsync in error", function(done) {
      let stub = sandbox.stub(inst._chain3.mc, "getTransactionCount");
      stub.yields(null, config.MOCK_NONCE);
      stub = sandbox.stub(inst._chain3.currentProvider, "sendAsync");
      stub.yields(new Error("connect node net in error"), null);
      inst.getNonce(config.MOAC_ADDRESS).catch((err) => {
        expect(err.message).to.equal("connect node net in error");
        done();
      });
    });
  });

  describe("test getTx", function() {
    let inst;
    before(() => {
      inst = new Moac(config.MOCK_NODE, true);
      inst.initChain3();
    });
    it("if calldata is not empty", function() {
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
      });
      expect(tx).to.deep.equal(data);
    });

    it("if calldata is empty", function() {
      let from = config.MOAC_ADDRESS;
      let to = config.MOAC_TO_ADDRESS;
      let nonce = config.MOCK_NONCE;
      let gasLimit = config.MOCK_GAS_LIMIT;
      let gasPrice = config.MOCK_GAS_PRICE;
      let value = config.MOCK_DEPOSIT_VALUE_STR;
      let tx = inst.getTx(from, to, nonce, gasLimit, gasPrice, value);
      expect(tx).to.deep.equal(config.MOCK_TX);
    });

    it("if to is empty", function() {
      let from = config.MOAC_ADDRESS;
      let nonce = config.MOCK_NONCE;
      let gasLimit = config.MOCK_GAS_LIMIT;
      let gasPrice = config.MOCK_GAS_PRICE;
      let value = config.MOCK_DEPOSIT_VALUE_STR;
      let tx = inst.getTx(from, null, nonce, gasLimit, gasPrice, value);
      const data = Object.assign({}, config.MOCK_TX);
      delete data.to;
      expect(tx).to.deep.equal(data);
    });
  });

  describe("test sendSignedTransaction", function() {
    let inst;
    before(() => {
      inst = new Moac(config.MOCK_NODE, true);
      inst.initChain3();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it("send transaction successfully", function(done) {
      let signedTransaction = "test";
      let stub = sandbox.stub(inst._chain3.mc, "sendRawTransaction");
      stub.yields(null, config.MOCK_HASH);
      inst.sendSignedTransaction(signedTransaction).then((hash) => {
        expect(hash).to.equal(config.MOCK_HASH);
        let args = stub.getCall(0).args;
        expect(args.length).to.equal(2);
        expect(args[0]).to.equal(signedTransaction);
        expect(args[1]).to.be.a("function");
        done();
      });
    });

    it("send transaction in error", function(done) {
      let signedTransaction = "test";
      let stub = sandbox.stub(inst._chain3.mc, "sendRawTransaction");
      stub.yields(new Error("connect net in error"), null);
      inst.sendSignedTransaction(signedTransaction).catch((err) => {
        expect(err.message).to.equal("connect net in error");
        done();
      });
    });
  });

  describe("test sendRawSignedTransaction", function() {
    let inst;
    before(() => {
      inst = new Moac(config.MOCK_NODE, true);
      inst.initChain3();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it("send transaction successfully", function(done) {
      let signedTransaction = "test";
      let stub = sandbox.stub(inst._chain3.mc, "sendRawTransaction");
      stub.yields(null, config.MOCK_HASH);
      inst.sendRawSignedTransaction(signedTransaction).then((hash) => {
        expect(hash).to.equal(config.MOCK_HASH);
        let args = stub.getCall(0).args;
        expect(args.length).to.equal(2);
        expect(args[0]).to.equal(signedTransaction);
        expect(args[1]).to.be.a("function");
        done();
      });
    });

    it("send transaction in error", function(done) {
      let signedTransaction = "test";
      let stub = sandbox.stub(inst._chain3.mc, "sendRawTransaction");
      stub.yields(new Error("connect net in error"), null);
      inst.sendRawSignedTransaction(signedTransaction).catch((err) => {
        expect(err.message).to.equal("connect net in error");
        done();
      });
    });
  });

  describe("test get Transaction", function() {
    let inst;
    before(() => {
      inst = new Moac(config.MOCK_NODE, true);
      inst.initChain3();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it("get transaction successfully", function(done) {
      let stub = sandbox.stub(inst._chain3.mc, "getTransaction");
      stub.yields(null, config.MOCK_HASH_TRANSACTION);
      inst.getTransaction(config.MOCK_HASH).then((data) => {
        expect(data).to.equal(config.MOCK_HASH_TRANSACTION);
        expect(stub.calledOnceWith(config.MOCK_HASH.toLowerCase())).to.true;
        done();
      });
    });

    it("hash is invalid", function() {
      expect(() => inst.getTransaction(config.MOCK_HASH.substring(2))).throw(`${config.MOCK_HASH.substring(2)} is invalid hash.`);
      expect(() => inst.getTransaction(config.MOCK_HASH.replace("0x", "0X"))).throw(`${config.MOCK_HASH.replace("0x", "0X")} is invalid hash.`);
      expect(() => inst.getTransaction(config.MOCK_HASH.substring(0, 64))).throw(`${config.MOCK_HASH.substring(0, 64)} is invalid hash.`);
      expect(() => inst.getTransaction(config.MOCK_HASH + "0")).throw(`${config.MOCK_HASH + "0"} is invalid hash.`);
    });

    it("get transaction in error", function(done) {
      let stub = sandbox.stub(inst._chain3.mc, "getTransaction");
      stub.yields(new Error("connect net in error"), null);
      inst.getTransaction(config.MOCK_HASH).catch((err) => {
        expect(err.message).to.equal("connect net in error");
        done();
      });
    });
  });

  describe("test get Transaction receipt", function() {
    let inst;
    before(() => {
      inst = new Moac(config.MOCK_NODE, true);
      inst.initChain3();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it("get transaction receipt successfully", function(done) {
      let stub = sandbox.stub(inst._chain3.mc, "getTransactionReceipt");
      stub.yields(null, config.MOCK_HASH_TRANSACTION_RECEIPT);
      inst.getTransactionReceipt(config.MOCK_HASH).then((data) => {
        expect(data).to.equal(config.MOCK_HASH_TRANSACTION_RECEIPT);
        expect(stub.calledOnceWith(config.MOCK_HASH.toLowerCase())).to.true;
        done();
      });
    });

    it("hash is invalid", function() {
      expect(() => inst.getTransactionReceipt(config.MOCK_HASH.substring(2))).throw(`${config.MOCK_HASH.substring(2)} is invalid hash.`);
      expect(() => inst.getTransactionReceipt(config.MOCK_HASH.replace("0x", "0X"))).throw(`${config.MOCK_HASH.replace("0x", "0X")} is invalid hash.`);
      expect(() => inst.getTransactionReceipt(config.MOCK_HASH.substring(0, 64))).throw(`${config.MOCK_HASH.substring(0, 64)} is invalid hash.`);
      expect(() => inst.getTransactionReceipt(config.MOCK_HASH + "0")).throw(`${config.MOCK_HASH + "0"} is invalid hash.`);
    });

    it("get transaction receipt in error", function(done) {
      let stub = sandbox.stub(inst._chain3.mc, "getTransactionReceipt");
      stub.yields(new Error("connect net in error"), null);
      inst.getTransactionReceipt(config.MOCK_HASH).catch((err) => {
        expect(err.message).to.equal("connect net in error");
        done();
      });
    });
  });

  describe("test getBlock", function() {
    let inst;
    before(() => {
      inst = new Moac(config.MOCK_NODE, true);
      inst.initChain3();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it("request block info success", async function() {
      let stub = sandbox.stub(inst._chain3.mc, "getBlock");
      stub.resolves({});
      const blockInfo = await inst.getBlock("1");
      expect(stub.calledOnceWith("1")).to.true;
      expect(blockInfo).to.deep.equal({});
    });

    it("request block info failed return null", async function() {
      let stub = sandbox.stub(inst._chain3.mc, "getBlock");
      stub.rejects();
      const blockInfo = await inst.getBlock("1");
      expect(blockInfo).to.equal(null);
    });
  });

  describe("test getOptions", function() {
    let inst;
    before(() => {
      inst = new Moac(config.MOCK_NODE, true);
      inst.initChain3();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it("if options if empty", async function() {
      let stub = sandbox.stub(inst, "getGasPrice");
      stub.resolves(config.MOCK_GAS);
      stub = sandbox.stub(inst, "getNonce");
      stub.resolves(config.MOCK_NONCE);
      const options = await inst.getOptions({}, config.MOAC_ADDRESS);
      expect(options).to.deep.equal({
        nonce: config.MOCK_NONCE,
        gasPrice: config.MOCK_GAS,
        gasLimit: 200000
      });
    });

    it("if options if not", async function() {
      let stub = sandbox.stub(inst, "getGasPrice");
      stub.resolves(config.MOCK_GAS);
      stub = sandbox.stub(inst, "getNonce");
      stub.resolves(config.MOCK_NONCE);
      const options = await inst.getOptions(
        {
          gasLimit: 1,
          gasPrice: 2,
          nonce: 3
        },
        config.MOAC_ADDRESS
      );
      expect(options).to.deep.equal({
        nonce: 3,
        gasPrice: 2,
        gasLimit: 1
      });
    });
  });

  describe("test transferMoac", function() {
    let moac;
    before(function() {
      moac = new Moac(config.MOCK_NODE, true);
      moac.initChain3();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it("transfer moac successfully with memo", async function() {
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
      let hash = await moac.transferMoac(config.MOAC_SECRET, config.MOAC_ERC20_ADDRESS, "1", "test测试");
      expect(stub.calledOnceWith("0xf8870c808504a817c80083030d40949bd4810a407812042f938d2f69f673843301cfa6880de0b6b3a76400009674657374254536254235253842254538254146253935808081eaa06b87446d73f4ad0d63dae5707b35b34efae1df0fdc5919e64090f5d28e95bd64a0406886445a194eeff334cce8bdb1640d7ada3fb806075ee387f24637a232ea4d")).true;
      expect(hash).to.equal(config.MOCK_HASH);
    });

    it("transfer moac successfully without memo", async function() {
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
      let hash = await moac.transferMoac(config.MOAC_SECRET, config.MOAC_ERC20_ADDRESS, "1");
      expect(stub.calledOnceWith("0xf8710c808504a817c80083030d40949bd4810a407812042f938d2f69f673843301cfa6880de0b6b3a764000000808081e9a06d2da1cf30a41b8b12150bee4b08ba5e7669596efa77cb5b697d104a2dd639eda0191c50367e31b5f8edf13faf822e09806965858209fa5f43b88a6ab04c9e2795")).true;
      expect(hash).to.equal(config.MOCK_HASH);
    });

    it("amount is invalid", function() {
      expect(() => moac.transferMoac(config.MOAC_SECRET, config.MOAC_ERC20_ADDRESS, "-1")).throw(`-1 is invalid amount.`);
    });

    it("moac secret is invalid", function() {
      expect(() => moac.transferMoac(config.MOAC_SECRET.substring(1), config.MOAC_ERC20_ADDRESS, "1")).throw(`${config.MOAC_SECRET.substring(1)} is invalid moac secret.`);
    });

    it("destination address is invalid", function() {
      expect(() => moac.transferMoac(config.MOAC_SECRET, config.MOAC_ERC20_ADDRESS.substring(1), "1")).throw(`${config.MOAC_ERC20_ADDRESS.substring(1)} is invalid moac address.`);
    });

    it("deposit in error", function(done) {
      let stub = sandbox.stub(moac._chain3.mc, "getTransactionCount");
      stub.yields(new Error("request nonce in error"), null);
      moac.transferMoac(config.MOAC_SECRET, config.MOAC_ERC20_ADDRESS, "1").catch((error) => {
        expect(error.message).to.equal("request nonce in error");
        done();
      });
    });
  });
});
