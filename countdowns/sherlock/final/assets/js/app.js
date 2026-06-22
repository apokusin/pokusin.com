(function() {
  var centerTopMargin, doNothing, doSomething, hideModal, hideModals, nextNavItem, prevNavItem, updateActiveNav, updateGIFImage, updateURLHash, urlHash;

  updateGIFImage = function(value) {
    var d;
    if (value) {
      d = new Date();
      return $(".gif").css("background-image", "url('assets/bg_gifs/" + value + ".gif')");
    }
  };

  updateURLHash = function(value) {
    return window.location.hash = value;
  };

  updateActiveNav = function(item) {
    $(".nav_selector a").removeClass();
    return $(".nav_selector a[data-href='" + item + "']").addClass("active");
  };

  nextNavItem = function() {
    return $(".nav_selector a.active").next("a").click();
  };

  prevNavItem = function() {
    return $(".nav_selector a.active").prev("a").click();
  };

  this.showModal = function(m) {
    if (!m.is(":visible")) {
      hideModals();
      flightCheck();
      m.show();
      return centerTopMargin(m.children(".modal"));
    }
  };

  centerTopMargin = function(e) {
    var top;
    top = e.height() / 2;
    return e.css("margin-top", -top);
  };

  hideModal = function(m) {
    return m.hide();
  };

  hideModals = function(m) {
    return $(".modal_wrap").hide();
  };

  doNothing = function() {
    return showModal($(".go_away"));
  };

  doSomething = function() {
    return activateSettingsPanel();
  };

  $(".nav_selector a").click(function() {
    var value;
    value = $(this).data("href");
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

  KeyboardJS.on("left", function() {
    prevNavItem();
    return false;
  });

  KeyboardJS.on("right", function() {
    nextNavItem();
    return false;
  });

  KeyboardJS.on("questionmark", function() {
    showModal($(".help_modal"));
    return false;
  });

  KeyboardJS.on("esc", function() {
    return hideModals();
  });

  $(".icon-help").click(function() {
    ga('send', 'event', "Help Icon", "click", "main nav");
    return showModal($(".help_modal"));
  });

  urlHash = window.location.hash.substring(1);

  if (urlHash) {
    updateGIFImage(urlHash);
    updateActiveNav(urlHash);
  }

  $(".overlay").click(function() {
    hideModals();
    return false;
  });

  if (!$.browser.webkit) {
    $("*[data-noff]").remove();
  }

  $(".nothing").click(function() {
    if ($(this).hasClass("something")) {
      doSomething();
    } else {
      doNothing();
    }
    return false;
  });

}).call(this);
