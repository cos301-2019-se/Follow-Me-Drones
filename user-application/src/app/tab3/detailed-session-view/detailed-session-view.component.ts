import { Component, OnInit } from '@angular/core';
import { FlightSessionController  } from '../../services/flight-session-controller/flight-session-controller';
import { FlightSession } from '../../services/flight-session/flight-session';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-detailed-session-view',
  templateUrl: './detailed-session-view.component.html',
  styleUrls: ['./detailed-session-view.component.scss'],
})
export class DetailedSessionViewComponent implements OnInit {
  session: FlightSession;
  constructor(
    private flightSessionController: FlightSessionController,
    private route: ActivatedRoute
  ) {
    console.log(this.route.snapshot.paramMap.get('session'));
    const vari = this.route.snapshot.paramMap.get('session');
    this.session = this.flightSessionController.getSessionByUUID(vari);
  }

  ngOnInit() {}

}
