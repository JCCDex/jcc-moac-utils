export interface IMoacTransaction {
    from: string;
    nonce: string;
    gasPrice: string;
    gasLimit: string;
    to?: string;
    value: string;
    data: string;
    chainId: string;
    shardingFlag: string;
    systemContract: string;
    via: string;
}

export interface ITransactionOption {
    gasLimit?: number | string;
    gasPrice?: number | string;
    nonce?: number;
}
