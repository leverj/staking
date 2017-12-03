const express = require('express');
const bodyParser = require('body-parser');
const config = require("config");


module.exports = (function () {
  async function getConfig(req, res, next) {
    return res.send(config.common);
  }

  let app = express();
  app.use(bodyParser.json());
  app.get('/config', api(getConfig));

  function api(method) {
    return async function () {
      let res = arguments[1];
      try {
        await method.apply(this, arguments)
      }
      catch (e) {
        util.log('FAIL', method.name, e);
        res.status(e.statusCode || 500).send({error: e.message})
      }
    }
  }

  return app;
})();


// rest.get("/api/v1/config")