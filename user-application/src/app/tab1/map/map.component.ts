import { Component, AfterContentInit } from '@angular/core';
import OlMap from 'ol/Map';
import OlTileLayer from 'ol/layer/Tile';
import OlView from 'ol/View';
import OlOSM from 'ol/source/OSM';
import OlProj from 'ol/proj';
import {fromLonLat} from 'ol/proj';

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

    this.view.setCenter(fromLonLat([28.232592, -25.755710]));

  } 
}