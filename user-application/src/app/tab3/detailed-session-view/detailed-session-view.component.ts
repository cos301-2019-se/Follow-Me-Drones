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
  activeImageIndex = 0;
    images = ['assets/mockshots/predictionGiraffe.jpg',
    'assets/mockshots/predictionLeopard.jpg',
    'assets/mockshots/predictionLion.jpg',
    'assets/mockshots/predictionRhino.jpg'];
  constructor(
    private flightSessionController: FlightSessionController,
    private route: ActivatedRoute
  ) {
    console.log(this.route.snapshot.paramMap.get('session'));
    const vari = this.route.snapshot.paramMap.get('session');
    this.session = this.flightSessionController.getSessionByUUID(vari);
    this.images = this.session.getImages();
  }

  updateIndex(s) {
    this.activeImageIndex = s;
  }
  ngOnInit() {}

}
