// import BigNumber from "bignumber.js";
import chain3 = require("chain3");
import MoacABI from "jcc-moac-abi";
// import erc20ABI from "./abi/erc20ABI";
import Moac from "./moac";
// import { ITransactionOption } from "./model/transaction";
// import { isValidAmount, isValidMoacAddress, isValidMoacSecret, validate } from "./validator";
import { isValidMoacAddress, validate } from "./validator";

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
     * instance of moac
     *
     * @private
     * @type {Moac}
     * @memberof Fingate
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
     * @memberof ERC721
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
     * init instance of smart contract
     *
     * @param {string} tokenContractAddress contract address of smart contract
     * @param {Moac} moac instance
     * @param {any} abi 
     * @memberof SmartContract
     */
    @validate
    public init(@isValidMoacAddress tokenContractAddress: string, moac: Moac, abi: any) {
        try {
            if (!moac.contractInitialied(this._contract, tokenContractAddress)) {
                this._address = tokenContractAddress;
                this._moac = moac;
                this._contract = this._moac.contract(abi).at(this._address);
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
        if (this._moacABI) {
            this._moacABI.destroy();
        }
    }
}

export default SmartContract;
