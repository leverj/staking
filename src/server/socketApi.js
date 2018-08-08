const socketio  = require('socket.io');
const config    = require('./conf');
const Web3      = require('web3');
const affirm    = require("affirm.js");
const stakeJSON = require("../../build/contracts/Stake");
const levJSON   = require("../../build/contracts/Token");

module.exports = (function () {
  let socketApi = {};
  let io, web3  = {}, lev = {}, stake = {};
  let state     = {start: 0, end: 0, current: 0};


  function subscribeStakingState() {
    web3.socket.eth.subscribe('newBlockHeaders', async function (error, data) {
      if (error) console.log("error", error);
      state.current = data.number;
      if (state.current > state.end) await updateStartEndBlock();
      emitToSocket(io, "state", state);
    })
  }

  function subscribeStake() {
    stake.socket.events.StakeEvent({}, function (error, data) {
      if (error) console.error('STAKE.STAKE', error);
      let userid = data.returnValues.user;
      console.log('STAKE.STAKE', userid);
      emitToSocket(io, 'user-update', {userid, event: 'STAKE.STAKE'})
    });

    stake.socket.events.RedeemEvent({}, function (error, data) {
      if (error) console.error('STAKE.REDEEM', error);
      let userid = data.returnValues.user;
      console.log('STAKE.REDEEM', userid);
      emitToSocket(io, 'user-update', {userid, event: 'STAKE.REDEEM'})
    })

    /*    stake.socket.events.FeeCalculated({}, function (error, data) {
          if (error) console.error('FEE CALCULATED', error);
          console.log('FEE CALCULATED', data);
        })

        stake.socket.events.StakingInterval({}, function (error, data) {
          if (error) console.error('StakingInterval', error);
          console.log('StakingInterval', data);
        })*/
  }

  function subscribeLEV() {
    lev.socket.events.Approval({}, function (error, data) {
      if (error) console.error('LEV.Approval', error);
      let userid = data.returnValues._owner;
      console.log('LEV.Approval', userid);
      emitToSocket(io, 'user-update', {userid, event: 'LEV.Approval'})
    })
  }

  async function init() {
    web3.http    = new Web3(new Web3.providers.HttpProvider(config.common.network));
    web3.socket  = new Web3(new Web3.providers.WebsocketProvider(config.socketprovider));
    lev.socket   = new web3.socket.eth.Contract(levJSON.abi, config.common.lev);
    stake.socket = new web3.socket.eth.Contract(stakeJSON.abi, config.common.stake);
    stake.http   = new web3.http.eth.Contract(stakeJSON.abi, config.common.stake);
    await updateStartEndBlock();
    subscribeStakingState();
    subscribeStake();
    subscribeLEV();
  }


  socketApi.connect = async function (server) {
    try {
      io = socketio(server)
      io.on('connection', onConnection);
      await init();
    } catch (e) {
      console.error(e);
    }
  }

  function onConnection(socket) {
    console.log('################# socket to client connected', socket.id);
    if (state.end && state.end && state.current) emitToSocket(io, "state", state);
  }

  function emitToSocket(channel, topic, message) {
    affirm(channel.emit, 'channel must be socket->individual or io->all')
    affirm(topic, 'topic undefined')
    affirm(message, 'message undefined')
    try {
      channel.emit(topic, message)
    } catch (e) {
      console.log('emitToSocket', topic, message, e.stack)
    }
  }

  async function updateStartEndBlock() {
    [state.start, state.end] = await Promise.all([
      stake.http.methods.startBlock().call(),
      stake.http.methods.endBlock().call(),
    ]);
  }

  return socketApi;
})();
