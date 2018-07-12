const $ = require('jquery');
$.fn.userInfo = function () {
  this.append(
    "<h4 class='user-info-heading'>Available LEV:<span class='suggested-count' name='lev-count'>&nbsp;</span><a target='_blank' class='icon-link'><i class='fa fa-external-link'></i></a> </h4>" +
    "<h4 class='user-info-heading'>Total Approved LEV: <span class='suggested-count'  name='approved-count'>&nbsp;</span><a target='_blank' class='icon-link'><i class='fa fa-external-link'></i></a> </h4>" +
    "<h4 class='user-info-heading'>Total Staked LEV: <span class='suggested-count'  name='staked-count'>&nbsp;</span><a target='_blank' class='icon-link'><i class='fa fa-external-link'></i></a> </h4>" +
    "<h4 class='user-info-heading'>Number of FEE: <span class='suggested-count'  name='fee-count'>&nbsp;</span><a target='_blank' class='icon-link'><i class='fa fa-external-link'></i></a> </h4>");
  // + "<a href='#' class='icon-link icon-link--big icon-link--center icon-link--rotate' data-id='user-info-display-action'><i class='fa fa-refresh' aria-hidden='true'></i></a>");
};

$.fn.txInfo = function (prefix) {
  this.append(
    "<h4 class='user-info-heading'>To address: <span id='" + prefix + "-address'>&nbsp;</span>" +
    "  <a class='icon-link'><i class='fa fa-files-o' aria-hidden='true'></i></a>" +
    "</h4>" +
    "<h4 class='user-info-heading'>Amount: <span id='" + prefix + "-amount'>&nbsp;</span>" +
    "  <a class='icon-link'><i class='fa fa-files-o' aria-hidden='true'></i></a>" +
    "</h4>" +
    "<h4 class='user-info-heading'>Gas limit: <span id='" + prefix + "-gas'>&nbsp;</span>" +
    "  <a class='icon-link'><i class='fa fa-files-o' aria-hidden='true'></i></a>" +
    "</h4>" +
    "<h4 class='user-info-heading'>Data: <span class='address' id='" + prefix + "-data'>&nbsp;</span>" +
    "  <a class='icon-link'><i class='fa fa-files-o' aria-hidden='true'></i></a>" +
    "</h4>"
  );
};
