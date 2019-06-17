"use strict";

import BigNumber from "bignumber.js";
import chain3 = require("chain3");
import moacABI from "./abi/moacABI";
import Moac from "./moac";
import { isValidAmount, isValidJingtumAddress, isValidMoacAddress, isValidMoacSecret, validate } from "./validator";

/**
 * toolkit of moac fingate
 *
 * @class MoacFingate
 * @extends {Moac}
 */
class MoacFingate extends Moac {

    /**
     * instance of moac contract
     *
     * @private
     * @type {chain3.mc.contract}
     * @memberof MoacFingate
     */
    private _moacContractInstance: chain3.mc.contract;

    /**
     * address of moac fingate
     *
     * @private
     * @type {string}
     * @memberof MoacFingate
     */
    private _fingateAddress: string;

    /**
     * decimals of moac
     *
     * @private
     * @type {number}
     * @memberof MoacFingate
     */
    private readonly _moacDecimals: number = 18;

    /**
     * Creates an instance of MoacFingate
     * @param {string} node moac node
     * @param {boolean} mainnet main net or test net
     * @memberof MoacFingate
     */
    constructor(node: string, mainnet: boolean) {
        super(node, mainnet);
        this._moacContractInstance = null;
        this._fingateAddress = null;
    }

    /**
     * get _moacContractInstance
     *
     * @readonly
     * @type {chain3.mc.contract}
     * @memberof MoacFingate
     */
    public get moacContractInstance(): chain3.mc.contract {
        return this._moacContractInstance;
    }

    /**
     * get _moacDecimals
     *
     * @readonly
     * @type {number}
     * @memberof MoacFingate
     */
    public get moacDecimals(): number {
        return this._moacDecimals;
    }

    /**
     * init instance of moac contract
     *
     * @param {string} fingateAddress contract address of moac fingate
     * @memberof MoacFingate
     */
    @validate
    public initMoacContract(@isValidMoacAddress fingateAddress: string) {
        try {
            super.initChain3();
            if (!super.contractInitialied(this._moacContractInstance, fingateAddress)) {
                this._fingateAddress = fingateAddress;
                this._moacContractInstance = this.contract(moacABI).at(this._fingateAddress);
            }
        } catch (e) {
            throw e;
        }
    }

    /**
     * close chain3 & destroy instance of contract
     *
     * @memberof MoacFingate
     */
    public close() {
        super.clearChain3();
        this._moacContractInstance = null;
    }

    /**
     * request deposit state
     *
     * @param {string} address moac address
     * @param {string} [contractAddress="0x0000000000000000000000000000000000000000"] contract address of token
     * @returns {(Promise<Array<BigNumber | string>>)}
     * @memberof MoacFingate
     */
    @validate
    public depositState(@isValidMoacAddress address: string, @isValidMoacAddress contractAddress = "0x0000000000000000000000000000000000000000"): Promise<Array<BigNumber | string>> {
        return new Promise((resolve, reject) => {
            try {
                address = Moac.prefix0x(address);
                const state = this._moacContractInstance.depositState(contractAddress, address);
                return resolve(state);
            } catch (error) {
                return reject(error);
            }
        });
    }

    /**
     * validate deposit state is pending or not
     *
     * @param {(Array<BigNumber | string>)} state
     * @returns {boolean} return true if the state is pending
     * @memberof MoacFingate
     */
    public isPending(state: Array<BigNumber | string>): boolean {
        return state[0].toString(10) !== "0" || state[1] !== "";
    }

    /**
     * deposit moac
     *
     * @param {string} jtAddress jingtum address
     * @param {number} amount amount of deposit
     * @param {string} moacSecret moac secret
     * @returns {Promise<string>} resolve hash if successful
     * @memberof MoacFingate
     */
    @validate
    public deposit(@isValidJingtumAddress jtAddress: string, @isValidAmount amount: number, @isValidMoacSecret moacSecret: string): Promise<string> {
        return new Promise(async (resolve, reject) => {
            try {
                const moacAddress = Moac.getAddress(moacSecret);
                const value = new BigNumber(amount).toString(10);
                const gasLimit = this.gasLimit;
                const gasPrice = await this.getGasPrice(this.minGasPrice);
                const nonce = await this.getNonce(moacAddress);
                const calldata = this.moacContractInstance.deposit.getData(jtAddress);
                const rawTx = this.getTx(moacAddress, this.moacContractInstance.address, nonce, gasLimit, gasPrice, value, calldata);
                const signedTransaction = this._chain3.signTransaction(rawTx, moacSecret);
                const hash = await this.sendRawSignedTransaction(signedTransaction);
                return resolve(hash);
            } catch (error) {
                return reject(error);
            }
        });
    }
}

export default MoacFingate;
