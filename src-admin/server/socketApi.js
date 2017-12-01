const socketio = require('socket.io');
const config = require('config');

module.exports = async function () {
  let socketApi = {};
  let usersToSockets = {}; //{userid:[socketid]}
  let socketToUser   = {};
  let io;

  socketApi.register = function(socket, data){

  }

};
