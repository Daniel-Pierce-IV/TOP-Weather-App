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

  #weatherData;

  constructor() {
    this.gatherTempElements();
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

  #refresh() {
    this.#refreshTemps();
  }

  #refreshTemps() {
    this.#tempElements.current.textContent = this.#weatherData.current.f;

    this.#tempElements.daily.forEach((day, i) => {
      day.high.textContent = this.#weatherData.daily[i].f.high;
      day.low.textContent = this.#weatherData.daily[i].f.low;
    });
  }
}
