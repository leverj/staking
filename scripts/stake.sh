#!/usr/bin/env bash

export STAKE=0x21ec0699AE84e342D34cABA2628880901e1A2bF1
export PROVIDER=https://ropsten.infura.io
export SOCKETPROVIDER=ws://51.15.134.155:8546
export BLOCKINTERVAL=10
export GAS=3e5

node automation.js ../../../coinpit.io/ignore/privateKeys/myEtherWallet/0xDaa1A6c972d4b8d57dce119E48C6ABB19BaF8402.json
