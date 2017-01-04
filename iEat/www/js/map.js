/**
 * Created by ronan on 28/04/2016.
 */
var box = L.control({
        position: 'bottomleft'
    });
var lat="";
var lng="";
var container="";

function setMap() {

    map = L.map('map').setView([53.3385578, -6.2687], 12);
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18
    }).addTo(map);

    map.locate({setView: true, maxZoom: 16, watch:true, enableHighAccuracy:true});
    //finds the users location
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


    //Creates the locate button in the top right of the map
    var lc = L.control.locate({
        position: 'topright',
        strings: {
            title: "Take Me To My Location"
        }

    }).addTo(map);
    var url="http://mf2.dit.ie:8080/geoserver/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=dit:dublin_food&outputFormat=json&srsName=epsg:4326";
    var markers = L.markerClusterGroup();
    var popup= L.popup();


    var i = 0;
    var geoJsonLayer = L.geoJson.ajax(url,
		{

			onEachFeature: function(feature) {
				var out = [];

				for(key in feature.properties){
					out.push(key+": "+feature.properties[key]);
				}

                //Chooses the markers used for each location type
				if (feature.properties.category=="fast_food"){
					myIcon = L.icon({
							iconUrl: "img/noun_67167_cc.svg",
							iconSize: [120, 100],
							className: "myIcon",
                            color:"blue"
						})

                }
                else if (feature.properties.category == "cafe"){
                        myIcon = L.icon({
							iconUrl: "img/noun_67170_cc.svg",
							iconSize: [120, 100],
							className: "myIcon",
                            color:"red"
						})

                }
                else if (feature.properties.category == "restaurant"){
                        myIcon = L.icon({
							iconUrl: "img/noun_67169_cc.svg",
							iconSize: [120, 100],
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
                stuff=JSON.stringify(feature);

                //Creates the pop up message for each marker on the map including details about the locations
                var message='<table border="0" style="border-collapse:collapse;" cellpadding="2"> <tr> <td id="name'+i+'">' + feature.properties.name +'</td></tr>'+
                        '<tr> <td id="cuisine'+i+'">Cuisine:' + feature.properties.cuisine +'</td></tr>'+
                        '<tr> <td id="category'+i+'">Category:' + feature.properties.category +'</td></tr>'+
                        '<tr> <td><a target="_blank" href="http://www.yelp.ie/search?find_desc='+ feature.properties.name +'&find_loc=Dublin">Search Yelp For Reviews</a></td></tr>'+
                    '<tr><td><button class="buttons" onclick="arrow('+i+','+ feature.geometry.coordinates[1]+','+ feature.geometry.coordinates[0]+')">Get Directions</button>'+
                '</td></tr></table>';
                //alert(message);
                i++;

                marker.bindPopup(message);
                markers.addLayer(marker);
                markers.addTo(map);

			}

		}


	);

    //Creates the arrow on the map
    var maparrow = L.Control.extend({
    options: {
        position: 'bottomright'
    },

    onAdd: function (map) {
        // create the control container with a particular class name
        container = L.DomUtil.create('div', 'fa fa-chevron-circle-up fa-5x pull-right');
        return container;
        }
    });

    map.addControl(new maparrow());



    //Creates the box div element
	box.onAdd = function (map) {
	    this._div = L.DomUtil.create('div', 'box');
	    this.update();
	    return this._div;
	};

	//updates the box div to add in the details from the chosen location or a template if there are no chosen elements
	box.update = function () {

	    box._div.innerHTML = (
        '<b id="location">No Location Chosen</b>' +
        '<h4 id="category">Category: Undefined</h4>' +
        '<h4 id="cuisine">Cuisine: Undefined</h4>' +
        '<h4 id="distance">Distance: Undefined</h4>' +
        '<div style="text-align: center;width: 100%;"><button type="button" style="width: 100%" class="btn btn-default btn-xs" onclick="deselect()">Deselect Location</button></div>'
        );
	};

	box.addTo(map);




}



function arrow(id,newlat,newlon){

    var R = 6371000; // metres
    var lat1 = newlat * (Math.PI / 180);
    var lat2 = lat * (Math.PI / 180);
    var lon1 = newlon * (Math.PI / 180);
    var lon2 = lng * (Math.PI / 180);
    var deltaLat = (lat - newlat) * (Math.PI / 180);
    var deltaLon = (lng - newlon) * (Math.PI / 180);

    //Computes the distance between the two points
    var a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        Math.cos(lat1) * Math.cos(lat2) *
        Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var dist=R*c;

    var y = Math.sin(lon2 - lon1) * Math.cos(lat2);
    var x = Math.cos(lat1) * Math.sin(lat2) -
        Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);

    //Returns the degrees between the two locations
    degrees= (Math.atan2(y, x)) * (180 / Math.PI);


    degrees=180+degrees;

    degrees=Math.round( degrees);


    //Rotates the arrow to point towards the chosen location
    container.style.webkitTransform = 'rotate('+degrees+'deg)';
    container.style.mozTransform    = 'rotate('+degrees+'deg)';
    container.style.msTransform     = 'rotate('+degrees+'deg)';
    container.style.oTransform      = 'rotate('+degrees+'deg)';
    container.style.transform       = 'rotate('+degrees+'deg)';

    //alert("You are "+Math.round(dist)+"meters away from this location")
    //box.update(feature);
    $("#location").text( $("#name"+id).text());
    $("#cuisine").text("Cuisine: "+$("#cuisine"+id).text());
    $("#category").text("Category: "+$("#category"+id).text());
    $("#distance").text("Distance: "+Math.round(dist));

}

function deselect(){

    $("#location").text( "No Location Chosen");
    $("#cuisine").text("Cuisine: Undefined");
    $("#category").text("Category: Undefined");
    $("#distance").text("Distance: Undefined");


}