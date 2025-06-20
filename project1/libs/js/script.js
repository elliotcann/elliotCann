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
const issLayer = L.layerGroup();

const basemaps = {
  "Streets": streets,
  "Satellite": satellite
};

const overlays = {
  "Cities": markers,
  "Wikipedia Points": wikipediaMarkers,
  "ISS Location": issLayer
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
  showLoadingIndicator();
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      lat = position.coords.latitude;
      lng = position.coords.longitude;
      autoSelectUserCountry();
    }, error => {
      hideLoadingIndicator();
    });
  } else {
    hideLoadingIndicator();
  }
};

// Function to auto-select the user's country based on their location
const autoSelectUserCountry = () => {
  if (lat !== undefined && lng !== undefined) {
    $.ajax({
      url: 'libs/php/getCountryFromCoords.php',
      method: 'GET',
      dataType: 'json',
      data: { lat, lng },
      success: data => {
        const countryCode = data.countryCode;
        if (countryCode) {
          $('#countrySelect').val(countryCode).change();
          fetchAndDisplayCountryDetails(countryCode);
          const countryName = $('#countryName').text();
          fetchWikipediaArticles(countryName);
        }
        hideLoadingIndicator();
      },
      error: (jqXHR, textStatus, errorThrown) => {
        hideLoadingIndicator();
      }
    });
  } else {
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
      // Silent error handling
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
      // Silent error handling
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
  cities.forEach(city => {
    const marker = L.marker([city.lat, city.lng], { icon: customIcon });
    
    // Create popup content using the template
    const createPopupContent = () => {
      const popupContent = $('#popupMarkerTemplate').html();
      const $popupContent = $(popupContent);
      
      // Create Wikipedia link for the city name
      const wikiCityName = encodeURIComponent(city.name.replace(/ /g, '_'));
      const wikiUrl = `https://en.wikipedia.org/wiki/${wikiCityName}`;
      
      $popupContent.find('#popupTitle').html(`<a href="${wikiUrl}" target="_blank" class="link-primary">${city.name}</a>`);
      $popupContent.find('#popupDescription').text(`Population: ${formatNumber(city.population)}`);
      $popupContent.find('#popupThumbnail').hide();
      return $popupContent.html();
    };
    
    // Bind the popup to the marker with specific options
    marker.bindPopup(createPopupContent(), {
      closeButton: true,
      closeOnEscapeKey: true
    });
    
    // Show popup on hover (desktop)
    marker.on('mouseover', function() {
      this.openPopup();
    });

    // Close popup when mouse leaves marker (except on click)
    marker.on('mouseout', function() {
      if (!marker._clicked) {
        setTimeout(() => {
          this.closePopup();
        }, 300);
      }
    });
    
    // Toggle popup on click (all devices)
    marker.on('click', function() {
      this.openPopup();
      // Set a flag to track if this popup was opened by click
      marker._clicked = !marker._clicked;
    });
    
    // Close popup when clicking elsewhere on map
    map.on('click', function() {
      marker._clicked = false;
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
      }
    },
    error: (jqXHR, textStatus, errorThrown) => {
      // Silent error handling
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
      if (!data.error) {
        // Update all country details
        $('#countryName').text(data.countryName);
        $('#countryFlag').attr('src', data.flag).attr('alt', `${data.countryName} flag`);
        $('#countryCode').text(data.countryCode);
        $('#countryRegion').text(data.region);
        $('#countryCapital').text(data.capitalCity);
        $('#countryPopulation').text(formatNumber(data.population));
        $('#countryArea').text(formatNumber(data.area));
        $('#countryLanguages').text(data.nativeLanguages);
        $('#countryCurrency').text(data.currency);
        $('#countryCallingCode').text(data.callingCode);
        $('#countryTimeZone').text(data.timeZone);
      }
    },
    error: (jqXHR, textStatus, errorThrown) => {
      // Silent error handling
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
    $('#infoContent').fadeIn(600); // Smoother transition
  });
};

// ---------------------------------------------------------
// WEATHER REPORT FUNCTIONS
// ---------------------------------------------------------

// Function to request weather reports using the capital city
const requestWeatherReport = (countryCode) => {
  if (countryCode) {
    // Show modal with loading indicator first
    $('#weatherLoadingIndicator').show();
    $('#weatherContent').hide();
    $('#weatherModal').modal('show');
    
    // Get the capital city from the DOM
    const capitalCity = $('#countryCapital').text();
    
    if (!capitalCity || capitalCity.trim() === '') {
      // Fetch country details first to ensure we have the capital city
      $.ajax({
        url: 'libs/php/getCountryDetails.php',
        method: 'GET',
        dataType: 'json',
        data: { countryCode },
        success: data => {
          if (data.error) {
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
          showWeatherError('Failed to retrieve country information.');
        }
      });
    } else {
      // We already have the capital city, proceed with weather request
      const countryName = $('#countryName').text();
      fetchWeatherData(capitalCity, countryName);
    }
  } else {
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
  $.ajax({
    url: 'libs/php/getWeatherForecast.php',
    method: 'GET',
    dataType: 'json',
    data: { city: city },
    success: data => {
      if (data.error) {
        showWeatherError(data.error);
        return;
      }
      
      try {
        // Display the weather data from weatherapi.com
        const location = data.location || {};
        const current = data.current || {};
        const forecast = data.forecast?.forecastday || [];
        
        // Set location name
        $('#placeName').text(`${city || 'Unknown'}, ${countryName || 'Unknown'}`);
        
        // Format last updated time
        const lastUpdated = new Date(current.last_updated || Date.now()).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        });
        $('#lastUpdated').text(lastUpdated);
        
        // Today's weather - check if data exists
        if (current && current.condition) {
          $('#todayWeatherIcon').attr('src', current.condition.icon ? `https:${current.condition.icon}` : '');
          $('#todayDescription').text(current.condition.text || 'No data available');
          
          // Get max and min from the first item in forecast
          if (forecast[0] && forecast[0].day) {
            $('#todayMaxTemp').text(Math.round(forecast[0].day.maxtemp_c || 0));
            $('#todayMinTemp').text(Math.round(forecast[0].day.mintemp_c || 0));
          } else {
            $('#todayMaxTemp').text('N/A');
            $('#todayMinTemp').text('N/A');
          }
        } else {
          $('#todayWeatherIcon').attr('src', '');
          $('#todayDescription').text('Weather data unavailable');
          $('#todayMaxTemp').text('N/A');
          $('#todayMinTemp').text('N/A');
        }
        
        // Forecast for next 2 days
        for (let i = 1; i <= 2; i++) {
          if (forecast[i]) {
            const dayForecast = forecast[i];
            const date = new Date(dayForecast.date);
            const day = date.toLocaleDateString('en-US', { weekday: 'short' });
            const dayOfMonth = date.getDate();
            const suffix = (dayOfMonth % 10 === 1 && dayOfMonth !== 11) ? 'st' :
                          (dayOfMonth % 10 === 2 && dayOfMonth !== 12) ? 'nd' :
                          (dayOfMonth % 10 === 3 && dayOfMonth !== 13) ? 'rd' : 'th';
            const formattedDate = `${day} ${dayOfMonth}${suffix}`;
            
            // Use day1 and day2 instead of day1, day2, day3
            const dayIndex = i;
            
            $(`#dateDay${dayIndex}`).text(formattedDate);
            
            // Check if day condition exists
            if (dayForecast.day && dayForecast.day.condition) {
              $(`#iconDay${dayIndex}`).attr('src', dayForecast.day.condition.icon ? 
                  `https:${dayForecast.day.condition.icon}` : '');
              
              // Set max and min temperatures
              $(`#maxTempDay${dayIndex}`).text(Math.round(dayForecast.day.maxtemp_c || 0));
              $(`#minTempDay${dayIndex}`).text(Math.round(dayForecast.day.mintemp_c || 0));
            } else {
              $(`#iconDay${dayIndex}`).attr('src', '');
              $(`#maxTempDay${dayIndex}`).text('N/A');
              $(`#minTempDay${dayIndex}`).text('N/A');
            }
          } else {
            // No forecast data for this day
            $(`#dateDay${dayIndex}`).text(`Day ${dayIndex}`);
            $(`#iconDay${dayIndex}`).attr('src', '');
            $(`#maxTempDay${dayIndex}`).text('N/A');
            $(`#minTempDay${dayIndex}`).text('N/A');
          }
        }
        
        // Hide loading indicator and show content
        $('#weatherLoadingIndicator').hide();
        $('#weatherContent').fadeIn(600);
      } catch (error) {
        showWeatherError(`Failed to process weather data: ${error.message}`);
      }
    },
    error: (jqXHR, textStatus, errorThrown) => {
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
    },
    error: (jqXHR, textStatus, errorThrown) => {
      // Silent error handling
    }
  });
};

// Currency conversion function using data attributes
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

// ---------------------------------------------------------
// WIKIPEDIA AND NEWS FUNCTIONS
// ---------------------------------------------------------

// Function to fetch and display Wikipedia information
const openWikipediaPage = countryName => {
  // Show loading indicator and hide content
  $('#wikiLoadingIndicator').show();
  $('#wikiContent').hide();
  
  // Show the modal immediately with the loading indicator
  $('#wikipediaModal').modal('show');
  
  $.ajax({
    url: 'libs/php/getWikipediaContent.php',
    method: 'GET',
    dataType: 'json',
    data: { countryName },
    success: data => {
      if (data.error) {
        $('#wikiContent').html(`<div class="alert alert-warning">Failed to load Wikipedia content: ${data.error}</div>`);
      } else {
        // Set the title and link
        $('#wikiTitle').text(data.title).attr('href', data.url);
        
        // Set the image if available
        if (data.thumbnail) {
          $('#wikiImage').attr('src', data.thumbnail).show();
        } else {
          $('#wikiImage').hide();
        }
        
        // Set a shorter summary text (first paragraph only)
        const shortExtract = data.extract.split('\n')[0];
        $('#wikiSummary').html(`<p>${shortExtract}</p>`);
      }
      
      // Hide loading indicator and show content
      $('#wikiLoadingIndicator').hide();
      $('#wikiContent').removeClass('d-none').fadeIn(600);
    },
    error: (jqXHR, textStatus, errorThrown) => {
      // Show error message
      $('#wikiContent').html(`<div class="alert alert-warning">Failed to load Wikipedia content. Please try again later.</div>`);
      
      // Hide loading indicator and show content with error message
      $('#wikiLoadingIndicator').hide();
      $('#wikiContent').removeClass('d-none').fadeIn(600);
    }
  });
};

// Function to fetch and display news articles
const fetchNewsArticles = countryCode => {
  // Show loading indicator and hide content
  $('#newsLoadingIndicator').show();
  $('#newsContent').hide();
  
  // Show the modal immediately with the loading indicator
  $('#newsModal').modal('show');
  
  $.ajax({
    url: 'libs/php/getNews.php',
    method: 'GET',
    dataType: 'json',
    data: { countryCode },
    success: data => {
      if (data.error) {
        // Show error message in news content
        $('#newsContent').html(`<div class="alert alert-warning">Failed to load news: ${data.error}</div>`);
      } else {
        const articles = data.results;

        // Display only 5 articles
        for (let i = 0; i < Math.min(articles.length, 5); i++) {
          // Create link for article title
          $(`#newsTitle${i + 1}`).html(`<a href="${articles[i].link}" target="_blank">${articles[i].title}</a>`);
          $(`#newsImage${i + 1}`).attr('src', articles[i].image_url).attr('alt', 'Image not available');
          $(`#newsProvider${i + 1}`).text(articles[i].source_id || 'Unknown source');
        }
      }
      
      // Hide loading indicator and show content
      $('#newsLoadingIndicator').hide();
      $('#newsContent').removeClass('d-none').fadeIn(600);
    },
    error: (jqXHR, textStatus, errorThrown) => {
      // Show error message
      $('#newsContent').html(`<div class="alert alert-warning">Failed to load news articles. Please try again later.</div>`);
      
      // Hide loading indicator and show content with error message
      $('#newsLoadingIndicator').hide();
      $('#newsContent').removeClass('d-none').fadeIn(600);
    }
  });
};

// Function to open external URL in a new browser window/tab
const openExternalUrl = url => {
  window.open(url, '_blank');
};

// Function to add Wikipedia markers to the cluster group
const addWikipediaMarkers = articles => {
  wikipediaMarkers.clearLayers();
  const maxMarkers = 10;
  const limitedArticles = articles.slice(0, maxMarkers);
  limitedArticles.forEach(article => {
    const marker = L.marker([article.lat, article.lng], { icon: wikipediaIcon });
    
    // Create popup content using the template
    const createPopupContent = () => {
      const popupContent = $('#popupMarkerTemplate').html();
      const $popupContent = $(popupContent);
      $popupContent.find('#popupTitle').html(`<a href="#" onclick="openExternalUrl('${article.url}'); return false;" class="link-primary">${article.title}</a>`);
      $popupContent.find('#popupThumbnail').attr('src', article.thumbnail).attr('alt', article.title);
      // Remove the onclick from the thumbnail
      $popupContent.find('#popupThumbnail').removeAttr('onclick');
      return $popupContent.html();
    };

    // Bind the popup to the marker with specific options
    marker.bindPopup(createPopupContent(), {
      closeButton: true,
      closeOnEscapeKey: true
    });
    
    // For desktop: Show on hover
    marker.on('mouseover', function() {
      this.openPopup();
    });
    
    // Close popup when mouse leaves marker (except on click)
    marker.on('mouseout', function() {
      if (!marker._clicked) {
        setTimeout(() => {
          this.closePopup();
        }, 300);
      }
    });
    
    // For all devices: Toggle on click
    marker.on('click', function() {
      this.openPopup();
      // Set a flag to track if this popup was opened by click
      marker._clicked = !marker._clicked;
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
      if (!data.error) {
        addWikipediaMarkers(data.articles);
      }
    },
    error: function(xhr, status, error) {
      // Silent error handling
    }
  });
};

// ---------------------------------------------------------
// ISS TRACKING FUNCTIONS
// ---------------------------------------------------------

// Create ISS marker with custom icon
const issIcon = createCustomIcon(
  'libs/assets/img/ISS.png',
  null,
  [32, 32],
  null,
  [16, 16],
  null,
  [0, -16]
);

// Create ISS marker and add to the layer
let issMarker = L.marker([0, 0], {
  icon: issIcon,
  title: "International Space Station"
});
let issTrackingInterval = null;

// Function to update ISS position
const updateISSPosition = (callback) => {
  $.ajax({
    url: 'libs/php/getISSPosition.php',
    method: 'GET',
    dataType: 'json',
    success: data => {
      if (data.error) {
        return;
      }
      
      const latitude = parseFloat(data.iss_position.latitude);
      const longitude = parseFloat(data.iss_position.longitude);
      
      // Update the marker's position
      issMarker.setLatLng([latitude, longitude]);
      
      // Create popup content using the template
      const popupContent = $('#popupMarkerTemplate').html();
      const $popupContent = $(popupContent);

      // Create Wikipedia link for the ISS
      const issWikiUrl = "https://en.wikipedia.org/wiki/International_Space_Station";
      $popupContent.find('#popupTitle').html(`<a href="${issWikiUrl}" target="_blank" class="link-primary">International Space Station</a>`);
      $popupContent.find('#popupDescription').text(`Lat: ${latitude.toFixed(2)}, Lng: ${longitude.toFixed(2)}`);
      
      // Bind the popup with specific options
      issMarker.bindPopup($popupContent.html(), {
        closeButton: true,
        closeOnEscapeKey: true
      });

      // Reset previous event listeners
      issMarker.off('mouseover mouseout click');
      
      // For desktop: Show popup on hover
      issMarker.on('mouseover', function() {
        this.openPopup();
      });
      
      // Close popup when mouse leaves marker (except on click)
      issMarker.on('mouseout', function() {
        if (!issMarker._clicked) {
          setTimeout(() => {
            this.closePopup();
          }, 300);
        }
      });

      // For all devices: Toggle popup on click
      issMarker.on('click', function() {
        this.openPopup();
        // Set a flag to track if this popup was opened by click
        issMarker._clicked = !issMarker._clicked;
      });
      
      // Execute callback if provided
      if (typeof callback === 'function') {
        callback(latitude, longitude);
      }
    },
    error: (jqXHR, textStatus, errorThrown) => {
      // Silent error handling
    }
  });
};

// ---------------------------------------------------------
// EVENT HANDLERS
// ---------------------------------------------------------

$(document).ready(function () {
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

  // Set up ISS layer event handlers
  map.on('overlayadd', function(e) {
    if (e.name === 'ISS Location') {
      // Add the marker to the layer
      issMarker.addTo(issLayer);
      
      // Update position immediately and center map after position is retrieved
      updateISSPosition((lat, lng) => {
        // Center map on ISS position after it's been updated
        map.setView([lat, lng], 4);
      });
      
      // Start interval updates
      issTrackingInterval = setInterval(() => updateISSPosition(), 5000); // Update every 5 seconds
    }
  });

  map.on('overlayremove', function(e) {
    if (e.name === 'ISS Location') {
      // Clear the update interval
      if (issTrackingInterval) {
        clearInterval(issTrackingInterval);
        issTrackingInterval = null;
      }
      
      // Return to selected country if one exists
      if (currentBorderLayer) {
        map.fitBounds(currentBorderLayer.getBounds());
      }
    }
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