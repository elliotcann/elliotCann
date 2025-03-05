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

// Create marker cluster groups
const markers = L.markerClusterGroup();
const wikipediaMarkers = L.markerClusterGroup();

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
const infoBtn = createButton('libs/assets/img/info-lg.svg', () => $('#infoModal').modal('show'));

const weatherBtn = createButton('libs/assets/img/cloud-sun.svg', () => {
  const countryCode = $('#countrySelect').val();
  if (countryCode) {
    requestWeatherReport(countryCode);
  } else {
    alert("Please select a country first.");
  }
});

const currencyBtn = createButton('libs/assets/img/currency-exchange.svg', () => $('#currencyModal').modal('show'));

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
          fetchAndDisplayCountryDetails(countryCode).then(() => {
            const countryName = $('#countryName').text();
            fetchWikipediaArticles(countryName); // Fetch Wikipedia articles for the selected country
          }).catch(error => {
            console.error('Failed to fetch and display country details:', error);
          });
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
const fetchAndDisplayCountryDetails = (countryCode) => {
  return new Promise((resolve, reject) => {
    if (countryCode) {
      $.ajax({
        url: 'libs/php/getCountryDetails.php',
        method: 'GET',
        dataType: 'json',
        data: { countryCode },
        success: data => {
          if (data.error) {
            console.error(data.error);
            reject(data.error);
          } else {
            console.log('Country details:', data);
            $('#countryName').text(data.countryName);
            $('#countryFlag').attr('src', data.flag);
            $('#countryCode').text(data.countryCode);
            $('#countryRegion').text(data.region);
            $('#countryCapital').text(data.capitalCity);
            $('#countryPopulation').text(formatNumber(data.population));
            $('#countryArea').text(formatNumber(data.area));
            $('#countryLanguages').text(data.nativeLanguages);
            $('#countryCurrency').text(data.currency);
            $('#countryCallingCode').text(data.callingCode);
            $('#countryTimeZone').text(data.timeZone);
            const currencySymbol = data.currencySymbol || '';
            $('#currencyNumber').attr('placeholder', `Enter Amount in ${data.currency} ${currencySymbol}`);
            resolve(data);
          }
        },
        error: (jqXHR, textStatus, errorThrown) => {
          console.error('Failed to get country details:', textStatus, errorThrown);
          reject(errorThrown);
        }
      });
    } else {
      reject('Country code is not defined.');
    }
  });
};

// Function to update the modal with country details
const updateInfoModal = (countryCode) => {
  fetchAndDisplayCountryDetails(countryCode).then(data => {
    $('#countryDetails').text(JSON.stringify(data, null, 2));
    $('#infoModal').modal('show');
  }).catch(error => {
    console.error('Failed to update info modal:', error);
  });
};

// ---------------------------------------------------------
// WEATHER REPORT FUNCTIONS
// ---------------------------------------------------------

// Function to request weather reports using the capital city coordinates
const requestWeatherReport = (countryCode) => {
  if (countryCode) {
    console.log(`Requesting weather report for country code: ${countryCode}`);
    // Fetch the country details including the capital city coordinates
    $.ajax({
      url: 'libs/php/getCountryDetails.php',
      method: 'GET',
      dataType: 'json',
      data: { countryCode: countryCode },
      success: countryData => {
        if (countryData.error) {
          console.error(countryData.error);
          $('#weatherModal').modal('show'); // Show modal even if there is an error
        } else {
          const capital = countryData.capitalCity;
          const lat = countryData.lat;
          const lng = countryData.lng;

          if (!lat || !lng) {
            console.error('Latitude and longitude are required');
            $('#weatherModal').modal('show'); // Show modal even if there is an error
            return;
          }

          // Fetch weather data for the capital city
          $.ajax({
            url: 'libs/php/getWeatherForecast.php',
            method: 'GET',
            dataType: 'json',
            data: { lat: lat, lng: lng },
            success: data => {
              if (data.error) {
                console.error(data.error);
              } else {
                console.log('Weather forecast:', data);
                let placeName = data.city.name + ' (' + data.city.country + ')';
                if (!data.city.name) placeName = 'Sea Area';
                $('#placeName').text(`${placeName}`);
                $('#placeCoords').text(`Latitude: ${lat.toFixed(2)}, Longitude: ${lng.toFixed(2)}`);
                $('#todayWeatherIcon').attr('src', `http://openweathermap.org/img/wn/${data.list[0].weather[0].icon}.png`);
                $('#todayTemp').text(`${data.list[0].main.temp.toFixed(1)} °C`);
                $('#todayDescription').text(data.list[0].weather[0].description);
                for (let i = 1; i <= 5; i++) {
                  const forecastIndex = i * 8 - 1;
                  if (data.list[forecastIndex]) {
                    const forecast = data.list[forecastIndex];
                    const date = new Date(forecast.dt * 1000);
                    const day = date.toLocaleDateString('en-US', { weekday: 'short' });
                    const dayOfMonth = date.getDate();
                    const suffix = (dayOfMonth % 10 === 1 && dayOfMonth !== 11) ? 'st' :
                                   (dayOfMonth % 10 === 2 && dayOfMonth !== 12) ? 'nd' :
                                   (dayOfMonth % 10 === 3 && dayOfMonth !== 13) ? 'rd' : 'th';
                    const formattedDate = `${day} ${dayOfMonth}${suffix}`;
                    $(`#dateDay${i}`).text(formattedDate);
                    $(`#iconDay${i}`).attr('src', `http://openweathermap.org/img/wn/${forecast.weather[0].icon}.png`);
                    $(`#tempDay${i}`).text(`${forecast.main.temp.toFixed(1)}°C`);
                    $(`#descriptionDay${i}`).text(forecast.weather[0].description);
                  } else {
                    $(`#dateDay${i}`).text('N/A');
                    $(`#iconDay${i}`).attr('src', '');
                    $(`#tempDay${i}`).text('N/A');
                    $(`#descriptionDay${i}`).text('N/A');
                  }
                }
              }
              $('#weatherModal').modal('show'); // Show modal after data is fetched
            },
            error: (jqXHR, textStatus, errorThrown) => {
              console.error('Failed to get weather report:', textStatus, errorThrown);
              $('#weatherModal').modal('show'); // Show modal even if there is an error
            }
          });
        }
      },
      error: (jqXHR, textStatus, errorThrown) => {
        console.error('Failed to get country details:', textStatus, errorThrown);
        $('#weatherModal').modal('show'); // Show modal even if there is an error
      }
    });
  } else {
    console.error('Country code is undefined');
  }
};

// ---------------------------------------------------------
// CURRENCY CONVERSION FUNCTIONS
// ---------------------------------------------------------

// Function to populate the currency dropdown
const populateCurrencyDropdown = () => {
  $.ajax({
    url: 'libs/php/getCurrencyData.php',
    method: 'GET',
    dataType: 'json',
    data: { action: 'getCurrencies' },
    success: currencies => {
      const $dropdown = $('#currencySelect');
      $dropdown.empty();
      $dropdown.append('<option value="" disabled selected>Select Currency</option>');
      $.each(currencies, (code, name) => {
        $dropdown.append(`<option value="${code}">${name} (${code})</option>`);
      });
      console.log('Currency dropdown populated:', currencies);
    },
    error: (jqXHR, textStatus, errorThrown) => {
      console.error('Failed to populate currency dropdown:', textStatus, errorThrown);
    }
  });
};


// Function to convert currency
const convertCurrency = () => {
  const amount = parseFloat($('#currencyNumber').val());
  const fromCurrency = $('#countryCurrency').text().split(' ')[0];
  const toCurrency = $('#currencySelect').val();
  if (!amount || !fromCurrency || !toCurrency) {
    console.error('Invalid input values for currency conversion');
    return;
  }
  $.ajax({
    url: 'libs/php/getCurrencyData.php',
    method: 'GET',
    dataType: 'json',
    data: { action: 'getExchangeRate', from: fromCurrency, to: toCurrency },
    success: data => {
      if (data.error) {
        console.error(data.error);
      } else {
        const convertedAmount = (amount * data.rate).toFixed(2);
        $('#currencyResult').text(`${amount} ${fromCurrency} = ${convertedAmount} ${toCurrency}`);
      }
    },
    error: (jqXHR, textStatus, errorThrown) => {
      console.error('Failed to convert currency:', textStatus, errorThrown);
    }
  });
};

// Event listener for currency conversion
$('#currencyNumber, #currencySelect').on('input change', convertCurrency);

// ---------------------------------------------------------
// WIKIPEDIA AND NEWS FUNCTIONS
// ---------------------------------------------------------

// Function to open Wikipedia page in a modal
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
        $('#wikipediaIframe').attr('src', data.url);
        $('#wikipediaModal').modal('show');
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

// Function to open external URL in a central modal
const openExternalUrl = url => {
  $('#externalIframe').attr('src', url);
  $('#externalModal').modal('show');
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
      $popupContent.find('#popupButton').attr('onclick', `openExternalUrl('${article.url}')`);
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
  if (countryCode) {
    // Clear input fields
    $('#currencyNumber').val('');
    $('#currencyResult').text('Please enter an Amount');
    $('#currencySelect').val(''); // Reset the "Convert to" dropdown

    getCountryBorder(countryCode);
    getCities(countryCode); // Get cities for the selected country
    fetchAndDisplayCountryDetails(countryCode).then(() => {
      const countryName = $('#countryName').text();
      fetchWikipediaArticles(countryName); // Fetch Wikipedia articles for the selected country
    }).catch(error => {
      console.error('Failed to fetch and display country details:', error);
    });
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

  // Show welcome modal
  $('#welcomeModal').modal('show');
});
