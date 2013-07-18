var map = new L.Map('map').setView([0, 0], 2).locate({setView: true, maxZoom: 16});

L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

/*
new L.Control.GeoSearch({
    provider: new L.GeoSearch.Provider.Google()
}).addTo(map);
*/

// Here's the Tabletop feed
// First we'll initialize Tabletop with our spreadsheet
var jqueryNoConflict = jQuery;
jqueryNoConflict(document).ready(function(){
	initializeTabletopObject('0Agcr__L1I1PDdEpoMnhxR0RHdkFsWlFtNTlEZlltR0E');
});

// Pull data from Google spreadsheet
// And push to our startUpLeaflet function
function initializeTabletopObject(dataSpreadsheet){
	Tabletop.init({
    	key: dataSpreadsheet,
    	callback: startUpLeafet,
    	debug: false
    });
}

// This function gets our data from our spreadsheet
// Then gets it ready for Leaflet.
// It creates the marker, sets location
// And plots on it on our map
function startUpLeafet(spreadsheetData) {
    var template = Handlebars.compile($("#handlebars_template").html());

    var icons = {};
    for( var i=0; i < spreadsheetData.Markers.elements.length; ++i ) {
        var row = spreadsheetData.Markers.elements[i];
        icons[row.type] = L.icon({ 
            iconUrl: row.iconurl,
            iconSize: [parseInt(row.iconwidth), parseInt(row.iconheight)],
            iconAnchor: [parseInt(row.iconanchorx), parseInt(row.iconanchory)],
            popupAnchor: [parseInt(row.popupanchorx), parseInt(row.popupanchory)],
            shadowUrl: row.shadowurl,
            shadowSize: [parseInt(row.shadowwidth), parseInt(row.shadowheight)],
            shadowAnchor: [parseInt(row.shadowanchorx), parseInt(row.shadowanchory)],
        });
    }
    window.layers = {};
    var clusters = L.markerClusterGroup();
    var tabletopData = foo = spreadsheetData.Objects.elements;
	// Tabletop creates arrays out of our data
	// We'll loop through them and create markers for each
	for (var num = 0; num < tabletopData.length; num ++) {
		// Pull in our lat, long information
		var dataLat = tabletopData[num].latitude;
		var dataLong = tabletopData[num].longitude;
		// Add to our marker
		marker_location = new L.LatLng(dataLat, dataLong);
		// Create the marker
            if( icons[tabletopData[num].type] ) {
    	        var layer = new L.Marker(marker_location, {"icon": icons[tabletopData[num].type]});
            } else {
                var layer = new L.Marker(marker_location);
            }
    
    	    // Create the popup by rendering handlebars template
    	    var popup = template(tabletopData[num]);
    	    // Add to our marker
	    layer.bindPopup(popup);
	
            var layerGroup = layers[tabletopData[num].type];
            if( typeof(layerGroup) === "undefined" ) {
                layers[tabletopData[num].type] = layerGroup = L.layerGroup();
            }
                                    
	    // Add marker to our to map
	    layerGroup.addLayer(layer);
	}

    var uiLayers = {};
    $.each(layers, function(i, n) {
//        n.addTo(map);
        clusters.addLayers(n.getLayers());
        uiLayers[i] = L.layerGroup().addTo(map);
    });
    clusters.addTo(map);
    L.control.layers(null, uiLayers).addTo(map);
    // https://github.com/Leaflet/Leaflet.markercluster/issues/145#issuecomment-19439160
    map.on("overlayadd", function(e) {
        clusters.addLayers(layers[e.name].getLayers());
    }).on("overlayremove", function(e) {
        clusters.removeLayers(layers[e.name].getLayers());
    });

};



// Toggle for 'About this map' and X buttons
// Only visible on mobile
isVisibleDescription = false;
// Grab header, then content of sidebar
sidebarHeader = $('.sidebar_header').html();
sidebarContent = $('.sidebar_content').html();
// Then grab credit information
creditsContent = $('.leaflet-control-attribution').html();
$('.toggle_description').click(function() {
	if (isVisibleDescription === false) {
		$('.description_box_cover').show();
		// Add Sidebar header into our description box
		// And 'Scroll to read more...' text on wide mobile screen
		$('.description_box_header').html(sidebarHeader + '<div id="scroll_more"><strong>Scroll to read more...</strong></div>');
		// Add the rest of our sidebar content, credit information
		$('.description_box_text').html(sidebarContent + '<br />');
		$('#caption_box').html('Credits: ' + creditsContent);
		$('.description_box').show();
		isVisibleDescription = true;
	} else {
		$('.description_box').hide();
		$('.description_box_cover').hide();
		isVisibleDescription = false;
	}
});
