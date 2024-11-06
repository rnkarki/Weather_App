// Function to display hourly forecast
const displayHourlyForcast = (hourlyData) => {
  // Get current time and calculate 24 hours from now
  const currentTime = new Date().setMinutes(0, 0, 0);
  const next24Hours = currentTime + 24 * 60 * 60 * 1000;

  // Filter data to only include forecasts for the next 24 hours
  const next24HoursData = hourlyData.filter(({ dt }) => {
    const forecastTime = dt * 1000;
    return forecastTime >= currentTime && forecastTime <= next24Hours;
  });

  // Generate HTML for each forecast item
  //Mapping to create a new array
  hourlyWeatherDiv.innerHTML = next24HoursData.map((item) => {
    const temperature = Math.floor(item.main.temp);
    //Converting to milisecond 
    const date = new Date(item.dt * 1000);
    
    // Format time without AM/PM
    const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    
    // Get weather icon
    const weatherIcon = getWeatherStaticIcon(item.weather[0].id);

    // Return HTML string for each forecast item
    return `<li class="weather-item">
      <p class="time">${formattedTime}</p>
      <img src="icons/${weatherIcon}.svg" class="weather-icon">
      <p class="temperature">${temperature}°C</p>
    </li>`;
  }).join("");
};

// Function to fetch and display weather details
const getWeatherDetails = async (API_URL) => {
  // Hide mobile keyboard and reset UI
  window.innerWidth <= 768 && searchInput.blur();
  document.body.classList.remove("show-no-results");

  try {
    // Fetch weather data from API
    const response = await fetch(API_URL);
    const data = await response.json();

    // Extract current weather details
    const currentWeather = data.list[0];
    const temperature = Math.floor(currentWeather.main.temp);
    const description = currentWeather.weather[0].description;

    // Save the city to recent locations
    saveToRecentLocations(data.city.name);
    // Determine if it's day or night
    const isDaytime = (currentTime, sunrise, sunset) => {
      return currentTime >= sunrise && currentTime <= sunset;
    };

    const currentTime = new Date(currentWeather.dt * 1000);
    const sunrise = new Date(data.city.sunrise * 1000);
    const sunset = new Date(data.city.sunset * 1000);
    const isDay = isDaytime(currentTime, sunrise, sunset);

    // Get appropriate weather icon
    const weatherIcon = getWeatherAnimatedIcon(currentWeather.weather[0].id, isDay);

    // Update current weather display
    currentWeatherDiv.querySelector(".temperature").innerHTML = `${temperature}<span>°C`;
    currentWeatherDiv.querySelector(".description").innerText = description;
    currentWeatherDiv.querySelector(".weather-icon").src = `animated-icons/${weatherIcon}`;

    // Display hourly forecast
    displayHourlyForcast(data.list, data.city.sunrise, data.city.sunset);

    // Update search input with city name
    searchInput.value = data.city.name;
  } catch (error) {
    // Show error message if data fetch fails
    document.body.classList.add("show-no-results");
  }
};

// Function to initiate weather request for a city
const setWeatherRequest = (cityname) => {
  const API_URL = `https://api.openweathermap.org/data/2.5/forecast?q=${cityname}&appid=${API_KEY}&units=metric`;
  getWeatherDetails(API_URL);
};

// Function to display recent locations
const displayRecentLocations = () => {
  const recentLocations = JSON.parse(localStorage.getItem("recentLocations")) || [];
  recentList.innerHTML = recentLocations.map(city => 
    `<li class="recent-item">${city}</li>`
  ).join("");

  // Add click event listeners to recent location items
  document.querySelectorAll(".recent-item").forEach(item => {
    item.addEventListener("click", () => setWeatherRequest(item.textContent));
  });
};

// Function to save a location to recent locations
const saveToRecentLocations = (cityName) => {
  let recentLocations = JSON.parse(localStorage.getItem("recentLocations")) || [];

  // Remove the city if it already exists in the list
  recentLocations = recentLocations.filter(city => city.toLowerCase() !== cityName.toLowerCase());

  // Add the new city to the beginning of the list
  recentLocations.unshift(cityName);

  // Keep only the most recent MAX_RECENT_LOCATIONS
  recentLocations = recentLocations.slice(0, MAX_RECENT_LOCATIONS);

  // Save to localStorage
  localStorage.setItem("recentLocations", JSON.stringify(recentLocations));

  // Update the UI
  displayRecentLocations();
};

const getCurrentLocationWeather = () => {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      const API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`;
      getWeatherDetails(API_URL);
    },
    (error) => {
      console.error("Geolocation error:", error);
      document.body.classList.add("show-no-results");
    }
  );
};

// Event listener for search input
searchInput.addEventListener("keyup", (e) => {
  const cityname = searchInput.value.trim();
  if (e.key == "Enter" && cityname) {
    setWeatherRequest(cityname);
  }
});

locationButton.addEventListener('click', getCurrentLocationWeather)
document.addEventListener("DOMContentLoaded", () => {
  displayRecentLocations();
  getCurrentLocationWeather();
});
