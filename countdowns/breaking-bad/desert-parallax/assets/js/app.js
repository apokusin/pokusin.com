$(document).ready(function(){

  // Timer countdown time
  var airDate = new Date(Date.now()+3888e6);
  $('#countdown').countdown({until: $.countdown.UTCDate(-8, airDate), format: 'ODHMS',
    layout: '<ul>{y<}<li>{yn}<span>{yl}</span></li>{y>}{o<}<li>{on}<span>{ol}</span></li>{o>}' +
    '{d<}<li>{dn}<span>{dl}</span></li>{d>}{h<}<li>{hn}<span>{hl}</span></li>{h>}' +
    '{m<}<li>{mn}<span>{ml}</span></li>{m>}{s<}<li>{sn}<span>{sl}</span></li>{s>}</ul>'});

});


$(document).ready(function(){
  // Declare parallax on layers
  $('.parallax-layer').parallax({ mouseport: $(".parallax_wrap")}, {xparallax: 0.3, yparallax: false}, {xparallax: 0.3, yparallax: false}, {xparallax: 0.2, yparallax: false});
});
