global.Promise = require('bluebird')
const mocha    = {
  reporter       : 'eth-gas-reporter',
  reporterOptions: {currency: 'USD', gasPrice: 21},
  fullTrace      : true,
}
module.exports = {mocha}
