import BigNumber from "bignumber.js";
import chain3 = require("chain3");
import erc20ABI from "./abi/erc20ABI";
import Moac from "./moac";
import { isValidAmount, isValidMoacAddress, isValidMoacSecret, validate } from "./validator";

/**
 * toolkit of erc20 fingate
 *
 * @class ERC20
 * @extends {Moac}
 */
class ERC20 extends Moac {

    /**
     * instance of erc20 contract
     *
     * @private
     * @type {chain3.mc.contract}
     * @memberof ERC20
     */
    private _instance: chain3.mc.contract;

    /**
     * contract address of erc20 token
     *
     * @private
     * @type {string}
     * @memberof ERC20
     */
    private _address: string;

    /**
     * Creates an instance of ERC20
     * @param {string} node moac node
     * @param {boolean} mainnet main net or test net
     * @memberof ERC20
     */
    constructor(node: string, mainnet: boolean) {
        /* istanbul ignore next  */

        super(node, mainnet);
        this._instance = null;
        this._address = null;
    }

    /**
     * init instance of erc20 contract
     *
     * @param {string} tokenContractAddress contract address of erc20 token
     * @memberof ERC20
     */
    @validate
    public init(@isValidMoacAddress tokenContractAddress: string) {
        try {
            super.initChain3();
            if (!super.contractInitialied(this._instance, tokenContractAddress)) {
                this._address = tokenContractAddress;
                this._instance = this.contract(erc20ABI).at(this._address);
            }
        } catch (e) {
            throw e;
        }
    }

    /**
     * destroy instance of erc20 contract
     *
     * @memberof ERC20
     */
    public close() {
        super.clearChain3();
        this._instance = null;
    }

    /**
     * request name of erc20 token
     *
     * @returns {string} name of erc20 token
     * @memberof ERC20
     */
    public name(): string {
        return this._instance.name();
    }

    /**
     * request symbol of erc20 token
     *
     * @returns {string} symbol of erc20 token
     * @memberof ERC20
     */
    public symbol(): string {
        return this._instance.symbol();
    }

    /**
     * request decimals of erc20 token
     *
     * @returns {number} decimals of erc20 token
     * @memberof ERC20
     */
    public decimals(): number {
        return this._instance.decimals();
    }

    /**
     * request balance of erc20 token
     *
     * @param {string} address moac address
     * @returns {Promise<string>} resolve '' if request failed, the precision rely on decimal function
     * @memberof ERC20
     */
    public async balanceOf(address: string): Promise<string> {
        let balance: string;
        try {
            const bnBalance = await this._instance.balanceOf(address);
            const decimals = this._instance.decimals();
            balance = bnBalance.dividedBy(10 ** decimals).toFormat(decimals);
        } catch (error) {
            balance = "0";
        }
        return balance;
    }

    /**
     * transfer erc20 token
     *
     * @param {string} secret moac secret of sender address
     * @param {string} to address of destination
     * @param {string} amount amount
     * @returns {Promise<string>} resolve hash if successful
     * @memberof ERC20
     */
    @validate
    public transfer(@isValidMoacSecret secret: string, @isValidMoacAddress to: string, @isValidAmount amount: number): Promise<string> {
        return new Promise(async (resolve, reject) => {
            try {
                const sender = Moac.getAddress(secret);
                const gasLimit = this.gasLimit;
                console.log("minGasPrice:", this.minGasPrice);
                const gasPrice = await this.getGasPrice(this.minGasPrice);
                const nonce = await this.getNonce(sender);
                const value = new BigNumber(amount).multipliedBy(10 ** this._instance.decimals());
                const calldata = this._instance.transfer.getData(to, value.toString(10));
                const tx = this.getTx(sender, this._instance.address, nonce, gasLimit, gasPrice, "0", calldata);
                // console.log("erc20 tx:", tx);
                const signedTransaction = this._chain3.signTransaction(tx, secret);
                const hash = await this.sendRawSignedTransaction(signedTransaction);
                return resolve(hash);
            } catch (error) {
                return reject(error);
            }
        });
    }

    /**
     * transfer erc20 token
     *
     * @param {string} secret moac secret of sender address
     * @param {string} spender address of spender
     * @param {string} amount amount
     * @returns {Promise<string>} resolve hash if successful
     * @memberof ERC20
     */
    @validate
    public approve(@isValidMoacSecret secret: string, @isValidMoacAddress spender: string, @isValidAmount amount: number): Promise<string> {
        return new Promise(async (resolve, reject) => {
            try {
                const sender = Moac.getAddress(secret);
                const gasLimit = this.gasLimit;
                const gasPrice = await this.getGasPrice(this.minGasPrice);
                const nonce = await this.getNonce(sender);
                const value = new BigNumber(amount).multipliedBy(10 ** this._instance.decimals());
                const calldata = this._instance.approve.getData(spender, value.toString(10));
                const tx = this.getTx(sender, this._instance.address, nonce, gasLimit, gasPrice, "0", calldata);
                const signedTransaction = this._chain3.signTransaction(tx, secret);
                const hash = await this.sendRawSignedTransaction(signedTransaction);
                return resolve(hash);
            } catch (error) {
                return reject(error);
            }
        });
    }

    /**
     * transfer erc20 token
     *
     * @param {string} secret moac secret of sender address
     * @param {string} to address of destination
     * @param {string} amount amount
     * @returns {Promise<string>} resolve hash if successful
     * @memberof ERC20
     */
    @validate
    public allowance(@isValidMoacAddress owner: string, @isValidMoacAddress spender: string): string {
        return this._instance.allowance(owner, spender);
    }

    /**
     * transfer erc20 token
     *
     * @param {string} secret moac secret of sender address
     * @param {string} from address of from
     * @param {string} to address of destination
     * @param {string} amount amount
     * @returns {Promise<string>} resolve hash if successful
     * @memberof ERC20
     */
    @validate
    public transferFrom(@isValidMoacSecret secret: string, @isValidMoacAddress from: string, @isValidMoacAddress to: string, @isValidAmount amount: number): Promise<string> {
        return new Promise(async (resolve, reject) => {
            try {
                const sender = Moac.getAddress(secret);
                const gasLimit = this.gasLimit;
                console.log("minGasPrice:", this.minGasPrice);
                const gasPrice = await this.getGasPrice(this.minGasPrice);
                const nonce = await this.getNonce(sender);
                const value = new BigNumber(amount).multipliedBy(10 ** this._instance.decimals());
                const calldata = this._instance.transferFrom.getData(from, to, value.toString(10));
                const tx = this.getTx(sender, this._instance.address, nonce, gasLimit, gasPrice, "0", calldata);
                // console.log("erc20 tx:", tx);
                const signedTransaction = this._chain3.signTransaction(tx, secret);
                const hash = await this.sendRawSignedTransaction(signedTransaction);
                return resolve(hash);
            } catch (error) {
                return reject(error);
            }
        });
    }
}

export default ERC20;
