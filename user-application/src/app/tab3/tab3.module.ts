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
import { DetailedSessionViewComponent } from './detailed-session-view/detailed-session-view.component';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    RouterModule.forChild([
      { path: '', component: Tab3Page },
      { path: 'detailed-session/:session', component: DetailedSessionViewComponent },
    ])
  ],
  declarations: [
    Tab3Page,
    ActiveSessionsComponent,
    AllSessionsComponent,
    PreviousSessionsComponent,
    SessionComponent,
    DetailedSessionViewComponent
  ]
})
export class Tab3PageModule {}
