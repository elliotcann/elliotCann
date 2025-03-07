// ---------------------------------------------------------
// GLOBAL DECLARATIONS
// ---------------------------------------------------------

let map, currentBorderLayer, lat, lng, centerLat, centerLng, pinMarker;

// Helper function to format numbers with commas
const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// ---------------------------------------------------------
// LOADING INDICATOR FUNCTIONS
// ---------------------------------------------------------

const showLoadingIndicator = () => {
  $('#loadingIndicator').show();
  $('#map, #selectContainer').hide();
};

const hideLoadingIndicator = () => {
  $('#loadingIndicator').hide();
  $('#map, #selectContainer').show();
  map.invalidateSize();
};

// ---------------------------------------------------------
// TILE LAYERS
// ---------------------------------------------------------

const streets = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
  attribution: "Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012"
});

const satellite = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
  attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
});

const markers = L.markerClusterGroup();
const wikipediaMarkers = L.markerClusterGroup();

const basemaps = {
  "Streets": streets,
  "Satellite": satellite
};

const overlays = {
  "Cities": markers,
  "Wikipedia Points": wikipediaMarkers
};

// ---------------------------------------------------------
// BUTTONS
// ---------------------------------------------------------

// Create a button with an icon and a callback function
const createButton = (icon, callback) => L.easyButton(`<img src="${icon}">`, callback);

// Create buttons with icons and event listeners
const infoBtn = createButton('libs/assets/img/info-lg.svg', () => {
  const countryCode = $('#countrySelect').val();
  countryCode ? updateInfoModal(countryCode) : alert("Please select a country first.");
});

const weatherBtn = createButton('libs/assets/img/cloud-sun.svg', () => {
  const countryCode = $('#countrySelect').val();
  if (countryCode) {
    requestWeatherReport(countryCode);
  } else {
    alert("Please select a country first.");
  }
});

// Update the currency button functionality
const currencyBtn = createButton('libs/assets/img/currency-exchange.svg', () => {
  const countryCode = $('#countrySelect').val();
  
  if (!countryCode) {
    alert("Please select a country first.");
    return;
  }
  
  const currentCurrency = $('#countryCurrency').text().split(' ')[0];
  
  $('#currencyNumber').val(1);
  
  $('#currencyModal').modal('show');
  
  if (currentCurrency) {
    setTimeout(() => {
      $('#currencySelect').val(currentCurrency);
      calcResult(); // Calculate result immediately
    }, 200);
  }
});

const zoomInBtn = createButton('libs/assets/img/plus.svg', (btn, map) => map.zoomIn());

const zoomOutBtn = createButton('libs/assets/img/minus.svg', (btn, map) => map.zoomOut());

const wikipediaBtn = createButton('libs/assets/img/wikipedia.svg', () => {
  const countryName = $('#countryName').text();
  countryName ? openWikipediaPage(countryName) : alert("Please select a country first.");
});

const newsBtn = createButton('libs/assets/img/newspaper.svg', () => {
  const countryCode = $('#countrySelect').val();
  countryCode ? fetchNewsArticles(countryCode) : alert("Please select a country first.");
});

const zoomControl = L.easyBar([zoomInBtn, zoomOutBtn], { position: 'topright' });

// ---------------------------------------------------------
// GEOLOCATION FUNCTIONS
// ---------------------------------------------------------

// Function to get the user's location
const getUserLocation = () => {
  console.log('Attempting to get user location...');
  showLoadingIndicator();
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      lat = position.coords.latitude;
      lng = position.coords.longitude;
      console.log(`Latitude: ${lat}, Longitude: ${lng}`);
      autoSelectUserCountry();
    }, error => {
      console.error('Geolocation error:', error);
      hideLoadingIndicator();
    });
  } else {
    console.error('Geolocation is not supported by this browser.');
    hideLoadingIndicator();
  }
};

// Function to auto-select the user's country based on their location
const autoSelectUserCountry = () => {
  if (lat !== undefined && lng !== undefined) {
    console.log(`Requesting country code for Latitude: ${lat}, Longitude: ${lng}`);
    $.ajax({
      url: 'libs/php/getCountryFromCoords.php',
      method: 'GET',
      dataType: 'json',
      data: { lat, lng },
      success: data => {
        const countryCode = data.countryCode;
        if (countryCode) {
          console.log(`Country code received: ${countryCode}`);
          $('#countrySelect').val(countryCode).change();
          fetchAndDisplayCountryDetails(countryCode);
          const countryName = $('#countryName').text();
          fetchWikipediaArticles(countryName);
        }
        hideLoadingIndicator();
      },
      error: (jqXHR, textStatus, errorThrown) => {
        console.error('Failed to get country code:', textStatus, errorThrown);
        hideLoadingIndicator();
      }
    });
  } else {
    console.error('Latitude and longitude are not defined.');
    hideLoadingIndicator();
  }
};

// ---------------------------------------------------------
// COUNTRY DETAILS FUNCTIONS
// ---------------------------------------------------------

// Function to populate the country dropdown
const populateDropdown = () => {
  $.ajax({
    url: 'libs/php/getCountries.php',
    method: 'GET',
    dataType: 'json',
    success: countries => {
      const $dropdown = $('#countrySelect');
      countries.sort((a, b) => a.name.localeCompare(b.name));
      countries.forEach(country => {
        $dropdown.append($('<option></option>').val(country.iso2).text(`${country.name} (${country.iso2})`));
      });
    },
    error: (jqXHR, textStatus, errorThrown) => {
      console.error('Failed to populate dropdown:', textStatus, errorThrown);
      console.error('Response text:', jqXHR.responseText);
    }
  });
};

// Function to get the border of the selected country
const getCountryBorder = iso2 => {
  if (currentBorderLayer) map.removeLayer(currentBorderLayer);
  $.ajax({
    url: 'libs/php/getCountryBorder.php',
    method: 'GET',
    data: { iso2 },
    dataType: 'json',
    success: data => {
      currentBorderLayer = L.geoJSON(data, {
        style: {
          color: 'blue',
          weight: 1,
          opacity: 0.4,
          fillOpacity: 0.1
        }
      }).addTo(map);
      map.fitBounds(currentBorderLayer.getBounds());
    },
    error: (jqXHR, textStatus, errorThrown) => {
      console.error('Failed to get country border:', textStatus, errorThrown);
      console.error('Response text:', jqXHR.responseText);
    }
  });
};

// ---------------------------------------------------------
// MARKER FUNCTIONS
// ---------------------------------------------------------

// Helper function to create custom icons
const createCustomIcon = (iconUrl, shadowUrl, iconSize, shadowSize, iconAnchor, shadowAnchor, popupAnchor) => {
  return L.icon({
    iconUrl: iconUrl,
    shadowUrl: shadowUrl,
    iconSize: iconSize,
    shadowSize: shadowSize,
    iconAnchor: iconAnchor,
    shadowAnchor: shadowAnchor,
    popupAnchor: popupAnchor
  });
};

// Custom icon for city markers
const customIcon = createCustomIcon(
  'libs/assets/img/bigcity.png',
  'libs/assets/img/marker-shadow.png',
  [25, 30],
  [41, 41],
  [12, 30],
  [12, 41],
  [1, -24]
);

// Custom icon for Wikipedia markers
const wikipediaIcon = createCustomIcon(
  'libs/assets/img/wikipedia-icon.png',
  'libs/assets/img/marker-shadow.png',
  [25, 30],
  [41, 41],
  [12, 30],
  [6, 43],
  [1, -24]
);

// Function to add city markers to the map
const addCityMarkers = cities => {
  console.log('Adding city markers:', cities);
  cities.forEach(city => {
    const marker = L.marker([city.lat, city.lng], { icon: customIcon });
    marker.on('mouseover', () => {
      const popupContent = `<div style="text-align: center;"><b>${city.name}</b><br>Population: ${formatNumber(city.population)}</div>`;
      marker.bindPopup(popupContent).openPopup();
    });
    marker.on('mouseout', () => {
      setTimeout(() => {
        if (!$('.leaflet-popup:hover').length) marker.closePopup();
      }, 100);
    });
    markers.addLayer(marker);
  });
};

// Function to get cities for the selected country
const getCities = countryCode => {
  markers.clearLayers();
  $.ajax({
    url: 'libs/php/getCities.php',
    type: 'GET',
    data: { country: countryCode },
    success: response => {
      console.log('API response:', response);
      const data = JSON.parse(response);
      if (data.geonames) {
        const cities = data.geonames.map(city => ({
          name: city.name,
          lat: city.lat,
          lng: city.lng,
          population: city.population
        }));
        addCityMarkers(cities);
        markers.addTo(map);
      } else {
        console.error('No cities found for the selected country');
      }
    },
    error: (jqXHR, textStatus, errorThrown) => {
      console.error('Failed to get cities:', textStatus, errorThrown);
    }
  });
};

// ---------------------------------------------------------
// COUNTRY DETAILS FUNCTIONS
// ---------------------------------------------------------

// Function to fetch and display country details
const fetchAndDisplayCountryDetails = (countryCode, callback) => {
  $.ajax({
    url: 'libs/php/getCountryDetails.php',
    method: 'GET',
    dataType: 'json',
    data: { countryCode },
    success: data => {
      if (data.error) {
        console.error(data.error);
      } else {
        // Update all country details
        $('#countryName').text(data.countryName);
        $('#countryFlag').attr('src', data.flag).attr('alt', `${data.countryName} flag`);
        $('#countryCode').text(data.countryCode);
        $('#countryRegion').text(data.region);
        $('#countryCapital').text(data.capitalCity);
        $('#countryPopulation').text(formatNumber(data.population));
        $('#countryArea').text(`${formatNumber(data.area)} km²`);
        $('#countryLanguages').text(data.nativeLanguages);
        $('#countryCurrency').text(data.currency);
        $('#countryCallingCode').text(data.callingCode);
        $('#countryTimeZone').text(data.timeZone);
      }
    },
    error: (jqXHR, textStatus, errorThrown) => {
      console.error('Failed to get country details:', textStatus, errorThrown);
    },
    complete: () => {
      // Always execute the callback, whether successful or not
      if (typeof callback === 'function') callback();
    }
  });
};

// Function to update the modal with country details
const updateInfoModal = (countryCode) => {
  $('#infoLoadingIndicator').show();
  $('#infoContent').hide();
  $('#infoModal').modal('show');
  
  fetchAndDisplayCountryDetails(countryCode, () => {
    $('#infoLoadingIndicator').hide();
    $('#infoContent').fadeIn(300); // Smoother transition
  });
};

// ---------------------------------------------------------
// WEATHER REPORT FUNCTIONS
// ---------------------------------------------------------

// Function to request weather reports using the capital city
const requestWeatherReport = (countryCode) => {
  if (countryCode) {
    console.log(`Requesting weather report for country code: ${countryCode}`);
    
    // Show modal with loading indicator first
    $('#weatherLoadingIndicator').show();
    $('#weatherContent').hide();
    $('#weatherModal').modal('show');
    
    // Get the capital city from the DOM
    const capitalCity = $('#countryCapital').text();
    
    if (!capitalCity || capitalCity.trim() === '') {
      console.log('Capital city not found in DOM, fetching country details first');
      
      // Fetch country details first to ensure we have the capital city
      $.ajax({
        url: 'libs/php/getCountryDetails.php',
        method: 'GET',
        dataType: 'json',
        data: { countryCode },
        success: data => {
          if (data.error) {
            console.error(data.error);
            showWeatherError('Could not retrieve capital city information.');
            return;
          }
          
          if (data.capitalCity && data.capitalCity.trim() !== '') {
            // Now we have the capital city, proceed with weather request
            fetchWeatherData(data.capitalCity, data.countryName);
          } else {
            showWeatherError('Capital city information not available for this country.');
          }
        },
        error: (jqXHR, textStatus, errorThrown) => {
          console.error('Failed to get country details:', textStatus, errorThrown);
          showWeatherError('Failed to retrieve country information.');
        }
      });
    } else {
      // We already have the capital city, proceed with weather request
      const countryName = $('#countryName').text();
      fetchWeatherData(capitalCity, countryName);
    }
  } else {
    console.error('Country code is undefined');
    showWeatherError('Country code is missing.');
  }
};

// Helper function to show weather error message
const showWeatherError = (message) => {
  $('#weatherLoadingIndicator').hide();
  $('#weatherContent').html(`
    <div class="alert alert-warning">
      <strong>Error:</strong> ${message}
    </div>
  `).show();
};

// Function to fetch weather data using capital city
const fetchWeatherData = (city, countryName) => {
  console.log(`Fetching weather for: ${city}, ${countryName}`);
  
  $.ajax({
    url: 'libs/php/getWeatherForecast.php',
    method: 'GET',
    dataType: 'json',
    data: { city: city },
    success: data => {
      if (data.error) {
        console.error('Weather API error:', data.error);
        showWeatherError(data.error);
        return;
      }
      
      console.log('Weather forecast:', data);
      
      try {
        // Display the weather data from weatherapi.com
        const location = data.location || {};
        const current = data.current || {};
        const forecast = data.forecast?.forecastday || [];
        
        // Set location name
        $('#placeName').text(`${city || 'Unknown'}, ${countryName || 'Unknown'}`);
        
        // Check if location data exists before accessing properties
        if (location && location.lat !== undefined && location.lon !== undefined) {
          $('#placeCoords').text(`Latitude: ${Number(location.lat).toFixed(2)}, Longitude: ${Number(location.lon).toFixed(2)}`);
        } else {
          $('#placeCoords').text('Coordinates unavailable');
        }
        
        // Today's weather - check if data exists
        if (current && current.condition) {
          $('#todayWeatherIcon').attr('src', current.condition.icon ? `https:${current.condition.icon}` : '');
          $('#todayTemp').text(current.temp_c !== undefined ? `${Number(current.temp_c).toFixed(0)}°C` : 'N/A');
          $('#todayDescription').text(current.condition.text || 'No data available');
        } else {
          $('#todayWeatherIcon').attr('src', '');
          $('#todayTemp').text('N/A');
          $('#todayDescription').text('Weather data unavailable');
        }
        
        // Forecast for next 3 days
        for (let i = 0; i < 3; i++) {
          if (forecast[i]) {
            const dayForecast = forecast[i];
            const date = new Date(dayForecast.date);
            const day = date.toLocaleDateString('en-US', { weekday: 'short' });
            const dayOfMonth = date.getDate();
            const suffix = (dayOfMonth % 10 === 1 && dayOfMonth !== 11) ? 'st' :
                          (dayOfMonth % 10 === 2 && dayOfMonth !== 12) ? 'nd' :
                          (dayOfMonth % 10 === 3 && dayOfMonth !== 13) ? 'rd' : 'th';
            const formattedDate = `${day} ${dayOfMonth}${suffix}`;
            
            $(`#dateDay${i+1}`).text(formattedDate);
            
            // Check if day condition exists
            if (dayForecast.day && dayForecast.day.condition) {
              $(`#iconDay${i+1}`).attr('src', dayForecast.day.condition.icon ? 
                  `https:${dayForecast.day.condition.icon}` : '');
              $(`#tempDay${i+1}`).text(dayForecast.day.avgtemp_c !== undefined ? 
                  `${Number(dayForecast.day.avgtemp_c).toFixed(0)}°C` : 'N/A');
              $(`#descriptionDay${i+1}`).text(dayForecast.day.condition.text || 'No data');
            } else {
              $(`#iconDay${i+1}`).attr('src', '');
              $(`#tempDay${i+1}`).text('N/A');
              $(`#descriptionDay${i+1}`).text('No data available');
            }
          } else {
            // No forecast data for this day
            $(`#dateDay${i+1}`).text(`Day ${i+1}`);
            $(`#iconDay${i+1}`).attr('src', '');
            $(`#tempDay${i+1}`).text('N/A');
            $(`#descriptionDay${i+1}`).text('No forecast available');
          }
        }
        
        // Hide loading indicator and show content
        $('#weatherLoadingIndicator').hide();
        $('#weatherContent').show();
      } catch (error) {
        console.error('Error processing weather data:', error);
        showWeatherError(`Failed to process weather data: ${error.message}`);
      }
    },
    error: (jqXHR, textStatus, errorThrown) => {
      console.error('Failed to get weather report:', textStatus, errorThrown);
      console.error('Response:', jqXHR.responseText);
      showWeatherError(`Could not load weather data. Please try again later.`);
    }
  });
};

// ---------------------------------------------------------
// CURRENCY CONVERSION FUNCTIONS
// ---------------------------------------------------------

// Function to populate the currency dropdown with rates
const populateCurrencyDropdown = () => {
  $.ajax({
    url: 'libs/php/getCurrencyData.php',
    method: 'GET',
    dataType: 'json',
    data: { action: 'getAllRates' },
    success: currencyData => {
      const $dropdown = $('#currencySelect');
      $dropdown.empty();
      
      // Convert currencies object to array for sorting
      const currencyArray = [];
      $.each(currencyData.currencies, (code, name) => {
        // Store both name and rate
        currencyArray.push({ 
          code, 
          name, 
          rate: currencyData.rates[code] || 1
        });
      });
      
      // Sort currencies alphabetically by name
      currencyArray.sort((a, b) => a.name.localeCompare(b.name));
      
      // Add all currencies alphabetically with data-rate attribute
      currencyArray.forEach(currency => {
        $dropdown.append(`<option value="${currency.code}" data-rate="${currency.rate}">${currency.name} (${currency.code})</option>`);
      });
      
      console.log('Currency dropdown populated with rates');
    },
    error: (jqXHR, textStatus, errorThrown) => {
      console.error('Failed to populate currency dropdown:', textStatus, errorThrown);
    }
  });
};

// Simplified currency conversion function using data attributes
const calcResult = () => {
  const amount = parseFloat($('#currencyNumber').val()) || 0;
  const rate = parseFloat($('#currencySelect option:selected').attr('data-rate')) || 0;
  
  if (amount > 0 && rate > 0) {
    // Format with 2 decimal places
    const result = (amount * rate).toFixed(2);
    $('#currencyResult').val(result);
  } else {
    $('#currencyResult').val('');
  }
};

// Event listeners for currency conversion
$('#currencyNumber').on('input', calcResult);
$('#currencySelect').on('change', calcResult);

// Reset to 1 when modal is closed
$('#currencyModal').on('hidden.bs.modal', function () {
  $('#currencyNumber').val(1);
  $('#currencyResult').val('');
});

// Calculate when modal is fully shown
$('#currencyModal').on('shown.bs.modal', function () {
  setTimeout(calcResult, 100);
});

// ---------------------------------------------------------
// WIKIPEDIA AND NEWS FUNCTIONS
// ---------------------------------------------------------

// Function to open Wikipedia page in a new browser window/tab
const openWikipediaPage = countryName => {
  $.ajax({
    url: 'libs/php/getWikipediaUrl.php',
    method: 'GET',
    dataType: 'json',
    data: { countryName },
    success: data => {
      if (data.error) {
        console.error(data.error);
      } else {
        window.open(data.url, '_blank');
      }
    },
    error: (jqXHR, textStatus, errorThrown) => {
      console.error('Failed to get Wikipedia URL:', textStatus, errorThrown);
    }
  });
};

// Function to fetch and display news articles
const fetchNewsArticles = countryCode => {
  $.ajax({
    url: 'libs/php/getNews.php',
    method: 'GET',
    dataType: 'json',
    data: { countryCode },
    success: data => {
      if (data.error) {
        console.error(data.error);
      } else {
        const articles = data.results;
        for (let i = 0; i < articles.length; i++) {
          if (i >= 10) break;
          $(`#newsTitle${i + 1}`).text(articles[i].title);
          $(`#newsImage${i + 1}`).attr('src', articles[i].image_url).attr('alt', articles[i].title);
          $(`#newsDescription${i + 1}`).text(articles[i].description);
          $(`#newsLink${i + 1}`).attr('href', articles[i].link);
        }
        $('#newsModal').modal('show');
      }
    },
    error: (jqXHR, textStatus, errorThrown) => {
      console.error('Failed to fetch news articles:', textStatus, errorThrown);
    }
  });
};

// Function to open external URL in a new browser window/tab
const openExternalUrl = url => {
  window.open(url, '_blank');
};

// Function to add Wikipedia markers to the cluster group
const addWikipediaMarkers = articles => {
  console.log('Adding Wikipedia markers:', articles);
  wikipediaMarkers.clearLayers();
  const maxMarkers = 10;
  const limitedArticles = articles.slice(0, maxMarkers);
  limitedArticles.forEach(article => {
    const marker = L.marker([article.lat, article.lng], { icon: wikipediaIcon });
    const createPopupContent = () => {
      const popupContent = $('#popupMarkerTemplate').html();
      const $popupContent = $(popupContent);
      $popupContent.find('#popupTitle').text(article.title);
      $popupContent.find('#popupThumbnail').attr('src', article.thumbnail).attr('alt', article.title);
      $popupContent.find('#popupThumbnail').attr('onclick', `openExternalUrl('${article.url}')`);
      return $popupContent.html();
    };
    marker.on('click', () => {
      if (marker.getPopup()) marker.unbindPopup();
      marker.bindPopup(createPopupContent()).openPopup();
    });
    wikipediaMarkers.addLayer(marker);
  });
  map.addLayer(wikipediaMarkers);
};

// Function to fetch and display Wikipedia articles
const fetchWikipediaArticles = (lat, lng) => {
  const zoomLevel = map.getZoom();
  const radius = zoomLevel > 10 ? 5000 : 10000;
  $.ajax({
    url: 'libs/php/getWikipediaArticles.php',
    method: 'GET',
    dataType: 'json',
    data: {
      lat: lat,
      lng: lng,
      radius: radius
    },
    success: function(data) {
      if (data.error) {
        console.error('Error fetching Wikipedia articles:', data.error);
        return;
      }
      addWikipediaMarkers(data.articles);
    },
    error: function(xhr, status, error) {
      console.error('AJAX error:', status, error);
    }
  });
};

// ---------------------------------------------------------
// EVENT HANDLERS
// ---------------------------------------------------------

$(document).ready(function () {
  console.log('Document is ready.');

  // Initialize the map
  map = L.map("map", {
    layers: [streets],
    zoomControl: false // Disable default zoom control
  });

  // Move the tile layers control to the bottom right corner
  L.control.layers(basemaps, overlays, { position: 'bottomright' }).addTo(map);

  // Add buttons to the map
  [infoBtn, weatherBtn, zoomControl, currencyBtn, wikipediaBtn, newsBtn].forEach(btn => btn.addTo(map));

  // Add marker clusters to the map
  markers.addTo(map);
  wikipediaMarkers.addTo(map);

  // Populate dropdowns
  populateDropdown();
  populateCurrencyDropdown();

  // Get the user's location and auto-select the user's country based on their location
  getUserLocation();

  // Event listener for dropdown change
  $('#countrySelect').on('change', function () {
  const countryCode = $(this).val();
  if (countryCode) {;
    getCountryBorder(countryCode);
    getCities(countryCode); // Get cities for the selected country

    const countryName = $(this).find('option:selected').text().split(' (')[0];
    $('#countryName').text(countryName);

    fetchWikipediaArticles(countryName);
    
    // Fetch country details which will update the currency
    fetchAndDisplayCountryDetails(countryCode);
  }
  });

  // Event listener for news article links
  $(document).on('click', '.news-article a', function(event) {
    event.preventDefault();
    const url = $(this).attr('href');
    window.open(url, '_blank');
  });

  // Event listener to fetch articles when the map is moved or zoomed
  map.on('moveend', function() {
    const center = map.getCenter();
    fetchWikipediaArticles(center.lat, center.lng);
  });
  
  $('#currencyModal').on('hidden.bs.modal', function () {
    $('#currencyNumber').val(1);
    $('#currencyResult').val('');  // Clear the result field
  });

  // Event listener for currency modal shown
  $('#currencyModal').on('shown.bs.modal', function () {
    // Ensure the currency conversion runs when modal is fully open
    setTimeout(calcResult, 100);
  });

  // Update event listeners for currency conversion
  $('#currencyNumber').on('input', calcResult);
  $('#currencySelect').on('change', calcResult);
});
