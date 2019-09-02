import BigNumber from "bignumber.js";
import erc721ABI from "./abi/erc721ABI";
import Moac from "./moac";
import { ITransactionOption } from "./model/transaction";
import SmartContract from "./smartContract";
import { isValidMoacAddress, isValidMoacSecret, validate } from "./validator";

/**
 * toolkit of erc721
 *
 * @class ERC721
 */
class ERC721 extends SmartContract {

    /**
     * Creates an instance of ERC721
     * @memberof ERC721
     */
    constructor() {
        super();
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
            super.init(tokenContractAddress, moac, erc721ABI);
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
        super.destroy();
    }

    /**
     * request name of erc721 token
     *
     * @returns {Promise<string>} name of erc721 token
     * @memberof ERC721
     */
    public async name(): Promise<string> {
        return await super.callABI("name");
    }

    /**
     * request symbol of erc721 token
     *
     * @returns {Promise<string>} symbol of erc721 token
     * @memberof ERC721
     */
    public async symbol(): Promise<string> {
        return await super.callABI("symbol");
    }

    /**
     * A distinct Uniform Resource Identifier (URI) for a given asset
     *
     * @param {string} tokenid of erc721 token
     * @returns {Promise<string>} uri of erc721 token
     * @memberof ERC721
     */
    public async tokenURI(tokenId: string): Promise<string> {
        return await super.callABI("tokenURI", new BigNumber(tokenId));
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
                options = await this.moac.getOptions(options || {}, sender);
                const calldata = await super.callABI("mint", to, tokenId, uri);
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
                options = await this.moac.getOptions(options || {}, sender);
                const calldata = await super.callABI("burn", owner, tokenId);
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
            balance = await super.callABI("balanceOf", owner);
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
        return await super.callABI("ownerOf", tokenId);
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
                options = await this.moac.getOptions(options || {}, sender);
                const calldata = !data ? await super.callABI("safeTransferFrom", sender, to, tokenId) : await super.callABI("safeTransferFrom", sender, to, tokenId, data);
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
                options = await this.moac.getOptions(options || {}, sender);
                const calldata = await super.callABI("transferFrom", sender, to, tokenId);
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
                options = await this.moac.getOptions(options || {}, sender);
                const calldata = await super.callABI("approve", approved, tokenId);
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
                options = await this.moac.getOptions(options || {}, sender);
                const calldata = await super.callABI("setApprovalForAll", operator, approved);
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
     * Get the approved address for a single NFT.
     *
     * @param {string} tokenId ID of the NFT to query the approval of.
     * @returns {Promise<string>} return address of approval
     * @memberof ERC721
     */
    public async getApproved(tokenId: string): Promise<string> {
        return await super.callABI("getApproved", tokenId);
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
        return await super.callABI("isApprovedForAll", owner, operator);
    }

    // The enumeration extension is OPTIONAL for ERC-721

    /**
     * Returns the count of all existing NFTokens.
     *
     * @returns {Promise<string>} count of all existing NFTokens.
     * @memberof ERC721
     */
    public async totalSupply(): Promise<string> {
        return await super.callABI("totalSupply");
    }

    /**
     * Returns NFT ID by its index.
     *
     * @param {string} index A counter less than `totalSupply()`.
     * @returns {Promise<string>} token id
     * @memberof ERC721
     */
    public async tokenByIndex(index: string): Promise<string> {
        return await super.callABI("tokenByIndex", new BigNumber(index));
    }

    /**
     * returns the n-th NFT ID from a list of owner's tokens.
     *
     * @param {string} owner Token owner's address.
     * @param {string} index Index number representing n-th token in owner's list of tokens.
     * @returns {Promise<string>} token id
     * @memberof ERC721
     */
    @validate
    public async tokenOfOwnerByIndex(@isValidMoacAddress owner: string, index: string): Promise<string> {
        return await super.callABI("tokenOfOwnerByIndex", owner, new BigNumber(index));
    }
}

export default ERC721;
