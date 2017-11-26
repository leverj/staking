const express = require('express');
const favicon = require('serve-favicon');

module.exports = (async function () {
  let leverj = {};
  const app = express();
  const compress = require('compression');
  const server = getServer();
  const helmet = require('helmet');
  const ip = '0.0.0.0';
  const port = 8889;

  function getServer() {
    return require('http').Server(app)
  }

  app.use(helmet({frameguard: {action: 'deny'}}));
  app.use(helmet.noCache());
  app.use(helmet.xssFilter());

  app.use(compress());

  let indexhtml = './dist1/src-admin/client/index.html';
  app.use(express.static('./dist1/src-admin/client/', {maxAge: 31536000000}));

  app.get(['/'], function (req, res) {
    return res.sendFile(indexhtml, {root: './dist1/src-admin/client/'})
  });

  app.use(function (err, req, res, next) {
    // util.log('FAIL', err);
    // util.log('FAIL, stack:', err.stack);
    res.status(err.statusCode || 500).send({error: err.message})
  });

  function init() {
    server.listen(port, ip);
    console.log(`Server listening on ${ip}:${port}`);
    process.on('uncaughtException', (err) => {
      console.log('################################## uncaught exception ######################################');
      // util.log(err.stack);
      console.log('################################## uncaught exception ######################################')
    })
  }

  init();
  return leverj
})();
