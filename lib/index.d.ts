declare class MoacUtils {
    private _chain3;
    private _network;
    /**
     * 构造函数
     * @param options url:主机位置, mainnet: true/false
     */
    constructor(options: any);
    close(): void;
    getInstance(): any;
    getChainId(): number;
}
export { MoacUtils };
