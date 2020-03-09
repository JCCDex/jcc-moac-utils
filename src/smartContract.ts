import chain3 = require("chain3");
import SolidityFunction = require("chain3/lib/chain3/function");
import MoacABI from "jcc-moac-abi";
import Moac from "./moac";

Object.defineProperty(SolidityFunction.prototype, "call", {
  get() {
    return function() {
      const _args = arguments;
      return new Promise((resolve, reject) => {
        const args = Array.prototype.slice.call(_args).filter((a) => {
          return a !== undefined;
        });
        const defaultBlock = this.extractDefaultBlock(args);
        const payload = this.toPayload(args);
        this._mc.call(payload, defaultBlock, (error, output) => {
          if (error) {
            return reject(error);
          }
          return resolve(this.unpackOutput(output));
        });
      });
    };
  }
});

/**
 * toolkit of smart contract
 *
 * @class SmartContract
 */
class SmartContract {
  /**
   * instance of smart contract
   *
   * @private
   * @type {chain3.mc.contract}
   * @memberof SmartContract
   */
  private _contract: chain3.mc.contract;

  /**
   * instance of abi
   *
   * @private
   * @type {any}
   * @memberof SmartContract
   */
  private _abi: any;

  /**
   * instance of moac
   *
   * @private
   * @type {Moac}
   * @memberof SmartContract
   */
  private _moac: Moac;

  /**
   * contract address of smart contract
   *
   * @private
   * @type {string}
   * @memberof SmartContract
   */
  private _address: string;

  /**
   * MoacABI instance
   *
   * @private
   * @type {MoacABI}
   * @memberof SmartContract
   */
  private _moacABI: MoacABI;

  /**
   * Creates an instance of SmartContract
   * @memberof SmartContract
   */
  constructor() {
    this._contract = null;
    this._address = null;
    this._moac = null;
  }

  /**
   * return moac instance
   *
   * @readonly
   * @type {Moac}
   * @memberof SmartContract
   */
  public get moac(): Moac {
    return this._moac;
  }

  /**
   * return contract instance
   *
   * @readonly
   * @type {chain3.mc.contract}
   * @memberof SmartContract
   */
  public get contract(): chain3.mc.contract {
    return this._contract;
  }

  /**
   * init instance of smart contract
   *
   * @param {string} tokenContractAddress contract address of smart contract
   * @param {Moac} moac instance
   * @param {any} abi
   * @memberof SmartContract
   */
  public init(tokenContractAddress: string, moac: Moac, abi: any) {
    try {
      if (!moac.contractInitialied(this._contract, tokenContractAddress)) {
        this._address = tokenContractAddress;
        this._moac = moac;
        this._abi = abi;
        this._contract = this._moac.contract(this._abi).at(this._address);
        this._moacABI = new MoacABI(this._contract);
      }
    } catch (e) {
      throw e;
    }
  }

  /**
   * destroy instance of smart contract
   *
   * @memberof SmartContract
   */
  public destroy() {
    this._contract = null;
  }

  /**
   * call defined function in the abi
   *
   */
  public async getData(name, ...args) {
    return await this._contract[name].getData.apply(null, args);
  }

  /**
   * call defined function in the abi
   *
   */
  public async callABI(name, ...args) {
    const abiItem = this._moacABI.getAbiItem.apply(null, [name, ...args]);
    const { stateMutability } = abiItem;
    if (stateMutability === "view" || stateMutability === "pure") {
      return await this._contract[name].apply(null, args);
    }
    return this._moacABI.encode.apply(null, [name, ...args]);
  }
}

export default SmartContract;
