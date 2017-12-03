#!/usr/bin/env bash
export SOCKETPROVIDER=ws://51.15.134.155:8546
export NETWORK=https://ropsten.infura.io/5Ik2NwtzUQsXpL5nAvXW
export STAKE=0xcc6e0b1bce2a153edc1ff8fe00cbca138e977a18
export FEE=0x2929d8e471244eec85e80b90165f489e3db4e570
export LEV=0xaa7127e250e87476fdd253f15e86a4ea9c4c4bd4
export SALE=0xce2e19cec5a5188b434c7e11e40a12d611acac11
export FEEDECIMALS=9
export LEVDECIMALS=9

node src/server/index.js