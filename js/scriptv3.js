 // This script demonstrates some simple things one can do with leaflet.js


var map = L.map('map').setView([40.7080529,-74.0111793], 15);

// set a tile layer to be CartoDB tiles 
var CartoDBTiles = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',{
  attribution: 'Map Data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> Contributors, Map Tiles &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
});

// add these tiles to our map
map.addLayer(CartoDBTiles);
L.Control.geocoder().addTo(map);

// create global variables we can use for layer controls
var plutoGeoJSON;

// use jQuery get geoJSON to grab geoJson layer, parse it, then plot it on the map using the plotDataset function
//Adding pluto data
$.getJSON( "data/PlutoClipLM.json", function( data ) {
    // ensure jQuery has pulled all data out of the geojson file
    var dataset = data;
    // draw the dataset on the map
    plotDataset(dataset);
    //create the sidebar with links to fire polygons on the map
    createListForClick(dataset);
});

//dataset isn't plotting with this code? 
// function to plot the dataset passed to it
function plotDataset(dataset) {
    plutoGeoJSON = L.geoJson(dataset, {
        style: landUseStyle,
        onEachFeature: plutoOnEachFeature
    }).addTo(map);

    // create layer controls
    createLayerControls(); 
}


//function that sets style of the plutoGeoJSON
var landUseStyle = function (feature, latlng) {
    var value = feature.properties.LandUse;
    //not plotting with this code either? 
    /*var fillColor = null;
    //field for land use code was originally a string...not sure if it was brought in as a string or automatically converted to a number
    if(value == "01"){
        fillColor = "#edf8e9";
    }
    if(value == "02"){
        fillColor = "#c7e9c0";
    }
    if(value == "03"){
        fillColor = "#a1d99b";
    }
    if(value == "04"){
        fillColor = "#74c476";
    }
    if(value == "05") { 
        fillColor = "#31a354";

    }*/

    var style = {
        weight: 1,
        opacity: .1,
        color: 'white',
        fillOpacity: 0.75,
       /*fillColor: fillColor*/
        fillColor: fillColorCode(value)
    };

    return style;
}

function codeLandUse(feature) {
    var output = [];
    var residential1= "01";
    var residential2= "02";
    var residential3= "03";
    var mixedrescomm= "04";
    var commoffice= "05";
    return output;    
}

// function that fills polygons with color based on the data
function fillColorCode(d) {
    return d = "01" ? '#006d2c' :
           d = "02" ? '#31a354' :
           d = "03" ? '#74c476' :
           d = "04" ? '#a1d99b' :
           d = "05" ? '#c7e9c0' :
                   '#edf8e9';
}


/*var landUseClick = function (feature, layer) {
     // let's bind some feature properties to a pop up
    layer.bindPopup("<strong>Land Use:</strong> " + feature.properties.LandUse);
}

    plutoGeoJSON = L.geoJson(dataset, {
        style: landUseStyle,
        onEachFeature: landUseClick
    }).addTo(map);

    plutoGeoJSON.addTo(map);

    // create layer controls
    createLayerControls();

});
 
*/

// empty L.popup so we can fire it outside of the map
var popup = new L.Popup();

// set up a counter so we can assign an ID to each layer
var count = 0;

// on each feature function that loops through the dataset, binds popups, and creates a count
var plutoOnEachFeature = function(feature,layer){
    var code = codeLandUse(feature);
    // let's bind some feature properties to a pop up with an .on("hover", ...) command. We do this so we can fire it both on and off the map
    layer.on("hover", function (e) {
        var bounds = layer.getBounds();
        var popupContent = "<strong>Land Use Type:</strong>" + feature.properties.LandUse;
        popup.setLatLng(bounds.getCenter());
        popup.setContent(popupContent);
        map.openPopup(popup);
    });


    // we'll now add an ID to each layer so we can fire the popup outside of the map
    layer._leaflet_id = 'plutoLayerID' + count;
    count++; //adds one to the count
}


function createLayerControls(){
    // add in layer controls
    var baseMaps = {
        "CartoDB Basemap": CartoDBTiles,
    };

    var overlayMaps = {
        "Land Use Type": plutoGeoJSON,
    };

    // add control
    L.control.layers(baseMaps, overlayMaps).addTo(map);
}

// add in a legend to make sense of it all
// create a container for the legend and set the location

var legend = L.control({position: 'bottomleft'});

// using a function, create a div element for the legend and return that div
legend.onAdd = function (map) {

    // a method in Leaflet for creating new divs and setting classes
    var div = L.DomUtil.create('div', 'legend'),
        values = [("01" + "02" + "03"), "04", "05"];

        div.innerHTML += '<p>Land Use Type</p>';

        for (var i = 0; i < values.length; i++) {
            div.innerHTML +=
                '<i style="background:' + fillColorCode(values[i] + 1) + '"></i> ' +
                values[i] + (values[i + 1] + values[i + 1] + '<br /><br />');
        }

    return div;
};

// add the legend to the map
legend.addTo(map);

// function to create a list in the right hand column with links that will launch the pop-ups on the map
function createListForClick(dataset) {
    // use d3 to select the div and then iterate over the dataset appending a list element with a link for clicking and firing
    // first we'll create an unordered list ul elelemnt inside the <div id='list'></div>. The result will be <div id='list'><ul></ul></div>
    var ULs = d3.select("#sidebar")
                .append("ul");

    // now that we have a selection and something appended to the selection, let's create all of the list elements (li) with the dataset we have 
    
   ULs.selectAll("li")
        .data(dataset.features)
        .enter()
        .append("li") // print a list element for each feature
        .html(function(d) { 
            return '<a href="#">' + d.properties.pluto_LandUse + '</a>'; 
        })
        .on('click', function(d, i) {
            console.log(d.properties.pluto_LandUse);
            console.log(i);
            var leafletId = 'plutoLayerID' + i;
            map._layers[leafletId].fire('click');
        });
}


// set a global variable to use in the D3 scale below
// use jQuery geoJSON to grab data from API
$.getJSON( "https://data.cityofnewyork.us/resource/erm2-nwe9.json?$$app_token=rQIMJbYqnCnhVM9XNPHE9tj0g&borough=Manhattan&agency=DOHMH&complaint_type=rodent", function( data ) {
    var dataset = data;
    // draw the dataset on the map
    plotAPIData(dataset);
});

// create a leaflet layer group to add your API dots to so we can add these to the map
var apiLayerGroup = L.layerGroup();

// since these data are not geoJson, we have to build our dots from the data by hand
function plotAPIData(dataset) {
    // set up D3 ordinal scle for coloring the dots just once
    var ordinalScale = setUpD3Scale(dataset);
    //console.log(ordinalScale("Noise, Barking Dog (NR5)"));


    // loop through each object in the dataset and create a circle marker for each one using a jQuery for each loop
    $.each(dataset, function( index, value ) {

        // check to see if lat or lon is undefined or null
        if ((typeof value.latitude !== "undefined" || typeof value.longitude !== "undefined") || (value.latitude && value.longitude)) {
            // create a leaflet lat lon object to use in L.circleMarker
            var latlng = L.latLng(value.latitude, value.longitude);
     
            var apiMarker = L.circleMarker(latlng, {
                stroke: false,
                fillColor: ordinalScale(value.descriptor),
                fillOpacity: 1,
                radius: 5
            });

            // bind a simple popup so we know what the noise complaint is
            apiMarker.bindPopup(value.descriptor);

            // add dots to the layer group
            apiLayerGroup.addLayer(apiMarker);
        }

    });

    apiLayerGroup.addTo(map);
}

function setUpD3Scale(dataset) {
    //console.log(dataset);
    // create unique list of descriptors
    // first we need to create an array of descriptors
    var descriptors = [];

    // loop through descriptors and add to descriptor array
    $.each(dataset, function( index, value ) {
        descriptors.push(value.descriptor);
    });

    // use underscore to create a unique array
    var descriptorsUnique = _.uniq(descriptors);

    // create a D3 ordinal scale based on that unique array as a domain
    var ordinalScale = d3.scale.category20()
        .domain(descriptorsUnique);

    return ordinalScale;
}


/*
//Bind popups for clicking on a landuse polygon

    var landUseClick = function (feature, layer) {
        var landUseCode = feature.properties.LandUse;
        // let's bind some feature properties to a pop up
        layer.bindPopup("<strong>Land Use Type:</strong> " + feature.properties.LandUse);
    }

    plutoGeoJSON = L.geoJson(pluto, {
        style: landUseStyle,
        onEachFeature: landUseClick
    }).addTo(map);

    plutoGeoJSON.addTo(map);

    // create layer controls
    createLayerControls();

});

//Another Style Attempt to show differnt land use numbers as differnt colors

var landUseStyle = {
        "type": "FeatureCollection", 
        "features": [{
            "type": "Feature", 
            "properties": {
                "LandUse": "01"
            },
            "geometry": {
                "type": "Polygon"
            }
    }, {
        "type": "FeatureCollection", 
        "features": [{
            "type": "Feature", 
            "properties": {
                "LandUse": "04"
            },
            "geometry": {
                "type": "Polygon"
            }
    },

    L.geoJson(landUseStyle, {
        style: function(feature) {
            if (feature.properties.LandUse === "01") {
               return {
                color: "#009b2e",
                weight: 2
               };
            }
            if (feature.properties.LandUse === "04") {
               return {
                color: "#ce06cb",
                weight: 2
               };
            }
        }
*/


