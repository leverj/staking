const $ = require('jquery');
$.fn.userInfo = function () {
  this.append(
    "<h4>Number of LEV: <span class='text-brand' name='lev-count'>10000</span></h4>" +
    "<h4>Approved LEV: <span class='text-brand'  name='approved-count'>100</span></h4>" +
    "<h4>Staked LEV: <span class='text-brand'  name='staked-count'>90</span></h4>" +
    "<h4>FEE: <span class='text-brand'  name='staked-count'>90</span></h4>" +
    "<a href='#' class='icon-link icon-link--big icon-link--center icon-link--rotate' data-id='user-info-display-action'><i class='fa fa-refresh' aria-hidden='true'></i></a>" );
};

$.fn.txInfo = function (prefix) {
  this.append(
    "<h4>To address: <span class='text-brand' id='" + prefix + "-address'>&nbsp;</span>" +
    "  <a class='icon-link'><i class='fa fa-files-o' aria-hidden='true'></i></a>" +
    "</h4>" +
    "<h4>Amount: <span class='text-brand' id='" + prefix + "-amount'>&nbsp;</span>" +
    "  <a class='icon-link'><i class='fa fa-files-o' aria-hidden='true'></i></a>" +
    "</h4>" +
    "<h4>Gas limit: <span class='text-brand' id='" + prefix + "-gas'>&nbsp;</span>" +
    "  <a class='icon-link'><i class='fa fa-files-o' aria-hidden='true'></i></a>" +
    "</h4>" +
    "<h4>Data: <span class='text-brand address' id='" + prefix + "-data'>&nbsp;</span>" +
    "  <a class='icon-link'><i class='fa fa-files-o' aria-hidden='true'></i></a>" +
    "</h4>"
  );
};
