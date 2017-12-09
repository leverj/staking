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
  let maxUserSockets = 10;

  function register(socket, data) {
    let userid = data.userid;
    socketToUser[socket.id] = userid;
    usersToSockets[userid] = usersToSockets[userid] || []
    removeUnusedSocketsForUser(userid);
    if (usersToSockets[userid].length >= 1) console.log(userid, usersToSockets[userid].length, 'sockets open')
    if (usersToSockets[userid].length >= maxUserSockets) {
      emitToSocket(socket, 'max_conn', 'Exceeded max connections')
      // setTimeout(function() {
      socket.disconnect('Exceeded max connections')
      // }, 10000)
    }
    usersToSockets[userid].push(socket.id)
    usersToSockets[userid] = removeDuplicate(usersToSockets[userid]);
  }

  function removeDuplicate(list){
    let map = {}
    for (let i = 0; i < list.length; i++) {
      let item = list[i];
      map[item] = true;
    }
    return Object.keys(map);
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
      sendUserMessage(userid, 'user-update', {userid, event: 'STAKE.STAKE'})
    });

    stake.socket.events.RedeemEvent({}, function (error, data) {
      if (error) console.error('STAKE.REDEEM', error);
      let userid = data.returnValues.user;
      console.log('STAKE.REDEEM', userid);
      sendUserMessage(userid, 'user-update', {userid, event: 'STAKE.REDEEM'})
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
      sendUserMessage(userid, 'user-update', {userid, event: 'LEV.Approval'})
    })
  }

  function sendUserMessage(userid, topic, message) {
    let socketids = usersToSockets[userid]
    console.log('socketids', socketids)
    if (!socketids || socketids.length === 0) return
    for (let i = 0; i < socketids.length; i++) {
      let socketid = socketids[i];
      let socket = io.sockets.sockets[socketid]
      if (!socket) {
        console.log('socket not there');
        continue
      }
      emitToSocket(socket, topic, message)
    }
    removeUnusedSocketsForUser()
  }

  async function init() {
    web3.http = new Web3(new Web3.providers.HttpProvider(config.common.network));
    web3.socket = new Web3(new Web3.providers.WebsocketProvider(config.socketprovider));
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
      io.on('connection', onConnection);
      await init();
    } catch (e) {
      console.error(e);
    }
  }

  function onConnection(socket) {
    console.log('################# socket to client connected', socket.id);
    if(state.end && state.end && state.current) emitToSocket(io, "state", state);
    socket.on('register', register.bind(undefined, socket));
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
