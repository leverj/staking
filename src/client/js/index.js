const $ = require("jquery");
require("jquery-easing");
require("./templates");
require("jquery-mousewheel")($);
const clipboard = require("clipboard-polyfill");
const contract = require("./contract");
const socket = require("./socket-client");

module.exports = (function () {
  let client = {};
  let errorFlag = false;
  let currentForm;
  let nextForm;
  let previousForm;
  let left;
  let opacity;
  let scale;
  let currentStep = 0;

  client.stakingForm = function () {

    $(".next").click(function(){
      goToStep(currentStep + 1);
    });

    $(".previous").click(function () {
      goToStep(currentStep -1);
    });

    $(".submit").click(function () {
      return false;
    })

    $("#progressbar > li").click(function() {
      if (!$(this).hasClass("reached")) return;

      let step = $(this).index();
      goToStep(step);
    })
  };

  client.toggleModal = function () {
    let openModal;
    let closeButton;
    let modalBody;
    let htmlBody;

    closeButton = $(".close-button");
    openModal = $(".help-modal");
    modalBody = $("#instructions-modal");
    htmlBody = $("html, body");

    openModal.on("click", function () {
      modalBody.addClass("active");
      htmlBody.addClass("modal-open");
    });

    closeButton.on("click", function () {
      modalBody.removeClass("active");
      htmlBody.removeClass("modal-open");
    })
  };

  client.rememberState = function () {
    console.log("client.rememberState function");
  };

  client.detectDevice = function () {
    console.log("client.detectDevice function");
  };

  client.removeLoading = function () {
    let overlay;

    overlay = $(".overlay");
    overlay.addClass("overlay__invisible");
  };

  client.showDisclaimerModal = function (callback) {
    let body;
    let acceptButton;
    let disclaimerModal;
    let cb = callback;

    body = $("body");
    acceptButton = $("#disclaimer-modal .accept-disclaimer-button");
    disclaimerModal = $("#disclaimer-modal");

    // just open the modal
    body.addClass("modal-open");
    disclaimerModal.addClass("active");
    //////////////////////

    acceptButton.on("click", function () {
      disclaimerModal.removeClass("active");
      body.removeClass("modal-open");
      cb();
    });
  }

  $(document).ready(function () {
    client.showDisclaimerModal(init);
    client.removeLoading();
  });

  function init() {
    client.stakingForm();
    client.toggleModal();
    client.detectDevice();
    client.rememberState();
    if (!contract.isMetaMask()) {
      $("#choice-metamask").attr("disabled", true);
      $("#choice-manual").prop("checked", true)
    }
    client.setup();
    client.setEvents();
  }

  client.setup = function () {
    $("#user-id").val(contract.user);
    $.each($(".user-info"), (i, ele) => $(ele).userInfo());
    $("#stake-tx-info").txInfo("stake");
    $("#approve-tx-info").txInfo("approve");

    socket.on("state", async function (data) {
      let text = data.current > data.end ? "expired" : `${data.end - data.current} blocks left`;
      $("#staking-status").text(text)
    })
    socket.on("user-update", function (data) {
      console.log("user-update");
      loadUserInfo.bind($("#approve-action"))();
    })
  };

  client.setEvents = function () {
    $("#choose-action").click(chooseMethod);
    $("#load-eth-info").click(loadUserInfo);
    $("#approve-action").click(approve);
    $("#stake-action").click(stake);
    $(".icon-link").click(copy);
    $(".suggested-count").click(updateWithSuggestedCount);
  };

  function copy() {
    let text = $(this).parent().find("span").first().text();
    clipboard.writeText(text);
  }

  function setupManual(isManual) {
    if (isManual) {
      $(".show-on-manual").removeClass("hidden");
    } else {
      $(".show-on-manual").addClass("hidden");
    }
  }

  function chooseMethod() {
    let self = this;
    let isManual = $("#choice-manual").is(":checked");
    setupManual(isManual);

    contract
      .setManual(isManual)
      .then(function () {
        $("#user-id").attr("readonly", !isManual).val(contract.user);
      })
      .then(goToStep.bind(self, currentStep + 1))
      .catch(handle);
  }

  function updateWithSuggestedCount() {
    $("fieldset:visible").find("[name=gplus]").val($(this).data("value"))
  }

  function loadUserInfo() {
    let userId = $("#user-id").val();
    contract.setUser(userId);

    let self = this;

    const text = $(self).text();
    $(self).html("<i class='fa fa-spinner fa-spin'></i>");

    const ethInfo = $(self).closest("fieldset").find(".eth-info");
    ethInfo.addClass("loading");

    const buttons = $(self).closest("fieldset").find("button");
    buttons.prop("disabled", true);

    contract
      .updateUserInfo()
      .then(function() {
        updateUserInfo();
        socket.emit("register", { userid: userId })
      })
      .then(showClick.bind(self))
      .catch(handle)
      .finally(function(){
        $(self).text(text);
        buttons.prop("disabled", false);
        ethInfo.removeClass("loading");
      });
  }

  function updateUserInfo() {
    let userInfo = contract.getUserInfo();
    $("[name=lev-count]").text(userInfo.lev.toLocaleString(undefined,{maximumFractionDigits:9})).data("value", userInfo.lev).next().attr("href", userInfo.levLink);
    $("[name=staked-count]").text(userInfo.staked.toLocaleString(undefined,{maximumFractionDigits:9})).data("value", userInfo.staked).next().attr("href", userInfo.stakedLink);
    $("[name=approved-count]").text(userInfo.approved.toLocaleString(undefined,{maximumFractionDigits:9})).data("value", userInfo.approved).next().attr("href", userInfo.approvedLink);
    $("[name=fee-count]").text(userInfo.fee.toLocaleString(undefined,{maximumFractionDigits:9})).data("value", userInfo.fee).next().attr("href", userInfo.feeLink);
  }

  function approve() {
    let tokens = $("#approve-count").val() - 0;
    let self = this;
    contract
      .getApproveInfo(tokens)
      .then(function (info) {
        $("#approve-address").text(info.address);
        $("#approve-amount").text(info.amount);
        $("#approve-gas").text(info.gas);
        $("#approve-data").text(info.data);
      })
      .then(() => contract.approve(tokens))
      .then(showClick.bind(self))
      .catch(handle);
  }

  function stake() {
    let tokens = $("#stake-count").val() - 0;
    let self = this;
    contract
      .getStakeInfo(tokens)
      .then(function (info) {
        $("#stake-address").text(info.address);
        $("#stake-amount").text(info.amount);
        $("#stake-gas").text(info.gas);
        $("#stake-data").text(info.data);
      })
      .then(() => contract.stake(tokens))
      .then(showClick.bind(self))
      .catch(handle);
  }

  function handle(e) {
    errorFlag = true;
    let $error = $(".error-container");
    $error.text(e.message);
    $error.fadeIn();
    setTimeout(function () {
      $(".error-container").fadeOut();
    }, 2500);
  }

  function showClick(res) {
    let $element = $(this);
    const fieldset = $element.closest("fieldset");
    fieldset.find(".eth-info").addClass("active");

    if (currentStep === 1) {
      const userInfo = contract.getUserInfo();
      const buttonToShow = $("#" + $element.data("show"));
      if (userInfo.approved === 0 && userInfo.lev === 0) {
        buttonToShow.addClass("hidden");
        alert("no approved or lev");
      } else {
        buttonToShow.removeClass("hidden");
      }
    }
  }

  function goToStep(step) {
    if (step == currentStep) return false;
    currentStep = step;
    const fieldsetWidth = $(".staking-steps").width();
    $(".fieldset-container").css("transform", "translateX(-" + (currentStep * fieldsetWidth) + "px)");

    $("#progressbar li").removeClass("passed current");
    $("#progressbar li:lt(" + (currentStep) + ")").addClass("passed");
    $("#progressbar li:lt(" + (currentStep + 1) + ")").addClass("reached");
    $("#progressbar li").eq(currentStep).addClass("current");
  }
})();
