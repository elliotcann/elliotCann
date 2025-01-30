// ---------------------------------------------------------
// GLOBAL DECLARATIONS
// ---------------------------------------------------------

var map;

// tile layers

var streets = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
    attribution: "Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012"
  }
);

var satellite = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
    attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
  }
);

var basemaps = {
  "Streets": streets,
  "Satellite": satellite
};

// buttons

var infoBtn = L.easyButton('<img src="libs/assets/img/info-lg.svg" class="img-responsive">', function (btn, map) {
  $("#infoModal").modal("show");
});

var weatherBtn = L.easyButton('<img src="libs/assets/img/cloud-sun.svg" class="img-responsive">', function (btn, map) {
  $("#exampleModal").modal("show");
});

// input JSON response from getCountries.php

async function populateDropdown() {
  try {
      // Make an AJAX call to the PHP script
      const response = await fetch('libs/php/getCountries.php');
      if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
      }

      const countries = await response.json();
      const $dropdown = $('#countrySelect');

      // Populate the dropdown
      countries.forEach(country => {
          const $option = $('<option></option>')
              .val(country.iso2)
              .text(`${country.name} (${country.iso2})`);
          $dropdown.append($option);
      });
  } catch (error) {
      console.error('Failed to populate dropdown:', error);
  }
};

// ---------------------------------------------------------
// EVENT HANDLERS
// ---------------------------------------------------------

// initialise and add controls once DOM is ready

$(document).ready(function () {
  
  map = L.map("map", {
    layers: [streets]
  }).setView([54.5, -4], 6);
  
  // setView is not required in your application as you will be
  // deploying map.fitBounds() on the country border polygon

  layerControl = L.control.layers(basemaps).addTo(map);

  infoBtn.addTo(map);

  weatherBtn.addTo(map);

  // Call the populateDropdown function to populate the dropdown
  populateDropdown();

});

