import {
  Chart,
  CategoryScale,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';
import conditions from './conditions';

Chart.register(
  CategoryScale,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip
);

Chart.defaults.font.size = 16;
Chart.defaults.font.family =
  'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"';
Chart.defaults.color = 'white';

export default class UI {
  #isCelsius = false;

  #unit = 'f';

  #unitButtons;

  #chart;

  #chartElement;

  #tooltipElement;

  #dayNameElements;

  #dateElements;

  #timeElement;

  #tempElements;

  #locationElements;

  #conditionElements;

  #searchElements;

  #searchEventCallbacks = [];

  #searchChoiceCallbacks = [];

  #weatherData;

  constructor() {
    document.body.classList.add('loading');
    this.gatherTempElements();
    this.gatherLocationElements();
    this.gatherConditionElements();
    this.gatherDayNameElements();
    this.gatherDateElements();
    this.gatherTimeElement();
    this.gatherSearchElements();
    this.gatherChartElement();
    this.setupUnitButtons();
    this.setupSearch();
  }

  set weatherData(value) {
    this.#weatherData = value;
    this.#refresh();
    document.body.classList.remove('loading');
  }

  updateSearchChoices(choices) {
    choices.forEach((choice) => {
      this.#searchElements.list.append(this.#createChoiceElement(choice));
    });

    this.#hideError();
    this.#searchElements.dropdown.classList.remove('hidden');
  }

  showError() {
    this.#searchElements.error.classList.remove('hidden');
  }

  #hideError() {
    this.#searchElements.error.classList.add('hidden');
  }

  #createChoiceElement(choice) {
    const element = document.createElement('li');
    element.classList =
      'py-2 px-2 cursor-pointer hover:bg-[rgba(255,255,255,0.1)]';
    element.textContent = choice;

    element.addEventListener('click', () => {
      this.#notifySearchChoice(choice);
      this.#resetSearch();
    });

    return element;
  }

  #resetSearch() {
    this.#searchElements.dropdown.classList.add('hidden');
    this.#searchElements.list.innerHTML = '';
  }

  subscribeToSearchEvent(callback) {
    this.#searchEventCallbacks.push(callback);
  }

  subscribeToSearchChoice(callback) {
    this.#searchChoiceCallbacks.push(callback);
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

  gatherChartElement() {
    this.#chartElement = document.querySelector('#chart');
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

  gatherSearchElements() {
    this.#searchElements = {
      input: document.querySelector('#search'),
      form: document.querySelector('.search-group form'),
      dropdown: document.querySelector('.search-group .dropdown'),
      list: document.querySelector('#cities'),
      error: document.querySelector('.search-group .error'),
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

  setupSearch() {
    this.#searchElements.form.addEventListener('submit', (event) => {
      event.preventDefault();
      this.#notifySearchEvent(this.#searchElements.input.value);
    });
  }

  #notifySearchEvent(data) {
    this.#searchEventCallbacks.forEach((callback) => callback(data));
  }

  #notifySearchChoice(data) {
    this.#searchChoiceCallbacks.forEach((callback) => callback(data));
  }

  #refresh() {
    this.#hideError();
    this.#refreshTemps();
    this.#refreshLocation();
    this.#refreshConditions();
    this.#refreshDayNames();
    this.#refreshDates();
    this.#refreshTime();
    this.#refreshChart();
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
    const dailyClasses = 'w-[max(75%,30px)]';

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

  #refreshChart() {
    if (!this.#chart) {
      this.#chart = new Chart(this.#chartElement, {
        type: 'line',
        data: this.#buildChartData(),
        options: this.#buildChartOptions(),
      });
    } else {
      this.#chart.data.labels = this.#weatherToHourlyLabels();
      this.#chart.data.datasets[0].data = this.#weatherToHourlyTemps();
      this.#chart.update();
    }
  }

  #weatherToHourlyLabels() {
    return this.#getFilteredHours().map((hour) =>
      new Intl.DateTimeFormat('en-US', { hour: 'numeric' }).format(hour.date)
    );
  }

  #weatherToHourlyTemps() {
    return this.#getFilteredHours().map((hour) => hour[this.#unit]);
  }

  #getFilteredHours() {
    return (
      this.#weatherData.hourly
        // Return the next 24 hours, starting at the top of the next hour
        .slice(1, 25)
        // Filter out every other hour
        .filter((e, i) => i % 2 === 0)
    );
  }

  #buildChartData() {
    return {
      labels: this.#weatherToHourlyLabels(),
      datasets: [
        {
          data: this.#weatherToHourlyTemps(),
          borderColor: 'white',
          borderCapStyle: 'round',
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 6,
          hoverRadius: 8,
          pointBorderWidth: 1,
          pointHoverBackgroundColor: 'white',
        },
      ],
    };
  }

  #buildChartOptions() {
    return {
      scales: {
        yAxis: {
          display: false,
        },
        xAxis: {
          display: false,
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: false,
          external: this.#tooltipHandler.bind(this),
        },
      },
    };
  }

  #createTooltipElement() {
    this.#tooltipElement = document.createElement('div');
    this.#tooltipElement.id = 'tooltip';
    this.#tooltipElement.classList = 'flex flex-col items-center';

    const time = document.createElement('span');
    time.classList = 'text-base';

    const temp = document.createElement('span');
    temp.classList = 'temp';

    this.#tooltipElement.time = time;
    this.#tooltipElement.temp = temp;

    this.#tooltipElement.append(time);
    this.#tooltipElement.append(temp);

    document.body.appendChild(this.#tooltipElement);
  }

  #tooltipHandler(context) {
    // Create element on first render
    if (!this.#tooltipElement) {
      this.#createTooltipElement();
    }

    // Hide if no tooltip
    if (context.tooltip.opacity === 0) {
      this.#tooltipElement.style.display = 'none';
    } else {
      this.#tooltipElement.style.display = null;
    }

    // Set text
    const pointData = context.tooltip.dataPoints[0];
    this.#tooltipElement.time.textContent = pointData.label;
    this.#tooltipElement.temp.textContent = pointData.raw;

    // Handle positioning
    const position = context.chart.canvas.getBoundingClientRect();
    const tooltipMargin = 15;

    this.#tooltipElement.style.left = `${
      position.left +
      window.pageXOffset +
      context.tooltip.caretX -
      this.#tooltipElement.clientWidth / 2
    }px`;

    this.#tooltipElement.style.top = `${
      position.top +
      window.pageYOffset +
      context.tooltip.caretY -
      this.#tooltipElement.clientHeight -
      tooltipMargin
    }px`;
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
      this.#refreshChart();
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
