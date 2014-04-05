if (Meteor.isClient) {

  Meteor.startup( function initializeMap() {
    var map = L.map('map').setView([51.505, -0.09], 13);
    //L.tileLayer('http://a.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    L.tileLayer('http://otile1.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.png', {
        attribution: 'Tiles Courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a> <img src="http://developer.mapquest.com/content/osm/mq_logo.png">',
        maxZoom: 18
    }).addTo(map);
  });

  Meteor.startup( function initializeFilePicker() {
    console.log('hi');
    filepicker.setKey("AlCrL69bBRFOX9cgnAJ0wz"); 
    filepicker.constructWidget(document.getElementById('attachment'));
  });

  Template.map.events({
    'change #attachment': function(evt){
        console.log(evt.files);
    }
});

/*
  filepicker.pick({
      mimetypes: ['image/*', 'text/plain'],
      container: 'window',
      services:['COMPUTER', 'FACEBOOK', 'GMAIL'],
    },
    function(InkBlob){
      console.log(JSON.stringify(InkBlob));
    },
    function(FPError){
      console.log(FPError.toString());
    }
  );

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
