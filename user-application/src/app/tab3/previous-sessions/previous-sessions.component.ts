import { Component, OnInit } from '@angular/core';
import { FlightSessionController } from '../../services/flight-session-controller/flight-session-controller';
import { FlightSession } from '../../services/flight-session/flight-session';

@Component({
  selector: 'app-previous-sessions',
  templateUrl: './previous-sessions.component.html',
  styleUrls: ['./previous-sessions.component.scss'],
})
export class PreviousSessionsComponent implements OnInit {
  previousSessions: FlightSession [] = [];
  constructor( private flightSessions: FlightSessionController) {

    console.log('hierso');
    console.log(this.flightSessions);
    const mock1 = new FlightSession();
    mock1.setSessionName('Sunday Morning');
    const mock2 = new FlightSession();
    mock2.setSessionName('Monday Afternoon');

    this.previousSessions.push( mock1 );
    this.previousSessions.push( mock2 );
  }
  ngOnInit() {}

}
