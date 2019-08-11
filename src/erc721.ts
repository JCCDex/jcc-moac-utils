import BigNumber from "bignumber.js";
import chain3 = require("chain3");
import erc721ABI from "./abi/erc721ABI";
import Moac from "./moac";
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
     * @param {any} options specify gasPrice, nonce, gasLimit etc.
     * @returns {Promise<string>} return hash, reject error if something wrong.
     * @memberof ERC721
     */
    @validate
    public async mint(@isValidMoacSecret secret: string, @isValidMoacAddress to: string, tokenId: string, uri: string, options?: any): Promise<string> {
        return new Promise(async (resolve, reject) => {
            try {
                const sender = Moac.getAddress(secret);

                const gasLimit = this._moac.gasLimit;
                const gasPrice = await this._moac.getGasPrice(this._moac.minGasPrice);
                const nonce = await this._moac.getNonce(sender);

                options = options || {};
                options.gasLimit = options.gasLimit || gasLimit;
                options.gasPrice = options.gasPrice || gasPrice;
                options.nonce = options.nonce || nonce;

                const calldata = this._contract.mint.getData(to, (new BigNumber(tokenId)), uri);
                // console.log("calldata:", calldata);
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
     * @param {any} options specify gasPrice, nonce, gasLimit etc.
     * @returns {Promise<string>} return hash, reject error if something wrong.
     * @memberof ERC721
     */
    @validate
    public async burn(@isValidMoacSecret secret: string, @isValidMoacAddress owner: string, tokenId: string, options?: any): Promise<string> {
        return new Promise(async (resolve, reject) => {
            try {
                const sender = Moac.getAddress(secret);

                const gasLimit = this._moac.gasLimit;
                const gasPrice = await this._moac.getGasPrice(this._moac.minGasPrice);
                const nonce = await this._moac.getNonce(sender);

                options = options || {};
                options.gasLimit = options.gasLimit || gasLimit;
                options.gasPrice = options.gasPrice || gasPrice;
                options.nonce = options.nonce || nonce;

                const calldata = this._contract.burn.getData(owner, (new BigNumber(tokenId)));
                // console.log("calldata:", calldata);
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
     * @param {any} options specify gasPrice, nonce, gasLimit etc.
     * @returns {Promise<string>} resolve hash if successful
     * @memberof ERC721
     */
    @validate
    public safeTransferFrom(@isValidMoacSecret secret: string, @isValidMoacAddress to: string, tokenId: string, data?: string, options?: any): Promise<string> {
        return new Promise(async (resolve, reject) => {
            try {
                const sender = Moac.getAddress(secret);

                const gasLimit = this._moac.gasLimit;
                const gasPrice = await this._moac.getGasPrice(this._moac.minGasPrice);
                const nonce = await this._moac.getNonce(sender);

                options = options || {};
                options.gasLimit = options.gasLimit || gasLimit;
                options.gasPrice = options.gasPrice || gasPrice;
                options.nonce = options.nonce || nonce;

                const calldata = !data ? this._contract.safeTransferFrom.getData(sender, to, tokenId) : this._contract.safeTransferFrom.getData(sender, to, tokenId, data);
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
     * @param {any} options specify gasPrice, nonce, gasLimit etc.
     * @returns {Promise<string>} resolve hash if successful
     * @memberof ERC721
     */
    @validate
    public transferFrom(@isValidMoacSecret secret: string, @isValidMoacAddress to: string, tokenId: string, options?: any): Promise<string> {
        return new Promise(async (resolve, reject) => {
            try {
                const sender = Moac.getAddress(secret);
                const gasLimit = this._moac.gasLimit;
                const gasPrice = await this._moac.getGasPrice(this._moac.minGasPrice);
                const nonce = await this._moac.getNonce(sender);

                options = options || {};
                options.gasLimit = options.gasLimit || gasLimit;
                options.gasPrice = options.gasPrice || gasPrice;
                options.nonce = options.nonce || nonce;

                const calldata = this._contract.transferFrom.getData(sender, to, tokenId);
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
     * @param {any} options specify gasPrice, nonce, gasLimit etc.
     * @returns {Promise<string>} resolve hash if successful
     * @memberof ERC721
     */
    @validate
    public approve(@isValidMoacSecret secret: string, @isValidMoacAddress approved: string, tokenId: string, options?: any): Promise<string> {
        return new Promise(async (resolve, reject) => {
            try {
                const sender = Moac.getAddress(secret);
                const gasLimit = this._moac.gasLimit;
                const gasPrice = await this._moac.getGasPrice(this._moac.minGasPrice);
                const nonce = await this._moac.getNonce(sender);

                options = options || {};
                options.gasLimit = options.gasLimit || gasLimit;
                options.gasPrice = options.gasPrice || gasPrice;
                options.nonce = options.nonce || nonce;

                const calldata = this._contract.approve.getData(approved, tokenId);
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
     * @param {any} options specify gasPrice, nonce, gasLimit etc.
     * @returns {Promise<string>} resolve hash if successful
     * @memberof ERC721
     */
    @validate
    public setApprovalForAll(@isValidMoacSecret secret: string, @isValidMoacAddress operator: string, approved: boolean, options?: any): Promise<string> {
        return new Promise(async (resolve, reject) => {
            try {
                const sender = Moac.getAddress(secret);
                const gasLimit = this._moac.gasLimit;
                const gasPrice = await this._moac.getGasPrice(this._moac.minGasPrice);
                const nonce = await this._moac.getNonce(sender);

                options = options || {};
                options.gasLimit = options.gasLimit || gasLimit;
                options.gasPrice = options.gasPrice || gasPrice;
                options.nonce = options.nonce || nonce;

                const calldata = this._contract.setApprovalForAll.getData(operator, approved);
                const tx = this._moac.getTx(sender, this._contract.address, options.nonce, options.gasLimit, options.gasPrice, "0", calldata);
                const signedTransaction = this._moac.signTransaction(tx, secret);
                const hash = await this._moac.sendRawSignedTransaction(signedTransaction);
                console.log("erc721 tx:", tx, "calldata:", calldata, signedTransaction);
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
