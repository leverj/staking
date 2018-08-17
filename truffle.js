global.Promise = require('bluebird')
const networks = {
  development: {
    host      : 'localhost',
    port      : 8545,
    network_id: '*', // Match any network id
    gas       : 4500000,
  }
}
const mocha    = {
  reporter       : 'eth-gas-reporter',
  reporterOptions: {currency: 'USD', gasPrice: 21},
  fullTrace      : true,
}

module.exports = {mocha}
// module.exports = {networks, mocha}
