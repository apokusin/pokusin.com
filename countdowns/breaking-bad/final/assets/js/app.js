$(document).ready(function(){
  var airDate = new Date(Date.UTC(2013, (9-1), 30, 1, 1, 0));
  $('#countdown_area').countdown({until: airDate, onExpiry: fire, layout: $('#countdown_area').html()});
    function fire() {
      audio.play();
      $("body").addClass("expired");
    };
  generateShareURL = function() {
    var days = $(".days .amount").text().trim();
    var hours = $(".hours .amount").text().trim();
    var minutes = $(".minutes .amount").text().trim();
    var seconds = $(".seconds .amount").text().trim();

    var url = "?text=Only " + days + " days, " + hours + " hours, " + minutes + " minutes, " + "and " + seconds + " seconds left! - " + "&related=apokusin&hashtags=allbadthingsmustcometoanend&url=http%3A%2F%2Fbreakingbadcountdown.com";

    return url;
  };

  $(".hash_tag a").click(function(event) {
    var currentURL = "https://twitter.com/intent/tweet" + generateShareURL();
    $(".hash_tag a").attr("href", decodeURIComponent(currentURL));
  });


});
