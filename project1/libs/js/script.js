// ---------------------------------------------------------
// GLOBAL DECLARATIONS
// ---------------------------------------------------------

let map;

// tile layers

const streets = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
    attribution: "Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012"
  }
);

const satellite = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
    attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
  }
);

const basemaps = {
  "Streets": streets,
  "Satellite": satellite
};

// buttons

const infoBtn = L.easyButton('<img src="libs/assets/img/info-lg.svg" class="img-responsive">', function (btn, map) {
  $("#infoModal").modal("show");
});

const weatherBtn = L.easyButton('<img src="libs/assets/img/cloud-sun.svg" class="img-responsive">', function (btn, map) {
  $("#exampleModal").modal("show");
});

// input JSON response from getCountries.php
function populateDropdown() {
  $.ajax({
    url: 'libs/php/getCountries.php',
    method: 'GET',
    dataType: 'json',
    success: function (countries) {
      const $dropdown = $('#countrySelect');

      // Sort countries alphabetically by name
      countries.sort((a, b) => a.name.localeCompare(b.name));

      // Populate the dropdown
      countries.forEach(country => {
        const $option = $('<option></option>')
          .val(country.iso2)
          .text(`${country.name} (${country.iso2})`);
        $dropdown.append($option);
      });
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.error('Failed to populate dropdown:', textStatus, errorThrown);
    }
  });
};

// inputv JSON response from getCountryBorder.php
function getCountryBorder(iso2) {
  $.ajax({
    url: 'libs/php/getCountryBorder.php',
    method: 'GET',
    data: {
      iso2: iso2
    },
    dataType: 'json',
    success: function (data) {
      // Convert the GeoJSON data to a Leaflet layer
      const countryBorder = L.geoJSON(data, {
        style: {
          color: 'red',
          weight: 2
        }
      });

      // Fit the map to the country border
      map.fitBounds(countryBorder.getBounds());
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.error('Failed to get country border:', textStatus, errorThrown);
    }
  });
}

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
