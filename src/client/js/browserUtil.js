const $ = require('jquery');
const affirm = require('affirm.js');

module.exports = (function () {
  let utilities = {};

  let storage;

  function init() {
    checkBrowsers();
    try {
      window.localStorage.test = 1;
      utilities.isLocalStorageSupported = true;
      storage = window.localStorage
    }
    catch (e) {
      utilities.isLocalStorageSupported = false;
      storage = {}
    }
    setBrowserOverlay();
  }

  function checkBrowsers() {
    if (typeof navigator === "undefined" || navigator.userAgent === undefined) return;
    utilities.is_chrome = navigator.userAgent.indexOf('Chrome') > -1;
    utilities.is_explorer = navigator.userAgent.indexOf('MSIE') > -1;
    utilities.is_firefox = navigator.userAgent.indexOf('Firefox') > -1;
    utilities.is_safari = navigator.userAgent.indexOf("Safari") > -1;
    utilities.is_opera = navigator.userAgent.toLowerCase().indexOf("op") > -1;

    if (utilities.is_chrome && utilities.is_safari) {
      utilities.is_safari = false;
    }
    if (utilities.is_chrome && utilities.is_opera) {
      utilities.is_chrome = false;
    }

    if (modernBrowsers())
        utilities.modern_browser = true;
    else
        utilities.modern_browser = false;
    }

    function modernBrowsers() {
      return window.CSS && window.CSS.supports && window.CSS.supports('--fake-var', 0);
    }

    function setBrowserOverlay() {
      let browserOverlay = $('.browser-detection-overlay');
      if (!utilities.modern_browser)
        browserOverlay.addClass("active");
    }

  utilities.setLocal = function (key, value) {
    affirm(key, 'Cant store without a key');
    affirm(value !== undefined, 'Cant store empty value. Use clear instead');
    storage[key] = value
  };

  utilities.getLocal = function (key) {
    return storage[key]
  };

  utilities.delLocal = function (key) {
    delete localStorage[key]
  };

  init();
  return utilities
})();
