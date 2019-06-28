const chai = require('chai');
const expect = chai.expect;
const ERC721 = require('../lib').ERC721;
const Moac = require('../lib').Moac;
const sinon = require('sinon');
const sandbox = sinon.createSandbox();
const BigNumber = require('bignumber.js');
const config = require("./config");
describe('test ERC721', function () {

  describe("test constructor", function () {
    it("create successfully", function () {
      let moac = new Moac(config.MOCK_NODE, true);
      moac.initChain3();
      let inst = new ERC721();
      inst.init(config.MOAC_ERC721_ADDRESS, moac);
      expect(moac.gasLimit).to.equal(config.MOCK_GAS_LIMIT);
      moac.gasLimit = config.MOCK_GAS;
      expect(moac.gasLimit).to.equal(config.MOCK_GAS);
      inst = new ERC721()
      inst.init(config.MOAC_ERC721_ADDRESS, moac);
      expect(inst._address).to.equal(config.MOAC_ERC20_ADDRESS);
    })
  })

  describe('test init ERC721 Contract', function () {
    let inst
    let moac
    beforeEach(() => {
      moac = new Moac(config.MOCK_NODE, true);
      moac.initChain3();
      inst = new ERC721();
    })

    afterEach(() => {
      moac.clearChain3();
      inst.close();
    });

    it("instance of erc721 contract had been not initialied", function () {
      inst.init(config.MOAC_ERC721_ADDRESS, moac);
      let instance = inst._instance;
      expect(instance).to.not.null;
      inst.init(config.MOAC_SMART_CONTRACT_ADDRESS, moac);
      expect(inst._instance).to.not.null;
      expect(inst._instance).to.not.deep.equal(instance);
    })

    it("instance of erc721 contract had been initialied", function () {
      inst.init(config.MOAC_ERC721_ADDRESS, moac);
      let instance = inst._instance;
      expect(instance).to.not.null;
      inst.init(config.MOAC_ERC721_ADDRESS, moac);
      expect(inst._instance).to.not.null;
      expect(inst._instance).to.deep.equal(instance);
    })

    it("if the address of erc721 contract is invalid", function () {
      expect(() => inst.init(config.MOAC_ERC721_ADDRESS.substring(1), moac)).throw(`${config.MOAC_ERC721_ADDRESS.substring(1)} is invalid moac address.`)
    })

    it('throws error if init error', function () {
      let stub = sandbox.stub(moac, "contractInitialied");
      stub.throws(new Error("create moac instance in error"));
      expect(() => inst.init(config.MOAC_ERC721_ADDRESS, moac)).throw("create moac instance in error");
    })
  })

  describe("test close", function () {
    it("close", function () {
      let moac = new Moac(config.MOCK_NODE, true);
      moac.initChain3();
      let inst = new ERC721()
      inst.init(config.MOAC_ERC721_ADDRESS, moac);
      inst.close();
      moac.clearChain3();
      expect(inst._instance).to.null;
      expect(moac._chain3).to.null;
    })
  })

  describe("ERC721 basic info test", function () {
    let inst
    let moac
    beforeEach(() => {
      moac = new Moac(config.MOCK_NODE, true);
      moac.initChain3();
      inst = new ERC721();
      inst.init(config.MOAC_ERC721_ADDRESS, moac);
    })

    afterEach(() => {
      moac.clearChain3();
      inst.close();
    });

    it("Basic infomation", function () {
      let stub = sandbox.stub(inst._instance, "name");
      stub.returns("Golden Coin Token")
      let name = inst.name();
      expect(name).to.equal(config.MOAC_ERC721_NAME);

      stub = sandbox.stub(inst._instance, "symbol");
      stub.returns("GCT")
      let symbol = inst.symbol();
      expect(symbol).to.equal(config.MOAC_ERC721_SYMBOL);

      stub = sandbox.stub(inst._instance, "tokenURI");
      stub.returns("https://jccdex.cn/")
      let tokenUri = inst.tokenURI();
      expect(tokenUri).to.equal(config.MOAC_ERC721_TOKENURI);
    })
  })

  describe('test balanceOf', function () {
    let inst
    let moac
    beforeEach(() => {
      moac = new Moac(config.MOCK_NODE, true);
      moac.initChain3();
      inst = new ERC721();
      inst.init(config.MOAC_ERC721_ADDRESS, moac);
    })

    afterEach(() => {
      moac.clearChain3();
      inst.close();
    });

    it('mint successfully', async function () {
      let stub = sandbox.stub(moac._chain3.mc, "getGasPrice");
      stub.yields(null, config.MOCK_GAS);
      stub = sandbox.stub(moac._chain3.mc, "getTransactionCount");
      stub.yields(null, config.MOCK_NONCE);
      stub = sandbox.stub(moac._chain3.currentProvider, "sendAsync");
      stub.yields(null, {
        jsonrpc: '2.0',
        id: 1536822829875,
        result: {}
      })
      stub = sandbox.stub(moac._chain3.mc, "sendRawTransaction");
      stub.yields(null, config.MOCK_HASH);
      stub = sandbox.stub(inst._instance.mint, "getData");
      stub.returns(config.MOCK_ERC721_TX_MINT_CALLDATA);
      let spy = sandbox.spy(moac, "sendRawSignedTransaction");
      let hash = await inst.mint(config.MOAC_SECRET, config.MOAC_TO_ADDRESS, config.MOAC_ERC721_TOKEN1_ID, config.MOAC_ERC721_TOKEN1_URI);
      expect(hash).to.equal(config.MOCK_HASH);
      expect(spy.calledOnceWith(config.MOCK_ERC721_TX_MINT)).to.true;
    })

    it('burn successfully', async function () {
      let stub = sandbox.stub(moac._chain3.mc, "getGasPrice");
      stub.yields(null, config.MOCK_GAS);
      stub = sandbox.stub(moac._chain3.mc, "getTransactionCount");
      stub.yields(null, config.MOCK_NONCE);
      stub = sandbox.stub(moac._chain3.currentProvider, "sendAsync");
      stub.yields(null, {
        jsonrpc: '2.0',
        id: 1536822829875,
        result: {}
      })
      stub = sandbox.stub(moac._chain3.mc, "sendRawTransaction");
      stub.yields(null, config.MOCK_HASH);
      stub = sandbox.stub(inst._instance.burn, "getData");
      stub.returns(config.MOCK_ERC721_TX_BURN_CALLDATA);
      let spy = sandbox.spy(moac, "sendRawSignedTransaction");
      let hash = await inst.burn(config.MOAC_SECRET, config.MOAC_TO_ADDRESS, config.MOAC_ERC721_TOKEN1_ID);
      expect(hash).to.equal(config.MOCK_HASH);
      expect(spy.calledOnceWith(config.MOCK_ERC721_TX_BURN)).to.true;
    })

    it('get balance successfully', async function () {
      let stub = sandbox.stub(inst._instance, "balanceOf");
      stub.resolves(new BigNumber(3));
      let balance = await inst.balanceOf(config.MOAC_ADDRESS);
      let args = stub.getCall(0).args;
      expect(args.length).to.equal(1);
      expect(args[0]).to.equal(config.MOAC_ADDRESS);
      expect(balance.toString()).to.equal('3');
    })

    it('throws error if mint error', function (done) {
      let stub = sandbox.stub(moac, "getNonce");
      stub.throws(new Error("mint error"));
      inst.mint(config.MOAC_SECRET, config.MOAC_TO_ADDRESS, config.MOAC_ERC721_TOKEN1_ID, config.MOAC_ERC721_TOKEN1_URI).catch(err => {
        expect(err.message).to.equal('mint error');
        done()
      });
    })

    it('throws error if burn error', function (done) {
      let stub = sandbox.stub(moac, "getNonce");
      stub.throws(new Error("burn error"));
      inst.burn(config.MOAC_SECRET, config.MOAC_TO_ADDRESS, config.MOAC_ERC721_TOKEN1_ID).catch(err => {
        expect(err.message).to.equal('burn error');
        done()
      });
    })

    it('throws error if balance error', async function () {
      let stub = sandbox.stub(inst._instance, "balanceOf");
      stub.throws(new Error("balance error"));
      let balance = await inst.balanceOf(config.MOAC_ADDRESS);
      let args = stub.getCall(0).args;
      expect(args.length).to.equal(1);
      expect(args[0]).to.equal(config.MOAC_ADDRESS);
      expect(balance.toString()).to.equal('0');
    })
  });

  describe('test ownerOf', function () {
    let inst
    let moac
    beforeEach(() => {
      moac = new Moac(config.MOCK_NODE, true);
      moac.initChain3();
      inst = new ERC721();
      inst.init(config.MOAC_ERC721_ADDRESS, moac);
    })

    afterEach(() => {
      moac.clearChain3();
      inst.close();
    });

    it('mint successfully', async function () {
      let stub = sandbox.stub(moac._chain3.mc, "getGasPrice");
      stub.yields(null, config.MOCK_GAS);
      stub = sandbox.stub(moac._chain3.mc, "getTransactionCount");
      stub.yields(null, config.MOCK_NONCE);
      stub = sandbox.stub(moac._chain3.currentProvider, "sendAsync");
      stub.yields(null, {
        jsonrpc: '2.0',
        id: 1536822829875,
        result: {}
      })
      stub = sandbox.stub(moac._chain3.mc, "sendRawTransaction");
      stub.yields(null, config.MOCK_HASH);
      stub = sandbox.stub(inst._instance.mint, "getData");
      stub.returns(config.MOCK_ERC721_TX_MINT_CALLDATA);
      let spy = sandbox.spy(moac, "sendRawSignedTransaction");
      let hash = await inst.mint(config.MOAC_SECRET, config.MOAC_TO_ADDRESS, config.MOAC_ERC721_TOKEN1_ID, config.MOAC_ERC721_TOKEN1_URI);
      expect(hash).to.equal(config.MOCK_HASH);
      expect(spy.calledOnceWith(config.MOCK_ERC721_TX_MINT)).to.true;
    })

    it('get ownerOf successfully', async function () {
      let stub = sandbox.stub(inst._instance, "ownerOf");
      stub.resolves(config.MOAC_TO_ADDRESS);
      let owner = await inst.ownerOf(config.MOAC_ERC721_TOKEN1_ID);
      let args = stub.getCall(0).args;
      expect(args.length).to.equal(1);
      expect(args[0]).to.equal(config.MOAC_ERC721_TOKEN1_ID);
      expect(owner).to.equal(config.MOAC_TO_ADDRESS);
    })
  });

  describe('test safeTransferFrom', function () {
    let inst
    let moac
    beforeEach(() => {
      moac = new Moac(config.MOCK_NODE, true);
      moac.initChain3();
      inst = new ERC721();
      inst.init(config.MOAC_ERC721_ADDRESS, moac);
    })

    afterEach(() => {
      moac.clearChain3();
      inst.close();
    });

    it('mint successfully', async function () {
      let stub = sandbox.stub(moac._chain3.mc, "getGasPrice");
      stub.yields(null, config.MOCK_GAS);
      stub = sandbox.stub(moac._chain3.mc, "getTransactionCount");
      stub.yields(null, config.MOCK_NONCE);
      stub = sandbox.stub(moac._chain3.currentProvider, "sendAsync");
      stub.yields(null, {
        jsonrpc: '2.0',
        id: 1536822829875,
        result: {}
      })
      stub = sandbox.stub(moac._chain3.mc, "sendRawTransaction");
      stub.yields(null, config.MOCK_HASH);
      stub = sandbox.stub(inst._instance.mint, "getData");
      stub.returns(config.MOCK_ERC721_TX_MINT_CALLDATA);
      let spy = sandbox.spy(moac, "sendRawSignedTransaction");
      let hash = await inst.mint(config.MOAC_SECRET, config.MOAC_TO_ADDRESS, config.MOAC_ERC721_TOKEN1_ID, config.MOAC_ERC721_TOKEN1_URI);
      expect(hash).to.equal(config.MOCK_HASH);
      expect(spy.calledOnceWith(config.MOCK_ERC721_TX_MINT)).to.true;
    })

    it('get safeTransferFrom successfully', async function () {
      let stub = sandbox.stub(moac._chain3.mc, "getGasPrice");
      stub.yields(null, config.MOCK_GAS);
      stub = sandbox.stub(moac._chain3.mc, "getTransactionCount");
      stub.yields(null, config.MOCK_NONCE);
      stub = sandbox.stub(moac._chain3.currentProvider, "sendAsync");
      stub.yields(null, {
        jsonrpc: '2.0',
        id: 1536822829875,
        result: {}
      })
      stub = sandbox.stub(moac._chain3.mc, "sendRawTransaction");
      stub.yields(null, config.MOCK_HASH);
      stub = sandbox.stub(inst._instance.safeTransferFrom, "getData");
      stub.returns(config.MOCK_ERC721_TX_SAFETRANSFERFROM_CALLDATA);
      let spy = sandbox.spy(moac, "sendRawSignedTransaction");
      let hash = await inst.safeTransferFrom(config.MOAC_SECRET, config.MOAC_TO_ADDRESS, config.MOAC_ERC721_TOKEN1_ID);
      expect(hash).to.equal(config.MOCK_HASH);
      expect(spy.calledOnceWith(config.MOCK_ERC721_TX_SAFETRANSFERFROM)).to.true;
    })

    it('get safeTransferFrom with data successfully', async function () {
      let stub = sandbox.stub(moac._chain3.mc, "getGasPrice");
      stub.yields(null, config.MOCK_GAS);
      stub = sandbox.stub(moac._chain3.mc, "getTransactionCount");
      stub.yields(null, config.MOCK_NONCE);
      stub = sandbox.stub(moac._chain3.currentProvider, "sendAsync");
      stub.yields(null, {
        jsonrpc: '2.0',
        id: 1536822829875,
        result: {}
      })
      stub = sandbox.stub(moac._chain3.mc, "sendRawTransaction");
      stub.yields(null, config.MOCK_HASH);
      stub = sandbox.stub(inst._instance.safeTransferFrom, "getData");
      stub.returns(config.MOCK_ERC721_TX_SAFETRANSFERFROM_CALLDATA);
      let spy = sandbox.spy(moac, "sendRawSignedTransaction");
      let hash = await inst.safeTransferFrom(config.MOAC_SECRET, config.MOAC_TO_ADDRESS, config.MOAC_ERC721_TOKEN1_ID, "0xaa");
      expect(hash).to.equal(config.MOCK_HASH);
      expect(spy.calledOnceWith(config.MOCK_ERC721_TX_SAFETRANSFERFROM)).to.true;
    })

    it('throws error if safeTransferFrom error', function (done) {
      let stub = sandbox.stub(moac, "getNonce");
      stub.throws(new Error("safeTransferFrom error"));
      inst.safeTransferFrom(config.MOAC_SECRET, config.MOAC_TO_ADDRESS, config.MOAC_ERC721_TOKEN1_ID).catch(err => {
        expect(err.message).to.equal('safeTransferFrom error');
        done()
      });
    })

    it('get transferFrom successfully', async function () {
      let stub = sandbox.stub(moac._chain3.mc, "getGasPrice");
      stub.yields(null, config.MOCK_GAS);
      stub = sandbox.stub(moac._chain3.mc, "getTransactionCount");
      stub.yields(null, config.MOCK_NONCE);
      stub = sandbox.stub(moac._chain3.currentProvider, "sendAsync");
      stub.yields(null, {
        jsonrpc: '2.0',
        id: 1536822829875,
        result: {}
      })
      stub = sandbox.stub(moac._chain3.mc, "sendRawTransaction");
      stub.yields(null, config.MOCK_HASH);
      stub = sandbox.stub(inst._instance.transferFrom, "getData");
      stub.returns(config.MOCK_ERC721_TX_SAFETRANSFERFROM_CALLDATA);
      let spy = sandbox.spy(moac, "sendRawSignedTransaction");
      let hash = await inst.transferFrom(config.MOAC_SECRET, config.MOAC_TO_ADDRESS, config.MOAC_ERC721_TOKEN1_ID);
      expect(hash).to.equal(config.MOCK_HASH);
      expect(spy.calledOnceWith(config.MOCK_ERC721_TX_SAFETRANSFERFROM)).to.true;
    })

    it('throws error if transferFrom error', function (done) {
      let stub = sandbox.stub(moac, "getNonce");
      stub.throws(new Error("transferFrom error"));
      inst.transferFrom(config.MOAC_SECRET, config.MOAC_TO_ADDRESS, config.MOAC_ERC721_TOKEN1_ID).catch(err => {
        expect(err.message).to.equal('transferFrom error');
        done()
      });
    })
  });

  describe('test approve related', function () {
    let inst
    let moac
    beforeEach(() => {
      moac = new Moac(config.MOCK_NODE, true);
      moac.initChain3();
      inst = new ERC721();
      inst.init(config.MOAC_ERC721_ADDRESS, moac);
    })

    afterEach(() => {
      moac.clearChain3();
      inst.close();
    });

    it('approve successfully', async function () {
      let stub = sandbox.stub(moac._chain3.mc, "getGasPrice");
      stub.yields(null, config.MOCK_GAS);
      stub = sandbox.stub(moac._chain3.mc, "getTransactionCount");
      stub.yields(null, config.MOCK_NONCE);
      stub = sandbox.stub(moac._chain3.currentProvider, "sendAsync");
      stub.yields(null, {
        jsonrpc: '2.0',
        id: 1536822829875,
        result: {}
      })
      stub = sandbox.stub(moac._chain3.mc, "sendRawTransaction");
      stub.yields(null, config.MOCK_HASH);
      // stub = sandbox.stub(inst._instance.approve, "getData");
      // stub.returns(config.MOCK_ERC721_TX_APPROVED_CALLDATA);
      let spy = sandbox.spy(moac, "sendRawSignedTransaction");
      let hash = await inst.approve(config.MOAC_SECRET, config.MOAC_TO_ADDRESS, config.MOAC_ERC721_TOKEN1_ID);
      expect(hash).to.equal(config.MOCK_HASH);
      expect(spy.calledOnceWith(config.MOCK_ERC721_TX_APPROVED)).to.true;
    })

    it('throws error if approve error', function (done) {
      let stub = sandbox.stub(moac, "getNonce");
      stub.throws(new Error("approve error"));
      inst.approve(config.MOAC_SECRET, config.MOAC_TO_ADDRESS, config.MOAC_ERC721_TOKEN1_ID).catch(err => {
        expect(err.message).to.equal('approve error');
        done()
      });
    })

    it('setApprovalForAll successfully', async function () {
      let stub = sandbox.stub(moac._chain3.mc, "getGasPrice");
      stub.yields(null, config.MOCK_GAS);
      stub = sandbox.stub(moac._chain3.mc, "getTransactionCount");
      stub.yields(null, config.MOCK_NONCE);
      stub = sandbox.stub(moac._chain3.currentProvider, "sendAsync");
      stub.yields(null, {
        jsonrpc: '2.0',
        id: 1536822829875,
        result: {}
      })
      stub = sandbox.stub(moac._chain3.mc, "sendRawTransaction");
      stub.yields(null, config.MOCK_HASH);
      // stub = sandbox.stub(inst._instance.approve, "getData");
      // stub.returns(config.MOCK_ERC721_TX_APPROVED_CALLDATA);
      let spy = sandbox.spy(moac, "sendRawSignedTransaction");
      let hash = await inst.setApprovalForAll(config.MOAC_SECRET, config.MOAC_TO_ADDRESS, true);
      expect(hash).to.equal(config.MOCK_HASH);
      expect(spy.calledOnceWith(config.MOCK_ERC721_TX_SETAPPROVEDALL)).to.true;
    })

    it('throws error if setApprovalForAll error', function (done) {
      let stub = sandbox.stub(moac, "getNonce");
      stub.throws(new Error("setApprovalForAll error"));
      inst.setApprovalForAll(config.MOAC_SECRET, config.MOAC_TO_ADDRESS, true).catch(err => {
        expect(err.message).to.equal('setApprovalForAll error');
        done()
      });
    })

    it('get getApproved successfully', async function () {
      let stub = sandbox.stub(inst._instance, "getApproved");
      stub.resolves(config.MOAC_TO_ADDRESS);
      let approved = await inst.getApproved(config.MOAC_ERC721_TOKEN1_ID);
      let args = stub.getCall(0).args;
      expect(args.length).to.equal(1);
      expect(args[0]).to.equal(config.MOAC_ERC721_TOKEN1_ID);
      expect(approved).to.equal(config.MOAC_TO_ADDRESS);
    })

    it('get isApprovedForAll successfully', async function () {
      let stub = sandbox.stub(inst._instance, "isApprovedForAll");
      stub.resolves(false);
      let ret = await inst.isApprovedForAll(config.MOAC_ADDRESS, config.MOAC_TO_ADDRESS);
      let args = stub.getCall(0).args;
      expect(args.length).to.equal(2);
      expect(args[0]).to.equal(config.MOAC_ADDRESS);
      expect(ret).to.equal(false);
    })
  });

  describe('test enumeration related', function () {
    let inst
    let moac
    beforeEach(() => {
      moac = new Moac(config.MOCK_NODE, true);
      moac.initChain3();
      inst = new ERC721();
      inst.init(config.MOAC_ERC721_ADDRESS, moac);
    })

    afterEach(() => {
      moac.clearChain3();
      inst.close();
    });

    it('test totalSupply', async function () {
      let stub = sandbox.stub(inst._instance, "totalSupply");
      stub.resolves(new BigNumber(3));
      let total = await inst.totalSupply();
      let args = stub.getCall(0).args;
      expect(args.length).to.equal(0);
      expect(total.toString()).to.equal('3');
    })

    it('test tokenByIndex', async function () {
      let stub = sandbox.stub(inst._instance, "tokenByIndex");
      stub.resolves(new BigNumber(config.MOAC_ERC721_TOKEN1_ID));
      let tokenId = await inst.tokenByIndex('2');
      let args = stub.getCall(0).args;
      expect(args.length).to.equal(1);
      expect(tokenId.toString()).to.equal(config.MOAC_ERC721_TOKEN1_ID);
    })

    it('test tokenOfOwnerByIndex', async function () {
      let stub = sandbox.stub(inst._instance, "tokenOfOwnerByIndex");
      stub.resolves(new BigNumber(config.MOAC_ERC721_TOKEN2_ID));
      let tokenId = await inst.tokenOfOwnerByIndex(config.MOAC_ADDRESS, "2");
      let args = stub.getCall(0).args;
      expect(args.length).to.equal(2);
      expect(tokenId.toString()).to.equal(config.MOAC_ERC721_TOKEN2_ID);
    })
  });
});