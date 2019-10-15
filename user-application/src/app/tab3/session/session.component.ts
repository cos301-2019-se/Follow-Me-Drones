import { Component, OnInit, Input} from '@angular/core';

@Component({
  selector: 'app-session',
  templateUrl: './session.component.html',
  styleUrls: ['./session.component.scss'],
})
export class SessionComponent implements OnInit {
  @Input() sessionName: string;
  @Input() isActive: boolean;
  @Input() droneName: boolean;
  @Input() coverImage: string;

  constructor() { }

  ngOnInit() {}
  test() {
    alert('delet');
  }

}
