/// <reference path = "./types/transaction.ts" />

import BigNumber from "bignumber.js";
import erc20ABI from "./abi/erc20ABI";
import Moac from "./moac";
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
    super.init(tokenContractAddress, moac, erc20ABI);
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
    const bnBalance = await super.callABI("balanceOf", address);
    const decimals = await this.decimals();
    const balance = bnBalance.dividedBy(10 ** decimals).toString(10);
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
  public async transfer(@isValidMoacSecret secret: string, @isValidMoacAddress to: string, @isValidAmount amount: string, options?: ITransactionOption): Promise<string> {
    const decimals = await this.decimals();
    const value = new BigNumber(amount).multipliedBy(10 ** decimals);
    const calldata = await super.callABI("transfer", to, value.toString(10));
    const hash = await this.moac.sendTransactionWithCallData(secret, this.contract.address, "0", calldata, options);
    return hash;
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
  public async approve(@isValidMoacSecret secret: string, @isValidMoacAddress spender: string, @isValidAmount amount: string, options?: ITransactionOption): Promise<string> {
    const decimals = await this.decimals();
    const value = new BigNumber(amount).multipliedBy(10 ** decimals);
    const calldata = await super.callABI("approve", spender, value.toString(10));
    const hash = await this.moac.sendTransactionWithCallData(secret, this.contract.address, "0", calldata, options);
    return hash;
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
  public async transferFrom(@isValidMoacSecret secret: string, @isValidMoacAddress from: string, @isValidMoacAddress to: string, @isValidAmount amount: string, options?: ITransactionOption): Promise<string> {
    const decimals = await this.decimals();
    const value = new BigNumber(amount).multipliedBy(10 ** decimals);
    const calldata = await super.callABI("transferFrom", from, to, value.toString(10));
    const hash = await this.moac.sendTransactionWithCallData(secret, this.contract.address, "0", calldata, options);
    return hash;
  }
}

export default ERC20;
