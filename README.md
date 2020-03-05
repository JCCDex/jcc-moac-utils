# jcc-moac-utils

Toolkit of crossing chain from [MOAC chain](https://www.moac.io/) to [SWTC chain](http://swtc.top/index.html#/).

![npm](https://img.shields.io/npm/v/jcc-moac-utils.svg)
[![Build Status](https://travis-ci.com/JCCDex/jcc-moac-utils.svg?branch=master)](https://travis-ci.com/JCCDex/jcc-moac-utils)
[![Coverage Status](https://coveralls.io/repos/github/JCCDex/jcc-moac-utils/badge.svg?branch=master)](https://coveralls.io/github/JCCDex/jcc-moac-utils?branch=master)
[![Dependencies](https://img.shields.io/david/JCCDex/jcc-moac-utils.svg?style=flat-square)](https://david-dm.org/JCCDex/jcc-moac-utils)
[![npm downloads](https://img.shields.io/npm/dm/jcc-moac-utils.svg)](http://npm-stat.com/charts.html?package=jcc-moac-utils)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

## Description

Transfer token automatically from [MOAC](https://www.moac.io/) chain to [SWTC](http://swtc.top/index.html#/) chain. Support moac and erc20 tokens.

e.g. you transfer 1 `moac` to [Moac Fingate](http://explorer.moac.io/addr/0x66c9b619215db959ec137ede6b96f3fa6fd35a8a) from your moac address, If success the contract will automatically transfer 1 `jmoac` to your swtc address from [Jingtum Fingate](https://swtcscan.jccdex.cn/#/wallet/?wallet=jG9ntUTuBKqDURPUqbGYZRuRDVzPY6bpxL) in a few minutes.

## Support token list of erc20

- [CKM](http://explorer.moac.io/token/0x4d206d18fd036423aa74815511904a2a40e25fb1)
- [SNRC](http://explorer.moac.io/token/0x1b9bae18532eeb8cd4316a20678a0c43f28f0ae2)
- [FST](http://explorer.moac.io/token/0x4c6007cea426e543551f2cb6392e6d6768f74706)

**_If you wanna we support other erc20 token, please contact us._**

## Installtion

```shell
npm i jcc-moac-utils
```

## CDN

`jcc_moac_utils` as a global variable.

```javascript
<script src="https://unpkg.com/jcc-moac-utils/dist/jcc-moac-utils.min.js"></script>
```

## Usage

Breaking changes since 0.1.8, if you used 0.1.7 see [this demo](https://github.com/JCCDex/jcc-moac-utils/blob/master/docs/demo_below_0.1.8.md).

```javascript
// demo
import { Fingate, Moac, ERC20 } from "jcc-moac-utils";

// Moac node
const node = "https://moac1ma17f1.jccdex.cn";

// Production network or not
const production = true;

// Your moac secret
const moacSecret = "";

// Your moac address
const moacAddress = "";

// Your swtc address
const swtcAddress = "";

// Deposit amount
const amount = 1;

// Moac fingate contract address, don't change it.
const scAddress = "0x66c9b619215db959ec137ede6b96f3fa6fd35a8a";

try {
  // deposit 1 MOAC
  const moac = new Moac(node, production);
  moac.initChain3();

  const fingateInstance = new Fingate();
  fingateInstance.init(scAddress, moac);

  // Check if has pending order, if has don't call the next deposit api
  const state = await fingateInstance.depositState(moacAddress);

  if (fingateInstance.isPending(state)) {
    return;
  }

  // start to transfer 1 MOAC to fingate address
  const hash = await fingateInstance.deposit(swtcAddress, amount, moacSecret);
  console.log(hash);
} catch (error) {
  console.log(error);
}

// deposit erc20 token

try {
  // deposit 1 CKM

  // CKM contract address
  const ckmContractAddress = "0x4d206d18fd036423aa74815511904a2a40e25fb1";

  const moac = new Moac(node, production);
  moac.initChain3();

  const fingateInstance = new Fingate();
  fingateInstance.init(scAddress, moac);

  const erc20Instance = new ERC20();
  erc20Instance.init(ckmContractAddress, moac);

  // Check if has pending order, if has don't call transfer api
  const state = await fingateInstance.depositState(moacAddress, ckmContractAddress);

  if (inst.isPending(state)) {
    return;
  }

  // The first step to transfer 1 CKM to fingate address.
  const transferHash = await erc20Instance.transfer(moacSecret, scAddress, amount);

  // The next step to submit previous transfer hash.
  const depositHash = await fingateInstance.depositToken(swtcAddress, ckmContractAddress, erc20Instance.decimals(), amount, transferHash, moacSecret);
  console.log(depositHash);

  // Warning:
  // This is not an atomic operating to deposit erc20 tokens for now,
  // If the first step is successful but next step is failed, please contact us.
  // The next version will make it an atomic operating after the next version of solidity contract upgrade.
} catch (error) {
  console.log(error);
}
```

## API

see [API.md](https://github.com/JCCDex/jcc-moac-utils/blob/master/docs/API.md)

## 关于墨客子链的访问分析

区块链上所有的行为都是交易，墨客链的交易如下

```javascript
declare interface IMoacTransaction {
  from: string;
  nonce: string;
  gasPrice: string;
  gasLimit: string;
  to?: string;
  value: string;
  data: string;
  chainId: string;
  // 0x0 主链调用 0x1 执行子链合约 0x2 子链原生币转账 0x3 在子链部署合约
  shardingFlag: string;
  // 在Chain3的sigUtils中强行赋值，作用未知
  systemContract: string;
  // vnode代理地址
  via: string;
}
// 交易的燃料和价格，在子链中一般都规定是0，当然看子链的设计如何规定了
declare interface ITransactionOption {
  gasLimit?: number | string;
  gasPrice?: number | string;
  nonce?: number;
}
```

所谓子链也有有币和无币的区别，子链上也可以运行各种合约，那么访问子链有以下几种：

- 获取交易信息和区块信息: getNonce, getTransaction, getReceipt, getBlock, 这些在 chain3.scs 接口中都有对应方法
- 单纯的读取合约信息，不修改账本, call,对应在 chain3.scs 是 direct_call 方法，合约参数组装同下个条目
- 调用合约修改账本，这是按照交易方式处理，如果是合约，那么还有参数组装

子链的合约调用，和传统方式相比，多了一个参数就是子链的地址，放在传统合约 data 的一开始位置。

为便于理解，我们以通俗的方式解释下子链构造过程

- 构造链，就得有节点做共识，首先要搭建节点池并进行注册批准，因此会得到一个（多个）vnode 地址，其实就是合约地址，一般称为 vnode address
- 链本身也是一个合约,部署一个子链，其实就是主链上发个交易，但是 shardingFlag 是 0x1,成功后会得到一个 subchain 的合约地址

好，到这一步，会有个子链依赖于母链运行了，我们在子链部署一个合约，实质情况是我们要知道 sub chain 地址，也就是说将构建一个合约的交易发送到 sub chain address 去，母链上部署合约，目的地地址是不需要填写的，墨客子链利用了这个结构上的技巧，当然 shardingFlag 规定是 0x3，不然也分不清这是啥交易。

调用子链的合约，shardingFlag 规定是 0x1,我们知道这个合约地址在主链上是不存在的，所以 to 这个地址只能是 sub chain address，在调用合约时正常组装参数后，在前面加上这个合约地址。这种情况下,ERC20、721 以及各种其他合约各种操作都能走通了

shardingFlag=0x2 用来处理子链原生币的转账，对应的是主链的的 address.transfer 方法。

那么我们编写合约，合约互相调用，其实无需改变，因为他们都在一个子链上，合约内部互相调用和原来一样，这些合约不知道自己运行在子链还是母链，这种结构也决定了子链之间互相不通。
