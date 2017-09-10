const Stake = artifacts.require("./Stake.sol");
const conf = require('../stake.json');

module.exports = (deployer) =>{

  deployer.deploy(Stake, conf.owner, conf.levid, conf.freezeBlock);
};
