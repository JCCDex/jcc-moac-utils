import BigNumber from "bignumber.js";
import * as jtWallet from "jcc_wallet/lib/jingtum";
import * as moacWallet from "jcc_wallet/lib/moac";

const router = Symbol();
const checkMoacAddressKey = Symbol();
const checkJingtumAddressKey = Symbol();
const checkMoacSecretKey = Symbol();
const checkHashKey = Symbol();
const checkAmountKey = Symbol();

const setTarget = (target: any, name: string, index: number, key: symbol) => {
    target[router] = target[router] || {};
    target[router][name] = target[router][name] || {};
    target[router][name].params = target[router][name].params || [];
    target[router][name].params[index] = key;
};

export const isValidMoacAddress = (target: any, name: string, index: number) => {
    setTarget(target, name, index, checkMoacAddressKey);
};

export const isValidMoacSecret = (target: any, name: string, index: number) => {
    setTarget(target, name, index, checkMoacSecretKey);
};

export const isValidJingtumAddress = (target: any, name: string, index: number) => {
    setTarget(target, name, index, checkJingtumAddressKey);
};

export const isValidHash = (target: any, name: string, index: number) => {
    setTarget(target, name, index, checkHashKey);
};

export const isValidAmount = (target: any, name: string, index: number) => {
    setTarget(target, name, index, checkAmountKey);
};

export const validate = (target: any, name: string, descriptor: PropertyDescriptor) => {
    const method = descriptor.value;

    descriptor.value = function () {
        const params = target[router][name].params;
        if (Array.isArray(params)) {
            const length = params.length;
            for (let index = 0; index < length; index++) {
                const element = params[index];
                let value = arguments[index];
                switch (element) {
                    case checkMoacAddressKey:
                        if (name === "depositState" && index === 1 && value === undefined) {
                            value = "0x0000000000000000000000000000000000000000";
                        }
                        if (!moacWallet.isValidAddress(value)) {
                            throw new Error(`${value} is invalid moac address.`);
                        }
                        break;
                    case checkMoacSecretKey:
                        if (!moacWallet.isValidSecret(value)) {
                            throw new Error(`${value} is invalid moac secret.`);
                        }
                        break;
                    case checkAmountKey:
                        const bn = new BigNumber(value);
                        if (!BigNumber.isBigNumber(bn) || !bn.isGreaterThan(0)) {
                            throw new Error(`${value} is invalid amount.`);
                        }
                        break;
                    case checkHashKey:
                        if (!/^0x([A-Fa-f0-9]{64})$/.test(value)) {
                            throw new Error(`${value} is invalid hash.`);
                        }
                        break;
                    case checkJingtumAddressKey:
                        if (!jtWallet.isValidAddress(value)) {
                            throw new Error(`${value} is invalid jingtum address.`);
                        }
                        break;
                    /* istanbul ignore next */
                    default:
                        break;
                }
            }
        }
        return method.apply(this, arguments);
    };
};
