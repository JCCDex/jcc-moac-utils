import BigNumber from "bignumber.js";
import chain3 = require("chain3");
import MoacABI from "jcc-moac-abi";
import erc721ABI from "./abi/erc721ABI";
import Moac from "./moac";
import { ITransactionOption } from "./model/transaction";
import { isValidMoacAddress, isValidMoacSecret, validate } from "./validator";

/**
 * toolkit of erc721
 *
 * @class ERC721
 */
class ERC721 {

    /**
     * instance of erc721 contract
     *
     * @private
     * @type {chain3.mc.contract}
     * @memberof ERC721
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
     * contract address of erc721 token
     *
     * @private
     * @type {string}
     * @memberof ERC721
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
     * Creates an instance of ERC721
     * @memberof ERC721
     */
    constructor() {
        this._contract = null;
        this._address = null;
        this._moac = null;
    }

    /**
     * init instance of erc721 contract
     *
     * @param {string} tokenContractAddress contract address of erc721 token
     * @param {Moac} moac instance
     * @memberof ERC721
     */
    @validate
    public init(@isValidMoacAddress tokenContractAddress: string, moac: Moac) {
        try {
            if (!moac.contractInitialied(this._contract, tokenContractAddress)) {
                this._address = tokenContractAddress;
                this._moac = moac;
                this._contract = this._moac.contract(erc721ABI).at(this._address);
                this._moacABI = new MoacABI(this._contract);
                // TODO: check the contract interface is up to standard or not
            }
        } catch (e) {
            throw e;
        }
    }

    /**
     * destroy instance of erc721 contract
     *
     * @memberof ERC721
     */
    public destroy() {
        this._contract = null;
        if (this._moacABI) {
            this._moacABI.destroy();
        }
    }

    /**
     * request name of erc721 token
     *
     * @returns {string} name of erc721 token
     * @memberof ERC721
     */
    public name(): string {
        return this._contract.name();
    }

    /**
     * request symbol of erc721 token
     *
     * @returns {string} symbol of erc721 token
     * @memberof ERC721
     */
    public symbol(): string {
        return this._contract.symbol();
    }

    /**
     * A distinct Uniform Resource Identifier (URI) for a given asset
     *
     * @param {string} tokenid of erc721 token
     * @returns {string} uri of erc721 token
     * @memberof ERC721
     */
    public tokenURI(tokenId: string): string {
        return this._contract.tokenURI(new BigNumber(tokenId));
    }

    /**
     * mint erc721 token
     *
     * @param {string} secret of sender
     * @param {string} to address of send to
     * @param {string} tokenId asset id
     * @param {string} uri token uri
     * @param {ITransactionOption} options specify gasPrice, nonce, gasLimit etc.
     * @returns {Promise<string>} return hash, reject error if something wrong.
     * @memberof ERC721
     */
    @validate
    public async mint(@isValidMoacSecret secret: string, @isValidMoacAddress to: string, tokenId: string, uri: string, options?: ITransactionOption): Promise<string> {
        return new Promise(async (resolve, reject) => {
            try {
                const sender = Moac.getAddress(secret);
                options = await this._moac.getOptions(options || {}, sender);
                const calldata = this._moacABI.encode("mint", to, tokenId, uri);
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
     * burn erc721 token
     *
     * @param {string} secret of sender
     * @param {string} to address of send to
     * @param {string} tokenId asset id
     * @param {ITransactionOption} options specify gasPrice, nonce, gasLimit etc.
     * @returns {Promise<string>} return hash, reject error if something wrong.
     * @memberof ERC721
     */
    @validate
    public async burn(@isValidMoacSecret secret: string, @isValidMoacAddress owner: string, tokenId: string, options?: ITransactionOption): Promise<string> {
        return new Promise(async (resolve, reject) => {
            try {
                const sender = Moac.getAddress(secret);
                options = await this._moac.getOptions(options || {}, sender);
                const calldata = this._moacABI.encode("burn", owner, tokenId);
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
     * request balance of erc721 token.
     *
     * @param {string} address moac address
     * @returns {Promise<string>} resolve '0' if request failed, the precision rely on decimal function
     * @memberof ERC721
     */
    @validate
    public async balanceOf(@isValidMoacAddress owner: string): Promise<string> {
        let balance: string;
        try {
            balance = this._contract.balanceOf(owner);
        } catch (error) {
            balance = "0";
        }
        return balance;
    }

    /**
     * request owner of erc721 token
     *
     * @param {string} tokenId token id
     * @returns {Promise<string>} return address of owner
     * @memberof ERC721
     */
    public async ownerOf(tokenId: string): Promise<string> {
        return this._contract.ownerOf(tokenId);
    }

    /**
     * safely transfer erc721 token.
     *
     * @param {string} secret moac secret of sender address
     * @param {string} to address of destination
     * @param {string} tokenId asset id
     * @param {string} data data bytes string
     * @param {ITransactionOption} options specify gasPrice, nonce, gasLimit etc.
     * @returns {Promise<string>} resolve hash if successful
     * @memberof ERC721
     */
    @validate
    public safeTransferFrom(@isValidMoacSecret secret: string, @isValidMoacAddress to: string, tokenId: string, data?: string, options?: ITransactionOption): Promise<string> {
        return new Promise(async (resolve, reject) => {
            try {
                const sender = Moac.getAddress(secret);
                options = await this._moac.getOptions(options || {}, sender);
                const calldata = !data ? this._moacABI.encode("safeTransferFrom", sender, to, tokenId) : this._moacABI.encode("safeTransferFrom", sender, to, tokenId, data);
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
     * transfer erc721 token
     *
     * @param {string} secret moac secret of sender address
     * @param {string} to address of destination
     * @param {string} tokenId asset id
     * @param {ITransactionOption} options specify gasPrice, nonce, gasLimit etc.
     * @returns {Promise<string>} resolve hash if successful
     * @memberof ERC721
     */
    @validate
    public transferFrom(@isValidMoacSecret secret: string, @isValidMoacAddress to: string, tokenId: string, options?: ITransactionOption): Promise<string> {
        return new Promise(async (resolve, reject) => {
            try {
                const sender = Moac.getAddress(secret);
                options = await this._moac.getOptions(options || {}, sender);
                const calldata = this._moacABI.encode("transferFrom", sender, to, tokenId);
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
     * Set or reaffirm the approved address for an NFT.
     *
     * @param {string} secret moac secret of sender address
     * @param {string} approved Address to be approved for the given NFT ID.
     * @param {string} tokenId ID of the token to be approved.
     * @param {ITransactionOption} options specify gasPrice, nonce, gasLimit etc.
     * @returns {Promise<string>} resolve hash if successful
     * @memberof ERC721
     */
    @validate
    public approve(@isValidMoacSecret secret: string, @isValidMoacAddress approved: string, tokenId: string, options?: ITransactionOption): Promise<string> {
        return new Promise(async (resolve, reject) => {
            try {
                const sender = Moac.getAddress(secret);
                options = await this._moac.getOptions(options || {}, sender);
                const calldata = this._moacABI.encode("approve", approved, tokenId);
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
     * Enables or disables approval for a third party ("operator") to manage all of `msg.sender`'s assets. It also emits the ApprovalForAll event
     *
     * @param {string} secret moac secret of sender address
     * @param {string} operator Address to add to the set of authorized operators.
     * @param {string} approved True if the operators is approved, false to revoke approval
     * @param {ITransactionOption} options specify gasPrice, nonce, gasLimit etc.
     * @returns {Promise<string>} resolve hash if successful
     * @memberof ERC721
     */
    @validate
    public setApprovalForAll(@isValidMoacSecret secret: string, @isValidMoacAddress operator: string, approved: boolean, options?: ITransactionOption): Promise<string> {
        return new Promise(async (resolve, reject) => {
            try {
                const sender = Moac.getAddress(secret);
                options = await this._moac.getOptions(options || {}, sender);
                const calldata = this._moacABI.encode("setApprovalForAll", operator, approved);
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
     * Get the approved address for a single NFT.
     *
     * @param {string} tokenId ID of the NFT to query the approval of.
     * @returns {Promise<string>} return address of approval
     * @memberof ERC721
     */
    public async getApproved(tokenId: string): Promise<string> {
        return this._contract.getApproved(tokenId);
    }

    /**
     * Checks if `operator` is an approved operator for `owner`.
     *
     * @param {string} owner The address that owns the NFTs.
     * @param {string} operator The address that acts on behalf of the owner.
     * @returns {Promise<boolean>} return true or false
     * @memberof ERC721
     */
    @validate
    public async isApprovedForAll(@isValidMoacAddress owner: string, @isValidMoacAddress operator: string): Promise<boolean> {
        return this._contract.isApprovedForAll(owner, operator);
    }

    // The enumeration extension is OPTIONAL for ERC-721

    /**
     * Returns the count of all existing NFTokens.
     *
     * @returns {string} count of all existing NFTokens.
     * @memberof ERC721
     */
    public totalSupply(): string {
        return this._contract.totalSupply();
    }

    /**
     * Returns NFT ID by its index.
     *
     * @param {string} index A counter less than `totalSupply()`.
     * @returns {string} token id
     * @memberof ERC721
     */
    public tokenByIndex(index: string): string {
        return this._contract.tokenByIndex(new BigNumber(index));
    }

    /**
     * returns the n-th NFT ID from a list of owner's tokens.
     *
     * @param {string} owner Token owner's address.
     * @param {string} index Index number representing n-th token in owner's list of tokens.
     * @returns {string} token id
     * @memberof ERC721
     */
    @validate
    public tokenOfOwnerByIndex(@isValidMoacAddress owner: string, index: string): string {
        return this._contract.tokenOfOwnerByIndex(owner, new BigNumber(index));
    }
}

export default ERC721;
