import { Component } from '@angular/core';
import { ServiceService } from './Shared/service.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'AngularTRDMap';
  
 

  public start: string;
  public finish: string;
  public query: string;
  public adresse: string;
  public position: string;
  public locations: Array<any>;
  public lat
  public lng
  public constructor(private service : ServiceService) {
    //naxxum
    this.start = "36.8481502,10.2695116";
    //Home
    this.finish = "36.8650635,10.2";

    this.query = "";


    
    this.position = "37.7397,-121.4252";
  }

    public ngOnInit() { 
      // this.getAddress()
    }

    consumeStart(data){
      this.start = data;
      console.log(this.start)
  }

    public getAddress() {
      if(this.query != "") {
          this.service.getAddress(this.query).then(result => {
            
              this.locations = <Array<any>>result;
              this.locations=this.locations.filter(l=>l.Location.Address.Country=="TUN")
                console.log(this.locations)
            
                this.lat = this.locations[0].Location.DisplayPosition.Latitude
                this.lng = this.locations[0].Location.DisplayPosition.Longitude
                this.start= this.lat+","+this.lng
                console.log(this.start)
          }, error => {
              console.error(error);
          });
      }
  }

  public getAddressFromLatLng() {
    if(this.position != "") {
        this.service.getAddressFromLatLng(this.position).then(result => {
            this.locations = <Array<any>>result;
        }, error => {
            console.error(error);
        });
    }
}

}
