/**
 * MIT License
 * Copyright (c) 2019 JCC Dex
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * @author https://github.com/jccdex
 */
import Chain3 from "chain3";

 /**
  * 网络ID 定义
  */
enum NETWORK  {
    MAINNET = 99,
    TESTNET = 101
  }

class MoacUtils {
  private _chain3: any;
  private _network: number;

  /**
   * 构造函数
   * @param options url:主机位置, mainnet: true/false
   */
  constructor(options: any) {
    const _opts = options || {};
    if (!_opts.url) {
        throw Error("moac node url need!");
    }
    this._chain3 = new Chain3(new Chain3.providers.HttpProvider(_opts.url));
    this._network = _opts.mainnet ? NETWORK.MAINNET : NETWORK.TESTNET;
  }
  public close () {
    this._chain3.setProvider(null);
    this._chain3 = null;
  }
//   public getBalance(address: string){
//     console.log(address);
//     return new Promise();
//     // return await this._chain3.mc.getBalance(address);
//   }
  public getInstance() {
      return this._chain3;
  }
  public getChainId() {
      return this._network;
  }
}
export {
    MoacUtils
};
