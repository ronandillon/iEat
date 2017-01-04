/**
 * Created by ronan on 28/04/2016.
 */
lat="";
lng="";
container="";
function setMap() {

    map = L.map('map').setView([53.3385578, -6.2687], 12);
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18
    }).addTo(map);

    map.locate({setView: true, maxZoom: 16, watch:true, enableHighAccuracy:true});

    function onLocationFound(e) {
        var radius = e.accuracy / 2;

        L.marker(e.latlng).addTo(map)
            .bindPopup("You are within " + radius + " meters from this point").openPopup();
        lat= e.latlng.lat;
        lng= e.latlng.lng;
        L.circle(e.latlng, radius).addTo(map);
    }

    map.on('locationfound', onLocationFound);

    function onLocationError(e) {
        alert(e.message);
    }

    map.on('locationerror', onLocationError);


    var lc = L.control.locate({
        position: 'topright',
        strings: {
            title: "Take Me To My Location"
        }

    }).addTo(map);
    var url="http://mf2.dit.ie:8080/geoserver/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=dit:dublin_food&outputFormat=json&srsName=epsg:4326";
    var markers = L.markerClusterGroup();
    var popup= L.popup();
    var geoJsonLayer = L.geoJson.ajax(url,
		{
			onEachFeature: function(feature) {
				var out = [];
                //alert("help");
				for(key in feature.properties){
					out.push(key+": "+feature.properties[key]);
				}
				if (feature.properties.category=="fast_food"){
					myIcon = L.icon({
							iconUrl: "img/noun_67167_cc.svg",
							iconSize: [60, 80],
							className: "myIcon",
                            color:"blue"
						})

                }
                else if (feature.properties.category == "cafe"){
                        myIcon = L.icon({
							iconUrl: "img/noun_67170_cc.svg",
							iconSize: [60, 80],
							className: "myIcon",
                            color:"red"
						})

                }
                else if (feature.properties.category == "restaurant"){
                        myIcon = L.icon({
							iconUrl: "img/noun_67169_cc.svg",
							iconSize: [60, 80],
							className: "myIcon",
                            color:"yellow"
						})

                }
                else {
					myIcon = new L.Icon.Default;
				}
				var marker = L.marker(
					L.latLng(feature.geometry.coordinates[1], feature.geometry.coordinates[0]),
					{
						icon: myIcon
					}

				);

                var message='<table border="0" style="border-collapse:collapse;" cellpadding="2"> <tr> <td>' + feature.properties.name +
                    '</td></tr><tr><td><button onclick="test('+feature.geometry.coordinates[1]+','+feature.geometry.coordinates[0]+')">Get Directions</button></td></tr></table>';




                marker.bindPopup(message);
                markers.addLayer(marker);
                markers.addTo(map);

			}

		}


	);

    var MyControl = L.Control.extend({
    options: {
        position: 'bottomright'
    },

    onAdd: function (map) {
        // create the control container with a particular class name
        container = L.DomUtil.create('i', 'fa fa-chevron-circle-up fa-5x pull-right');

        // ... initialize other DOM elements, add listeners, etc.

        return container;
        }
    });

    map.addControl(new MyControl());


}

function test(foodlat,foodlng){

    var R = 6371000; // metres
    var lat1 = foodlat * (Math.PI / 180);
    var lat2 = lat * (Math.PI / 180);
    var lon1 = foodlng * (Math.PI / 180);
    var lon2 = lng * (Math.PI / 180);
    var deltaLat = (lat - foodlat) * (Math.PI / 180);
    var deltaLon = (lng - foodlng) * (Math.PI / 180);

    var a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        Math.cos(lat1) * Math.cos(lat2) *
        Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var dist=R*c;

    //alert(dist);

    var y = Math.sin(lon2 - lon1) * Math.cos(lat2);
    var x = Math.cos(lat1) * Math.sin(lat2) -
        Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);

    //var brng = Math.atan2(y, x).toDegrees();
    degrees= (Math.atan2(y, x)) * (180 / Math.PI);


    degrees=180+degrees;

    degrees=Math.round( degrees);

    container.style.webkitTransform = 'rotate('+degrees+'deg)';
    container.style.mozTransform    = 'rotate('+degrees+'deg)';
    container.style.msTransform     = 'rotate('+degrees+'deg)';
    container.style.oTransform      = 'rotate('+degrees+'deg)';
    container.style.transform       = 'rotate('+degrees+'deg)';

}

