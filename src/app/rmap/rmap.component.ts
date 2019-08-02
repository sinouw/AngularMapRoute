import { Component, OnInit, OnChanges, SimpleChanges, ViewChild, ElementRef, Input, EventEmitter, Output } from '@angular/core';
import { ServiceService } from '../Shared/service.service';
import { ToastrService } from 'ngx-toastr';

declare var H: any;


@Component({
    selector: 'rmap',
    templateUrl: './rmap.component.html',
    styles: []
})
export class RmapComponent implements OnInit, OnChanges {
   
    
    private ui: any;
    private search: any;


    @ViewChild("map",{static:false})
    public mapElement: ElementRef;

    @Input()
    public appId: any;

    @Input()
    public appCode: any;

    @Input()
    public start: any;

    @Input()
    public finish: any;

    @Input()
    public width: any;

    @Input()
    public height: any;

    @Output() sendData : EventEmitter <string> = new EventEmitter<string>();

    public directions: any;
    public distance : any ;
    public duration : any ;
    public choosing : boolean =false ;
    private platform: any;
    private map: any;
    private router: any;
    public choice: any = "pedestrian";
    unit : string = "Metre"
    tunit : string 
    public constructor(private service : ServiceService,private toastr: ToastrService) { }
  //the ngOnInit lifecycle hook
    public ngOnInit() {

        this.userGeolocation()
      //we initialize our platform with the app id and app code for our project
        this.platform = new H.service.Platform({
            // "app_id": this.appId,
            // "app_code": this.appCode
            "app_id": this.appId,
            "app_code": this.appCode
        });
        //Direction List
        this.directions = [];
        this.distance = 0
        this.duration = 0
        //initializing the router
        this.router = this.platform.getRoutingService();
    }
  
    //the map is a UI component, we cannot begin working with it until the ngAfterViewInit method has triggered
    public ngAfterViewInit() {
        let defaultLayers = this.platform.createDefaultLayers();
        this.map = new H.Map(
            this.mapElement.nativeElement,
            defaultLayers.normal.map,
            {
                zoom: 7,
                // center: { lat: 36.847835499999995, lng: 10.267448199999999 }
                center: new H.geo.Point(  34.247835499999995, 10.267448199999999 )

            }
        );
        //call the route method
        // this.route(this.start, this.finish);
        //map Events 
        let behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(this.map));
        

         // Add event listener:
         this.map.addEventListener('tap',evt=> {
            // this.map.removeObjects(this.map.getObjects());
        if(this.choosing){
            var coord = this.map.screenToGeo(evt.currentPointer.viewportX,evt.currentPointer.viewportY);
            
            this.start=coord.lat+","+coord.lng
        
             this.sendData.emit(this.start)

            this.setPosition()
            this.toastr.success('Location Successfully Setted!', 'Setting Position',{ timeOut: 1500 });
        }
            });
    }
   
    //We’ll be using the ngOnChanges hook for when component attribute values change in realtime
    public ngOnChanges(changes: SimpleChanges) {
      //So if the start or finish coordinates change, this method will execute
      if((changes["start"] && !changes["start"].isFirstChange()) || (changes["finish"] && !changes["finish"].isFirstChange())) {
        this.route(this.start, this.finish);
    }
    
     }

     setPosition(){
         this.choosing = !this.choosing
         if(this.choosing)
         this.toastr.info( 'Click On The Map!','Setting Position',{ timeOut: 1500 });
     }


    public route(start: any, finish: any) {
   
        let   params = {
            "mode": "fastest;"+this.choice+";",
            "waypoint0": "geo!" + this.start,
            "waypoint1": "geo!" + this.finish,
            "representation": "display",
           }
      this.map.removeObjects(this.map.getObjects());
      this.router.calculateRoute(params, data => {
          if(data.response) {
              this.directions = data.response.route[0].leg[0].maneuver;
              //Distance
              this.distance=0
              data.response.route[0].leg[0].maneuver.forEach(element => {
                  this.distance+= parseInt(element.length)
              });
              if (this.distance>1000) {
                  this.distance/=1000
                  this.distance=Math.round((this.distance)*100)/100
                  this.unit = "Km"
              }
              else{
                  this.unit="Metre"
              }

              //Duration
              this.duration=0
              data.response.route[0].leg[0].maneuver.forEach(element => {
                this.duration+=parseInt(element.travelTime)
              });

              if (this.duration<60) {
                this.tunit = "Sec"
                console.log(this.tunit)
            }
            else if (this.duration>60 && this.duration<3600){
                this.duration=Math.round(this.duration/60)
                this.tunit="Min"
                console.log(this.tunit)
            }else{
                this.duration=Math.round((this.duration/3600)*100)/100
                this.tunit="Hour"
                console.log(this.tunit)

            }
            
              data = data.response.route[0];

              let lineString = new H.geo.LineString();
              data.shape.forEach(point => {
                  let parts = point.split(",");
                  lineString.pushLatLngAlt(parts[0], parts[1]);
              });
              let routeLine = new H.map.Polyline(lineString, {
                  style: { strokeColor: "blue", lineWidth: 4 }, 
              });
              let startMarker = new H.map.Marker({
                  lat: this.start.split(",")[0],
                  lng: this.start.split(",")[1]
              });
              let finishMarker = new H.map.Marker({
                  lat: this.finish.split(",")[0],
                  lng: this.finish.split(",")[1]
              });
               this.map.addObjects([routeLine, startMarker, finishMarker]);
            //    this.map.addObjects([startMarker]);
              this.map.setViewBounds(routeLine.getBounds());
          }
      }, error => {
          console.error(error);
      });
  }
  
  modeType(mode){
    if (mode == "Walk"){
        this.choice="pedestrian";
        this.toastr.success('Walk Mode Successfully Setted!', 'Setting Mode',{ timeOut: 1500 });
    }     
    else if(mode == "Car"){
        this.choice="car"
        this.toastr.success('Car Mode Successfully Setted!', 'Setting Mode',{ timeOut: 1500 });
    }
    else{
        this.choice="bicycle"
        this.toastr.success('Bicycle Mode Successfully Setted!', 'Setting Mode',{ timeOut: 1500 });
    }
    this.route(this.start, this.finish);
  }

  userGeolocation(){
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            this.start=position.coords.latitude+","+position.coords.longitude
            this.route(this.start, this.finish);

        });
    } else {
        this.start = "36.8481502,10.2695116";
        this.route(this.start, this.finish);
        console.error("Geolocation is not supported by this browser!");
    }
  }

}