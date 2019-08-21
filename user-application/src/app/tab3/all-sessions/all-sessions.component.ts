import { Component, OnInit } from '@angular/core';
import { FlightSessionController } from '../../services/flight-session-controller/flight-session-controller';
import { FlightSession } from '../../services/flight-session/flight-session';


@Component({
  selector: 'app-all-sessions',
  templateUrl: './all-sessions.component.html',
  styleUrls: ['./all-sessions.component.scss'],
})
export class AllSessionsComponent implements OnInit {
  allSessions: FlightSession [] = [];
  constructor( private flightSessions: FlightSessionController) {
    console.log(this.flightSessions);

    this.allSessions = this.flightSessions.getAllSessions();
    console.log(this.allSessions);

    // const mock1 = new FlightSession();
    // mock1.setSessionName('Sunday Morning');
    // mock1.active = true;
    // const mock2 = new FlightSession();
    // mock2.setSessionName('Monday Afternoon');

    // this.allSessions.push( mock1 );
    // this.allSessions.push( mock2 );
  }

  ngOnInit() {}

}
