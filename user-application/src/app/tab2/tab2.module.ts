import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Tab2Page } from './tab2.page';
import { DroneListComponent } from './drone-list/drone-list.component';
import { DroneSocketService } from '../services/drone-data/drone-socket/drone-socket.service';
import { FlightSessionComponent } from './flight-session/flight-session.component';
import { DroneInfoComponent } from './drone-info/drone-info.component';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      { path: '', component: Tab2Page },
      { path: 'flight-session/:drone', component: FlightSessionComponent },
      { path: 'new-drone', component: DroneInfoComponent },
      { path: 'edit-drone/:drone', component: DroneInfoComponent }
    ])
  ],
  declarations: [Tab2Page, DroneListComponent, FlightSessionComponent, DroneInfoComponent],
  entryComponents: [FlightSessionComponent],
  providers: [DroneSocketService]
})
export class Tab2PageModule {}
