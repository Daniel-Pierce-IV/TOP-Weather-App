// I'm aware this is bad practice (this is a practice project)
const apiKey = '295e9bb0e250da8fe8e1ac30858d5e24';
const apiWeather = `https://api.openweathermap.org/data/2.5/onecall?lat={lat}&lon={lon}&exclude=minutely,hourly,alerts&appid=${apiKey}`;
const apiGeocoding = `http://api.openweathermap.org/geo/1.0/direct?q={location}&limit=5&appid=${apiKey}`;
const apiReverseGeo = 'https://geocode.xyz/{lat},{lon}?json=1';

function createGeoURL(location) {
  return apiGeocoding.replace('{location}', location);
}

function createReverseURL(lat, lon) {
  return apiReverseGeo.replace('{lat}', lat).replace('{lon}', lon);
}

function createWeatherURL(lat, lon) {
  return apiWeather.replace('{lat}', lat).replace('{lon}', lon);
}

// Returns current weather and today + 7 days forecast
async function getWeatherData(lat, lon) {
  const weatherURL = createWeatherURL(lat, lon);
  const response = await fetch(weatherURL);
  return response.json();
}

async function getCityName(lat, lon) {
  const reverseURL = createReverseURL(lat, lon);
  const response = await fetch(reverseURL);
  return response.json().then((data) => ({
    name: data.city,
    state: data.statename,
    country: data.country,
  }));
}

// returns up to 5 cities that match the search input
async function getCityData(location) {
  const geoURL = createGeoURL(location);
  const response = await fetch(geoURL);
  return response.json();
}

function chooseLocation(locations) {
  let location;

  if (locations.length === 1) {
    // parentheses needed for array destructring into already-declared variable
    [location] = locations;
  } else {
    const citiesText = locations
      .map(
        (city, i) =>
          `${i + 1}: ${city.name}, ${city.state ? `${city.state}, ` : ''}${
            city.country
          }`
      )
      .join('\n');

    while (!location) {
      const userInput = prompt(`${citiesText}\nSelect a city by number (1-5):`);
      location = locations[parseInt(userInput, 10) - 1];
    }
  }

  return location;
}

function searchForLocations() {
  const location = prompt('Search for a city: "city,state,country"');
  return getCityData(location);
}

function processWeatherData(rawData, cityName) {
  const data = {
    cityName,
    daily: rawData.daily.map((day) => ({
      high: day.temp.max,
      low: day.temp.min,
      weather: {
        title: day.weather[0].main,
        code: day.weather[0].id,
      },
    })),
  };

  return data;
}

function getBrowserCoords() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (data) => resolve(data.coords),
      (error) => reject(error)
    );
  });
}

async function getWeather() {
  let location;

  try {
    location = await getLocationViaBrowser();
  } catch (error) {
    console.error('Error with Browser Geolocation', error);

    location = await getLocationViaSearch();
  }

  const rawData = await getWeatherData(location.lat, location.lon);
  const processedData = processWeatherData(rawData, location.name);

  console.log(processedData);
}

async function getLocationViaBrowser() {
  const { latitude, longitude } = await getBrowserCoords();
  const cityData = await getCityName(latitude, longitude);

  return locationFactory(
    latitude,
    longitude,
    cityData.name,
    cityData.country,
    cityData.state
  );
}

async function getLocationViaSearch() {
  const locations = await searchForLocations();
  return chooseLocation(locations);
}

function locationFactory(lat, lon, name, country, state = undefined) {
  return { name, state, country, lat, lon };
}

getWeather();
