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
  let animating;


  client.stakingForm = function () {

    $(".next").click(function(){
      nextScreen(current() + 1);
    });

    $(".previous").click(function () {
      let prevButton = $(this);
      prevScreen(current() -1);
    });

    $(".submit").click(function () {
      return false;
    })

    $(".lev-count").click(function() {
      let levCount = $(this).index();
      let currentForm = $("fieldset:visible");
      let currentIndex = currentForm.index();

     if($(this).hasClass("activated")) {
       if(levCount > currentIndex) {
         nextScreen(levCount);
          $(this).prevAll(".activated").addClass("active");
       }
       else if(levCount === currentIndex){
         return false;
       }
       else {
         prevScreen(levCount);
         $(this).nextAll(".active").removeClass("active");
       }
     }
    })

  };

  client.toggleModal = function () {
    let openModal;
    let closeButton;
    let modalBody;
    let htmlBody;

    closeButton = $(".close-button");
    openModal = $(".js-open-modal");
    modalBody = $(".instructions");
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

    overlay = $('.overlay');
    setTimeout(function () {
      overlay.addClass('overlay__invisible');
    }, 3000);
  }

  $(document).ready(function () {
    init();
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
    client.removeLoading();
    }

  client.setup = function () {
    $("#user-id").val(contract.user);
    $.each($(".user-info"), (i, ele) => $(ele).userInfo());
    $("#stake-tx-info").txInfo("stake");
    $("#approve-tx-info").txInfo("approve");

    socket.on('state', async function (data) {
      let text = data.current > data.end ? "expired" : `${data.end - data.current} blocks left`;
      $("#staking-status").text(text)
    })
    socket.on('user-update', function (data) {
      console.log('user-update');
      displayUserInfo();
    })
  };

  client.setEvents = function () {
    $("#choose-action").click(chooseMethod);
    $("[data-id=user-info-display-action]").click(displayUserInfo);
    $("[data-id=approve-action]").click(approve);
    $("#stake-action").click(stake);
    $(".icon-link").click(copy);
    $(".suggested-count").click(updateWithSuggestedCount);
  };

  function copy() {
    let text = $(this).parent().find("span").first().text();
    clipboard.writeText(text);
  }

  function chooseMethod() {
    let self = this;
    let isManual = $("#choice-manual").is(":checked");
    contract.setManual(isManual).then(function () {
      $("#user-id").attr("readonly", !isManual).val(contract.user);
    })
      .then(nextScreen.bind(self, current() + 1))
      .catch(handle);
  }

  function updateWithSuggestedCount() {
    $("fieldset:visible").find('[name=gplus]').val($(this).data('value'))
  }

  function displayUserInfo() {
    let user = $("#user-id").val();
    contract.setUser(user);
    let self = this;
    contract.updateUserInfo().then(function () {
      updateUserInfo();
      socket.emit('register', {userid: user})
    }).then(showClick.bind(self))
      .catch(handle)
  }

  function updateUserInfo() {
    let userInfo = contract.getUserInfo();
    $("[name=lev-count]").text(userInfo.lev.toLocaleString()).data('value', userInfo.lev).next().attr('href', userInfo.levLink);
    $("[name=staked-count]").text(userInfo.staked.toLocaleString()).data('value', userInfo.staked).next().attr('href', userInfo.stakedLink);
    $("[name=approved-count]").text(userInfo.approved.toLocaleString()).data('value', userInfo.approved).next().attr('href', userInfo.approvedLink);
    $("[name=fee-count]").text(userInfo.fee.toLocaleString()).data('value', userInfo.fee).next().attr('href', userInfo.feeLink);
  }

  function approve() {
    let tokens = $("#approve-count").val() - 0;
    let self = this;
    contract.getApproveInfo(tokens).then(function (info) {
      $("#approve-address").text(info.address);
      $("#approve-amount").text(info.amount);
      $("#approve-gas").text(info.gas);
      $("#approve-data").text(info.data);
    }).then(() => contract.approve(tokens))
      .then(showClick.bind(self))
      .catch(handle);
  }

  function stake() {
    let tokens = $("#stake-count").val() - 0;
    let self = this;
    contract.getStakeInfo(tokens).then(function (info) {
      $("#stake-address").text(info.address);
      $("#stake-amount").text(info.amount);
      $("#stake-gas").text(info.gas);
      $("#stake-data").text(info.data);
    }).then(() => contract.stake(tokens))
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

  function showClick() {
    // if(errorFlag) return;
    // $(this).addClass("hidden");
    let $element = $(this)
    $element.parent().find(".eth-info").addClass("active");
    $element.nextAll(".action-button").removeClass("hidden");
    $element.hasClass("show") ? $element.addClass("hidden") : "";
  }

  function nextScreen(x) {
    if (animating) return false;
    animating = true;
    let $fieldset = $("fieldset");

    let currentForm = $("fieldset:visible");
    let nextIndex = x + currentForm;

    nextForm = $fieldset.eq(x);

    console.log(nextForm);

    nextForm.addClass("next current form");

    $("#progressbar li").eq($fieldset.index(nextForm)).addClass("active activated");
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
  }

  function move(current, forward){
    return Promise(function(resolve, reject){
      $("#progressbar li").eq($("fieldset").index(nextForm)).addClass("active activated");
      // $("fieldset").removeClass("active");
      nextForm.addClass('active');
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
          resolve();
        },
        easing: 'easeInOutBack',
      });
    })
  }

  function prevScreen(x) {
    if (animating) return false;
    animating = true;
    let $fieldset = $("fieldset");

    let currentForm = $("fieldset:visible");
    let prevIndex = x + currentForm;

    previousForm = $fieldset.eq(x);

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
  }

  function current(){
    return $("fieldset:visible").index()
  }

})();
