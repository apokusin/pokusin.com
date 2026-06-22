(function() {
  var activateItem, airDateUK, airDateUS, clearInputs, deactivateItem, form, formInputs, inputCode, parse, validCode, validateCode;

  form = $(".code_input");

  formInputs = $(form).children("input");

  validCode = "SHER";

  parse = function(type) {
    if (typeof type === "string") {
      return JSON.parse(type);
    } else {
      return type;
    }
  };

  this.checkLocalValue = function(item) {
    return parse(localStorage.getItem(item));
  };

  this.updateLocalItem = function(item, val) {
    if (val) {
      localStorage.setItem(item, val);
      return ga('send', 'event', item, val, "settings panel");
    } else {
      localStorage.removeItem(item);
      return ga('send', 'event', item, "disabled", "settings panel");
    }
  };

  activateItem = function(m) {
    return $(m).addClass("active").removeClass("inactive");
  };

  deactivateItem = function(m) {
    return $(m).addClass("inactive").removeClass("active");
  };

  this.itemsArray = function(selector) {
    var items;
    items = [];
    return $(selector).each(function() {
      return items.push($(this));
    });
  };

  this.checkLocalSettings = function() {
    var index, itemData, items, value, _results;
    items = itemsArray($(".settings_list .toggle"));
    index = 0;
    _results = [];
    while (index < items.length) {
      itemData = $(items[index]).data("local");
      value = checkLocalValue(itemData);
      if (value) {
        activateItem($(items[index]));
      } else {
        deactivateItem($(items[index]));
      }
      _results.push(++index);
    }
    return _results;
  };

  this.flightCheck = function() {
    var hideSocial, settingsValue, usaVersion;
    settingsValue = checkLocalValue("settings");
    hideSocial = checkLocalValue("hideSocial");
    usaVersion = checkLocalValue("usa_version");
    if (settingsValue) {
      $(".nothing").addClass("something").text("Settings");
    } else {
      $(".nothing").removeClass("something").text("221B");
    }
    if (hideSocial) {
      $(".links").hide();
      $(".social").hide();
      $(".bbc_logo").hide();
    } else {
      $(".links").show();
      $(".social").show();
      $(".bbc_logo").show();
    }
    if (usaVersion) {
      return updateCountdown('us');
    } else {
      return updateCountdown('uk');
    }
  };

  airDateUS = new Date(2014, 0, 19, 22, 0, 0);

  airDateUK = new Date(2014, 0, 12, 20, 30, 0);

  this.updateCountdown = function(country) {
    var airDate, timezone;
    if (country === "us") {
      airDate = airDateUS;
      timezone = -5;
    } else {
      airDate = airDateUK;
      timezone = 0;
    }
    if ($("#countdown").hasClass("hasCountdown")) {
      return $("#countdown").countdown('option', {
        'until': airDate,
        'timezone': timezone
      });
    } else {
      return $("#countdown").countdown({
        until: airDate,
        timezone: timezone,
        layout: $("#countdown_layout").html()
      });
    }
  };

  $(".settings_list .toggle_trigger").click(function() {
    var item, value;
    item = $(this).children(".toggle").data("local");
    value = checkLocalValue(item);
    if (value) {
      updateLocalItem(item);
    } else {
      updateLocalItem(item, "true");
    }
    return flightCheck();
  });

  $(".reset_local").click(function() {
    return $(".clear_confirm").fadeIn(200);
  });

  $(".clear_confirm .yes").click(function() {
    localStorage.clear();
    $(".clear_confirm").fadeOut(200);
    checkLocalSettings();
    return flightCheck();
  });

  $(".clear_confirm .no").click(function() {
    return $(".clear_confirm").fadeOut(200);
  });

  $(formInputs).autotab_magic();

  inputCode = function() {
    var code;
    code = [];
    $(formInputs).each(function() {
      return code.push($(this).val());
    });
    return code.join("");
  };

  validateCode = function() {
    var c;
    c = inputCode().toUpperCase();
    if (c === validCode) {
      $(form).removeClass("error").addClass("success");
      $(".hint").fadeOut();
      activateSettingsPanel();
      return false;
    } else {
      $(form).addClass("error").removeClass("success");
      return false;
    }
  };

  this.activateSettingsPanel = function() {
    updateLocalItem("settings", "true");
    checkLocalSettings();
    showModal($(".definitely_nothing_at_all"));
    return clearInputs();
  };

  clearInputs = function() {
    $(formInputs).first().focus();
    $(formInputs).val("");
    return $(form).removeClass();
  };

  $(formInputs).keyup(function() {
    if (event.keyCode === 8 || event.keyCode === 46) {
      clearInputs();
      return false;
    } else {
      validateCode();
      return console.log("test");
    }
  });

  $(formInputs).click(function() {
    return clearInputs();
  });

  flightCheck();

}).call(this);
