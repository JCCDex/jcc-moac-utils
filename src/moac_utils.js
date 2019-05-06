var BigNumber = require('bignumber.js');
const async = require('async')
const keyStore = require('jcc_eth_lightwallet').keystore

var utf8 = require('utf8');
var Chain3 = require('chain3');

const NETWORK = {
    MAINNET: 99,
    TESTNET: 101
}

module.exports = {
    _chain3: null,
    _network: NETWORK.TESTNET,
    _nonce: 0,
    init: function (url, mainnet) {
        // Web3.providers.HttpProvider.prototype.sendAsync = Web3.providers.HttpProvider.prototype.send
        this._chain3 = new Chain3(new Chain3.providers.HttpProvider(url))
        this._network = mainnet ? NETWORK.MAINNET : NETWORK.TESTNET
    },
    close: function () {
        this._chain3.setProvider(null)
        this._chain3 = null
    },
    createWallet: async function (password, seed) {
        return new Promise(function (resolve, reject) {
            var randomSeed = keyStore.generateRandomSeed(seed)
            // console.log(randomSeed)
            keyStore.createVault({ password: password, seedPhrase: randomSeed, hdPathString: "m/44'/60'/0'/0" }, function (err, ks) {
                if (err) {
                    return resolve(null)
                }
                ks.keyFromPassword(password, function (err, pwDerivedKey) {
                    if (err) {
                        return resolve(null)
                    }
                    ks.generateNewAddress(pwDerivedKey);
                    var addr = ks.getAddresses();
                    var privateKey = ks.exportPrivateKey(addr[0], pwDerivedKey)
                    return resolve({ address: addr[0], secret: privateKey })
                })
            })
        })
    },
    getAddress: function (privateKey) {
        return '0x' + keyStore._computeAddressFromPrivKey(privateKey)
    },
    validAddress: function (address) {
        if (!address.startsWith('0x')) {
            return false
        }
        return this._chain3.isAddress(address)
    },
    getBalance: async function (address) {
        return await this._chain3.mc.getBalance(address)
    },
    sendRawSignedTransaction: async function (secret, from, to, count, gasLimit, gasPrice, value, calldata) {
        var self = this
        return new Promise(function (resolve, reject) {
            if (!!!calldata) {
                calldata = '0x00'
            }

            var rawTx = {
                from: from,
                nonce: self._chain3.intToHex(count),
                gasPrice: self._chain3.intToHex(gasPrice),
                gasLimit: self._chain3.intToHex(gasLimit),
                to: to,
                value: self._chain3.intToHex(value),
                data: calldata,
                chainId: self._network
            }
            //console.log(rawTx, '\n')
            var tx_sign = self._chain3.signTransaction(rawTx, secret);
            self._chain3.mc.sendRawTransaction(tx_sign, function (err, hash) {
                if (!err) {
                    self._nonce = count + 1
                } else {
                    console.log('sendSignedTransaction error:', err)
                }
                // console.log('\nsendSignedTransaction hash:', hash, '\n')
                return (!err) ? resolve(hash) : resolve(null)
            });
        })
    },
    getTransaction: async function (hash) {
        var self = this
        return new Promise(function (resolve, reject) {
            self._chain3.mc.getTransaction(hash, function (err, data) {
                if (err) {
                    console.log(err)
                    data = null
                }
                return resolve(data)
            })
        });
    },
    getTransactionReceipt: async function (hash) {
        var self = this
        return new Promise(function (resolve, reject) {
            self._chain3.mc.getTransactionReceipt(hash, function (err, data) {
                if (err) {
                    console.log(err)
                    data = null
                }
                return resolve(data)
            })
        });
    },
    getLastBlockNumber: async function () {
        try {
            var block = await this._chain3.mc.getBlock('latest')
            return block.number
        } catch (err) {
            console.log('getLastBlockNumber err:', err)
            return -1
        }
    },
    getBlock: async function (param) {
        var self = this
        return new Promise(function (resolve, reject) {
            self._chain3.mc.getBlock(param, function (err, data) {
                if (err) {
                    console.log(err)
                    data = null
                }
                return resolve(data)
            })
        });
    },
    getTransactionCount: async function (address) {
        try {
            var count = await this._chain3.mc.getTransactionCount(address)
            // console.log('count:', count)
            return count;
        } catch (err) {
            console.log(err)
            return -1
        }
    },
    getNonce: async function (address) {
        var self = this
        return new Promise(function (resolve, reject) {
            self._chain3.mc.getTransactionCount(address, function (err, res) {
                if (err) {
                    console.log('address:', address, 'getTransactionCount err:', err)
                    return resolve(-1)
                }
                var count = res
                self._chain3.currentProvider.sendAsync({
                    method: "txpool_content",
                    params: [],
                    jsonrpc: "2.0",
                    id: new Date().getTime()
                }, function (err, res) {
                    // console.log('tx_pool:', res)
                    if (err) {
                        console.log('send async err:', err)
                        return resolve(-1)
                    }
                    if (res.result.pending) {
                        var keys = Object.keys(res.result.pending)
                        for (var index in keys) {
                            let key = keys[index]
                            if (key.toLowerCase() == address.toLowerCase()) {
                                count = count + Object.keys(res.result.pending[key]).length;
                            }
                        }
                    }
                    self._nonce = count
                    return resolve(count)
                })
            })
        })
    },
    _gasPrice: 0,
    getGasPrice: async function (limit) {
        var self = this
        return new Promise(function (resolve, reject) {
            self._chain3.mc.getGasPrice(function (err, data) {
                if (err) {
                    data = 20000000000
                }
                if (!!limit) {
                    if (data.toFixed() < limit) {
                        data = BigNumber(limit)
                    }
                }
                self._gasPrice = data.toFixed()
                return resolve(data.toFixed())
            })
        });
    },
    transactionReceipt: {
        isEvent: function (r, eventTag) {
            if (!r.logs.length) { return false }
            if (!r.logs[0].topics.length) { return false }

            return r.logs[0].topics[0] == eventTag
        },
        topics: {
            getAddress: function (t) {
                return '0x' + t.substr(26)
            }
        }
    },
    transaction: {
    },
    getParametersFromDepositTokenInput: function (input) {
        var params = { method_sign: '', jtAddress: '', token: '', amount: 0, hash: '' }
        if (input.substr(0,10) !== '0xcc2c5164') {
            return params
        }
        params.method_sign = input.substr(10)
        params.token = '0x' + input.substr(10 + 64).substr(0, 64).substr(24)
        params.amount = BigNumber('0x' + input.substr(10 + 128).substr(0, 64))
        params.hash = '0x' + input.substr(10 + 64 * 3).substr(0, 64)
        var len = BigNumber('0x' + input.substr(10 + 64 * 4).substr(0, 64)).toNumber()
        params.jtAddress = this._chain3.toAscii(input.substr(10 + 64 * 5).substr(0, len * 2))

        return params
    },
    getParametersFromDepositInput: function (input) {
        var params = { method_sign: '', jtAddress: '' }
        if (input.substr(0, 10) !== '0xa26e1186') {
            return params
        }
        params.method_sign = input.substr(10)

        var p1 = input.substr(10).substr(0, 64)
        var len1 = BigNumber('0x' + p1).toNumber()
        if (!len1) { return params }

        var p2 = input.substr(10 + 64).substr(0, len1 * 2)
        var len2 = BigNumber('0x' + p2).toNumber()
        if (len2 < 33) { return params }

        var p3 = input.substr(10 + 64 + len1 * 2).substr(0, len2 * 2)
        params.jtAddress = this._chain3.toAscii(p3)
        return params
    },
    transfer: async function (src, dest, amount, memo, gasLimit, gasPrice) {
        if (!!!amount) {
            console.log('Please specify moac amount')
            return null
        }
        if (!this.validAddress(src.address)) {
            console.log('src address invalid')
            return null
        }
        if (!this.validAddress(dest.address)) {
            console.log('dest address invalid')
            return null
        }
        if (!!!memo) {
            memo = ""
        }
        if (!!!gasLimit) {
            gasLimit = 1000000
        }
        if (!!!gasPrice) {
            let ret = await this.getGasPrice()
            this._gasPrice = Number(ret).toFixed()
        } else {
            this._gasPrice = gasPrice
        }
        var count = await this.getNonce(src.address)
        if (count < 0) {
            console.log('get nonce error')
            return null
        }

        var value = this._chain3.toSha(amount, 'mc')
        var hash = await this.sendRawSignedTransaction(src.secret, src.address, dest.address, count, gasLimit, this._gasPrice, value)
        return hash
    },
    contract: function (abi) {
        return this._chain3.mc.contract(abi)
    }
}
// "dependencies": {
// },
// "devDependencies": {
//   "@babel/core": "^7.3.3",
//   "@babel/plugin-transform-runtime": "^7.2.0",
//   "@babel/preset-env": "^7.3.1",
//   "@babel/runtime": "^7.4.2",
//   "babel-eslint": "^8.2.6",
//   "chai": "^4.2.0",
//   "coveralls": "^3.0.2",
//   "eslint-config-standard": "^11.0.0",
//   "eslint-plugin-import": "^2.16.0",
//   "eslint-plugin-node": "^7.0.1",
//   "eslint-plugin-promise": "^4.0.1",
//   "eslint-plugin-standard": "^3.1.0",
//   "gulp": "^4.0.0",
//   "gulp-babel": "^8.0.0",
//   "gulp-eslint": "^5.0.0",
//   "mocha": "^5.2.0",
//   "nyc": "^13.3.0"
// }
