(function() {
  $(document).ready(function() {
    var activateHouse, googleClickTrack, hideHouses, nextNavItem, prevNavItem, resetTheme, routeURLHash, runCountdown, updateHouseQuote, updateLocalStorage, updateNav, updateNavText, updateTheme, updateURLHash;
    runCountdown = function() {
      var airDate;
      airDate = new Date(2014, 5, 15, 21, 0, 0);
      return $("#countdown").countdown({
        until: airDate,
        timezone: -4,
        format: 'DHMS',
        tickInterval: 1,
        layout: $(".countdown_layout").html()
      });
    };
    runCountdown();
    updateHouseQuote = function(house) {
      var houses;
      houses = {
        targaryen: "Fire and Blood",
        baratheon: "Ours is the Fury",
        tully: "Family Duty Honor",
        lannister: "Hear Me Roar",
        tyrell: "Growing Strong",
        stark: "Winter is Coming",
        arryn: "As High As Honor",
        martell: "Unbowed Unbent Unbroken",
        greyjoy: "We Do Not Sow"
      };
      return houses[house];
    };
    updateNav = function(house) {
      if (house) {
        return $("footer").addClass("active");
      } else {
        return $("footer").removeClass("active");
      }
    };
    hideHouses = function() {
      return $(".houses").removeClass("active");
    };
    googleClickTrack = function(category, action) {
      console.log(category, action);
      return _gaq.push(["_trackEvent", category, action]);
    };
    activateHouse = function(house) {
      $(".house").removeClass("active");
      return $("a[data-house='" + house + "']").parent().addClass("active");
    };
    updateNavText = function(text) {
      if (text) {
        return $(".nav_text").text("house " + text);
      } else {
        return $(".nav_text").text("Select your house:");
      }
    };
    updateLocalStorage = function(house) {
      if (house) {
        return localStorage.setItem("house", house);
      } else {
        return localStorage.removeItem("house");
      }
    };
    updateURLHash = function(text) {
      if (text) {
        return window.location.hash = text;
      } else {
        return history.pushState("", document.title, window.location.pathname);
      }
    };
    updateTheme = function(house) {
      if (house) {
        updateLocalStorage(house);
        $("meta[name=title]").attr("content", house);
        $("body").removeClass().addClass(house);
        $(".clear").css("display", "inline-block");
        updateNav(house);
        return googleClickTrack("house", house);
      } else {
        updateLocalStorage();
        $("body").removeClass();
        $(".clear").hide();
        updateNav(false);
        return googleClickTrack("house", "Default");
      }
    };
    prevNavItem = function() {
      return $('.house.active').prev('.house').children('a').click();
    };
    nextNavItem = function() {
      return $('.house.active').next('.house').children('a').click();
    };
    routeURLHash = function(house) {
      if (!house) {
        house = window.location.hash.substring(1) || localStorage.getItem("house");
      }
      hideHouses();
      activateHouse(house);
      updateNavText(house);
      updateURLHash(house);
      updateTheme(house);
      return false;
    };
    resetTheme = function() {
      $(".houses").removeClass("active");
      updateNavText(false);
      updateURLHash(false);
      return updateTheme(false);
    };
    $(".nav_text").click(function() {
      $(".houses").toggleClass("active");
      return false;
    });
    $(".clear").click(function() {
      resetTheme();
      return false;
    });
    $(".house a").click(function(event) {
      var house;
      event.preventDefault();
      house = $(this).data("house").toLowerCase();
      routeURLHash(house);
      return false;
    });
    $(".nav.left").click(function(event) {
      event.preventDefault();
      prevNavItem();
      return false;
    });
    $(".nav.right").click(function(event) {
      event.preventDefault();
      nextNavItem();
      return false;
    });
    Mousetrap.bind("left", function(e) {
      e.preventDefault;
      prevNavItem();
      return false;
    });
    Mousetrap.bind("right", function(e) {
      e.preventDefault;
      nextNavItem();
      return false;
    });
    Mousetrap.bind("esc", function(e) {
      e.preventDefault;
      resetTheme();
      return false;
    });
    Mousetrap.bind("1", function(e) {
      e.preventDefault;
      $(".house:first-child a").click();
      return false;
    });
    Mousetrap.bind("2", function(e) {
      e.preventDefault;
      $(".house:nth-child(2) a").click();
      return false;
    });
    Mousetrap.bind("3", function(e) {
      e.preventDefault;
      $(".house:nth-child(3) a").click();
      return false;
    });
    Mousetrap.bind("4", function(e) {
      e.preventDefault;
      $(".house:nth-child(4) a").click();
      return false;
    });
    Mousetrap.bind("5", function(e) {
      e.preventDefault;
      $(".house:nth-child(5) a").click();
      return false;
    });
    Mousetrap.bind("6", function(e) {
      e.preventDefault;
      $(".house:nth-child(6) a").click();
      return false;
    });
    Mousetrap.bind("7", function(e) {
      e.preventDefault;
      $(".house:nth-child(7) a").click();
      return false;
    });
    Mousetrap.bind("8", function(e) {
      e.preventDefault;
      $(".house:nth-child(8) a").click();
      return false;
    });
    Mousetrap.bind("9", function(e) {
      e.preventDefault;
      $(".house:nth-child(9) a").click();
      return false;
    });
    Mousetrap.bind("h", function(e) {
      e.preventDefault;
      $(".nav_text").click();
      return false;
    });
    return routeURLHash();
  });

}).call(this);
