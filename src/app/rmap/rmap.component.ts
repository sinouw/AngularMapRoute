import { Component, OnInit, OnChanges, SimpleChanges, ViewChild, ElementRef, Input } from '@angular/core';

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

    public directions: any;

    private platform: any;
    private map: any;
    private router: any;

    public constructor() { }
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
                zoom: 4,
                center: { lat: 36.847835499999995, lng: 10.267448199999999 }
            }
        );
        //call the route method
        this.route(this.start, this.finish);

    }
    //We’ll be using the ngOnChanges hook for when component attribute values change in realtime
    public ngOnChanges(changes: SimpleChanges) {
      //So if the start or finish coordinates change, this method will execute
      if((changes["start"] && !changes["start"].isFirstChange()) || (changes["finish"] && !changes["finish"].isFirstChange())) {
        this.route(this.start, this.finish);
    }
     }


    public route(start: any, finish: any) {
      let params = {
          "mode": "fastest;car",
          "waypoint0": "geo!" + this.start,
          "waypoint1": "geo!" + this.finish,
          "representation": "display"
      }
      this.map.removeObjects(this.map.getObjects());
      this.router.calculateRoute(params, data => {
          if(data.response) {
              this.directions = data.response.route[0].leg[0].maneuver;
              data = data.response.route[0];
              let lineString = new H.geo.LineString();
              data.shape.forEach(point => {
                  let parts = point.split(",");
                  lineString.pushLatLngAlt(parts[0], parts[1]);
              });
              let routeLine = new H.map.Polyline(lineString, {
                  style: { strokeColor: "blue", lineWidth: 5 }
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


}