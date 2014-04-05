if (Meteor.isClient) {

  var pickFile = function pickFile() {
    filepicker.pick({
      extension: '.gpx',
      container: 'modal',
      services:['COMPUTER', 'FACEBOOK', 'GMAIL'],
    },
    function onSuccess(inkBlob){
      console.log(JSON.stringify(inkBlob));

      console.log('Now reading inkBlob...');
      filepicker.read(inkBlob, function(data){
          console.log(data);
      });
    },
    function onError(FPError){
      console.log(FPError.toString());
    }
  );
  }

  Meteor.startup( function initializeMap() {
    var map = L.map('map').setView([51.505, -0.09], 13);
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
    $('#uploadBtn').click(pickFile);
  });

  Template.map.events({
    'change #attachment': function(evt){
        console.log(evt.files);
    }
});

/*
  

  Templates.template.events({
    'change #attachment': function(evt){
      console.log(evt.files);
    }
  });

  */
  /*
  // Hook up GPX Button
  $('#loadBtn').click(function() {
    $("#file_upload").click();
  });

  $('input[type=file]').change(function() { 
    
  });
  var map = L.map('map').setView([51.505, -0.09], 13);
  //L.tileLayer('http://a.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  L.tileLayer('http://otile1.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.png', {
      attribution: 'Tiles Courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a> <img src="http://developer.mapquest.com/content/osm/mq_logo.png">',
      maxZoom: 18
  }).addTo(map);
  */
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
