
function displayScreen() {
    let cityInput = document.getElementById("enter-city")
    let searchButton = document.getElementById("search-button")
    let clearHistory = document.getElementById("clear-history")
    let history = document.getElementById("history");
    let cityName = document.getElementById("city-name")
    let weatherDescription = document.getElementById("weather-description")
    let liveIcon = document.getElementById("live-icon");
    let currentTemperature = document.getElementById("temp");
    let windSpeed = document.getElementById("wind-speed");
    let humidity = document.getElementById("humidity");
    let uvIndex = document.getElementById("uv-index");
    
    let todayWeather = document.getElementById("today-weather")
    let fiveDayHeader = document.getElementById("fiveday-header");
    let searchHistory = JSON.parse(localStorage.getItem("search")) || []
    let weatherUrl = "https://api.openweathermap.org/data/2.5/weather?q=";
    let forecastUrl = "https://api.openweathermap.org/data/2.5/forecast?id=";
    let apiKey = "d6b4fd1efef85db37e2a3f3cd63bb491";


    const getWeather = (cityDisplayName) => {
        let queryURL = `${weatherUrl}${cityDisplayName}&appid=${apiKey}`;
        axios.get(queryURL)
            .then(function (response) {
                console.log(response)
                todayWeather.classList.remove("d-none");
                cityName.innerHTML = `${response.data.name} ${" (Current weather)"}`
                weatherDescription.innerHTML = response.data.weather[0].description;
                let weatherIcon = response.data.weather[0].icon;
                liveIcon.setAttribute("src", "https://openweathermap.org/img/wn/" + weatherIcon + "@2x.png");
                currentTemperature.innerHTML = `${"Temperature: "} ${Kelvin2Celsius(response.data.main.temp)} ${" &#176C"}`          
                windSpeed.innerHTML = `${"Wind Speed: "} ${mS2KmH(response.data.wind.speed)} ${" Km/h"}`
                humidity.innerHTML =  `${"Humidity: "} ${response.data.main.humidity} ${"%"}`
                let lat = response.data.coord.lat;
                let lon = response.data.coord.lon;
                let UVQueryURL = "https://api.openweathermap.org/data/2.5/uvi/forecast?lat=" + lat + "&lon=" + lon + "&appid=" + apiKey;
                axios.get(UVQueryURL)
                .then(function (response) {
                                        
                    let uvIndexVar = document.createElement("span");
                    if (response.data[0].value < 4 ) {
                       uvIndexVar.setAttribute("class", "badge badge-success");
                    }
                    else if (response.data[0].value < 8) {
                        uvIndexVar.setAttribute("class", "badge badge-warning");
                    } 
                    else {
                        uvIndexVar.setAttribute("class", "badge badge-danger");
                    }
                    console.log(response.data[0].value)
                    uvIndexVar.innerHTML = response.data[0].value;
                    uvIndex.innerHTML = "UV Index: ";
                    uvIndex.append(uvIndexVar);
                });
               
            
                let cityId = response.data.id;
                let forecastQueryURL = `${forecastUrl}${cityId}&appid=${apiKey}`;
                axios.get(forecastQueryURL)
                    .then(function (response) {
                        fiveDayHeader.classList.remove("d-none");
                        console.log(response);
                        var forecast5Days = document.querySelectorAll(".forecast");
                        for (i = 0; i < forecast5Days.length; i++) {
                            forecast5Days[i].innerHTML = "";
                            let forecastIndex = i * 8 + 4;
                            var forecastDate = new Date(response.data.list[forecastIndex].dt * 1000);
                            let forecastDay = forecastDate.getDate();
                            let forecastMonth = forecastDate.getMonth() + 1;
                            let forecastYear = forecastDate.getFullYear();
                            var forecastDate = document.createElement("p");
                            forecastDate.setAttribute("class", "mt-3 mb-0 forecast-date");
                            forecastDate.innerHTML = forecastDay + "/" + forecastMonth + "/" + forecastYear;
                            forecast5Days[i].append(forecastDate);

                            
                            let forecastWeather = document.createElement("img");
                            forecastWeather.setAttribute("src", "https://openweathermap.org/img/wn/" + response.data.list[forecastIndex].weather[0].icon + "@2x.png");
                            forecastWeather.setAttribute("alt", response.data.list[forecastIndex].weather[0].description);
                            forecast5Days[i].append(forecastWeather);
                                
                          
                            let forecastTemp = document.createElement("p");
                            forecastTemp.innerHTML = "Temp: " + Kelvin2Celsius(response.data.list[forecastIndex].main.temp) + " &#176C";
                            forecast5Days[i].append(forecastTemp);
                                
                            
                            let forecastHumidity = document.createElement("p");
                            forecastHumidity.innerHTML = "Humidity: " + response.data.list[forecastIndex].main.humidity + "%";
                            forecast5Days[i].append(forecastHumidity);
                        }
                    });
            });
    }

    
    function Kelvin2Celsius(K) {
        return Math.floor(K - 273.15);
    }

    
    function mS2KmH(M) {
        return Math.floor(M * 3.6);
    }
            
    
    searchButton.addEventListener("click", function () {
        var searchTerm = cityInput.value;
        getWeather(searchTerm);
        searchHistory.push(searchTerm);
        localStorage.setItem("search", JSON.stringify(searchHistory));
        renderSearchHistory();
        })
    
    
    clearHistory.addEventListener("click", function () {
        localStorage.clear();
        searchHistory = [];
        renderSearchHistory();
    })

    
    function renderSearchHistory() {
        history.innerHTML = "";
        for (let i = 0; i < searchHistory.length; i++) {
            var historyEntry = document.createElement("input");
            historyEntry.setAttribute("type", "text");
            historyEntry.setAttribute("readonly", true);
            historyEntry.setAttribute("class", "form-control d-block bg-dark text-light");
            historyEntry.setAttribute("value", searchHistory[i]);
            historyEntry.addEventListener("click", function () {
            getWeather(historyEntry.value);
            })
            history.append(historyEntry);
        }
    }
    
    renderSearchHistory();
    if (searchHistory.length > 0) {
        getWeather(searchHistory[searchHistory.length - 1]);
    }
}

const timeDisplayEl = $('#currentDay');
function currentTime (){
    let liveDay = moment().format('dddd');
    let liveDateTime = moment().format('MMMM Do YYYY, h:mm:ss a');
    timeDisplayEl.text(liveDay + ", " + liveDateTime);
}
setInterval(currentTime, 1000);

displayScreen();