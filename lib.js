const DEBUG = require('debug');
const path = require('path');

function Debug(filename) {
  return DEBUG("STAKE:" + path.basename(filename));
}


module.exports = {
  Debug,
};
