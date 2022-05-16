// I'm aware this is bad practice (this is a practice project)
const apiKey = '295e9bb0e250da8fe8e1ac30858d5e24';
const apiWeather = `https://api.openweathermap.org/data/2.5/onecall?lat={lat}&lon={lon}&exclude=minutely,hourly,alerts&appid=${apiKey}`;
const apiGeocoding = `http://api.openweathermap.org/geo/1.0/direct?q={location}&limit=5&appid=${apiKey}`;

function createGeoURL(location) {
  return apiGeocoding.replace('{location}', location);
}

function createWeatherURL(lat, lon) {
  return apiWeather.replace('{lat}', lat).replace('{lon}', lon);
}

// Returns current weather and today + 7 days forecast
async function getWeatherData(lat, lon) {
  const weatherURL = createWeatherURL(lat, lon);
  const data = await fetch(weatherURL).then((res) => res.json());

  console.log(data);
}

// returns up to 5 cities that match the search input
async function getCityData(location) {
  const geoURL = createGeoURL(location);
  return fetch(geoURL).then((res) => res.json());
}

function chooseLocation(locations) {
  let city;

  if (locations.length === 1) {
    // parentheses needed for array destructring into already-declared variable
    [city] = locations;
  } else {
    const citiesText = locations
      .map(
        (location, i) =>
          `${i + 1}: ${location.name}, ${
            location.state ? `${location.state}, ` : ''
          }${location.country}`
      )
      .join('\n');

    while (!city) {
      const userInput = prompt(`${citiesText}\nSelect a city by number (1-5):`);
      city = locations[parseInt(userInput, 10) - 1];
    }
  }

  getWeatherData(city.lat, city.lon);
}

function searchForLocation() {
  const location = prompt('Search for a city: "city,state,country"');
  getCityData(location).then(chooseLocation);
}

searchForLocation();
