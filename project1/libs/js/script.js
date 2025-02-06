// ---------------------------------------------------------
// GLOBAL DECLARATIONS
// ---------------------------------------------------------

let map;
let currentBorderLayer;
let lat, lng;

// ---------------------------------------------------------
// TILE LAYERS
// ---------------------------------------------------------

const streets = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
  attribution: "Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012"
});

const satellite = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
  attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
});

const basemaps = {
  "Streets": streets,
  "Satellite": satellite
};

// ---------------------------------------------------------
// BUTTONS
// ---------------------------------------------------------

const infoBtn = L.easyButton('<img src="libs/assets/img/info-lg.svg" class="img-responsive">', function (btn, map) {
  $('#infoModal').modal('show');
});

const weatherBtn = L.easyButton('<img src="libs/assets/img/cloud-sun.svg" class="img-responsive">', function (btn, map) {
  $("#weatherModal").modal("show");
});

// ---------------------------------------------------------
// LOADING INDICATOR FUNCTIONS
// ---------------------------------------------------------

function showLoadingIndicator() {
  console.log('Showing loading indicator...');
  $('#loadingIndicator').show();
  $('#map').hide();
  $('#selectContainer').hide();
}

function hideLoadingIndicator() {
  console.log('Hiding loading indicator...');
  $('#loadingIndicator').hide();
  $('#map').show();
  $('#selectContainer').show();
  map.invalidateSize(); // Ensure the map is displayed correctly
}

// ---------------------------------------------------------
// GEOLOCATION FUNCTIONS
// ---------------------------------------------------------

function getUserLocation() {
  console.log('Attempting to get user location...');
  showLoadingIndicator();
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      lat = position.coords.latitude;
      lng = position.coords.longitude;
      console.log(`Latitude: ${lat}, Longitude: ${lng}`);
      autoSelectUserCountry(); // Call the function to select the user's country
    }, function (error) {
      console.error('Geolocation error:', error);
      hideLoadingIndicator();
    });
  } else {
    console.error('Geolocation is not supported by this browser.');
    hideLoadingIndicator();
  }
}

function autoSelectUserCountry() {
  if (lat !== undefined && lng !== undefined) {
    console.log(`Requesting country code for Latitude: ${lat}, Longitude: ${lng}`);

    // Use the PHP routine to get the country code from the coordinates
    $.ajax({
      url: 'libs/php/getCountryFromCoords.php',
      method: 'GET',
      dataType: 'json',
      data: {
        lat: lat,
        lng: lng
      },
      // On success, set the dropdown value to the country code
      success: function (data) {
        const countryCode = data.countryCode;
        if (countryCode) {
          console.log(`Country code received: ${countryCode}`);
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
  } else {
    console.error('Latitude and longitude are not defined.');
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
      console.error('Response text:', jqXHR.responseText);
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

// Create a marker cluster group
const markers = L.markerClusterGroup();

// Define the custom icon
const customIcon = L.icon({
  iconUrl: 'libs/assets/img/bigcity.png', // Path to the marker image
  shadowUrl: 'libs/assets/img/marker-shadow.png', // Path to the shadow image
  iconSize: [25, 30], // Size of the icon
  shadowSize: [41, 41], // Size of the shadow
  iconAnchor: [12, 30], // Point of the icon which will correspond to marker's location
  shadowAnchor: [12, 41], // Point of the shadow which will correspond to marker's location
  popupAnchor: [1, -24] // Point from which the popup should open relative to the iconAnchor
});

// Function to add city markers to the cluster group
function addCityMarkers(cities) {
  console.log('Adding city markers:', cities); // Log the cities data
  cities.forEach(function(city) {
    const marker = L.marker([city.lat, city.lng], { icon: customIcon });
    marker.bindPopup(`<div style="text-align: center;"><b>${city.name}</b><br>Population: ${city.population}</div>`);
    markers.addLayer(marker);
  });
}

// Function to get cities for the selected country
function getCities(countryCode) {
  // Clear existing markers
  markers.clearLayers();

  $.ajax({
    url: 'libs/php/getCities.php',
    type: 'GET',
    data: { country: countryCode },
    success: function(response) {
      console.log('API response:', response); // Log the API response
      const data = JSON.parse(response);
      if (data.geonames) {
        const cities = data.geonames.map(function(city) {
          return {
            name: city.name,
            lat: city.lat,
            lng: city.lng,
            population: city.population // Ensure population is included
          };
        });
        addCityMarkers(cities);
        markers.addTo(map);
      } else {
        console.error('No cities found for the selected country');
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.error('Failed to get cities:', textStatus, errorThrown);
    }
  });
}

// Function to fetch and display country details
function fetchAndDisplayCountryDetails(countryCode, callback) {
  if (countryCode) {
    $.ajax({
      url: 'libs/php/getCountryDetails.php',
      method: 'GET',
      dataType: 'json',
      data: {
        countryCode: countryCode
      },
      success: function(data) {
        if (data.error) {
          console.error(data.error);
        } else {
          console.log('Country details:', data);
          // Update the UI with the country details
          $('#countryName').text(data.countryName);
          $('#countryFlag').attr('src', data.flag);
          $('#countryCode').text(data.countryCode);
          $('#countryRegion').text(data.region);
          $('#countryCapital').text(data.capitalCity);
          $('#countryPopulation').text(data.population);
          $('#countryArea').text(data.area);
          $('#countryLanguages').text(data.nativeLanguages);
          $('#countryCurrency').text(data.currency);
          $('#countryCallingCode').text(data.callingCode);
          $('#countryTimeZone').text(data.timeZone);
          if (callback) {
            callback(data);
          }
        }
      },
      error: function(jqXHR, textStatus, errorThrown) {
        console.error('Failed to get country details:', textStatus, errorThrown);
      }
    });
  }
}

// Function to update the modal with country details
const updateInfoModal = countryCode => {
  fetchAndDisplayCountryDetails(countryCode, data => {
    $('#countryDetails').text(JSON.stringify(data, null, 2)); // Display JSON data
    $('#infoModal').modal('show'); // Show the modal
  });
}

// ---------------------------------------------------------
// EVENT HANDLERS
// ---------------------------------------------------------

// initialise and add controls once DOM is ready
$(document).ready(function () {
  console.log('Document is ready.');

  map = L.map("map", {
    layers: [streets]
  });

  L.control.layers(basemaps).addTo(map);

  // Add the buttons to the map
  infoBtn.addTo(map);
  weatherBtn.addTo(map);

  // Add the marker cluster group to the map
  markers.addTo(map);

  // Call the populateDropdown function to populate the dropdown
  populateDropdown();

  // Get the user's location and auto-select the user's country based on their location
  getUserLocation();

  // Event listener for dropdown change
  $('#countrySelect').on('change', function () {
    const countryCode = $(this).val();
    if (countryCode) {
      getCountryBorder(countryCode);
      getCities(countryCode); // Get cities for the selected country
      fetchAndDisplayCountryDetails(countryCode, function() {
      }); // Fetch and display country details
    }
  });
});
