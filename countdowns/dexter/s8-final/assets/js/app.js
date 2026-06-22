$(document).ready(function(){
  var airDate = new Date(Date.now()+2160e6);
  $('#countdown').countdown({until: airDate, layout: $('#countdown').html()});
});
