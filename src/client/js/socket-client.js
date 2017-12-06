const io = require('socket.io-client')

module.exports = (function (baseUrl) {
  let socket = io(baseUrl, {rejectUnauthorized: true});

  return socket;
})()