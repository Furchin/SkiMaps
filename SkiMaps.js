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

  var find

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
    var polyline = L.polyline(points, {color: 'red'}).addTo(map);

    // Now we need to compute the individual runs and lift rides
    var tracks = detectRuns(points);
    console.log('Number of lift rides: ' + tracks.lifts.length);
    console.log('Number of runs: ' + tracks.runs.length);

    _.each(tracks.lifts, function iterator(lift) {
      L.polyline(lift, {color: 'black'}).addTo(map);
    })
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
