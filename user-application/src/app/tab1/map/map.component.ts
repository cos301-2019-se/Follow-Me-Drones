import { Component, AfterContentInit } from '@angular/core';
import OlMap from 'ol/Map';
import OlTileLayer from 'ol/layer/Tile';
import {Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import OlVectorLayer from 'ol/layer/Vector';
import OlView from 'ol/View';
import OlOSM from 'ol/source/OSM';
import OlVector from 'ol/source/Vector';
import { Vector as VectorSource } from 'ol/source';
import OlProj from 'ol/proj';
import {transform} from 'ol/proj';
import {fromLonLat} from 'ol/proj';
import OlFeature from 'ol/Feature';
import Point from 'ol/geom/Point';
import {Circle as CircleStyle, Fill, Stroke, Icon, Style} from 'ol/style';
import Geolocation from 'ol/Geolocation';
// import { Geolocation } from '@ionic-native/geolocation/ngx';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements AfterContentInit  {

  map: OlMap;
  source: OlOSM;
  layer: VectorLayer;
  view: OlView;
  Olproj: OlProj;
  geolocation: Geolocation;
  constructor() {

  }
  getElement(id) {
    return document.getElementById(id);
  }

  // refresh() {
  //     this.getElement('accuracy').innerText = this.geolocation.getAccuracy() + ' [m]';
  //     this.getElement('altitude').innerText = this.geolocation.getAltitude() + ' [m]';
  //     this.getElement('altitudeAccuracy').innerText = this.geolocation.getAltitudeAccuracy() + ' [m]';
  //     this.getElement('heading').innerText = this.geolocation.getHeading() + ' [rad]';
  //     this.getElement('speed').innerText = this.geolocation.getSpeed() + ' [m/s]';
  //     this.layer.getSource().changed();
  //     alert('changed');
  // }

  ngAfterContentInit() {

    this.view = new OlView({
      center: [0, 0],
      zoom: 16
    });

    this.map = new OlMap( {
      layers: [
        new OlTileLayer({
          source: new OlOSM()
        })
      ],
      target: 'map',
      view: this.view
    });

    this.geolocation = new Geolocation({
      // enableHighAccuracy must be set to true to have the heading value.
      trackingOptions: {
        enableHighAccuracy: true
      },
      projection: this.view.getProjection()
    });

    const coord = [28.232592, -25.755710]; // TUKS IT BUILDING COORDS
    this.view.setCenter(fromLonLat(coord));

    this.getElement('track').addEventListener('change', () => {
      console.log('works');
      this.geolocation.setTracking(true);
    });

    this.geolocation.on('change', () => {
      this.getElement('accuracy').innerText = this.geolocation.getAccuracy() + ' [m]';
      this.getElement('altitude').innerText = this.geolocation.getAltitude() + ' [m]';
      this.getElement('altitudeAccuracy').innerText = this.geolocation.getAltitudeAccuracy() + ' [m]';
      this.getElement('heading').innerText = this.geolocation.getHeading() + ' [rad]';
      this.getElement('speed').innerText = this.geolocation.getSpeed() + ' [m/s]';
      this.getElement('lat').innerText = this.geolocation.getPosition()[0];
      this.getElement('lon').innerText = this.geolocation.getPosition()[1];
      // console.log( this.geolocation.getPosition());
      // alert('changed');
    });

    this.geolocation.on('error', (error) => {
      const info = document.getElementById('info');
      info.innerHTML = error.message;
      info.style.display = '';
    });

    const accuracyFeature = new OlFeature();
    this.geolocation.on('change:accuracyGeometry', () => {
      accuracyFeature.setGeometry(this.geolocation.getAccuracyGeometry());
    });

    const positionFeature = new OlFeature();
    positionFeature.setStyle(new Style({
      image: new CircleStyle({
        radius: 6,
        fill: new Fill({
          color: '#3399CC'
        }),
        stroke: new Stroke({
          color: '#fff',
          width: 2
        })
      })
    }));

    this.geolocation.on('change:position', () => {
      const coordinates = this.geolocation.getPosition();
      positionFeature.setGeometry(coordinates ?
        new Point(coordinates) : null);
      // alert('pos-change');
    });

    this.layer = new VectorLayer({
      map: this.map,
      source: new VectorSource({
        features: [accuracyFeature, positionFeature]
      })
    });



    this.layer = new OlTileLayer({
      source: new OlOSM()
    });

    // this.view = new OlView({
    //   center: fromLonLat([0, 0]),
    //   zoom: 18
    // });

    // this.map = new OlMap({
    //   target: 'map',
    //   layers: [this.layer],
    //   view: this.view
    // });

    // var coord = [28.232592, -25.755710]; // TUKS IT BUILDING COORDS
    // var coord2 = [28.233443, -25.755809]; // IT BUILDING RIGHT
    // var coord3 = [28.232434, -25.756141]; // CROSS STREET
    // var coord4 = [28.233445, -25.756216]; //

    // var vectorSource = new OlVector();

    // var vector = new OlVectorLayer({ //drawing layer
    //   source: vectorSource
    // }); 

    // this.map.addLayer(vector); //add drawing layer to drop points on
    // this.view.setCenter(fromLonLat(coord));  

    // var point = new OlFeature({
    //   geometry: new Point(transform(coord, 'EPSG:4326', 'EPSG:3857')) //this creates a dot at coordinates given
    // });

    // var point2 = new OlFeature({
    //   geometry: new Point(transform(coord2, 'EPSG:4326', 'EPSG:3857'))
    // });

    // var point3 = new OlFeature({
    //   geometry: new Point(transform(coord3, 'EPSG:4326', 'EPSG:3857'))
    // });

    // var point4 = new OlFeature({
    //   geometry: new Point(transform(coord4, 'EPSG:4326', 'EPSG:3857'))
    // });


    // var pointStyle = new Style({
    //   image: new Icon(({
    //       crossOrigin: 'anonymous',
		  // src: 'assets/color-pins/dot.png',
		  // scale: 0.06
    //   }))
    // });

    // var pointStyleRed = new Style({
    //   image: new Icon(({
    //     crossOrigin: 'anonymous',
    //     src: 'assets/color-pins/dot_red.png',
    //     scale: 0.06
    //   }))
    // });

    // var pointStyleYellow = new Style({
    //   image: new Icon(({
    //     crossOrigin: 'anonymous',
    //     src: 'assets/color-pins/dot_yellow.png',
    //     scale: 0.06
    //   }))
    // });

    // point.setStyle(pointStyle);
    // point2.setStyle(pointStyleRed);
    // point3.setStyle(pointStyleYellow);
    // point4.setStyle(pointStyleYellow);

    // vectorSource.addFeature(point);
    // vectorSource.addFeature(point2);
    // vectorSource.addFeature(point3);
    // vectorSource.addFeature(point4);

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
