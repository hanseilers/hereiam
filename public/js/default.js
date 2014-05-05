var io = io.connect()
var room = 'a' //prompt('type a room name');
var name = 'b' //prompt('type your name');
var geolocation = null;
var clearWatchHandle = null;
var myPosition = null;
var myHeading = null;
var theirPosition = null;
var theirHeading = null;
var theirMarker, myMarker = null;
var map;
var latlngbounds = new google.maps.LatLngBounds();

function initialize() {
    var map_canvas = document.getElementById('map_canvas');
    var map_options = {
        center: new google.maps.LatLng(44.5403, - 78.5463),
        zoom: 8,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    }
    map = new google.maps.Map(map_canvas, map_options)
}
google.maps.event.addDomListener(window, 'load', initialize);

// Emit ready event with room name.
io.emit('ready', room);

// Listen for the announce event.
io.on('announce', function(data) {
    console.log('io.on(announce)');
    //send my positionto new user
    io.emit('location', {
            room: room,
            client: name,
            position: myPosition
        });
});

// Listen for the announce event.
io.on('location', function(data) {
    var b = getBearing(myPosition.coords.latitude, myPosition.coords.longitude, data.position.coords.latitude, data.position.coords.longitude);
    theirHeading = b;
    text('theirHeading', b, "them");
    var d = getDistance(data.position.coords.latitude, data.position.coords.longitude, myPosition.coords.latitude, myPosition.coords.longitude);

    setBearing();
    setDistance(d);

     var latLng = new google.maps.LatLng(data.position.coords.latitude, data.position.coords.longitude);
    // Create marker 
    if (!theirMarker) {
        theirMarker = new google.maps.Marker({
            map: map,
            position: latLng,
            title:'them'
        });
    }
    else {
        theirMarker.setPosition(latLng);
    }

    latlngbounds.extend(latLng);

    map.setCenter(latlngbounds.getCenter());
    map.fitBounds(latlngbounds);
});

if (window.navigator && window.navigator.geolocation) {
    geolocation = window.navigator.geolocation;
}

if (geolocation) {
    clearWatchHandle = geolocation.watchPosition(function(position) {
        myPosition = position;
        io.emit('location', {
            room: room,
            client: name,
            position: myPosition
        });

          var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    // Create marker 
    if (!myMarker) {
        myMarker = new google.maps.Marker({
            map: map,
            position: latLng,
            title:'us'
        });
    }
    else {
        myMarker.setPosition(latLng);
    }

    latlngbounds.extend(latLng);

    map.setCenter(latlngbounds.getCenter());
    map.fitBounds(latlngbounds);
    
    }, function(a, b, c) {
        toScreen('Error when trying to geolocate');
        debugger;
    });
}


function radians(n) {
    return n * (Math.PI / 180);
}

function degrees(n) {
    return n * (180 / Math.PI);
}

function getBearing(startLat, startLong, endLat, endLong) {
    startLat = radians(startLat);
    startLong = radians(startLong);
    endLat = radians(endLat);
    endLong = radians(endLong);

    var dLong = endLong - startLong;

    var dPhi = Math.log(Math.tan(endLat / 2.0 + Math.PI / 4.0) / Math.tan(startLat / 2.0 + Math.PI / 4.0));
    if (Math.abs(dLong) > Math.PI) {
        if (dLong > 0.0) dLong = -(2.0 * Math.PI - dLong);
        else dLong = (2.0 * Math.PI + dLong);
    }

    return (degrees(Math.atan2(dLong, dPhi)) + 360.0) % 360.0;
}

function getDistance(startLat, startLong, endLat, endLong) {
    var R = 6371; // km
    var startLatR = radians(startLat); //φ1
    var endLatR = radians(endLat); //φ2
    var endLatStartLatR = radians(endLat - startLat); //Δφ
    var endLongStartLongR = radians(endLong - startLong); //Δλ

    var a = Math.sin(endLatStartLatR / 2) * Math.sin(endLatStartLatR / 2) + Math.cos(startLatR) * Math.cos(endLatR) * Math.sin(endLongStartLongR / 2) * Math.sin(endLongStartLongR / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

function setBearing() {
    transform('compass', 'rotate(' + (theirHeading - myHeading) + 'deg)');
}

function setDistance(distance) {
    text('distance', distance);
}

var byId = function(id) {
    return document.getElementById(id);
};
var text = function(id, value) {
    byId(id).innerHTML = value;
};
var transform = function(id, commands) {
    var props = ['transform', 'webkitTransform', 'mozTransform', 'msTransform', 'oTransform'];
    var node = byId(id);
    for (var i = 0; i < props.length; i++) {
        if (typeof(node.style[props[i]]) != 'undefined') {
            node.style[props[i]] = commands;
            break;
        }
    }
};
var round = function(value) {
    return Math.round(value * 100) / 100;
};

Compass.noSupport(function() {
    text('text', 'no support');
}).needGPS(function() {
    text('text', 'need GPS');
}).needMove(function() {
    text('text', 'need move');
}).init(function(method) {
    if (method == 'orientationAndGPS') {
        text('meta', 'GPS diff: ' + round(Compass._gpsDiff));
    }
}).watch(function(heading) {
    myHeading = heading;
    text('text', round(theirHeading-myHeading));

    setBearing();
});
