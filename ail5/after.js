const WeatherApp = class {
  constructor(apiKey, resultsBlockSelector) {
    this.apiKey = apiKey;
    this.currentWeatherLink =
      "https://api.openweathermap.org/data/2.5/weather?q={query}&appid={apiKey}&units=metric&lang=pl";
    this.forecastLink =
      "https://api.openweathermap.org/data/2.5/forecast?q={query}&appid={apiKey}&units=metric&lang=pl";
    this.iconLink = "https://openweathermap.org/img/wn/{iconName}@2x.png";

    this.currentWeatherLink = this.currentWeatherLink.replace(
      "{apiKey}",
      this.apiKey
    );
    this.forecastLink = this.forecastLink.replace("{apiKey}", this.apiKey);

    this.currentWeather = undefined;
    this.forecast = undefined;

    this.resultsBlock = document.querySelector(resultsBlockSelector);
  }

  getCurrentWeather(query) {
    let url = this.currentWeatherLink.replace("{query}", query);
    let req = new XMLHttpRequest();
    req.open("GET", url, true);
    req.addEventListener("load", () => {
      this.currentWeather = JSON.parse(req.responseText);
      console.log(this.currentWeather);
      this.drawWeather();
    });
    req.send();
  }

  getForecast(query) {
    let url = this.forecastLink.replace("{query}", query);
    fetch(url)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        console.log(data);
        this.forecast = data.list;
        this.drawWeather();
      });
  }

  getWeather(query) {
    this.getCurrentWeather(query);
    this.getForecast(query);
  }
  createTextNode(text) {
    const node = document.createElement("h3");
    node.innerHTML = text;
    return node;
  }
  drawWeather() {
    // clear previous blocks
    this.resultsBlock.innerHTML = "";

    // add current weather block
    if (this.currentWeather) {
      const date = new Date(this.currentWeather.dt * 1000);
      const dateTimeString = `${date.toLocaleDateString(
        "pl-PL"
      )} ${date.toLocaleTimeString("pl-PL")}`;

      const temperature = this.currentWeather.main.temp;
      const feelsLikeTemperature = this.currentWeather.main.feels_like;
      const iconName = this.currentWeather.weather[0].icon;
      const description = this.currentWeather.weather[0].description;

      const weatherBlock = this.createWeatherBlock(
        dateTimeString,
        temperature,
        feelsLikeTemperature,
        iconName,
        description
      );
      const currentWrapper = document.createElement("div");
      currentWrapper.classList.add("current-wrapper");
      const title = this.createTextNode("Current Weather");
      currentWrapper.appendChild(title);
      currentWrapper.appendChild(weatherBlock);
      this.resultsBlock.appendChild(currentWrapper);
    }

    // add forecast weather blocks
    if (this.forecast && this.forecast.length > 0) {
      const groupedForecast = this.groupByDate();
      const forecastWrapper = document.createElement("div");
      forecastWrapper.classList.add("forecast-wrapper");
      for (let i = 0; i < groupedForecast.length; i++) {
        const day = new Date(
          groupedForecast[i][0].dt * 1000
        ).toLocaleDateString("pl-PL");
        const dayTitle = this.createTextNode(day);
        const dayWrapper = document.createElement("div");
        dayWrapper.classList.add("day-wrapper");
        dayWrapper.appendChild(dayTitle);
        const dayGroup = groupedForecast[i];
        for (let x = 0; x < dayGroup.length; x++) {
          let weather = dayGroup[x];
          const date = new Date(weather.dt * 1000);
          const dateTimeString = `${date.toLocaleDateString(
            "pl-PL"
          )} ${date.toLocaleTimeString("pl-PL")}`;

          const temperature = weather.main.temp;
          const feelsLikeTemperature = weather.main.feels_like;
          const iconName = weather.weather[0].icon;
          const description = weather.weather[0].description;
          const weatherBlock = this.createWeatherBlock(
            dateTimeString,
            temperature,
            feelsLikeTemperature,
            iconName,
            description
          );
          dayWrapper.appendChild(weatherBlock);
        }
        forecastWrapper.appendChild(dayWrapper);
      }
      this.resultsBlock.appendChild(forecastWrapper);
    }
  }
  groupByDate() {
    const ref = {};
    const res = this.forecast.reduce(function (arr1, o) {
      const date = new Date(o.dt * 1000);
      const d = date.toLocaleDateString("pl-PL");
      if (!(d in ref)) {
        ref[d] = arr1.length;
        arr1.push([]);
      }
      arr1[ref[d]].push(o);
      return arr1;
    }, []);

    return res;
  }

  createWeatherBlock(
    dateString,
    temperature,
    feelsLikeTemperature,
    iconName,
    description
  ) {
    let weatherBlock = document.createElement("div");
    weatherBlock.className = "weather-block";

    let dateBlock = document.createElement("div");
    dateBlock.className = "weather-date";
    dateBlock.innerText = dateString;
    weatherBlock.appendChild(dateBlock);

    let temperatureBlock = document.createElement("div");
    temperatureBlock.className = "weather-temperature";
    temperatureBlock.innerHTML = `${temperature} &deg;C`;
    weatherBlock.appendChild(temperatureBlock);

    let feelsLikeBlock = document.createElement("div");
    feelsLikeBlock.className = "weather-temperature-feels-like";
    feelsLikeBlock.innerHTML = `Odczuwalna: ${feelsLikeTemperature} &deg;C`;
    weatherBlock.appendChild(feelsLikeBlock);

    let weatherIcon = document.createElement("img");
    weatherIcon.className = "weather-icon";
    weatherIcon.src = this.iconLink.replace("{iconName}", iconName);
    weatherBlock.appendChild(weatherIcon);

    let weatherDescription = document.createElement("div");
    weatherDescription.className = "weather-description";
    weatherDescription.innerText = description;
    weatherBlock.appendChild(weatherDescription);

    return weatherBlock;
  }
};

document.weatherApp = new WeatherApp(
  "7ded80d91f2b280ec979100cc8bbba94",
  "#weather-results-container"
);

document.querySelector("#checkButton").addEventListener("click", function () {
  const query = document.querySelector("#locationInput").value;
  document.weatherApp.getWeather(query);
});
