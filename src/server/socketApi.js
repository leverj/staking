const socketio = require('socket.io');
const config = require('config');
const Web3 = require('web3');


module.exports = (async function () {
  let socketApi = {};
  let usersToSockets = {}; //{userid:[socketid]}
  let socketToUser   = {};
  let io, web3;

  socketApi.register = function(socket, data){

  }

  async function init (){
    web3 = new Web3(new Web3.providers.WebsocketProvider(process.env.SOCKETPROVIDER));
    web3.eth.subscribe('pendingTransactions', function(error, data){
      if(error) console.log("error", error);
      console.log("data", data);
    })
  }
  // await init();
  return socketApi;
})().then(console.error);
