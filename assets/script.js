const apiKey = 'd6b4fd1efef85db37e2a3f3cd63bb491';
let currentCity = "";
let lastCity = "";
const url = 'https://api.openweathermap.org/data/2.5/weather?q=';
const ulrIcon =' https://openweathermap.org/img/wn/';
const ulrUvIndex = 'https://api.openweathermap.org/data/2.5/uvi?lat='
const urlForecast = 'https://api.openweathermap.org/data/2.5/forecast?q=';
const iconcode = 'data.weather[0].icon';

const localstorageCity = (newCity) => {
    let cityExists = false;
    for (let i = 0; i < localStorage.length; i++) {
        if (localStorage["cities" + i] === newCity) {
            cityExists = true;
            break;
        }
    }
    if (cityExists === false) {
        localStorage.setItem('cities' + localStorage.length, newCity);
    }
}

const CurrentCities = () => {
    $('#city-results').empty();
    if (localStorage.length===0){
        if (lastCity){
            $('#search-city').attr("value", lastCity);
        } else {
            $('#search-city').attr("value", "Sydney");
        }
    } else {
        let lastCityKey="cities"+(localStorage.length-1);
        lastCity=localStorage.getItem(lastCityKey);
        $('#search-city').attr("value", lastCity);
        for (let i = 0; i < localStorage.length; i++) {
            let city = localStorage.getItem("cities" + i);
            let cityEl;
            if (currentCity===""){
                currentCity=lastCity;
            }
            if (city === currentCity) {
                cityEl = `<button type="button" class="list-group-item list-group-item-action active">${city}</button></li>`;
            } else {
                cityEl = `<button type="button" class="list-group-item list-group-item-action">${city}</button></li>`;
            } 
            $('#city-results').prepend(cityEl);
        }
        if (localStorage.length>0){
            $('#clear-storage').html($('<a id="clear-storage" href="#">clear</a>'));
        } else {
            $('#clear-storage').html('');
        }
    }
    
};
const currentUVindex = async (data) => {
    const latitude = response.coord.lat;
    const longitude = response.coord.lon;
    const uvIndexUrl = `${ulrUvIndex}${latitude}&lon=${longitude}&APPID=${apiKey}`;

    try {
        const response = await fetch(uvIndexUrl, {cache: 'no-cache'})
        if(response.ok){
            const jsonResponse = await response.json()
        .then((response => {
            let uvIndex = response.value;
            $('#uvIndex').html(`UV Index: <span id="uvVal"> ${uvIndex}</span>`);
            if (uvIndex>=0 && uvIndex<3){
                $('#uvVal').attr("class", "uv-favorable");
            } else if (uvIndex>=3 && uvIndex<8){
                $('#uvVal').attr("class", "uv-moderate");
            } else if (uvIndex>=8){
                $('#uvVal').attr("class", "uv-severe");
            }
        }))
    }
}catch(error){console.log(error)};
}

const currentCondition = async (event) => {
    const city = $('#search-city').val();
    currentCity = $('#search-city').val();
    const urlToFetch = `${url}city&units=metric&appid=${apiKey}`;
    try {
        const response = await fetch(urlToFetch, {cache: 'no-cache'});
        if(response.ok){
            const jsonResponse = async() => await response.json();
                jsonResponse().then((response) => {
                localstorageCity(city);
                $('#search-error').text("");
                var iconurl = "http://openweathermap.org/img/w/" + iconcode + ".png";
                let currentTimeUTC = response.dt;
                let currentTimeZoneOffset = response.timezone;
                let currentTimeZoneOffsetHours = currentTimeZoneOffset / 60 / 60;
                let currentMoment = moment.unix(currentTimeUTC).utc().utcOffset(currentTimeZoneOffsetHours);
                
                const currentWeatherHTML = `
                    <h3>${response.name} ${currentMoment.format("(DD/MM/YY)")}<img src="${iconurl}"></h3>
                    <ul class="list-unstyled">
                        <li>Temperature: ${response.main.temp}&#8451;</li>
                        <li>Humidity: ${response.main.humidity}%</li>
                        <li>Wind Speed: ${response.wind.speed} Km/h</li>
                        <li id="uvIndex">UV Index:${this.currentUVindex}</li>
                    </ul>`;

                CurrentCities();
                FiveDayForecast(event);
                $('#header-text').text(response.name);
                $('#current-weather').html(currentWeatherHTML);
            });
        }
    }catch(error){console.log(error)}  
};


      
const FiveDayForecast = async (event) => {
    let city = $('#search-city').val();
    const forecastUrl = `${urlForecast}${city}&units=metric&appid=${apiKey}`;

    try {
        const response = await fetch(forecastUrl, {cache: 'no-cache'})
        if(response.ok){
            const jsonResponse = async() => await response.json()
            jsonResponse().then((response) => {
                let fiveDayForecastHTML = `
                <h2>5-Day Forecast:</h2>
                <div id="fiveDayForecastUl" class="d-inline-flex flex-wrap ">`;
                for (let i = 0; i < response.list.length; i++) {
                    let dayData = response.list[i];
                    let currentMoment = dayData.dt;
                    let timeZoneOffset = response.city.timezone;
                    let timeZoneOffsetHours = timeZoneOffset / 60 / 60;
                    let thisMoment = moment.unix(currentMoment).utc().utcOffset(timeZoneOffsetHours);
                    var iconurl = "http://openweathermap.org/img/w/" + iconcode + ".png";
                    if (thisMoment.format("HH:mm:ss") === "11:00:00" || thisMoment.format("HH:mm:ss") === "12:00:00" || thisMoment.format("HH:mm:ss") === "13:00:00") {
                        fiveDayForecastHTML += `
                        <div class="weather-card card m-2 p0">
                            <ul class="list-unstyled p-3">
                                <li>${thisMoment.format("DD/MM/YY")}</li>
                                <li class="weather-icon"><img src="${iconurl}"></li>
                                <li>Temp: ${dayData.main.temp}&#8451;</li>
                                <br>
                                <li>Humidity: ${dayData.main.humidity}%</li>
                            </ul>
                        </div>`;
                    }
                }
                fiveDayForecastHTML += `</div>`;
                $('#five-day-forecast').html(fiveDayForecastHTML);
            })
        }
    }catch(error){console.log(error)};
};

$('#search-button').on("click", (event) => {
event.preventDefault();
currentCity = $('#search-city').val();
currentCondition(event);
});

$('#city-results').on("click", (event) => {
    event.preventDefault();
    $('#search-city').val(event.target.textContent);
    currentCity = $('#search-city').val();
    currentCondition(event);
});

$("#clear-storage").on("click", (event) => {
    localStorage.clear();
    CurrentCities();
});

CurrentCities();

currentCondition();