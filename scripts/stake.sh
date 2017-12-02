#!/usr/bin/env bash

export STAKE=0x24ff28af80967625241848550711f70360b98689
export PROVIDER=https://ropsten.infura.io
export SOCKETPROVIDER=ws://51.15.134.155:8546
export BLOCKINTERVAL=10
export GAS=3e5

node automation.js $1
