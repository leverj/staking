const express = require('express');
const favicon = require('serve-favicon');

module.exports = (async function () {
  let leverj = {};
  let app = express();
  let compress = require('compression');
  let server = getServer();
  let helmet = require('helmet');

  function getServer() {
    return require('http').Server(app)
  }

  app.use(helmet({frameguard: {action: 'deny'}}));
  app.use(helmet.noCache());
  app.use(helmet.xssFilter());

  app.use(compress());

  let indexhtml = 'index.html';
  app.use(express.static('./dist/src/client', {maxAge: 31536000000}));

  app.get(['/'], function (req, res) {
    return res.sendFile(indexhtml, {root: './dist/src/client'})
  });

  app.use(function (err, req, res, next) {
    util.log('FAIL', err);
    util.log('FAIL, stack:', err.stack);
    res.status(err.statusCode || 500).send({error: err.message})
  });

  function init() {
    server.listen(8888, '0.0.0.0');
    process.on('uncaughtException', (err) => {
      console.log('################################## uncaught exception ######################################');
      util.log(err.stack);
      console.log('################################## uncaught exception ######################################')
    })
  }

  init();
  return leverj
})();
