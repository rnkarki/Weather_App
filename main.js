const searchInput = document.querySelector(".search-input");
const locationButton = document.querySelector(".location-button");
const currentWeatherDiv = document.querySelector(".current-weather");
const hourlyWeatherDiv = document.querySelector('.hourly-weather .weather-list');
const API_KEY = "7ce3e3db79949b7b015b0adffc590394";

const getWeatherIcon = (weatherId) => {
  if (weatherId >= 200 && weatherId < 232) {
    return weatherId >= 210 && weatherId <= 221 ? "thunder" : "thunder_rain";
  }
  if (weatherId >= 300 && weatherId < 504) return "rain";
  if (weatherId >= 504 && weatherId < 600) return "moderate_heavy_rain";
  if (weatherId >= 600 && weatherId < 700) return "snow";
  if (weatherId >= 700 && weatherId < 800) return "mist";
  if (weatherId === 800) return "clear";
  if (weatherId > 800) return "clouds";
  return "no-result";
};

const displayHourlyForcast = (hourlyData) => {
  const currentTime = new Date().setMinutes(0, 0, 0);
  const next24Hours = currentTime + 24 * 60 * 60 * 1000;

  const next24HoursData = hourlyData.filter(({ dt }) => {
    const forecastTime = dt * 1000;
    return forecastTime >= currentTime && forecastTime <= next24Hours;
  });

  hourlyWeatherDiv.innerHTML = next24HoursData.map((item) => {
    const temperature = Math.floor(item.main.temp);
    const date = new Date(item.dt * 1000);
    
    // Format time without AM/PM
    const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    
    const weatherIcon = getWeatherIcon(item.weather[0].id);

    return `<li class="weather-item">
      <p class="time">${formattedTime}</p>
      <img src="icons/${weatherIcon}.svg" class="weather-icon">
      <p class="temperature">${temperature}°C</p>
    </li>`;
  }).join("");
};

const getWeatherDetails = async (API_URL) => {
  window.innerWidth <= 768 && searchInput.blur();
  document.body.classList.remove("show-no-results");

  try {
    const response = await fetch(API_URL);
    const data = await response.json();

    // Extract current weather details
    const currentWeather = data.list[0];
    const temperature = Math.floor(currentWeather.main.temp);
    const description = currentWeather.weather[0].description;
    const weatherIcon = getWeatherIcon(currentWeather.weather[0].id);

    // Update current weather display
    currentWeatherDiv.querySelector(".temperature").innerHTML = `${temperature}<span>°C`;
    currentWeatherDiv.querySelector(".description").innerText = description;
    currentWeatherDiv.querySelector(".weather-icon").src = `icons/${weatherIcon}.svg`;

    // Display hourly forecast
    displayHourlyForcast(data.list);

    searchInput.value = data.city.name;
  } catch (error) {
    document.body.classList.add("show-no-results");
  }
};

const setWeatherRequest = (cityname) => {
  const API_URL = `https://api.openweathermap.org/data/2.5/forecast?q=${cityname}&appid=${API_KEY}&units=metric`;
  getWeatherDetails(API_URL);
};

searchInput.addEventListener("keyup", (e) => {
  const cityname = searchInput.value.trim();
  if (e.key == "Enter" && cityname) {
    setWeatherRequest(cityname);
  }
});

locationButton.addEventListener("click", () => {
  navigator.geolocation.getCurrentPosition(position => {
    const { latitude, longitude } = position.coords;
    const API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`;
    getWeatherDetails(API_URL);
  }, error => {
    alert("Location access denied. Please enable your location permission.");
  });
});
