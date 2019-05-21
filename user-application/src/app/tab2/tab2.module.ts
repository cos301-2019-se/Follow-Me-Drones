import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tab2Page } from './tab2.page';
import { DroneListComponent } from './drone-list/drone-list.component';
import { AddNewDronePage } from './add-new-drone/add-new-drone.page';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    RouterModule.forChild([{ path: '', component: Tab2Page }])
  ],
  declarations: [Tab2Page, DroneListComponent, AddNewDronePage],
  entryComponents: [AddNewDronePage]
})
export class Tab2PageModule {}
