if (Meteor.isClient) {

  var pickFile = function pickFile() {
    filepicker.pick({
      extension: '.gpx',
      container: 'modal',
      services:['COMPUTER', 'FACEBOOK', 'GMAIL'],
    },
    function onSuccess(inkBlob){
      console.log('Now reading inkBlob...');
      loadGpx(inkBlob);
    },
    function onError(FPError){
      console.log(FPError.toString());
    });
  };

  var loadGpx = function loadGpx(inkBlob) {
    if (!inkBlob) {
      console.log('inkBlob not provided; using default.');
      inkBlob = {"url":"https://www.filepicker.io/api/file/toS3GQPXTpaSKKWrtGKX","filename":"WhistlerSkiing.gpx","mimetype":"application/octet-stream","size":763448,"isWriteable":true};
    }

    filepicker.read(inkBlob, function(data){
      processGpx(data);
    });
  };

  var combineAdjacentTracksOfSameType = function combineAdjacentTracksOfSameType(tracks) {
    for (var i = 0; i < tracks.length - 1; i++ ) {
      if (tracks[i].type === tracks[i + 1].type) {
        // combine identical adjacent tracks
        _.each(tracks[i+1].points, function iterator(point) {
          tracks[i].points.push(point);
        });
        // Remove tracks[i+1] from array
        tracks.splice(i + 1, 1);
      }
    }

    return tracks;
  }

  var processGpx = function processGpx(gpxStr) {
    var gpxXml = $.parseXML(gpxStr);
    var json = xmlToJson(gpxXml);

    // Okay, that's been converted to json. Let's strip out all the stuff we don't need!
    var points = [];
    if (!_.isArray(json.gpx.trk)) {
      json.gpx.trk = [json.gpx.trk];
    }
    _.each(json.gpx.trk, function processTrack(trk) {
      if (!_.isArray(trk.trkseg)) {
        trk.trkseg = [trk.trkseg];
      }
      _.each(trk.trkseg, function processSegment(seg) {
        if (!_.isArray(seg.trkpt)) {
          seg.trkpt = [seg.trkpt];
        }
        _.each(seg.trkpt, function processPoint(pt){
          points.push({
            time: pt.time['#text'],
            altitude: pt.ele['#text'],
            lat: pt['@attributes'].lat,
            lng: pt['@attributes'].lon
          })
        });
      });
    });

    // Sort the points by time
    points = _.sortBy(points, function iterator(point){
      return point.time;
    });

    // Compute a speed and heading for each point
    points[0].speed = 0;
    points[0].heading = 0;
    for (var i=1; i < points.length; i++) {
      var distance = L.latLng(points[i]).distanceTo(L.latLng(points[i-1]));
      var elapsedTime = moment(points[i].time).diff(moment(points[i-1].time), 'seconds');
      points[i].speed = distance / elapsedTime; // This is in meters per second

      points[i].heading = L.LatLng.RAD_TO_DEG * computeHeading(points[i-1], points[i]);
    }

    // Zoom the map onto the first point with nice smooth animation.
    // TODO: This isn't working. I don't know why.
    /*
    map.zoomIn(2, {duration: 10});
    map.setView(points[0], {animate: 'true'});
    */

    // Move the map to show all the points
    var options = {
      paddingTopLeft: 0,
      paddingBottomRight: 0,
      pan: {
        animate: true,
        duration: 0.25,
        easeLinearity: 0.25
      },
      zoom: {
        animate: true
      }
    };
    map.fitBounds(L.latLngBounds(points), options);

    // Rudimentary drawing of all the points
    //var polyline = L.polyline(points, {color: 'red'}).addTo(map);

    // Now we need to compute the individual runs and lift rides
    var tracks = detectRuns(points);

    // Combine short tracks with their neighbors.
    tracks = combineAdjacentTracksOfSameType(tracks);

    for (var i = 0; i < tracks.length - 1; i++ ) {
      if (tracks[i].type === tracks[i + 1].type) {
        // combine identical adjacent tracks
        _.each(tracks[i+1].points, function iterator(point) {
          tracks[i].points.push(point);
        });
        // Remove tracks[i+1] from array
        tracks.splice(i + 1, 1);
      }

      // If we have a short track -- less than 4 points, or less than 10% of the tracks around it, then merge it with tracks[i]. 
      // Then tracks[i] and tracks of what is now i+2 will be merged in the next iteration
      var LENGTH_THRESHOLD = 0.1;
      var numSurroundingPoints = tracks[i].points.length;
      if (tracks[i+2]) {
        numSurroundingPoints += tracks[i+2].points.length;
      }
      if (tracks[i+1].points.length < 4 || 
        (tracks[i+1].points.length < LENGTH_THRESHOLD * tracks[i].points.length && (!tracks[i+2] || tracks[i+1].points.length < LENGTH_THRESHOLD * tracks[i+2].points.length))) {
        //(tracks[i+1].points.length < LENGTH_THRESHOLD * numSurroundingPoints)) { // TODO: This line over-generously combines tracks, resulting in problems elsewhere in the code
        _.each(tracks[i+1].points, function iterator(point) {
          tracks[i].points.push(point);
        });
        tracks.splice(i + 1, 1);
        i--; // Go back one track.
      }
    }

    // Combine short tracks with their neighbors.
    tracks = combineAdjacentTracksOfSameType(tracks);

/*
    // If a track is a LIFT, and has relatively similar bearing to either neighbor, we want to combine.
    for (var i = 0; i < tracks.length - 1; i++) {
      if (tracks[i].type === 'LIFT') {
        var computeAvgHeading = function(points) {
          _.reduce(points, function iterator(memo, point) {
            return memo + point.heading;
          }) / points.length;
        };
        var avgHeading = computeAvgHeading(track[i].points);

        var maxHeadingDeviation = _.reduce(tracks[i].points, function iterator(memo, point) {
          return Math.max(memo, Math.abs(avgHeading - point.heading));
        });

        var nextAvgHeading = computeAvgHeading(track[i+1].points);

        if (maxHeadingDeviation < 7 && Math.abs(avgHeading - nextAvgHeading) < 3) {
          // TODO: Merge, but only if adjacent track is also a LIFT.
        }
      }
    }
*/
    var num = 0;
    for (var i=0; i< tracks.length; i++) {
      var track = tracks[i];
      if (track.type === 'LIFT') { 
        // For debugging purposes, print out any LIFT tracks which rise less than 100m.
        if (track.points[track.points.length - 1].altitude - track.points[0].altitude < 100) {
          console.log('The following LIFT was less than 100 meters: ' + num);
          console.log('Proceeding track num points: ' + (tracks[i-1] ? tracks[i-1].points.length : -1));
          console.log('This track\'s points:' + tracks[i].points.length);
          console.log('Proceeding track num points: ' + (tracks[i+1] ? tracks[i+1].points.length : -1));
          console.dir(track);
          L.polyline(track.points, {color: 'red'}).addTo(map);

          L.marker(track.points[0], {
            riseOnHover: true,
            title: 'track ' + num++
          }).addTo(map);
        } else {
          L.polyline(track.points, {color: 'black'}).addTo(map);
        }
      } else {
        L.polyline(track.points, {color: 'blue'}).addTo(map);
      }
    };
  };

  Meteor.startup( function initializeMap() {
    map = L.map('map').setView([51.505, -0.09], 1);
    //L.tileLayer('http://a.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    L.tileLayer('http://otile1.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.png', {
        attribution: 'Tiles Courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a> <img src="http://developer.mapquest.com/content/osm/mq_logo.png">',
        maxZoom: 18
    }).addTo(map);
  });

  Meteor.startup( function initializeFilePicker() {
    filepicker.setKey("AlCrL69bBRFOX9cgnAJ0wz"); 
  });

  Meteor.startup( function hookupUploadButton() {
    //$('#uploadBtn').click(pickFile);
    // Temporarily skip the file upload, and just process a known good one.
    $('#uploadBtn').click(function clickHandler(e) {
      loadGpx();
    });
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
