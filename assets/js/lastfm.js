// Hacky last.fm Now Playing
// by Zack Fernandes (zackfern.me) April 2013
//
// Instructions:
// - Install jQuery, if you don't have it already.
// - Create a last.fm API key and set the api_key variable.
// - Set the username variable to your last.fm username.
// - Add something with the ID of now_playing in your site.
// - Include this script and enjoy.
//
// last.fm API documentation for the method we're using:
// http://www.last.fm/api/show/user.getRecentTracks

$(function(){
  // Musical verbs to use in the 'jamming label'
  var musicVerbs = ['jamming', 'grooving', 'dancing', 'listening', 'coding', 'designing', 'thinking', 'reading'];
  var randomVerb = musicVerbs[Math.floor(Math.random()*musicVerbs.length)];
  // Create a new API Key here: http://www.last.fm/api/account/create
  var api_key = '780d266ced9cf1ad8354c91d03c14bdd';
  // Your last.fm username. We'll use this to fetch your tracks and link to your profile.
  var username = 'playfulcyanide';
  // This is the URL of the API we're calling.
  var base_url = 'http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user='+username+'&api_key='+api_key+'&limit=1&format=json';
  $.getJSON(base_url, function(data){
    // Check to see if we're getting an Array or Object.
    // If we're listening to something right now, the API returns the song we're currently listening to as well as the last song we listened to, which would be an Array.
    // If we aren't listening toa nything right now, the API returns the last song we listened to, which would appear to jQuery as an Object.
    if(jQuery.type(data.recenttracks.track) === 'array') {
      // Grab the first item out of the Array.
      var nowPlaying = data.recenttracks.track[0];
      var listening_text = 'Currently ' + randomVerb + ' to: ';
    }
    else {
      // We don't have an Array, so just return the whole Hash.
      var nowPlaying = data.recenttracks.track;
      var listening_text = 'Last listened to: ';
    }
    var currentTrack = nowPlaying['name'] + ' - ' + nowPlaying['artist']['#text'];
    $('#now_playing').html('<span class="jamming_label">' + listening_text + '</span>' + '<a href="http://last.fm/user/' + username + '">' + currentTrack + '</a>');
  });
});