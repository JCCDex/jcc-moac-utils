import BigNumber from "bignumber.js";
import erc20ABI from "./abi/erc20ABI";
import Moac from "./moac";
import { ITransactionOption } from "./model/transaction";
import SmartContract from "./smartContract";
import { isValidAmount, isValidMoacAddress, isValidMoacSecret, validate } from "./validator";

/**
 * toolkit of erc20
 *
 * @class ERC20
 */
class ERC20 extends SmartContract {

    /**
     * Creates an instance of ERC20
     * @memberof ERC20
     */
    constructor() {
        super();
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
            super.init(tokenContractAddress, moac, erc20ABI);
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
        super.destroy();
    }

    /**
     * request name of erc20 token
     *
     * @returns {Promise<string>} name of erc20 token
     * @memberof ERC20
     */
    public async name(): Promise<string> {
        return await super.callABI("name");
    }

    /**
     * request symbol of erc20 token
     *
     * @returns {Promise<string>} symbol of erc20 token
     * @memberof ERC20
     */
    public async symbol(): Promise<string> {
        return await super.callABI("symbol");
    }

    /**
     * request decimals of erc20 token
     *
     * @returns {Promise<number>} decimals of erc20 token
     * @memberof ERC20
     */
    public async decimals(): Promise<number> {
        return await super.callABI("decimals");
    }

    /**
     * request totalSupply of erc20 token
     *
     * @returns {Promise<number>} decimals of erc20 token
     * @memberof ERC20
     */
    public async totalSupply(): Promise<number> {
        return await super.callABI("totalSupply");
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

            const bnBalance = await super.callABI("balanceOf", address);
            const decimals = await this.decimals();
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
                options = await this.moac.getOptions(options || {}, sender);
                const decimals = await this.decimals();
                const value = new BigNumber(amount).multipliedBy(10 ** decimals);
                const calldata = await super.callABI("transfer", to, value.toString(10));
                const tx = this.moac.getTx(sender, this.contract.address, options.nonce, options.gasLimit, options.gasPrice, "0", calldata);
                const signedTransaction = this.moac.signTransaction(tx, secret);
                const hash = await this.moac.sendRawSignedTransaction(signedTransaction);
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
                options = await this.moac.getOptions(options || {}, sender);
                const decimals = await this.decimals();
                const value = new BigNumber(amount).multipliedBy(10 ** decimals);
                const calldata = await super.callABI("approve", spender, value.toString(10));
                const tx = this.moac.getTx(sender, this.contract.address, options.nonce, options.gasLimit, options.gasPrice, "0", calldata);
                const signedTransaction = this.moac.signTransaction(tx, secret);
                const hash = await this.moac.sendRawSignedTransaction(signedTransaction);
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
        return await super.callABI("allowance", owner, spender);
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
                options = await this.moac.getOptions(options || {}, sender);
                const decimals = await this.decimals();
                const value = new BigNumber(amount).multipliedBy(10 ** decimals);
                const calldata = await super.callABI("transferFrom", from, to, value.toString(10));
                const tx = this.moac.getTx(sender, this.contract.address, options.nonce, options.gasLimit, options.gasPrice, "0", calldata);
                const signedTransaction = this.moac.signTransaction(tx, secret);
                const hash = await this.moac.sendRawSignedTransaction(signedTransaction);
                return resolve(hash);
            } catch (error) {
                return reject(error);
            }
        });
    }
}

export default ERC20;
