#!/usr/bin/env bash
export SOCKETPROVIDER=wss://ropsten.infura.io:443/wss
export NETWORK=https://ropsten.infura.io/
export STAKE=0xd36029d76af6fE4A356528e4Dc66B2C18123597D
export FEE=0x72402058Ea385fA9900AE16ABd3459f9D0fa05Bf
export ETHERSCAN=https://ropsten.etherscan.io
export LEV=0xaa7127e250e87476fdd253f15e86a4ea9c4c4bd4
export SALE=0xce2e19cec5a5188b434c7e11e40a12d611acac11
export FEEDECIMALS=9
export LEVDECIMALS=9

grunt; nodemon -d 2 src/server/index.js