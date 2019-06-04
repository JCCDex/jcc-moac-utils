const MoacFingate = require('./src');
/**
 * 充币
 */
const deposit = async () => {
  try {
    // 节点地址
    // 可用节点: 
    // 香港: moac1ma17f1.jccdex.cn、moac23f2151.jccdex.cn、moac3e90bd5.jccdex.cn、moac4dad565.jccdex.cn、moac5fd8dfd.jccdex.cn
    // 青岛: moac6c689b7.jccdex.cn、moac76755ad.jccdex.cn、moac8b9bf32.jccdex.cn、moac90e7976.jccdex.cn、moac10662a7f.jccdex.cn 
    let node = 'https://moac1ma17f1.jccdex.cn';
    // moac智能合约地址
    let scAddress = '0x66c9b619215db959ec137ede6b96f3fa6fd35a8a';
    // 主网
    let production = true
    const inst = new MoacFingate(node, scAddress, production);
    inst.init()
    // 井通钱包地址
    let jingtumAddress = '';
    // 数量
    let amount = '';
    // 墨客钱包地址
    let moacAddress = '';
    // 墨客钱包秘钥
    let moacSecret = '';
    let state = await inst.depositState(moacAddress);
    // state[0] 充币数量
    // state[1] 井通钱包地址
    if (state[0].toString(10) !== '0' || state[1] !== '') {
      console.log('上个充币流程尚未结束');
      return
    }
    let hash = await inst.deposit(jingtumAddress, amount, moacAddress, moacSecret);
    console.log(hash)
  } catch (error) {
    console.log(error)
  }
}

const withdraw = async () => {

  // 墨客钱包地址
  // 墨客钱包地址一定要有0x
  let moacAddress = ''
  if (!moacAddress.startsWith('0x')) {
    moacAddress = '0x' + moacAddress
  }
  let memo = {
    moac_wallet: moacAddress,
    value: this.form.amount
  }
  // 井通钱包地址
  let jingtumAddress = '';
  // 井通钱包秘钥
  let jingtumSecret = '';
  // 墨客银关地址
  let moacFingateAddress = 'jG9ntUTuBKqDURPUqbGYZRuRDVzPY6bpxL';
  // 数量
  let amount = '';
  // 按照以下格式转账
  let data = {
    issuer: 'jGa9J9TkqtBcUoHe2zqhVFFbgUVED6o9or',
    currency: 'JMOAC',
    address: jingtumAddress,
    secret: jingtumSecret,
    to: moacFingateAddress,
    amount: amount,
    memo: JSON.stringify(memo)
  };
  console.log(data)
}