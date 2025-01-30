// ---------------------------------------------------------
// GLOBAL DECLARATIONS
// ---------------------------------------------------------

let map;
let currentBorderLayer;

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

// ---------------------------------------------------------
// NAVIGATIOR FUNCTION & LOADING INDICATOR
// ---------------------------------------------------------

// Function to show the loading indicator
function showLoadingIndicator() {
  $('#loadingIndicator').show();
  $('#map').hide();
  $('#selectContainer').hide();
}

// Function to hide the loading indicator
function hideLoadingIndicator() {
  $('#loadingIndicator').hide();
  $('#map').show();
  $('#selectContainer').show();
  map.invalidateSize(); // Ensure the map is displayed correctly
}

// Function to get the user's current location and highlight the country
function autoSelectUserCountry() {
  if (navigator.geolocation) {
    showLoadingIndicator();

    // Get the user's current position
    navigator.geolocation.getCurrentPosition(function (position) {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      // Use a reverse geocoding service to get the country code from the coordinates
      $.ajax({
        url: 'https://api.bigdatacloud.net/data/reverse-geocode-client',
        dataType: 'json',
        data: {
          latitude: lat,
          longitude: lng,
          localityLanguage: 'en'
        },
        // On success, set the dropdown value to the country code
        success: function (data) {
          const countryCode = data.countryCode;
          if (countryCode) {
            $('#countrySelect').val(countryCode).change();
          }
          hideLoadingIndicator();
        },
        // on error, log the error
        error: function (jqXHR, textStatus, errorThrown) {
          console.error('Failed to get country code:', textStatus, errorThrown);
          hideLoadingIndicator();
        }
      });
    }, function (error) {
      console.error('Geolocation error:', error);
      hideLoadingIndicator();
    });
  } else {
    console.error('Geolocation is not supported by this browser.');
    hideLoadingIndicator();
  }
}

// ---------------------------------------------------------
// AJAX FUNCTIONS
// ---------------------------------------------------------

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
}

// input JSON response from getCountryBorder.php
function getCountryBorder(iso2) {
  if (currentBorderLayer) {
    map.removeLayer(currentBorderLayer);
  }

  $.ajax({
    url: 'libs/php/getCountryBorder.php',
    method: 'GET',
    data: {
      iso2: iso2
    },
    dataType: 'json',
    success: function (data) {
      // Convert the GeoJSON data to a Leaflet layer
      currentBorderLayer = L.geoJSON(data, {
        style: {
          color: 'blue',
          weight: 1,
          opacity: 0.4,
          fillOpacity: 0.1
        }
      }).addTo(map);

      // Fit the map to the country border
      map.fitBounds(currentBorderLayer.getBounds());
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.error('Failed to get country border:', textStatus, errorThrown);
      console.error('Response text:', jqXHR.responseText);
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
  });

  layerControl = L.control.layers(basemaps).addTo(map);

  // Add the buttons to the map
  infoBtn.addTo(map);
  weatherBtn.addTo(map);

  // Call the populateDropdown function to populate the dropdown
  populateDropdown();

  // Auto-select the user's country based on their location
  autoSelectUserCountry();

  // Event listener for dropdown change
  $('#countrySelect').on('change', function () {
      const iso2 = $(this).val();
      getCountryBorder(iso2);
  });

  // Get the user's current location and add a marker
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      const userLat = position.coords.latitude;
      const userLng = position.coords.longitude;

      // Create a marker and add it to the map
      const userMarker = L.marker([userLat, userLng]).addTo(map);

      // Optionally, you can bind a popup to the marker
      userMarker.bindPopup("You are here!").openPopup();

      // Optionally, you can set the view to the user's location
      map.setView([userLat, userLng], 13);
    }, function (error) {
      console.error("Error getting user's location:", error);
    });
  } else {
    console.error("Geolocation is not supported by this browser.");
  }

});
