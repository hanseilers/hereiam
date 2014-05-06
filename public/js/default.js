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
    text('theirHeading', b);
    var d = getDistance(data.position.coords.latitude, data.position.coords.longitude, myPosition.coords.latitude, myPosition.coords.longitude);

    setBearing();
    setDistance(d);

    var latLng = new google.maps.LatLng(data.position.coords.latitude, data.position.coords.longitude);
    // Create marker 
    if (!theirMarker) {
        theirMarker = new google.maps.Marker({
            map: map,
            position: latLng,
            title: 'them'
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
                title: 'us'
            });
        }
        else {
            myMarker.setPosition(latLng);
        }

        latlngbounds.extend(latLng);

        map.setCenter(latlngbounds.getCenter());
        map.fitBounds(latlngbounds);

    }, function(a, b, c) {
        alert(a);
    });
}

function setBearing() {
    transform('compass', 'rotate(' + (theirHeading - myHeading) + 'deg)');
}

function setDistance(distance) {
    text('distance', distance);
}

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
    text('text', round(theirHeading - bmyHeading));

    setBearing();
});
