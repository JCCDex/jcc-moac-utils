import BigNumber from "bignumber.js";
import chain3 = require("chain3");
import MoacABI from "jcc-moac-abi";
import erc20ABI from "./abi/erc20ABI";
import Moac from "./moac";
import { ITransactionOption } from "./model/transaction";
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
    private _contract: chain3.mc.contract;

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
     * MoacABI instance
     *
     * @private
     * @type {MoacABI}
     * @memberof ERC721
     */
    private _moacABI: MoacABI;

    /**
     * Creates an instance of ERC20
     * @memberof ERC20
     */
    constructor() {
        this._contract = null;
        this._address = null;
        this._moac = null;
    }

    /**
     * init instance of erc20 contract
     *
     * @param {string} tokenContractAddress contract address of erc20 token
     * @param {Moac} moac instance
     * @memberof ERC20
     */
    @validate
    public init(@isValidMoacAddress tokenContractAddress: string, moac: Moac) {
        try {
            if (!moac.contractInitialied(this._contract, tokenContractAddress)) {
                this._address = tokenContractAddress;
                this._moac = moac;
                this._contract = this._moac.contract(erc20ABI).at(this._address);
                this._moacABI = new MoacABI(this._contract);
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
    public destroy() {
        this._contract = null;
        if (this._moacABI) {
            this._moacABI.destroy();
        }
    }

    /**
     * request name of erc20 token
     *
     * @returns {Promise<string>} name of erc20 token
     * @memberof ERC20
     */
    public async name(): Promise<string> {
        return await this._moac.callByName(this._contract, "name");
    }

    /**
     * request symbol of erc20 token
     *
     * @returns {Promise<string>} symbol of erc20 token
     * @memberof ERC20
     */
    public async symbol(): Promise<string> {
        return await this._moac.callByName(this._contract, "symbol");
    }

    /**
     * request decimals of erc20 token
     *
     * @returns {Promise<number>} decimals of erc20 token
     * @memberof ERC20
     */
    public async decimals(): Promise<number> {
        return await this._moac.callByName(this._contract, "decimals");
    }

    /**
     * request totalSupply of erc20 token
     *
     * @returns {Promise<number>} decimals of erc20 token
     * @memberof ERC20
     */
    public async totalSupply(): Promise<number> {
        return await this._moac.callByName(this._contract, "totalSupply");
    }

    /**
     * request balance of erc20 token
     *
     * @param {string} address moac address
     * @returns {Promise<string>} resolve '0' if request failed, the precision rely on decimal function
     * @memberof ERC20
     */
    public async balanceOf(address: string): Promise<string> {
        let balance: string;
        try {
            const bnBalance = await this._moac.callByName(this._contract, "balanceOf", address);
            const decimals = await this._moac.callByName(this._contract, "decimals");
            balance = bnBalance.dividedBy(10 ** decimals).toString(10);
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
     * @param {ITransactionOption} options specify gasPrice, nonce, gasLimit etc.
     * @returns {Promise<string>} resolve hash if successful
     * @memberof ERC20
     */
    @validate
    public transfer(@isValidMoacSecret secret: string, @isValidMoacAddress to: string, @isValidAmount amount: string, options?: ITransactionOption): Promise<string> {
        return new Promise(async (resolve, reject) => {
            try {
                const sender = Moac.getAddress(secret);
                options = await this._moac.getOptions(options || {}, sender);
                const decimals = await this.decimals();
                const value = new BigNumber(amount).multipliedBy(10 ** decimals);
                const calldata = this._moacABI.encode("transfer", to, value.toString(10));
                const tx = this._moac.getTx(sender, this._contract.address, options.nonce, options.gasLimit, options.gasPrice, "0", calldata);
                const signedTransaction = this._moac.signTransaction(tx, secret);
                const hash = await this._moac.sendRawSignedTransaction(signedTransaction);
                return resolve(hash);
            } catch (error) {
                return reject(error);
            }
        });
    }

    /**
     * Token owner can approve for `spender` to transferFrom(...) `tokens` from the token owner's account
     *
     * @param {string} secret moac secret of sender address
     * @param {string} spender address of spender
     * @param {string} amount amount
     * @param {ITransactionOption} options specify gasPrice, nonce, gasLimit etc.
     * @returns {Promise<string>} resolve hash if successful
     * @memberof ERC20
     */
    @validate
    public approve(@isValidMoacSecret secret: string, @isValidMoacAddress spender: string, @isValidAmount amount: string, options?: ITransactionOption): Promise<string> {
        return new Promise(async (resolve, reject) => {
            try {
                const sender = Moac.getAddress(secret);
                options = await this._moac.getOptions(options || {}, sender);
                const decimals = await this.decimals();
                const value = new BigNumber(amount).multipliedBy(10 ** decimals);
                const calldata = this._moacABI.encode("approve", spender, value.toString(10));
                const tx = this._moac.getTx(sender, this._contract.address, options.nonce, options.gasLimit, options.gasPrice, "0", calldata);
                const signedTransaction = this._moac.signTransaction(tx, secret);
                const hash = await this._moac.sendRawSignedTransaction(signedTransaction);
                return resolve(hash);
            } catch (error) {
                return reject(error);
            }
        });
    }

    /**
     * Returns the amount of tokens approved by the owner that can be transferred to the spender's account     *
     * @param {string} secret moac secret of sender address
     * @param {string} to address of destination
     * @param {string} amount amount
     * @returns {Promise<string>} resolve hash if successful
     * @memberof ERC20
     */
    @validate
    public async allowance(@isValidMoacAddress owner: string, @isValidMoacAddress spender: string): Promise<string> {
        return await this._moac.callByName(this._contract, "allowance", owner, spender);
    }

    /**
     * Transfer `tokens` from the `from` account to the `to` account
     *
     * @param {string} secret moac secret of sender address
     * @param {string} from address of from
     * @param {string} to address of destination
     * @param {string} amount amount
     * @param {ITransactionOption} options specify gasPrice, nonce, gasLimit etc.
     * @returns {Promise<string>} resolve hash if successful
     * @memberof ERC20
     */
    @validate
    public transferFrom(@isValidMoacSecret secret: string, @isValidMoacAddress from: string, @isValidMoacAddress to: string, @isValidAmount amount: string, options?: ITransactionOption): Promise<string> {
        return new Promise(async (resolve, reject) => {
            try {
                const sender = Moac.getAddress(secret);
                options = await this._moac.getOptions(options || {}, sender);
                const decimals = await this.decimals();
                const value = new BigNumber(amount).multipliedBy(10 ** decimals);
                const calldata = this._moacABI.encode("transferFrom", from, to, value.toString(10));
                const tx = this._moac.getTx(sender, this._contract.address, options.nonce, options.gasLimit, options.gasPrice, "0", calldata);
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
