let htmlPage = (mapCDN) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="initial-scale=1.0">
    <link rel="stylesheet" href="https://openlayers.org/en/v5.3.0/css/ol.css" type="text/css">
    <script src="${mapCDN}"></script>
    <title>Mock Map</title>
    <style>
        .map {
          height: 75%;
          width: 75%;
          max-width: 1200px;
          margin: 0 auto;
        }
        html, body {
          height: 100%;
          margin: 0;
          padding: 0;
          background-color: #36454f;
        }
      </style>
</head>
<body>
  <div id="map" class="map"></div>
  <form>
    <div class="map">
      <select id="location" onchange="updateView()">
        <option value=0>IT Building</option>
        <option value=1>Bon Accord Dam</option>
        <option value=2>Faerie Glen Nature Reserve</option>
        <option value=3>Loftus Stadium</option>
      </select>
    </div>
  </form>
    <script type="text/javascript">
      var tile = new ol.layer.Tile({
        source: new ol.source.OSM()
      });
      

      //point drawing layer
      var vector = new ol.layer.Vector({
        source: new ol.source.Vector(),
        style: new ol.style.Style({
          fill: new ol.style.Fill({
            color: 'red'
          })})
      }); 

      var myView = new ol.View({
          center: ol.proj.fromLonLat([28.232592,-25.755710]),
          zoom: 18
      });
     
      console.log("ITBuilding: " + ol.proj.fromLonLat([28.232592,-25.755710]));
      var myMap = new ol.Map({
        target: 'map',
        layers: [tile, vector],
        view: myView
      });

      //point drawing function
      function addInteraction() {
          draw = new ol.interaction.Draw({
            source: vector.source,
            type: 'Point'
          });
          map.addInteraction(draw);
      };

    //point drawing enable function
    //addInteraction();

    function updateView()
    {
      var idx = document.getElementById("location").value; 
      var arrLon = [28.232592,   28.188971,  28.296756,  28.222929];
      var arrLat = [-25.755710, -25.628668, -25.774027, -25.753256];

      console.log("Current:    " + ol.proj.fromLonLat([arrLon[idx], arrLat[idx]]))

      myView.setCenter(ol.proj.fromLonLat([arrLon[idx], arrLat[idx]]));
      myView.setZoom(18);

    };
    </script>
</body>
</html>`;

const cdn = "https://cdn.rawgit.com/openlayers/openlayers.github.io/master/en/v5.3.0/build/ol.js";

var a = function getCDN(){
    return cdn;
}

module.exports = {
    htmlPage,
    a
}