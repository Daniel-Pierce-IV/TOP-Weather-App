/* 
  TODO
    Update background image based on current weather condition */

import conditions from './conditions.js';

export default class UI {
  #isCelsius = false;

  #unit = 'f';

  #unitButtons;

  #dayNameElements;

  #dateElements;

  #timeElement;

  #tempElements;

  #locationElements;

  #conditionElements;

  #weatherData;

  constructor() {
    this.gatherTempElements();
    this.gatherLocationElements();
    this.gatherConditionElements();
    this.gatherDayNameElements();
    this.gatherDateElements();
    this.gatherTimeElement();
    this.setupUnitButtons();
  }

  set weatherData(value) {
    this.#weatherData = value;
    this.#refresh();
  }

  gatherTempElements() {
    this.#tempElements = {
      current: document.querySelector('.current .temp'),
      today: {
        high: document.querySelector('#hourly .weather .high'),
        low: document.querySelector('#hourly .weather .low'),
      },
      daily: Array.from(document.querySelectorAll('#daily .day')).map(
        (day) => ({
          high: day.querySelector('.high'),
          low: day.querySelector('.low'),
        })
      ),
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

  gatherTimeElement() {
    this.#timeElement = document.querySelector('.current .time');
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

  gatherConditionElements() {
    this.#conditionElements = {
      current: document.querySelector('.current .condition'),
      today: document.querySelector('#hourly .condition'),
      daily: Array.from(document.querySelectorAll('#daily .day .condition')),
    };
  }

  setupUnitButtons() {
    this.#unitButtons = {
      f: document.querySelector('#fahrenheit'),
      c: document.querySelector('#celsius'),
    };

    this.#unitButtons.f.addEventListener(
      'click',
      this.#toggleTempsUnit.bind(this, this.#unitButtons.f)
    );

    this.#unitButtons.c.addEventListener(
      'click',
      this.#toggleTempsUnit.bind(this, this.#unitButtons.c)
    );
  }

  #refresh() {
    this.#refreshTemps();
    this.#refreshLocation();
    this.#refreshConditions();
    this.#refreshDayNames();
    this.#refreshDates();
    this.#refreshTime();
  }

  #refreshTemps() {
    this.#tempElements.current.textContent =
      this.#weatherData.current[this.#unit];

    this.#tempElements.today.high.textContent =
      this.#weatherData.today[this.#unit].high;

    this.#tempElements.today.low.textContent =
      this.#weatherData.today[this.#unit].low;

    this.#tempElements.daily.forEach((day, i) => {
      day.high.textContent = this.#weatherData.daily[i][this.#unit].high;
      day.low.textContent = this.#weatherData.daily[i][this.#unit].low;
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

  #refreshConditions() {
    const currentClasses = 'paper-shadow-svg w-32 h-32';
    const todayClasses = 'w-10 h-10';
    const dailyClasses = 'w-3/4';

    this.#conditionElements.current.innerHTML = conditions.fromCode(
      this.#weatherData.current.code,
      currentClasses
    );

    this.#conditionElements.today.innerHTML = conditions.fromCode(
      this.#weatherData.today.weather.code,
      todayClasses
    );

    this.#conditionElements.daily.forEach((condition, i) => {
      condition.innerHTML = conditions.fromCode(
        this.#weatherData.daily[i].weather.code,
        dailyClasses
      );
    });
  }

  #refreshDayNames() {
    this.#dayNameElements.forEach((day, i) => {
      day.textContent = new Intl.DateTimeFormat('en-US', {
        weekday: 'narrow',
      }).format(this.#weatherData.daily[i].date);
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

  #refreshTime() {
    const options = {
      hour: 'numeric',
      minute: 'numeric',
    };

    this.#timeElement.textContent = new Intl.DateTimeFormat(
      'en-US',
      options
    ).format(this.#weatherData.current.date);
  }

  #toggleTempsUnit(clickedButton) {
    if (clickedButton !== this.#unitButtons[this.#unit]) {
      this.#isCelsius = !this.#isCelsius;

      if (this.#isCelsius) {
        this.#unit = 'c';
        this.#unitButtons.f.classList.remove('active');
        this.#unitButtons.c.classList.add('active');
      } else {
        this.#unit = 'f';
        this.#unitButtons.f.classList.add('active');
        this.#unitButtons.c.classList.remove('active');
      }

      this.#refreshTemps();
    }
  }

  static #titleCase(str) {
    return str
      .toLowerCase()
      .split(' ')
      .map((word) => word[0].toUpperCase() + word.slice(1))
      .join(' ');
  }
}
