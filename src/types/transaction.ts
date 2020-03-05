declare interface IMoacTransaction {
  from: string;
  nonce: string;
  gasPrice: string;
  gasLimit: string;
  to?: string;
  value: string;
  data: string;
  chainId: string;
  // 0x0 主链调用 0x1 执行子链合约 0x2 子链原生币转账 0x3 在子链部署合约
  shardingFlag: string;
  // 在Chain3的sigUtils中强行赋值，作用未知
  systemContract: string;
  // vnode代理地址
  via: string;
}

declare interface ITransactionOption {
  gasLimit?: number | string;
  gasPrice?: number | string;
  nonce?: number;
}
