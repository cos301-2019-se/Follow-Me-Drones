import { Component, OnInit } from '@angular/core';
import { FlightSessionController } from '../../services/flight-session-controller/flight-session-controller';
import { FlightSession } from '../../services/flight-session/flight-session';

@Component({
  selector: 'app-active-sessions',
  templateUrl: './active-sessions.component.html',
  styleUrls: ['./active-sessions.component.scss'],
})
export class ActiveSessionsComponent implements OnInit {

  activeSessions: FlightSession [] = [];
  constructor( private flightSessions: FlightSessionController) {
    console.log(this.flightSessions);

    this.activeSessions = this.flightSessions.getAllActiveSessions();
    console.log(this.activeSessions);

    // const mock1 = new FlightSession();
    // mock1.active = true;
    // mock1.setSessionName('Sunday Morning');
    // const mock2 = new FlightSession();
    // mock2.active = true;
    // mock2.setSessionName('Monday Afternoon');

    // this.activeSessions.push( mock1 );
    // this.activeSessions.push( mock2 );
  }
  ngOnInit() {}

}
