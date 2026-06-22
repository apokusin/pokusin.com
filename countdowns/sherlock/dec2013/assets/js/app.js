var updateGIFImage = function(value) {
  if (value) {
    d = new Date();
    $('.gif').css('background-image', "url('assets/bg_gifs/" + value + ".gif')");
  }
};

var updateURLHash = function(value) {
  window.location.hash = value;
};

var updateActiveNav = function(item) {
  $('.nav_selector a').removeClass();
  $(".nav_selector a[data-href='" + item + "']").addClass('active');
};

var nextNavItem = function() {
  $('.nav_selector a.active').next('a').click();
};

var prevNavItem = function() {
  $('.nav_selector a.active').prev('a').click();
};

var showModal = function(m) {
  m.fadeIn(200);
  centerTopMargin(m.children(".modal"));
  };

var centerTopMargin = function(e) {
  var top = e.height()/2;
  e.css('margin-top', - top);
};

var hideModal = function(m) {
  m.fadeOut(200);
};

$(document).ready(function() {

  var airDate = new Date(Date.UTC(2014, (1 - 1), 1, 20, 0, 0));
  $('#countdown').countdown({
    until: airDate,
    layout: $('#countdown').html()
  });

  $('.nav_selector a').click(function() {
    var value = $(this).data("href");
    updateGIFImage(value);
    updateURLHash(value);
    updateActiveNav(value);
    return false;
  });

  $(".main_nav.left").click(function() {
    prevNavItem();
    return false;
  });

  $(".main_nav.right").click(function() {
    nextNavItem();
    return false;
  });

  KeyboardJS.on("left, h", function() {
    prevNavItem();
    return false;
  });

  KeyboardJS.on("right, l", function() {
    nextNavItem();
    return false;
  });

  KeyboardJS.on("questionmark", function() {
    showModal($(".help_modal"));
  });

  KeyboardJS.on("esc", function() {
    hideModal($(".help_modal"));
  });

  $(".icon-help").click(function() {
    showModal($(".help_modal"));
  });

  var urlHash = window.location.hash.substring(1);
  if (urlHash) {
    updateGIFImage(urlHash);
    updateActiveNav(urlHash);
  }

  $('.overlay').click(function() {
    hideModal($(".modal_wrap"));
    return false;
  });

  if (!$.browser.webkit) {
    $("*[data-noff]").remove();
  }

});