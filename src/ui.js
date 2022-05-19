/* 
  TODO
    Get all dynamic UI elements
      conditions
      locations
      dates
      current time
      daily labels
    Toggle Celcius / Fahrenheit via buttons
    Update background image based on current weather condition
    Create reference objects to weather condition svgs */

export default class UI {
  #tempElements;

  #locationElements;

  #weatherData;

  constructor() {
    this.gatherTempElements();
    this.gatherLocationElements();
  }

  set weatherData(value) {
    this.#weatherData = value;
    this.#refresh();
  }

  gatherTempElements() {
    this.#tempElements = {
      current: document.querySelector('.current .temp'),
      daily: [
        {
          high: document.querySelector('#hourly .weather .high'),
          low: document.querySelector('#hourly .weather .low'),
        },
        ...Array.from(document.querySelectorAll('#daily .day')).map((day) => ({
          high: day.querySelector('.high'),
          low: day.querySelector('.low'),
        })),
      ],
    };
  }

  gatherLocationElements() {
    this.#locationElements = {
      main: document.querySelector('.current .city'),
      full: {
        city: document.querySelector('#city'),
        state: document.querySelector('#state'),
        country: document.querySelector('#country'),
      },
    };
  }

  #refresh() {
    this.#refreshTemps();
    this.#refreshLocation();
  }

  #refreshTemps() {
    this.#tempElements.current.textContent = this.#weatherData.current.f;

    this.#tempElements.daily.forEach((day, i) => {
      day.high.textContent = this.#weatherData.daily[i].f.high;
      day.low.textContent = this.#weatherData.daily[i].f.low;
    });
  }

  #refreshLocation() {
    this.#locationElements.main.textContent =
      this.#weatherData.location.name.toUpperCase();

    this.#locationElements.full.city.textContent = UI.#titleCase(
      this.#weatherData.location.name
    );

    this.#locationElements.full.state.textContent = UI.#titleCase(
      this.#weatherData.location.state
    );

    this.#locationElements.full.country.textContent = UI.#titleCase(
      this.#weatherData.location.country
    );
  }

  static #titleCase(str) {
    return str
      .toLowerCase()
      .split(' ')
      .map((word) => word[0].toUpperCase() + word.slice(1))
      .join(' ');
  }
}
