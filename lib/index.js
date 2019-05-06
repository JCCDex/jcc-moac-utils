"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
var chain3_1 = require("chain3");
/**
 * 网络ID 定义
 */
var NETWORK;
(function (NETWORK) {
    NETWORK[NETWORK["MAINNET"] = 99] = "MAINNET";
    NETWORK[NETWORK["TESTNET"] = 101] = "TESTNET";
})(NETWORK || (NETWORK = {}));
var MoacUtils = /** @class */ (function () {
    /**
     * 构造函数
     * @param options url:主机位置, mainnet: true/false
     */
    function MoacUtils(options) {
        var _opts = options || {};
        if (!_opts.url) {
            throw Error("moac node url need!");
        }
        this._chain3 = new chain3_1.default(new chain3_1.default.providers.HttpProvider(_opts.url));
        this._network = _opts.mainnet ? NETWORK.MAINNET : NETWORK.TESTNET;
    }
    MoacUtils.prototype.close = function () {
        this._chain3.setProvider(null);
        this._chain3 = null;
    };
    //   public getBalance(address: string){
    //     console.log(address);
    //     return new Promise();
    //     // return await this._chain3.mc.getBalance(address);
    //   }
    MoacUtils.prototype.getInstance = function () {
        return this._chain3;
    };
    MoacUtils.prototype.getChainId = function () {
        return this._network;
    };
    return MoacUtils;
}());
exports.MoacUtils = MoacUtils;
//# sourceMappingURL=index.js.map