/* 
  TODO
    Get all dynamic UI elements
      conditions
      current time
    Toggle Celcius / Fahrenheit via buttons
    Update background image based on current weather condition
    Create reference objects to weather condition svgs */

export default class UI {
  #dayNameElements;

  #dateElements;

  #tempElements;

  #locationElements;

  #weatherData;

  constructor() {
    this.gatherTempElements();
    this.gatherLocationElements();
    this.gatherDayNameElements();
    this.gatherDateElements();
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

  gatherDayNameElements() {
    this.#dayNameElements = Array.from(
      document.querySelectorAll('#daily .day .name')
    );
  }

  gatherDateElements() {
    this.#dateElements = Array.from(document.querySelectorAll('#date, .date'));
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
    this.#refreshDayNames();
    this.#refreshDates();
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

  #refreshDayNames() {
    this.#dayNameElements.forEach((day, i) => {
      day.textContent = new Intl.DateTimeFormat('en-US', {
        weekday: 'narrow',
      }).format(this.#weatherData.daily[i + 1].date);
    });
  }

  #refreshDates() {
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };

    this.#dateElements.forEach((date) => {
      date.textContent = new Intl.DateTimeFormat('en-US', options).format(
        this.#weatherData.current.date
      );
    });
  }

  static #titleCase(str) {
    return str
      .toLowerCase()
      .split(' ')
      .map((word) => word[0].toUpperCase() + word.slice(1))
      .join(' ');
  }
}
