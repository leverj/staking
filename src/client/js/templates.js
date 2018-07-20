const $ = require('jquery');
$.fn.userInfo = function () {
  this.append(
    "<h4 class='user-info-row heading'><label>User Account: <span name='eth-addr'>&nbsp;</span></label></i></h4>" +
    "<h4 class='user-info-row'><a target='_blank'><span name='lev-count'>&nbsp;</span> <i class='fa fa-info-circle'></i></a><label>Available LEV</label></h4>" +
    "<h4 class='user-info-row'><a target='_blank'><span name='approved-count'>&nbsp;</span> <i class='fa fa-info-circle'></i></a><label>Total Approved LEV</label></h4>" +
    "<h4 class='user-info-row'><a target='_blank'><span name='staked-count'>&nbsp;</span> <i class='fa fa-info-circle'></i></a><label>Total Staked LEV</label></h4>" +
    "<h4 class='user-info-row'><a target='_blank'><span name='fee-count'>&nbsp;</span> <i class='fa fa-info-circle'></i></a><label>Number of FEE</label></h4>");
};

$.fn.txInfo = function (prefix) {
  this.append(
    "<h4 class='user-info-row'><a class='icon-copy'><span id='" + prefix + "-address'>&nbsp;</span> <i class='fa fa-files-o' aria-hidden='true'></i></a><label>To Address</label></h4>" +
    "<h4 class='user-info-row'><a class='icon-copy'><span id='" + prefix + "-amount'>&nbsp;</span> <i class='fa fa-files-o' aria-hidden='true'></i></a><label>Amount</label></h4>" +
    "<h4 class='user-info-row'><a class='icon-copy'><span id='" + prefix + "-gas'>&nbsp;</span> <i class='fa fa-files-o' aria-hidden='true'></i></a><label>Gas limit</label></h4>" +
    "<h4 class='user-info-row'><a class='icon-copy'><span class='address' id='" + prefix + "-data'>&nbsp;</span> <i class='fa fa-files-o' aria-hidden='true'></i></a><label>Data</label></h4>"
  );
};
