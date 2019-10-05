import { Component, OnInit, Input} from '@angular/core';
import { FlightSessionController } from '../../services/flight-session-controller/flight-session-controller';
import { FlightSession } from '../../services/flight-session/flight-session';
import { Router } from '@angular/router';


@Component({
  selector: 'app-all-sessions',
  templateUrl: './all-sessions.component.html',
  styleUrls: ['./all-sessions.component.scss'],
})
export class AllSessionsComponent implements OnInit {
  @Input() allSessions: FlightSession [] = [];
  constructor(
              private flightSessions: FlightSessionController,
              public router: Router
  ) {
    console.log(this.allSessions);
  }
  navigateTo(session) {
    this.router.navigate(['/tabs/tab3/detailed-session', session.getID()]);
  }

  ngOnInit() {}

}
