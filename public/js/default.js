var io = io.connect()
var room = 'a'//prompt('type a room name');
var name = 'b'//prompt('type your name');
var geolocation = null;
var clearWatchHandle = null;
var myPosition=null;


// Emit ready event with room name.
io.emit('ready', room)

// Listen for the announce event.
io.on('announce', function(data) {
   toScreen(data.message);;
});

// Listen for the announce event.
io.on('location', function(data) {
  var b = getBearing(myPosition.coords.latitude,myPosition.coords.longitude,data.position.coords.latitude, data.position.coords.longitude);
  var d = getDistance(data.position.coords.latitude, data.position.coords.longitude, myPosition.coords.latitude,myPosition.coords.longitude);
  setBearing(b);
  toScreen('<hr>Other client: bearing: '+ b+' distance:'+d+' <br>lon:' + data.position.coords.longitude + ' lat:'+ data.position.coords.latitude);
});


if (window.navigator && window.navigator.geolocation) {
  geolocation = window.navigator.geolocation;
}
 
if (geolocation) {
  clearWatchHandle = geolocation.watchPosition(function(position) {
  	myPosition = position;
    toScreen('lon:' + position.coords.longitude + ' lat:'+ position.coords.latitude);
    io.emit('location', {room: room, client: name, position:position});
  },function(a,b,c){
  	debugger;
  });
}

function radians(n) {
  return n * (Math.PI / 180);
}
function degrees(n) {
  return n * (180 / Math.PI);
}

function getBearing(startLat,startLong,endLat,endLong){
  startLat = radians(startLat);
  startLong = radians(startLong);
  endLat = radians(endLat);
  endLong = radians(endLong);

  var dLong = endLong - startLong;

  var dPhi = Math.log(Math.tan(endLat/2.0+Math.PI/4.0)/Math.tan(startLat/2.0+Math.PI/4.0));
  if (Math.abs(dLong) > Math.PI){
    if (dLong > 0.0)
       dLong = -(2.0 * Math.PI - dLong);
    else
       dLong = (2.0 * Math.PI + dLong);
  }

  return (degrees(Math.atan2(dLong, dPhi)) + 360.0) % 360.0;
}

function getDistance(startLat, startLong, endLat, endLong){
	var R = 6371; // km
	var φ1 = radians(startLat);
	var φ2 = radians(endLat);
	var Δφ = radians(endLat-startLat);
	var Δλ = radians(endLong-startLong);

	var a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
	        Math.cos(φ1) * Math.cos(φ2) *
	        Math.sin(Δλ/2) * Math.sin(Δλ/2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

	return d = R * c;
}

function setBearing(bearing){
	$('#arrow').css({
     '-moz-transform':'rotate('+ bearing + 'deg)',
     '-webkit-transform':'rotate('+ bearing + 'deg)',
     '-o-transform':'rotate('+ bearing + 'deg)',
     '-ms-transform':'rotate('+ bearing + 'deg)',
     'transform':'rotate('+ bearing + 'deg)'
});
}
function toScreen(message){
	 $('body').append('<p>'+ message + ' '+ new Date().toString()+'</p>');
}