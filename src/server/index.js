const express = require('express');
const compress = require('compression');
const helmet = require('helmet');
const config = require('./conf');
const util = require('util');
const api = require('./api');
const socketApi = require('./socketApi');

module.exports = (async function () {
  let leverj = {};
  const app = express();
  const server = getServer();

  function getServer() {
    return require('http').Server(app)
  }

  app.use(helmet({frameguard: {action: 'deny'}}));
  app.use(helmet.noCache());
  app.use(helmet.xssFilter());
  app.use(helmet.contentSecurityPolicy(
    {
      directives: config.csp.directives,
      reportOnly: false,
      setAllHeaders: false,
      disableAndroid: false
    }
  ))
  app.use("/api/v1", api);
  app.use(compress());

  let indexhtml = './dist/src/client/index.html';
  app.use(express.static('./dist/src/client/', {maxAge: 31536000000}));

  app.get(['/'], function (req, res) {
    return res.sendFile(indexhtml, {root: './dist/src/client/'})
  });

  app.use(function (err, req, res, next) {
    util.log('FAIL', err.stack);
    res.status(err.statusCode || 500).send({error: err.message})
  });

  function init() {
    server.listen(config.port, config.ip);
    util.log(`Server listening on ${config.ip}:${config.port}`);
    process.on('uncaughtException', (err) => {
      util.log('################################## uncaught exception ######################################');
      util.log(err.stack);
      util.log('################################## uncaught exception ######################################')
    })
    socketApi.connect(server);
  }

  init();
  return leverj
})().catch(function (e) {
  console.log(e);
  process.exit(1);
});
