const fs = require('fs');
const affirm = require('affirm.js');

function getPrivateKey() {
  affirm(process.argv[2], 'Provide private key file location of Operator');
  try {
    let keyFile = fs.readFileSync(process.argv[2]);
    return JSON.parse(keyFile).privateKey;
  } catch (e) {
    console.log("Operator private ky file is invalid.", process.argv[2], e);
    process.exit(1);
  }
}


module.exports = {
  "privateKey": getPrivateKey(),
  "stake": process.env.STAKE,
  "fee": process.env.FEE,
  "provider": process.env.PROVIDER,
  "socketProvider": process.env.SOCKETPROVIDER,
  "blockInterval": process.env.BLOCKINTERVAL - 0,
  "gas": process.env.GAS - 0,
  "maxRedeem": process.env.MAX_REDEEM ? process.env.MAX_REDEEM - 0 : 10,
};


