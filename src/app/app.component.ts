import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'AngularTRDMap';
  
  public start: string;
  public finish: string;


  public constructor() {
    //naxxum
    this.start = "36.8481502,10.2695116";
    //Home
    this.finish = "36.8650635,10.2";
}

public ngOnInit() { }

}
