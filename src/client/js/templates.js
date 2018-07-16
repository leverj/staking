const $ = require('jquery');
$.fn.userInfo = function () {
  this.append(
    "<h4 class='user-info-row'><label>Ethereum address:</label><a target='_blank' class='icon-link'><span name='eth-addr'>&nbsp;</span> <i class='fa fa-info-circle'></i></a></h4>" +
    "<h4 class='user-info-row'><label>Available LEV:</label><a target='_blank' class='icon-link'><span name='lev-count'>&nbsp;</span> <i class='fa fa-info-circle'></i></a></h4>" +
    "<h4 class='user-info-row'><label>Total Approved LEV:</label><a target='_blank' class='icon-link'><span name='approved-count'>&nbsp;</span> <i class='fa fa-info-circle'></i></a></h4>" +
    "<h4 class='user-info-row'><label>Total Staked LEV:</label><a target='_blank' class='icon-link'><span name='staked-count'>&nbsp;</span> <i class='fa fa-info-circle'></i></a></h4>" +
    "<h4 class='user-info-row'><label>Number of FEE:</label><a target='_blank' class='icon-link'><span name='fee-count'>&nbsp;</span> <i class='fa fa-info-circle'></i></a></h4>");
};

$.fn.txInfo = function (prefix) {
  this.append(
    "<h4 class='user-info-row'><label>To address:</label>" +
    "<a class='icon-link'><span id='" + prefix + "-address'>&nbsp;</span> <i class='fa fa-files-o' aria-hidden='true'></i></a>" +
    "</h4>" +
    "<h4 class='user-info-row'><label>Amount:</label>" +
    "<a class='icon-link'><span id='" + prefix + "-amount'>&nbsp;</span> <i class='fa fa-files-o' aria-hidden='true'></i></a>" +
    "</h4>" +
    "<h4 class='user-info-row'><label>Gas limit:</label>" +
    "<a class='icon-link'><span id='" + prefix + "-gas'>&nbsp;</span> <i class='fa fa-files-o' aria-hidden='true'></i></a>" +
    "</h4>" +
    "<h4 class='user-info-row'><label>Data:</label>" +
    "<a class='icon-link'><span class='address' id='" + prefix + "-data'>&nbsp;</span> <i class='fa fa-files-o' aria-hidden='true'></i></a>" +
    "</h4>"
  );
};
