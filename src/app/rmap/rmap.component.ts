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

    public constructor(private service : ServiceService,private toastr: ToastrService) { }
  //the ngOnInit lifecycle hook
    public ngOnInit() {

    
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
                zoom: 3,
                center:  {lat : this.start.split(",")[0], lng :this.start.split(",")[1]}
                // center: { lat: 36.847835499999995, lng: 10.267448199999999 }
            }
        );
        //call the route method
        this.route(this.start, this.finish);
        //map Events 
        let behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(this.map));
        

         // Add event listener:
         this.map.addEventListener('tap',evt=> {
            // this.map.removeObjects(this.map.getObjects());
        if(this.choosing){
            var coord = this.map.screenToGeo(evt.currentPointer.viewportX,evt.currentPointer.viewportY);
            
            this.start=coord.lat+","+coord.lng
        
             this.sendData.emit(this.start)
            console.log(this.start)
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
              data.response.route[0].leg[0].maneuver.forEach(element => {
                  this.distance+= parseInt(element.length)
              });
              //Duration
              data.response.route[0].leg[0].maneuver.forEach(element => {
                this.duration+= Math.round((parseInt(element.travelTime)/60))
              });
            
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
              this.map.setViewBounds(routeLine.getBounds());
          }
      }, error => {
          console.error(error);
      });
  }
  
  modeType(mode){
    if (mode == "Walk")     
    this.choice="pedestrian"
    else if(mode == "Car")
    this.choice="car"
    else
    this.choice="bicycle"


    this.route(this.start, this.finish);
  }

}