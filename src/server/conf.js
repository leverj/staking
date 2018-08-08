let config     = require('config');
const _        = require('lodash');
module.exports = _.assign(config, {
  "common"        : {
    "network"    : process.env.NETWORK,
    "networkId"  : process.env.NETWORK_ID - 0,
    "stake"      : process.env.STAKE,
    "fee"        : process.env.FEE,
    "lev"        : process.env.LEV,
    "sale"       : process.env.SALE,
    "feeDecimals": process.env.FEEDECIMALS - 0,
    "levDecimals": process.env.LEVDECIMALS - 0,
    "etherscan"  : process.env.ETHERSCAN,
  },
  "ip"            : "0.0.0.0",
  "port"          : "8888",
  "socketprovider": process.env.SOCKETPROVIDER,
})
