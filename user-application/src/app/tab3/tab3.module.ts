import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tab3Page } from './tab3.page';
import { ActiveSessionsComponent } from './active-sessions/active-sessions.component';
import {AllSessionsComponent } from './all-sessions/all-sessions.component';
import { PreviousSessionsComponent } from './previous-sessions/previous-sessions.component';
import { SessionComponent } from './session/session.component';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    RouterModule.forChild([{ path: '', component: Tab3Page }])
  ],
  declarations: [Tab3Page, ActiveSessionsComponent, AllSessionsComponent, PreviousSessionsComponent, SessionComponent]
})
export class Tab3PageModule {}
