import { Component, HostListener } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  interval: any;
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private geolocation: Geolocation
  ) {
    this.initializeApp();
    // this.initializeGeolocation();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }
  initializeGeolocation() {
    console.log('sarie');
    this.interval = setInterval( () => {
      this.geolocation.getCurrentPosition().then((resp) => {
        // alert(`currentLocation!\n lat: ${resp.coords.latitude} \n lon: ${resp.coords.longitude}`);
        console.log(`currentLocation!\n lat: ${resp.coords.latitude} \n lon: ${resp.coords.longitude}`);
      }).catch((error) => {
        console.log('Error getting location', error);
      });
    }, 5000);
  }

}
