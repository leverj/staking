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

    closeButton = $("#instructions-modal .close-button");
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

  client.setupStepsModal = function () {
    const body = $("body");
    const stepsModal = $("#steps-modal");
    const actionButton = $("#steps-modal button");
    const closeButton = $("#steps-modal .close-button");

    actionButton.on("click", function () {
      stepsModal.removeClass("active");
      body.removeClass("modal-open");
      const step = $(this).data("step");
      goToStep(step);

      client.closeStepsModal();
    });

    closeButton.on("click", client.closeStepsModal);
  }

  client.showStepsModal = function (userInfo) {
    const body = $("body");
    const stepsModal = $("#steps-modal");

    body.addClass("modal-open");
    stepsModal.addClass("active");

    const approveButton = $("#steps-modal button.approve-button");
    const stakeButton = $("#steps-modal button.stake-button");
    const confirmButton = $("#steps-modal button.confirm-button");

    userInfo.lev > 0 ? approveButton.show() : approveButton.hide();
    userInfo.approved > 0 ? stakeButton.show() : stakeButton.hide();
    userInfo.staked > 0 ? confirmButton.show() : confirmButton.hide();
  }

  client.closeStepsModal = function() {
    $("body").removeClass("modal-open");
    $("#steps-modal").removeClass("active");
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
    client.setupStepsModal();
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
      console.log("user-update", data);
      if (data.event === "LEV.Approval") {
        loadUserInfo.bind($("#approve-action"))();
      } else if (data.event === "STAKE.STAKE") {
        loadUserInfo.bind($("#stake-action"))();
      }
    })
  };

  client.setEvents = function () {
    $("#choose-action").click(chooseMethod);
    $("#load-eth-info").click(loadUserInfo);
    $("#approve-action").click(approve);
    $("#stake-action").click(stake);
    $(".icon-copy").click(copy);
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
      .then(() => {
        if (isManual) {
          $("#load-eth-info").text("Show Info");
        }
      })
      .catch(handle);
  }

  function loadUserInfo() {
    let userId = $("#user-id").val();
    contract.setUser(userId);

    let self = this;

    let buttonText = $(self).text();
    $(self).html("<i class='fa fa-spinner fa-spin'></i>");

    const ethInfo = $(self).closest("fieldset").find(".eth-info");
    ethInfo.addClass("loading");

    const buttons = $(self).closest("fieldset").find(".actions button");
    buttons.prop("disabled", true);

    contract
      .updateUserInfo()
      .then(function() {
        updateUserInfo();
        buttonText = $(self).data("reload");
        socket.emit("register", { userid: userId })
      })
      .then(() => {
        const userInfo = contract.getUserInfo();
        buttons.prop("disabled", false);
        const buttonId = $(self).attr("id");
        if (buttonId === "load-eth-info") {
          if (userInfo.lev > 0 || userInfo.approved > 0 || userInfo.staked > 0) {
            if (userInfo.lev > 0 && userInfo.approved === 0 && userInfo.staked === 0) {
              return goToStep(2);
            } else if (userInfo.lev === 0 && ((userInfo.approved > 0 && userInfo.staked === 0) || (userInfo.staked > 0 && userInfo.approved === 0))) {
              return goToStep(3);
            }

            client.showStepsModal(userInfo);
          }
        } else {
          if (userInfo.staked > 0) {
            goToStep(4);
          } else if (userInfo.approved > 0) {
            $("#stake-count").val(userInfo.approved);
            goToStep(3);
          }
        }
      })
      .catch(handle)
      .finally(function(){
        $(self).text(buttonText);
        $(self).removeClass("working");
        showClick.bind(self)();
        ethInfo.removeClass("loading");
      });
  }

  function updateUserInfo() {
    const userInfo = contract.getUserInfo();
    $("[name=eth-addr]").text(contract.user).data("value", contract.user).parent().attr("href", userInfo.userLink);
    $("[name=lev-count]").text(userInfo.lev.toLocaleString(undefined,{maximumFractionDigits:9})).data("value", userInfo.lev).parent().attr("href", userInfo.levLink);
    $("[name=staked-count]").text(userInfo.staked.toLocaleString(undefined,{maximumFractionDigits:9})).data("value", userInfo.staked).parent().attr("href", userInfo.stakedLink);
    $("[name=approved-count]").text(userInfo.approved.toLocaleString(undefined,{maximumFractionDigits:9})).data("value", userInfo.approved).parent().attr("href", userInfo.approvedLink);
    $("[name=fee-count]").text(userInfo.fee.toLocaleString(undefined,{maximumFractionDigits:9})).data("value", userInfo.fee).parent().attr("href", userInfo.feeLink);
  }

  function approve() {
    if ($(this).hasClass("working")) return;

    const tokens = $("#approve-count").val() - 0;
    let self = this;

    let buttonText = $(self).text();
    const approveTxInfo = $("#approve-tx-info");
    const buttons = $(self).closest("fieldset").find(".actions button");

    const userInfo = contract.getUserInfo();
    if (userInfo.lev < tokens) {
      return handle({
        message: "You can not approve more than the available LEV."
      });
    }

    contract
      .getApproveInfo(tokens)
      .then(function (info) {
        approveTxInfo.addClass("active");
        $("#approve-address").text(info.address);
        $("#approve-amount").text(info.amount);
        $("#approve-gas").text(info.gas);
        $("#approve-data").text(info.data);
      })
      .then(() => contract.approve(tokens, (hash) => {
        console.log("approve hash generated: " + hash);
        $(self).addClass("working");
        $(self).html("<i class='fa fa-spinner fa-spin'></i>");
        approveTxInfo.addClass("loading");
        buttons.prop("disabled", true);
      }))
      .then(() => {
        console.log("contract.approve done")
        showClick.bind(self)();
        buttons.prop("disabled", false);
      })
      .catch((e) => {
        handle();
        approveTxInfo.removeClass("active");
      })
      .finally(function() {
        $(self).removeClass("working");
        $(self).text(buttonText);
        approveTxInfo.removeClass("loading");
      });
  }

  function stake() {
    if ($(this).hasClass("working")) return;

    let tokens = $("#stake-count").val() - 0;
    let self = this;

    let buttonText = $(self).text();
    const stakeTxInfo = $("#stake-tx-info");
    const buttons = $(self).closest("fieldset").find(".actions button");

    contract
      .getStakeInfo(tokens)
      .then(function (info) {
        stakeTxInfo.addClass("active");
        $("#stake-address").text(info.address);
        $("#stake-amount").text(info.amount);
        $("#stake-gas").text(info.gas);
        $("#stake-data").text(info.data);
      })
      .then(() => contract.stake(tokens, (hash) => {
        console.log("staking hash generated: " + hash);
        $(self).addClass("working");
        $(self).html("<i class='fa fa-spinner fa-spin'></i>");
        stakeTxInfo.addClass("loading");
        buttons.prop("disabled", true);
      }))
      .then(() => {
        console.log("contract.stake done")
        showClick.bind(self)();
      })
      .catch((e) => {
        if (e.toString().indexOf("Error: gas required exceeds allowance")) {
          handle({
            message: "Staking has failed, it could be one of the following two reasons. <br>" +
                    "1. Staking has expired. Wait for a new staking period. <br>" +
                    "2. You do not have enough approved LEV to be staked."
          })
        } else {
          handle(e);
        }
        stakeTxInfo.removeClass("active");
      })
      .finally(function() {
        $(self).removeClass("working");
        $(self).text(buttonText);
        buttons.prop("disabled", false);
        stakeTxInfo.removeClass("loading");
      });
  }

  function handle(e) {
    console.log(e);
    errorFlag = true;
    let $error = $(".error-container");
    $error.html(e.message);
    $error.fadeIn();
    setTimeout(function () {
      $(".error-container").fadeOut();
    }, 5000);
  }

  function showClick(res) {
    let $element = $(this);
    const fieldset = $element.closest("fieldset");
    fieldset.find(".eth-info").addClass("active");

    if (currentStep === 1) {
      const userInfo = contract.getUserInfo();
      const buttonToShow = $("#" + $element.data("show"));
      if (userInfo.approved === 0 && userInfo.lev === 0) {
        buttonToShow.prop("disabled", true);
      } else {
        buttonToShow.prop("disabled", false);
      }
    }
  }

  function goToStep(step) {
    if (step == currentStep) return false;
    currentStep = step;
    const fieldsetWidth = $(".staking-steps").width();
    $(".fieldset-container").css("transform", "translateX(-" + (currentStep * fieldsetWidth) + "px)");
    $(".fieldset-container fieldset").removeClass("active");
    $(".fieldset-container fieldset:eq(" + currentStep + ")").addClass("active");
    $(".fieldset-container fieldset:lt(" + (currentStep) + ")").find(".next").prop("disabled", false);

    reachStep(step);
    $("#progressbar li").removeClass("passed current");
    $("#progressbar li").eq(step).addClass("current");
    $("#progressbar li:lt(" + (step) + ")").addClass("passed");

    if (step !== 3) {
      $("#stake-tx-info").hide();
    } else {
      $("#stake-tx-info").show();
    }
  }

  function reachStep(step) {
    $("#progressbar li:lt(" + (step + 1) + ")").addClass("reached");
  }
})();
