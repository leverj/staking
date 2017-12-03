const socketio = require('socket.io');
const config = require('./conf');
const Web3 = require('web3');
const affirm = require("affirm.js");
const stakeJSON = require("../../build/contracts/Stake");
const levJSON = require("../../build/contracts/Token");

module.exports = (function () {
  let socketApi = {};
  let usersToSockets = {}; //{userid:[socketid]}
  let socketToUser = {};
  let io, web3 = {}, block, startBlock, endBlock, lev = {}, stake = {};
  let state = {start: 0, end: 0, current: 0};

  socketApi.register = function (socket, data) {
    let userid = data.userid;
    socketToUser[socket.id] = userid;
    usersToSockets[userid] = usersToSockets[userid] || []
    removeUnusedSocketsForUser(userid);
  }

  function removeUnusedSocketsForUser(userid) {
    let socketids = usersToSockets[userid]
    if (!socketids || socketids.length === 0) return
    socketids.forEach(socketid => {
      let socket = io.sockets.sockets[socketid]
      if (!socket) delete socketToUser[socketid]
    })
    usersToSockets[userid] = socketids.filter(socketid => io.sockets.sockets[socketid])
  }

  function subscribeStakingState() {
    web3.socket.eth.subscribe('newBlockHeaders', async function (error, data) {
      if (error) console.log("error", error);
      console.log("current block", data.number);
      state.current = data.number;
      if (state.current > state.end) await updateStartEndBlock();
        emitToSocket(io, "state", state);
    })
  }

  function subscribeStake() {

  }

  function subscribeLEV() {

  }

  async function init() {
    web3.socket = new Web3(new Web3.providers.WebsocketProvider(config.socketprovider));
    web3.http = new Web3(new Web3.providers.HttpProvider(config.common.network));
    lev.socket = new web3.socket.eth.Contract(levJSON.abi, config.common.lev);
    stake.socket = new web3.socket.eth.Contract(stakeJSON.abi, config.common.stake);
    stake.http = new web3.http.eth.Contract(stakeJSON.abi, config.common.stake);
    await updateStartEndBlock();
    subscribeStakingState();
    subscribeStake();
    subscribeLEV();
  }


  socketApi.connect = async function (server) {
    try {
      io = socketio(server)
      io.on('connection', onConnection)
      await init();
    } catch (e) {
      console.error(e);
    }
  }

  function onConnection(socket) {
    console.log('################# socket to client connected', socket.id);
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
