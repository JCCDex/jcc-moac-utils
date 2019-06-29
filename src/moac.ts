"use strict";

import chain3 = require("chain3");
import * as moacWallet from "jcc_wallet/lib/moac";
import { IWalletModel } from "jcc_wallet/lib/model";
import { IMoacTransaction } from "./model/transaction";

/**
 * toolkit of moac
 *
 * @export
 * @class Moac
 */
export default class Moac {

    /**
     * instance of chain3
     *
     * @protected
     * @type {chain3}
     * @memberof Moac
     */
    protected _chain3: chain3;

    /**
     * moac node
     *
     * @private
     * @type {string}
     * @memberof Moac
     */
    private _node: string;

    /**
     * main or test net
     *
     * @private
     * @type {number}
     * @memberof Moac
     */
    private _network: number;

    /**
     * main net
     * the value is 99
     * @private
     * @type {number}
     * @memberof Moac
     */
    private readonly MAINNET: number = 99;

    /**
     * test net
     * the value is 101
     * @private
     * @type {number}
     * @memberof Moac
     */
    private readonly TESTNET: number = 101;

    /**
     * gas limit
     *
     * @private
     * @type {number}
     * @memberof Moac
     */
    private _gasLimit: number;

    /**
     * minimum gas price
     *
     * @private
     * @type {number}
     * @memberof Moac
     */
    private _minGasPrice: number;

    /**
     * Creates an instance of Moac
     * @param {string} node
     * @param {boolean} mainnet
     * @memberof Moac
     */
    constructor(node: string, mainnet: boolean) {
        this._chain3 = null;
        this._node = node;
        this._network = mainnet ? this.MAINNET : this.TESTNET;
        this._gasLimit = 200000;
        this._minGasPrice = 20000000000;
    }

    /**
     * set & get _gasLimit
     *
     * @type {number}
     * @memberof Moac
     */
    public get gasLimit(): number {
        return this._gasLimit;
    }

    public set gasLimit(gas: number) {
        this._gasLimit = gas;
    }

    /**
     * set & get _minGasPrice
     *
     * @type {number}
     * @memberof Moac
     */
    public get minGasPrice(): number {
        return this._minGasPrice;
    }

    public set minGasPrice(value: number) {
        this._minGasPrice = value;
    }

    /**
     * validate moac address
     *
     * @static
     * @param {string} address moac address
     * @returns {boolean} return true if the address is valid
     * @memberof Moac
     */
    public static isValidAddress(address: string): boolean {
        return moacWallet.isValidAddress(address);
    }

    /**
     * validate moac secret
     *
     * @static
     * @param {string} secret moac secret
     * @returns {boolean} return true if the secret is valid
     * @memberof Moac
     */
    public static isValidSecret(secret: string): boolean {
        return moacWallet.isValidSecret(secret);
    }

    /**
     * get moac address with secret
     *
     * @static
     * @param {string} secret moac secret
     * @returns {string} return address if the secret is valid, otherwise return null
     * @memberof Moac
     */
    public static getAddress(secret: string): string {
        return moacWallet.getAddress(secret);
    }

    /**
     * create moac wallet
     *
     * @static
     * @returns {IWalletModel}
     * @memberof Moac
     */
    public static createWallet(): IWalletModel {
        return moacWallet.createWallet();
    }

    /**
     * prefix `0x` before the given moac address if it's not start with `0x`
     *
     * @public
     * @static
     * @param {string} address moac address
     * @returns {string} return itself if the address is empty or start with `0x`
     * @memberof Moac
     */
    public static prefix0x(address: string): string {
        if (address && !address.startsWith("0x")) {
            address = "0x" + address;
        }
        return address;
    }

    /**
     * init instance of chain3
     *
     * @memberof Moac
     */
    public initChain3() {
        const initialied = this._chain3 instanceof chain3;
        if (!initialied || !this._chain3.currentProvider) {
            this._chain3 = new chain3(new chain3.providers.HttpProvider(this._node));
        }
    }

    /**
     * destroy instance of chain3
     *
     * @memberof Moac
     */
    public clearChain3() {
        try {
            this._chain3.setProvider(null);
        } catch (error) {
            /* istanbul ignore next */
        } finally {
            this._chain3 = null;
        }
    }

    /**
     * get instance of chain3
     *
     * @memberof Moac
     */
    public getChain3() {
        return this._chain3;
    }

    /**
     * request balance of moac
     *
     * @param {string} address moac address
     * @returns {Promise<string>} resolve 0 if request failed, it is 18-digit decimal, convert it into number will lose
     * @memberof Moac
     */
    public async getBalance(address: string): Promise<string> {
        let balance: string;
        try {
            const bnBalance = await this._chain3.mc.getBalance(address);
            balance = this._chain3.fromSha(bnBalance).toString(10);
        } catch (error) {
            balance = "0";
        }
        return balance;
    }

    /**
     * request nonce
     *
     * @param {string} address moac address
     * @returns {Promise<number>} resolve nonce if successful
     * @memberof Moac
     */
    public getNonce(address: string): Promise<number> {
        return new Promise((resolve, reject) => {
            this._chain3.mc.getTransactionCount(address, (err: Error, nonce: number) => {
                if (err) {
                    return reject(err);
                }
                let count = nonce;
                this._chain3.currentProvider.sendAsync({
                    id: new Date().getTime(),
                    jsonrpc: "2.0",
                    method: "txpool_content",
                    params: []
                }, (error: Error, res: any) => {
                    if (error) {
                        return reject(error);
                    }
                    const pendings = res.result.pending;
                    if (pendings) {
                        const keys = Object.keys(pendings);
                        for (const index in keys) {
                            if (keys.hasOwnProperty(index)) {
                                const key = keys[index];
                                if (key.toLowerCase() === address.toLowerCase()) {
                                    count = count + Object.keys(pendings[key]).length;
                                }
                            }
                        }
                    }
                    return resolve(count);
                });
            });
        });
    }

    /**
     * request gas price
     *
     * @param {number} limit min gas
     * @returns {Promise<string>} if request failed, the default response gas is 20000000000. if the response gas is less than
     * the given limit, resolve the value of given limit
     * @memberof Moac
     */
    public getGasPrice(limit: number): Promise<string> {
        return new Promise((resolve) => {
            this._chain3.mc.getGasPrice((err: Error, data: number) => {
                if (err) {
                    data = this._minGasPrice;
                }
                if (limit && data < limit) {
                    data = limit;
                }
                return resolve(data.toFixed());
            });
        });
    }

    /**
     * structuring transaction data
     *
     * @param {string} from moac address
     * @param {string} to moac address
     * @param {number} nonce current nonce
     * @param {number} gasLimit gas limit
     * @param {string} gasPrice gas price
     * @param {string} value MOAC amount
     * @param {string} calldata generated by `getData` api of contract
     * @returns {IMoacTransaction} return transaction object
     * @memberof Moac
     */
    public getTx(from: string, to: string, nonce: number, gasLimit: number, gasPrice: string, value: string, calldata: string): IMoacTransaction {
        if (!calldata) {
            calldata = "0x00";
        }
        const tx = {
            chainId: "0x" + this._network.toString(16),
            data: calldata,
            from,
            gasLimit: this._chain3.intToHex(gasLimit),
            gasPrice: this._chain3.intToHex(gasPrice),
            nonce: this._chain3.intToHex(nonce),
            shardingFlag: "0x0",
            systemContract: "0x0",
            to,
            value: this._chain3.intToHex(this._chain3.toSha(value)),
            via: "0x"
        };
        return tx;
    }

    /**
     * sign transaction
     *
     * @param {IMoacTransaction} tx object
     * @returns {string} signed string
     * @memberof Moac
     */
    public signTransaction(tx: IMoacTransaction, secret: string): string {
        return this._chain3.signTransaction(tx, secret);
    }

    /**
     * send raw signed transaction
     *
     * @param {string} signedTransaction generated by `signTransaction` api of chain3 instance
     * @returns {Promise<string>} resolve hash if successful
     * @memberof Moac
     */
    public sendRawSignedTransaction(signedTransaction: string): Promise<string> {
        return new Promise((resolve, reject) => {
            this._chain3.mc.sendRawTransaction(signedTransaction, (err: Error, hash: string) => {
                if (err) {
                    return reject(err);
                }
                return resolve(hash);
            });
        });
    }

    /**
     * get transaction
     *
     * @param {string} hash transaction hash
     * @returns {any} null or transaction object
     * @memberof Moac
     */
    public getTransaction(hash: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this._chain3.mc.getTransaction(hash, (err: Error, data: any) => {
                if (err) {
                    return reject(err);
                }
                return resolve(data);
            });
        });
    }
    /**
     * get transaction receipt
     *
     * @param {string} hash transaction hash
     * @returns {any} null or transaction receipt object
     * @memberof Moac
     */
    public getTransactionReceipt(hash: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this._chain3.mc.getTransactionReceipt(hash, (err: Error, data: any) => {
                if (err) {
                    return reject(err);
                }
                return resolve(data);
            });
        });
    }

    /**
     * get instance of moac or erc20 contract
     *
     * @public
     * @param {object} abi definition of moac abi or erc20 abi
     * @returns {chain3.mc.contract} return instance of moac or erc20 contract
     * @memberof Moac
     */
    public contract(abi: object): chain3.mc.contract {
        return this._chain3.mc.contract(abi);
    }

    /**
     * check instance of contract if initialied
     *
     * @public
     * @param {chain3.mc.contract} contract
     * @param {string} address
     * @returns {boolean}
     * @memberof Moac
     */
    public contractInitialied(contract: chain3.mc.contract, address: string): boolean {
        return contract && contract.address === address;
    }
}
