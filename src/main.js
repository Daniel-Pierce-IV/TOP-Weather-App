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
  const response = await fetch(weatherURL);
  return response.json();
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

async function getWeatherByLocation() {
  const locations = await searchForLocations();
  const location = chooseLocation(locations);
  const rawData = await getWeatherData(location.lat, location.lon);
  const processedData = processWeatherData(rawData, location.name);
  console.log(processedData);
}

getWeatherByLocation();
