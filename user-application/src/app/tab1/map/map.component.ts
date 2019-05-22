import { Component, AfterContentInit } from '@angular/core';
import OlMap from 'ol/Map';
import OlTileLayer from 'ol/layer/Tile';
import OlVectorLayer from 'ol/layer/Vector';
import OlView from 'ol/View';
import OlOSM from 'ol/source/OSM';
import OlVector from 'ol/source/Vector';
import OlProj from 'ol/proj';
import {transform} from 'ol/proj';
import {fromLonLat} from 'ol/proj';
import OlFeature from 'ol/Feature';
import Point from 'ol/geom/Point';
import {Style, Icon} from 'ol/style';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements AfterContentInit  {

  map: OlMap;
  source: OlOSM;
  layer: OlTileLayer;
  view: OlView;
  Olproj: OlProj;

  ngAfterContentInit(){

    this.layer = new OlTileLayer({
      source: new OlOSM()
    });

    this.view = new OlView({
      center: fromLonLat([0, 0]),
      zoom: 18
    });

    this.map = new OlMap({
      target: 'map',
      layers: [this.layer],
      view: this.view
    });

    var coord = [28.232592, -25.755710]; // TUKS IT BUILDING COORDS
    var coord2 = [28.233443, -25.755809]; // IT BUILDING RIGHT
    var coord3 = [28.232434, -25.756141]; // CROSS STREET
    var coord4 = [28.233445, -25.756216]; //

    var vectorSource = new OlVector();

    var vector = new OlVectorLayer({ //drawing layer
      source: vectorSource
    }); 

    this.map.addLayer(vector); //add drawing layer to drop points on
    this.view.setCenter(fromLonLat(coord));  

    var point = new OlFeature({
      geometry: new Point(transform(coord, 'EPSG:4326', 'EPSG:3857')) //this creates a dot at coordinates given
    });

    var point2 = new OlFeature({
      geometry: new Point(transform(coord2, 'EPSG:4326', 'EPSG:3857'))
    });

    var point3 = new OlFeature({
      geometry: new Point(transform(coord3, 'EPSG:4326', 'EPSG:3857'))
    });

    var point4 = new OlFeature({
      geometry: new Point(transform(coord4, 'EPSG:4326', 'EPSG:3857'))
    });


    var pointStyle = new Style({
      image: new Icon(({
          crossOrigin: 'anonymous',
		  src: 'assets/color-pins/dot.png',
		  scale: 0.06
      }))
    });

    var pointStyleRed = new Style({
      image: new Icon(({
        crossOrigin: 'anonymous',
        src: 'assets/color-pins/dot_red.png',
        scale: 0.06
      }))
    });

    var pointStyleYellow = new Style({
      image: new Icon(({
        crossOrigin: 'anonymous',
        src: 'assets/color-pins/dot_yellow.png',
        scale: 0.06
      }))
    });

    point.setStyle(pointStyle);
    point2.setStyle(pointStyleRed);
    point3.setStyle(pointStyleYellow);
    point4.setStyle(pointStyleYellow);

    vectorSource.addFeature(point);
    vectorSource.addFeature(point2);
    vectorSource.addFeature(point3);
    vectorSource.addFeature(point4);

    const sleep = (milliseconds) => { //Temporary rendering fix
      return new Promise(resolve => setTimeout(resolve, milliseconds))
    }
    const wait300 = async () => {
      await sleep(300)
      this.map.updateSize();
    }
    wait300();
  } 
}
