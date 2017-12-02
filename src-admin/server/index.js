const express = require('express');
const compress = require('compression');
const helmet = require('helmet');
const config = require('config');
const util = require('util');
const api = require('./api');

module.exports = (async function () {
  let leverj = {};
  const app = express();
  const server = getServer();
  const socketApi = await require('./socketApi');

  function getServer() {
    return require('http').Server(app)
  }

  app.use(helmet({frameguard: {action: 'deny'}}));
  app.use(helmet.noCache());
  app.use(helmet.xssFilter());
  app.use("/api/v1", api);
  app.use(compress());

  let indexhtml = './dist/src-admin/client/index.html';
  app.use(express.static('./dist/src-admin/client/', {maxAge: 31536000000}));

  app.get(['/'], function (req, res) {
    return res.sendFile(indexhtml, {root: './dist/src-admin/client/'})
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
  }

  init();
  return leverj
})().catch(function (e) {
  console.log(e);
  process.exit(1);
});
