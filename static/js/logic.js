// URL for USGS earthquake data for the past week
let usgs = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';

// Array of colors for different depth levels
let depthColor = ['lightgreen', 'green', 'yellow', 'orange', 'red'];

// Depth color levels 
let depthLevel = [15, 30, 45, 60];

// Create a Leaflet map centered at coordinates 
let map = L.map('map', {
    center: [39, 98],
    zoom: 3,
    layers: [
        // Add OpenStreetMap tile layer to the map
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        })
    ]
});


d3.json(usgs).then(function(earthquakeUSGS) {
    // Function to determine the color of the marker based on depth
    function colorEarthquake(depth) {
        if (depth > depthLevel[3]) return 'red';
        if (depth > depthLevel[2]) return 'orange';
        if (depth > depthLevel[1]) return 'yellow';
        if (depth > depthLevel[0]) return 'green';
        return 'lightgreen';
    }


    function styleMarker(feature) {
        return {
            radius: feature.properties.mag * 4, 
            fillColor: colorEarthquake(feature.geometry.coordinates[2]), 
            color: '#000', 
            weight: 1, 
            opacity: 1, 
            fillOpacity: 0.8 
        };
    }

    // timestamp 
    function formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString();
    }

    // popup content
    function contentInfo(feature) {
        const place = feature.properties.place; // Directly use the raw place data
        const time = formatTime(feature.properties.time);
        return `<b>Location:</b> ${place}<br><b>Magnitude:</b> ${feature.properties.mag}<br><b>Depth:</b> ${feature.geometry.coordinates[2]} km<br><b>Time:</b> ${time}`;
    }

    // Add GeoJSON layer 
    L.geoJson(earthquakeUSGS, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, styleMarker(feature));
        },
        onEachFeature: function (feature, layer) {
            layer.bindPopup(contentInfo(feature));
        }
    }).addTo(map);

    // Add a legend to the map
    let legend = L.control({ position: 'bottomright' });

    legend.onAdd = function (map) {
        let div = L.DomUtil.create('div', 'info legend');
        div.style.backgroundColor = 'lightgrey';
        div.style.padding = '10px';
        div.style.borderRadius = '5px';
        div.innerHTML = '<h4>Depth of Earthquakes</h4>';

        // Loop through depth levels to generate a label with a colored square for each interval
        for (let i = 0; i < depthLevel.length; i++) {
            div.innerHTML +=
                '<i style="background:' + colorEarthquake(depthLevel[i] + 1) + '; width: 18px; height: 18px; display: inline-block; margin-right: 5px;"></i> ' +
                depthLevel[i] + (depthLevel[i + 1] ? '&ndash;' + depthLevel[i + 1] + '<br>' : '+');
        }

        return div;
    };

    legend.addTo(map);
});
