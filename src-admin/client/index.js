const $ = require("jquery");
const jQuery = require("jquery-easing");

module.exports = (function () {
  let client = {};
  let init
  let stakingForm;
  let toggleModal;
  let copyData;
  let rememberState;
  let detectDevice;

  stakingForm = function() {
    let currentForm;
    let nextForm;
    let previousForm;
    let left;
    let opacity;
    let scale;
    let animating;

    $(".show").click(function() {
      $(this).addClass("hidden");
      $(this).parent().find(".eth-info").addClass("active");
      $(this).next(".next").removeClass("hidden");
    })

    $(".next").click(function(){
      if(animating) return false;
      animating = true;

      currentForm = $(this).parent();
      nextForm = $(this).parent().next();


      $("#progressbar li").eq($("fieldset").index(nextForm)).addClass("active");

      nextForm.show();
      currentForm.animate({opacity: 0}, {
        step: function(now, mx) {
          //as the opacity of currentForm reduces to 0 - stored in "now"
          //1. scale currentForm down to 80%
          scale = 1 - (1 - now) * 0.2;
          //2. bring nextForm from the right(50%)
          left = (now * 50)+"%";
          //3. increase opacity of nextForm to 1 as it moves in
          opacity = 1 - now;
          currentForm.css({
            'transform': 'scale('+scale+')',
            'position': 'absolute'
          });
          nextForm.css({'left': left, 'opacity': opacity});
        },
        duration: 800,
        complete: function(){
          currentForm.hide();
          animating = false;
        },
        easing: 'easeInOutBack'
      });
    });

    $(".previous").click(function(){
      if(animating) return false;
      animating = true;

      currentForm = $(this).parent();
      previousForm = $(this).parent().prev();

      $("#progressbar li").eq($("fieldset").index(currentForm)).removeClass("active");

      previousForm.show();
      currentForm.animate({opacity: 0}, {
        step: function(now, mx) {
          //as the opacity of currentForm reduces to 0 - stored in "now"
          //1. scale previousForm from 80% to 100%
          scale = 0.8 + (1 - now) * 0.2;
          //2. take currentForm to the right(50%) - from 0%
          left = ((1-now) * 50)+"%";
          //3. increase opacity of previousForm to 1 as it moves in
          opacity = 1 - now;
          currentForm.css({'left': left});
          previousForm.css({'transform': 'scale('+scale+')', 'opacity': opacity});
        },
        duration: 800,
        complete: function(){
          currentForm.hide();
          animating = false;
        },
        //this comes from the custom easing plugin
        easing: 'easeInOutBack'
      });
    });

    $(".submit").click(function(){
      return false;
    })
  }

  toggleModal = function () {
    console.log("toggleModal function");
  }

  copyData = function () {
    console.log("copyData function");
  }

  rememberState = function () {
    console.log("rememberState function");
  }

  detectDevice = function () {
    console.log("detectDevice function");
  }

  $(document).ready(function () {
    init();
  })

  init = function () {
    stakingForm();
    toggleModal();
    copyData();
    detectDevice();
    rememberState();
  }
})();
