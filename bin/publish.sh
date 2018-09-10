#!/usr/bin/env bash

function cleanup(){
  rm -rf build dist
  rm -f Fee.sol Stake.sol
}

function checkDocker(){
  docker pull $IMAGE:develop
  [ "$?" -eq 1 ] && exit 1
}

function build(){
  node_modules/.bin/truffle compile
  node node_modules/.bin/truffle-flattener contracts/Fee.sol > Fee.sol
  node node_modules/.bin/truffle-flattener contracts/Stake.sol > Stake.sol
}

function createAndDeployImage(){
  docker build -t ${IMAGE}:${npm_package_version} .
  if [ -z "$LOCAL" ]; then docker push ${IMAGE}:${npm_package_version} ;fi
}

function publishNpmModule(){
  mkdir -p dist
  cp package.json dist/
  cp -R build/contracts dist/
  cp Fee.sol dist/
  cp Stake.sol dist/
  yarn publish dist --new-version ${npm_package_version}
}

IMAGE=leverj/stake-contract
if [ -z "$LOCAL" ]; then git pull; fi
cleanup
if [ -z "$LOCAL" ]; then checkDocker ;fi
echo npm_package_version:$npm_package_version
build
createAndDeployImage
if [ -z "$LOCAL" ]; then publishNpmModule ;fi
cleanup



