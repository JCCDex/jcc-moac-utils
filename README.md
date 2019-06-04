# jcc-moac-utils

Toolkit of crossing chain from [MOAC chain](https://www.moac.io/)  to [SWTC chain](http://swtc.top/index.html#/).

![npm](https://img.shields.io/npm/v/jcc-moac-utils.svg)
[![Build Status](https://travis-ci.com/JCCDex/jcc-moac-utils.svg?branch=master)](https://travis-ci.com/JCCDex/jcc-moac-utils)
[![Coverage Status](https://coveralls.io/repos/github/JCCDex/jcc-moac-utils/badge.svg?branch=master)](https://coveralls.io/github/JCCDex/jcc-moac-utils?branch=master)
[![Dependencies](https://img.shields.io/david/JCCDex/jcc-moac-utils.svg?style=flat-square)](https://david-dm.org/JCCDex/jcc-moac-utils)
[![DevDependencies](https://img.shields.io/david/dev/JCCDex/jcc-moac-utils.svg?style=flat-square)](https://david-dm.org/JCCDex/jcc-moac-utils?type=dev)
[![npm downloads](https://img.shields.io/npm/dm/jcc-moac-utils.svg)](http://npm-stat.com/charts.html?package=jcc-moac-utils)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

## Description

Transfer token automatically from [MOAC](https://www.moac.io/) chain to [SWTC](http://swtc.top/index.html#/) chain. Support moac and erc20 tokens.

e.g. you transfer 1 `moac` to [Moac Fingate](http://explorer.moac.io/addr/0x66c9b619215db959ec137ede6b96f3fa6fd35a8a) from your moac address, If success the contract will automatically transfer 0.999 `jmoac` (if the transaction fee is 0.001 `moac`) to your swtc address from [Jingtum Fingate](https://swtcscan.jccdex.cn/#/wallet/?wallet=jG9ntUTuBKqDURPUqbGYZRuRDVzPY6bpxL) in a few minutes.

## Support token list of erc20

* [CKM](http://explorer.moac.io/token/0x4d206d18fd036423aa74815511904a2a40e25fb1)
* [SNRC](http://explorer.moac.io/token/0x1b9bae18532eeb8cd4316a20678a0c43f28f0ae2)
* [FST](http://explorer.moac.io/token/0x4c6007cea426e543551f2cb6392e6d6768f74706)

***If you wanna we support other erc20 token, please contact us.***

## Installtion

```shell
npm i jcc-moac-utils
```

## Usage

```javascript
// demo
import { MoacFingate, Erc20Fingate } from "jcc-moac-utils";

// Moac node
const node = 'https://moac1ma17f1.jccdex.cn';

// Production network or not
const production = true;

// Your moac secret
const moacSecret = '';

// Your moac address
const moacAddress = '';

// Your swtc address
const swtcAddress = '';

// Deposit amount
const amount = 1;

// Moac fingate contract address, don't change it.
const scAddress = '0x66c9b619215db959ec137ede6b96f3fa6fd35a8a';

try {
    // deposit 1 MOAC
    const inst = new MoacFingate(node, production);
    inst.initMoacContract(scAddress);

    // Check if has pending order, if has don't call the next deposit api
    const state = await inst.depositState(moacAddress);

    if (inst.isPending(state)) {
        return;
    }

    // start to transfer 1 MOAC to fingate address
    const hash = await inst.deposit(swtcAddress, amount, moacSecret);
    console.log(hash);
} catch (error) {
    console.log(error);
}

// deposit erc20 token

try {
    // deposit 1 CKM

    // CKM contract address
    const ckmContractAddress = "0x4d206d18fd036423aa74815511904a2a40e25fb1";

    const inst = new Erc20Fingate(node, production);

    inst.initErc20Contract(scAddress, ckmContractAddress);

    // Check if has pending order, if has don't call transfer api
    const state = await inst.depositState(moacAddress, ckmContractAddress);

    if (inst.isPending(state)) {
        return;
    }

    // The first step to transfer 1 CKM to fingate address.
    const transferHash = await inst.transfer(amount, moacSecret);

    // The next step to submit previous transfer hash.
    const depositHash = await inst.depositToken(swtcAddress, amount, transferHash, moacSecret);
    console.log(depositHash);

    // Warning:
    // This is not an atomic operating to deposit erc20 tokens for now,
    // If the first step is successful but next step is failed, please contact us.
    // The next version will make it an atomic operating after the next version of solidity contract upgrade.
} catch (error) {
    console.log(error);
}

```
