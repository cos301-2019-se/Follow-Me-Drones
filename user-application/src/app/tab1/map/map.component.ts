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

    var coord = [28.232592, -25.755710]; //TUKS IT BUILDING COORDS
    var coord2 = [28.233443, -25.755809]; 

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
      geometry: new Point(transform(coord2, 'EPSG:4326', 'EPSG:3857')) //this creates a dot at coordinates given
    });

    /*
    var pointStyle = new Style({
      image: new Icon(({
        crossOrigin: 'anonymous',
        src: './dot.png' //unable to find
      }))
    });

    point.setStyle(pointStyle); //once dot.png is found can apply
    */

    vectorSource.addFeature(point);
    vectorSource.addFeature(point2);

    const sleep = (milliseconds) => { //Temporary rendering fix
      return new Promise(resolve => setTimeout(resolve, milliseconds))
    }
    const wait100 = async () => {
      await sleep(100)
      this.map.updateSize();
    }
    wait100();
  } 
}