const $ = require("jquery");
const jQuery = require("jquery-easing");
const contract = require("./contract");

module.exports = (function () {
  let client = {};

  client.stakingForm = function () {
    let currentForm;
    let nextForm;
    let previousForm;
    let left;
    let opacity;
    let scale;
    let animating;

    $(".show").click(function () {
      $(this).addClass("hidden");
      $(this).parent().find(".eth-info").addClass("active");
      $(this).next(".next").removeClass("hidden");
    });

    $(".next").click(function () {
      if (animating) return false;
      animating = true;

      currentForm = $(this).parent();
      nextForm = $(this).parent().next();


      $("#progressbar li").eq($("fieldset").index(nextForm)).addClass("active");

      nextForm.show();
      currentForm.animate({opacity: 0}, {
        step: function (now, mx) {
          scale = 1 - (1 - now) * 0.2;
          left = (now * 50) + "%";
          opacity = 1 - now;
          currentForm.css({
            'transform': 'scale(' + scale + ')',
            'position': 'absolute'
          });
          nextForm.css({'left': left, 'opacity': opacity});
        },
        duration: 800,
        complete: function () {
          currentForm.hide();
          animating = false;
        },
        easing: 'easeInOutBack'
      });
    });

    $(".previous").click(function () {
      if (animating) return false;
      animating = true;

      currentForm = $(this).parent();
      previousForm = $(this).parent().prev();

      $("#progressbar li").eq($("fieldset").index(currentForm)).removeClass("active");

      previousForm.show();
      currentForm.animate({opacity: 0}, {
        step: function (now, mx) {
          //as the opacity of currentForm reduces to 0 - stored in "now"
          //1. scale previousForm from 80% to 100%
          scale = 0.8 + (1 - now) * 0.2;
          //2. take currentForm to the right(50%) - from 0%
          left = ((1 - now) * 50) + "%";
          //3. increase opacity of previousForm to 1 as it moves in
          opacity = 1 - now;
          currentForm.css({'left': left});
          previousForm.css({'transform': 'scale(' + scale + ')', 'opacity': opacity});
        },
        duration: 800,
        complete: function () {
          currentForm.hide();
          animating = false;
        },
        //this comes from the custom easing plugin
        easing: 'easeInOutBack'
      });
    });

    $(".submit").click(function () {
      return false;
    })
  };

  client.toggleModal = function () {
    let openModal;
    let closeButton;
    let modalBody;

    openModal = $(".js-open-modal");
    modalBody = $(".modal__body");

    openModal.on("click", function () {
      modalBody.addClass("active");
    });

    // closeButton.on("click", function () {
    //   modalBody.removeClass("active");
    // })
  };

  client.copyData = function () {
    let copyButton;
    let copyString;

  };

  client.rememberState = function () {
    console.log("client.rememberState function");
  };

  client.detectDevice = function () {
    console.log("client.detectDevice function");
  };

  $(document).ready(function () {
    init();
  });

  function init() {
    client.stakingForm();
    client.toggleModal();
    client.copyData();
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
  };

  client.setEvents = function () {
    $("#choose-action").click(chooseMethod);
    $("#user-info-display-action").click(displayUserInfo);
    $("#approve-action").click(approve);
    $("#stake-action").click(stake);
  };

  function chooseMethod() {
    contract.setManual($("#choice-manual").is(":checked"));
  }

  function displayUserInfo() {
    let user = $("#user-id").val();
    contract.setUser(user);
    contract.updateUserInfo().then(function () {
      let userInfo = contract.getUserInfo();
      $("[name=lev-count]").text(userInfo.lev);
      $("[name=staked-count]").text(userInfo.staked);
      $("[name=approved-count]").text(userInfo.approved);
    })
  }

  function approve() {
    let tokens = $("#approve-count").val() - 0;
    contract.getApproveInfo(tokens).then(function(info){
      $("#approve-address").text(info.address);
      $("#approve-amount").text(info.amount);
      $("#approve-gas").text(info.gas);
      $("#approve-data").text(info.data);
    })
  }

  function stake() {
    let tokens = $("#stake-count").val() - 0;
    contract.getStakeInfo(tokens).then(function(info){
      $("#stake-address").text(info.address);
      $("#stake-amount").text(info.amount);
      $("#stake-gas").text(info.gas);
      $("#stake-data").text(info.data);
    })
  }


})();
