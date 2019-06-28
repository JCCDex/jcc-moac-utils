import BigNumber from "bignumber.js";
import chain3 = require("chain3");
import erc20ABI from "./abi/erc20ABI";
import Moac from "./moac";
import { isValidAmount, isValidMoacAddress, isValidMoacSecret, validate } from "./validator";

/**
 * toolkit of erc20
 *
 * @class ERC20
 */
class ERC20 {

    /**
     * instance of erc20 contract
     *
     * @private
     * @type {chain3.mc.contract}
     * @memberof ERC20
     */
    private _instance: chain3.mc.contract;

    /**
     * instance of moac
     *
     * @private
     * @type {Moac}
     * @memberof Fingate
     */
    private _moac: Moac;

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
     * @memberof ERC20
     */
    constructor() {
        /* istanbul ignore next  */

        this._instance = null;
        this._address = null;
        this._moac = null;
    }

    /**
     * init instance of erc20 contract
     *
     * @param {string} tokenContractAddress contract address of erc20 token
     * @memberof ERC20
     */
    @validate
    public init(@isValidMoacAddress tokenContractAddress: string, moac: Moac) {
        try {
            if (!moac.contractInitialied(this._instance, tokenContractAddress)) {
                this._address = tokenContractAddress;
                this._moac = moac;
                this._instance = this._moac.contract(erc20ABI).at(this._address);
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
    public transfer(@isValidMoacSecret secret: string, @isValidMoacAddress to: string, @isValidAmount amount: string): Promise<string> {
        return new Promise(async (resolve, reject) => {
            try {
                const sender = Moac.getAddress(secret);
                const gasLimit = this._moac.gasLimit;
                const gasPrice = await this._moac.getGasPrice(this._moac.minGasPrice);
                const nonce = await this._moac.getNonce(sender);
                const value = new BigNumber(amount).multipliedBy(10 ** this._instance.decimals());
                const calldata = this._instance.transfer.getData(to, value.toString(10));
                const tx = this._moac.getTx(sender, this._instance.address, nonce, gasLimit, gasPrice, "0", calldata);
                const signedTransaction = this._moac.signTransaction(tx, secret);
                const hash = await this._moac.sendRawSignedTransaction(signedTransaction);
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
    public approve(@isValidMoacSecret secret: string, @isValidMoacAddress spender: string, @isValidAmount amount: string): Promise<string> {
        return new Promise(async (resolve, reject) => {
            try {
                const sender = Moac.getAddress(secret);
                const gasLimit = this._moac.gasLimit;
                const gasPrice = await this._moac.getGasPrice(this._moac.minGasPrice);
                const nonce = await this._moac.getNonce(sender);
                const value = new BigNumber(amount).multipliedBy(10 ** this._instance.decimals());
                const calldata = this._instance.approve.getData(spender, value.toString(10));
                const tx = this._moac.getTx(sender, this._instance.address, nonce, gasLimit, gasPrice, "0", calldata);
                const signedTransaction = this._moac.signTransaction(tx, secret);
                const hash = await this._moac.sendRawSignedTransaction(signedTransaction);
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
    public transferFrom(@isValidMoacSecret secret: string, @isValidMoacAddress from: string, @isValidMoacAddress to: string, @isValidAmount amount: string): Promise<string> {
        return new Promise(async (resolve, reject) => {
            try {
                const sender = Moac.getAddress(secret);
                const gasLimit = this._moac.gasLimit;
                const gasPrice = await this._moac.getGasPrice(this._moac.minGasPrice);
                const nonce = await this._moac.getNonce(sender);
                const value = new BigNumber(amount).multipliedBy(10 ** this._instance.decimals());
                const calldata = this._instance.transferFrom.getData(from, to, value.toString(10));
                const tx = this._moac.getTx(sender, this._instance.address, nonce, gasLimit, gasPrice, "0", calldata);
                const signedTransaction = this._moac.signTransaction(tx, secret);
                const hash = await this._moac.sendRawSignedTransaction(signedTransaction);
                return resolve(hash);
            } catch (error) {
                return reject(error);
            }
        });
    }
}

export default ERC20;
