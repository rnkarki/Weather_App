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
    
    //Determine if it is day or night
    const weatherIcon = getWeatherStaticIcon(item.weather[0].id);

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
    const currentWeather = data.list[0];  // Assuming the first item in the list is current weather
    const temperature = Math.floor(currentWeather.main.temp);
    const description = currentWeather.weather[0].description;

    // Add these lines to determine if it's day or night
    const isDaytime = (currentTime, sunrise, sunset) => {
      return currentTime >= sunrise && currentTime <= sunset;
    };

    const currentTime = new Date(currentWeather.dt * 1000);
    const sunrise = new Date(data.city.sunrise * 1000);
    const sunset = new Date(data.city.sunset * 1000);
    const isDay = isDaytime(currentTime, sunrise, sunset);

    // Now use isDay when getting the weather icon
    const weatherIcon = getWeatherAnimatedIcon(currentWeather.weather[0].id, isDay);

    // Update current weather display
    currentWeatherDiv.querySelector(".temperature").innerHTML = `${temperature}<span>°C`;
    currentWeatherDiv.querySelector(".description").innerText = description;
    currentWeatherDiv.querySelector(".weather-icon").src = `animated-icons/${weatherIcon}`;

    // Display hourly forecast
    displayHourlyForcast(data.list, data.city.sunrise, data.city.sunset);

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
