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
      moac.destroyChain3();
      inst.destroy();
    });

    it("instance of erc721 contract had been not initialied", function () {
      inst.init(config.MOAC_ERC721_ADDRESS, moac);
      let instance = inst._contract;
      expect(instance).to.not.null;
      inst.init(config.MOAC_SMART_CONTRACT_ADDRESS, moac);
      expect(inst._contract).to.not.null;
      expect(inst._contract).to.not.deep.equal(instance);
    })

    it("instance of erc721 contract had been initialied", function () {
      inst.init(config.MOAC_ERC721_ADDRESS, moac);
      let instance = inst._contract;
      expect(instance).to.not.null;
      inst.init(config.MOAC_ERC721_ADDRESS, moac);
      expect(inst._contract).to.not.null;
      expect(inst._contract).to.deep.equal(instance);
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
      inst.destroy();
      moac.destroyChain3();
      expect(inst._contract).to.null;
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
      moac.destroyChain3();
      inst.destroy();
    });

    it("Basic infomation", function () {
      let stub = sandbox.stub(inst._contract, "name");
      stub.returns("Golden Coin Token")
      let name = inst.name();
      expect(name).to.equal(config.MOAC_ERC721_NAME);

      stub = sandbox.stub(inst._contract, "symbol");
      stub.returns("GCT")
      let symbol = inst.symbol();
      expect(symbol).to.equal(config.MOAC_ERC721_SYMBOL);

      stub = sandbox.stub(inst._contract, "tokenURI");
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
      moac.destroyChain3();
      inst.destroy();
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
      let spy = sandbox.spy(moac, "sendRawSignedTransaction");
      let hash = await inst.burn(config.MOAC_SECRET, config.MOAC_TO_ADDRESS, config.MOAC_ERC721_TOKEN1_ID);
      expect(hash).to.equal(config.MOCK_HASH);
      expect(spy.calledOnceWith(config.MOCK_ERC721_TX_BURN)).to.true;
    })

    it('get balance successfully', async function () {
      let stub = sandbox.stub(inst._contract, "balanceOf");
      stub.resolves(new BigNumber(3));
      let balance = await inst.balanceOf(config.MOAC_ADDRESS);
      let args = stub.getCall(0).args;
      expect(args.length).to.equal(1);
      expect(args[0][0]).to.equal(config.MOAC_ADDRESS);
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
      let stub = sandbox.stub(inst._contract, "balanceOf");
      stub.throws(new Error("balance error"));
      let balance = await inst.balanceOf(config.MOAC_ADDRESS);
      let args = stub.getCall(0).args;
      expect(args.length).to.equal(1);
      expect(args[0][0]).to.equal(config.MOAC_ADDRESS);
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
      moac.destroyChain3();
      inst.destroy();
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
      let spy = sandbox.spy(moac, "sendRawSignedTransaction");
      let hash = await inst.mint(config.MOAC_SECRET, config.MOAC_TO_ADDRESS, config.MOAC_ERC721_TOKEN1_ID, config.MOAC_ERC721_TOKEN1_URI);
      expect(hash).to.equal(config.MOCK_HASH);
      expect(spy.calledOnceWith(config.MOCK_ERC721_TX_MINT)).to.true;
    })

    it('get ownerOf successfully', async function () {
      let stub = sandbox.stub(inst._contract, "ownerOf");
      stub.resolves(config.MOAC_TO_ADDRESS);
      let owner = await inst.ownerOf(config.MOAC_ERC721_TOKEN1_ID);
      let args = stub.getCall(0).args;
      expect(args.length).to.equal(1);
      expect(args[0][0]).to.equal(config.MOAC_ERC721_TOKEN1_ID);
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
      moac.destroyChain3();
      inst.destroy();
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
      let spy = sandbox.spy(moac, "sendRawSignedTransaction");
      let hash = await inst.safeTransferFrom(config.MOAC_SECRET, config.MOAC_TO_ADDRESS, config.MOAC_ERC721_TOKEN1_ID);
      expect(hash).to.equal(config.MOCK_HASH);
      expect(spy.calledOnceWith("0xf8ce0c808504a817c80083030d40949bd4810a407812042f938d2f69f673843301cfa680b86442842e0e000000000000000000000000ae832592b6d697cd6b3d053866bfe5f334e7c667000000000000000000000000533243557dfdc87ae5bda885e22db00f874999710000000000000000000000000000000000000000000000000000000000000001808081eaa0aefd86be95369597529fa5b9524bc5620b9e6d1e4a9574f52800e39fbb792deda02678d5bbee33ff4da3ebefa065b235692fcaf185fc82832b9a2d09ef9b506be3")).to.true;
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
      let spy = sandbox.spy(moac, "sendRawSignedTransaction");
      let hash = await inst.safeTransferFrom(config.MOAC_SECRET, config.MOAC_TO_ADDRESS, config.MOAC_ERC721_TOKEN1_ID, "0xaa");
      expect(hash).to.equal(config.MOCK_HASH);
      expect(spy.calledOnceWith("0xf9012e0c808504a817c80083030d40949bd4810a407812042f938d2f69f673843301cfa680b8c4b88d4fde000000000000000000000000ae832592b6d697cd6b3d053866bfe5f334e7c667000000000000000000000000533243557dfdc87ae5bda885e22db00f87499971000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000001aa00000000000000000000000000000000000000000000000000000000000000808081eaa0fcd8b4ed8f22ec3643fc3f066c1227a9afa6c0e8cb5359dd69ffd439111458d4a07660d7df1b06cfc9c58a9081b2da88af8e11ae0d2b0804fe36a0656c45ad3e9c")).to.true;
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
      let spy = sandbox.spy(moac, "sendRawSignedTransaction");
      let hash = await inst.transferFrom(config.MOAC_SECRET, config.MOAC_TO_ADDRESS, config.MOAC_ERC721_TOKEN1_ID);
      expect(hash).to.equal(config.MOCK_HASH);
      expect(spy.calledOnceWith(config.MOCK_ERC721_TX_TRANSFERFROM)).to.true;
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
      moac.destroyChain3();
      inst.destroy();
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
      let stub = sandbox.stub(inst._contract, "getApproved");
      stub.resolves(config.MOAC_TO_ADDRESS);
      let approved = await inst.getApproved(config.MOAC_ERC721_TOKEN1_ID);
      let args = stub.getCall(0).args;
      expect(args.length).to.equal(1);
      expect(args[0][0]).to.equal(config.MOAC_ERC721_TOKEN1_ID);
      expect(approved).to.equal(config.MOAC_TO_ADDRESS);
    })

    it('get isApprovedForAll successfully', async function () {
      let stub = sandbox.stub(inst._contract, "isApprovedForAll");
      stub.resolves(false);
      let ret = await inst.isApprovedForAll(config.MOAC_ADDRESS, config.MOAC_TO_ADDRESS);
      let args = stub.getCall(0).args;
      expect(args.length).to.equal(1);
      expect(args[0][0]).to.equal(config.MOAC_ADDRESS);
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
      moac.destroyChain3();
      inst.destroy();
    });

    it('test totalSupply', async function () {
      let stub = sandbox.stub(inst._contract, "totalSupply");
      stub.resolves(new BigNumber(3));
      let total = await inst.totalSupply();
      let args = stub.getCall(0).args;
      expect(args.length).to.equal(1);
      expect(total.toString()).to.equal('3');
    })

    it('test tokenByIndex', async function () {
      let stub = sandbox.stub(inst._contract, "tokenByIndex");
      stub.resolves(new BigNumber(config.MOAC_ERC721_TOKEN1_ID));
      let tokenId = await inst.tokenByIndex('2');
      let args = stub.getCall(0).args;
      expect(args.length).to.equal(1);
      expect(tokenId.toString()).to.equal(config.MOAC_ERC721_TOKEN1_ID);
    })

    it('test tokenOfOwnerByIndex', async function () {
      let stub = sandbox.stub(inst._contract, "tokenOfOwnerByIndex");
      stub.resolves(new BigNumber(config.MOAC_ERC721_TOKEN2_ID));
      let tokenId = await inst.tokenOfOwnerByIndex(config.MOAC_ADDRESS, "2");
      let args = stub.getCall(0).args;
      expect(args[0].length).to.equal(2);
      expect(tokenId.toString()).to.equal(config.MOAC_ERC721_TOKEN2_ID);
    })
  });
});