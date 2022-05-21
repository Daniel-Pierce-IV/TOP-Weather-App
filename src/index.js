import UI from './ui';

const KELVIN_CONSTANT = 273.15;

// I'm aware this is bad practice (this is a practice project)
const apiKey = '295e9bb0e250da8fe8e1ac30858d5e24';
const apiWeather = `https://api.openweathermap.org/data/2.5/onecall?lat={lat}&lon={lon}&exclude=minutely,hourly,alerts&appid=${apiKey}`;
const apiGeocoding = `http://api.openweathermap.org/geo/1.0/direct?q={query}&limit=5&appid=${apiKey}`;
// const apiReverseGeo = 'https://geocode.xyz/{lat},{lon}?json=1';

const ui = new UI();
let cityCache;

function createGeoURL(query) {
  return apiGeocoding.replace('{query}', query);
}

// function createReverseURL(lat, lon) {
//   return apiReverseGeo.replace('{lat}', lat).replace('{lon}', lon);
// }

function createWeatherURL(lat, lon) {
  return apiWeather.replace('{lat}', lat).replace('{lon}', lon);
}

// function locationFactory(lat, lon, name, country, state = undefined) {
//   return { name, state, country, lat, lon };
// }

function kelvinToCelcius(kelvin) {
  return Math.round(kelvin - KELVIN_CONSTANT);
}

function kelvinToFahrenheit(kelvin) {
  return Math.round(((kelvin - KELVIN_CONSTANT) * 9) / 5 + 32);
}

// async function getCity(lat, lon) {
//   const reverseURL = createReverseURL(lat, lon);
//   const response = await fetch(reverseURL);
//   return response.json().then((data) => ({
//     name: data.city,
//     state: data.statename,
//     country: data.country,
//   }));
// }

// returns up to 5 cities that match the search input
async function getCities(query) {
  const geoURL = createGeoURL(query);
  const response = await fetch(geoURL);
  cityCache = await response.json();
  return cityCache;
}

async function searchForCities(searchValue) {
  return getCities(searchValue);
}

// async function getLocationViaSearch() {
//   const cities = await searchForCities();
//   return chooseCity(cities);
// }

// function getBrowserCoords() {
//   return new Promise((resolve, reject) => {
//     navigator.geolocation.getCurrentPosition(
//       (data) => resolve(data.coords),
//       (error) => reject(error)
//     );
//   });
// }

// async function getLocationViaBrowser() {
//   const { latitude, longitude } = await getBrowserCoords();
//   const city = await getCity(latitude, longitude);

//   return locationFactory(
//     latitude,
//     longitude,
//     city.name,
//     city.country,
//     city.state
//   );
// }

// Returns current weather and today + 7 days forecast
async function getWeatherData(lat, lon) {
  const weatherURL = createWeatherURL(lat, lon);
  const response = await fetch(weatherURL);
  return response.json();
}

function processWeatherData(rawData, location) {
  const data = {
    location,
    current: {
      date: new Date(rawData.current.dt * 1000),
      f: kelvinToFahrenheit(rawData.current.temp),
      c: kelvinToCelcius(rawData.current.temp),
      code: rawData.current.weather[0].id,
    },
    daily: rawData.daily.map((day) => ({
      // dt must be converted to milliseconds
      date: new Date(day.dt * 1000),
      f: {
        high: kelvinToFahrenheit(day.temp.max),
        low: kelvinToFahrenheit(day.temp.min),
      },
      c: {
        high: kelvinToCelcius(day.temp.max),
        low: kelvinToCelcius(day.temp.min),
      },
      weather: {
        title: day.weather[0].main,
        code: day.weather[0].id,
      },
    })),
  };

  data.today = data.daily[0];
  data.daily = data.daily.slice(1);

  return data;
}

function condenseCities(cities) {
  const { name, state, country } = cities[0];

  const allSameCity = cities.every(
    (city) =>
      city.name === name && city.state === state && city.country === country
  );

  if (allSameCity) {
    return cities[0];
  }

  throw Error('More than one city returned!');
}

async function getWeather(city) {
  const rawData = await getWeatherData(city.lat, city.lon);
  return processWeatherData(rawData, city);
}

function cityToString(city) {
  return `${city.name}, ${city.state ? `${city.state}, ` : ''}${city.country}`;
}

ui.subscribeToSearchEvent(async (inputValue) => {
  const cities = await searchForCities(inputValue);

  if (cities.length === 1) {
    ui.weatherData = await getWeather(cities[0]);
  } else {
    const cityStrings = cities.map((city) => cityToString(city));
    ui.updateSearchChoices(cityStrings);
  }
});

ui.subscribeToSearchChoice(async (cityString) => {
  const cities = cityCache.filter((city) => cityToString(city) === cityString);
  const city = condenseCities(cities);
  ui.weatherData = await getWeather(city);
});
