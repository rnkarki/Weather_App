const searchInput = document.querySelector(".search-input");
const locationButton = document.querySelector(".location-button");
const currentWeatherDiv = document.querySelector(".current-weather");
const hourlyWeatherDiv = document.querySelector('.hourly-weather .weather-list');
const API_KEY = "7ce3e3db79949b7b015b0adffc590394";
// Add these variables at the top of your main.js file
const recentList = document.querySelector(".recent-list");
const MAX_RECENT_LOCATIONS = 5;

//Main Dashboard
const getWeatherAnimatedIcon = (weatherId, isDay) => {
  // Thunderstorm
  if (weatherId >= 200 && weatherId < 232) {
    return "thunder.svg";
  }
  
  // Drizzle and Rain
  if (weatherId >= 300 && weatherId < 504) {
    return isDay ? "rainy-sun.svg" : "rainy.svg";
  }
  
  // Heavy Rain
  if (weatherId >= 504 && weatherId < 600) {
    return "rainy.svg";
  }
  
  // Snow
  if (weatherId >= 600 && weatherId < 700) {
    return isDay ? "snowy-sun.svg" : "snowy.svg";
  }
  
  // Atmosphere (mist, fog, etc.)
  if (weatherId >= 700 && weatherId < 800) {
    return "mist.svg";
  }
  
  // Clear sky
  if (weatherId === 800) {
    return isDay ? "day.svg" : "night.svg";
  }
  
  // Clouds
  if (weatherId > 800) {
    if (weatherId === 801 || weatherId === 802) { // Few clouds or scattered clouds
      return isDay ? "cloudy-day.svg" : "cloudy-night.svg";
    } else { // Broken clouds or overcast
      return "cloudy.svg";
    }
  }
  
  // Default case
  return "no-result.svg";
};

const getWeatherStaticIcon = (weatherId) => {
    if (weatherId >= 200 && weatherId < 300) return "thunder";
    if (weatherId >= 300 && weatherId < 500) return "rain";
    if (weatherId >= 500 && weatherId < 600) return "rain";
    if (weatherId >= 600 && weatherId < 700) return "snow";
    if (weatherId >= 700 && weatherId < 800) return "mist";
    if (weatherId === 800) return "clear";
    if (weatherId > 800) return "clouds";
    return "clear";
  };
