const searchInput = document.querySelector(".search-input");
const locationButton = document.querySelector(".location-button");
const currentWeatherDiv = document.querySelector(".current-weather");
const hourlyWeatherDiv = document.querySelector('.hourly-weather .weather-list')
const API_KEY = "7e562a7299e74d58af9164521241510";

//Weather codes for the icons
const weatherCodes = {
  clear: [1000],
  clouds: [1003, 1006, 1009],
  mist: [1030, 1135, 1147],
  rain: [
    1063, 1150, 1153, 1168, 1171, 1180, 1183, 1198, 1201, 1240, 1243, 1246,
    1273, 1276,
  ],
  moderate_heavy_rain: [1186, 1189, 1192, 1195, 1243, 1246],
  snow: [
    1066, 1069, 1072, 1114, 1117, 1204, 1207, 1210, 1213, 1216, 1219, 1222,
    1225, 1237, 1249, 1252, 1255, 1258, 1261, 1264, 1279, 1282,
  ],
  thunder: [1087, 1279, 1282],
  thunder_rain: [1273, 1276],
};

const displayHourlyForcast = (hourlyData) => {
  const currentTime = new Date().setMinutes(0, 0, 0);
  const next24Hours = currentTime + 24 * 60 * 60 * 1000;

  //Filter the hourly data to only include the next 24 hours
  const next24HoursData = hourlyData.filter(({ time }) => {
    const forecastTime = new Date(time).getTime();
    return forecastTime >= currentTime && forecastTime <= next24Hours;
  });

  hourlyWeatherDiv.innerHTML = next24HoursData.map((item) => {
    const temperature = Math.floor(item.temp_c);
    const date = new Date(item.time);
    const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const weatherIcon = Object.keys(weatherCodes).find((icon) =>
      weatherCodes[icon].includes(item.condition.code)
  );

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
    //Fetching the data
    const response = await fetch(API_URL);
    const data = await response.json();
    // console.log(data)

    //Extracting current weather details
    const temperature = Math.floor(data.current.temp_c);
    const description = data.current.condition.text;
    const weatherIcon = Object.keys(weatherCodes).find((icon) =>
      weatherCodes[icon].includes(data.current.condition.code)
    );

    //Updating the weather details
    currentWeatherDiv.querySelector(
      ".temperature"
    ).innerHTML = `${temperature}<span>°C`;
    currentWeatherDiv.querySelector(".description").innerText = description;
    currentWeatherDiv.querySelector(
      ".weather-icon"
    ).src = `icons/${weatherIcon}.svg`;

    //Combining hourly data from today and tomorrow
    const combinedHourlyData = [
      ...data.forecast.forecastday[0].hour,
      ...data.forecast.forecastday[1].hour,
    ];
    displayHourlyForcast(combinedHourlyData);

    searchInput.value = data.location.name;
  } catch (error) {
    document.body.classList.add("show-no-results");
  }
};

//Set up weather request for specific city
const setWeatherRequest = (cityname) =>{
  const API_URL = `http://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${cityname}&days=2`;
  getWeatherDetails(API_URL);
}

//Handling user input in the search box
searchInput.addEventListener("keyup", (e) => {
  const cityname = searchInput.value.trim();
  if (e.key == "Enter" && cityname) {
    setWeatherRequest(cityname)
  }
});

//Get user's coordinate
locationButton.addEventListener("click", () =>{
  navigator.geolocation.getCurrentPosition(position =>{
    const { latitude, longitude} = position.coords;
    const API_URL = `http://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${latitude},${longitude}&days=2`;
    getWeatherDetails(API_URL);

  }, error =>{
    alert("Location access denied please enable your location permission")
  });
})
