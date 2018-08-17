module.exports = {
  skipFiles     : ["*Token.sol"],
  compileCommand: '../node_modules/.bin/truffle compile -all',
  testCommand   : 'truffle test --network coverage',
  testrpcOptions: `--port 8555 -i coverage --noVMErrorsOnRPCResponse`
}