# Usage

```javascript

npm i jcc-moac-utils@0.1.7

// demo
import { MoacFingate, ERC20Fingate } from "jcc-moac-utils";

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

    const inst = new ERC20Fingate(node, production);

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
