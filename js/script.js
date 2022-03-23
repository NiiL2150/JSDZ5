const apiKey = "your open weather map api";
const days = 5;
const weekdays = ["Sun", "Mon", "Tue", "Wen", "Thu", "Fri", "Sat"];

function showUserError(str) {
    alert(str);
}

class GeolocationError extends Error {
    constructor(message) {
        super(message);
        this.name = "GeolocationError";
    }
}

var geoLocation = null;
var gpsCallback = null;
function locationSuccess(pos) {
    cityName.textContent = `Your location`;
    geoLocation = { lat: pos.coords.latitude, lon: pos.coords.longitude };
    gpsCallback();
}

function locationError(error) {
    try {
        let message = "";
        switch (error.code) {
            case error.PERMISSION_DENIED:
                message = "User denied the request for Geolocation";
                break;
            case error.POSITION_UNAVAILABLE:
                message = "Location information is unavailable";
                break;
            case error.TIMEOUT:
                message = "The request to get user location timed out";
                break;
            case error.UNKNOWN_ERROR:
                message = "An unknown error occurred";
                break;
        }
        throw new GeolocationError(message);
    } catch (error) {
        if (error instanceof GeolocationError) {
            showUserError(error.message);
        } else {
            throw error;
        }
    }
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            locationSuccess,
            locationError
        );
    } else {
        throw new GeolocationError(
            "Geolocation is not supported on this browser"
        );
    }
}

function useCurrentLocation(e) {
    e.preventDefault();
    try {
        getLocation();
        gpsCallback = () => {
            getWeather(geoLocation);
        };
    } catch (error) {
        if (error instanceof GeolocationError) {
            showUserError(error.message);
        } else {
            throw error;
        }
    }
}

function ajaxFailHandler(str = "An error occured") {
    showUserError(str);
}

function ajaxHandler(link = "", next = null) {
    $.ajax({
        url: link,
        dataType: "json",
        type: "GET",
        beforeSend: () => {},
    })
        .done(next)
        .fail(() => {
            ajaxFailHandler();
        });
}

function findLocation(e) {
    e.preventDefault();
    getLocationByName(locationName.value);
}

function getLocationByName(locationName) {
    ajaxHandler(
        `https://api.openweathermap.org/geo/1.0/direct?` +
            `q=${locationName}&limit=1&appid=${apiKey}`,
        wrapLocation
    );
}

function wrapLocation(obj) {
    cityName.textContent = `${obj[0].name}, ${obj[0].country}`;
    getWeather({ lat: obj[0].lat, lon: obj[0].lon });
}

function getWeather(geoLocation) {
    ajaxHandler(
        `https://api.openweathermap.org/data/2.5/` +
            `onecall?units=metric&lat=${geoLocation.lat}&lon=${geoLocation.lon}` +
            `&exclude=minutely,hourly,alerts&appid=${apiKey}`,
        editForecast
    );
}

function formatDate1(date) {
    return [date.getDate(), date.getMonth() + 1, date.getFullYear() % 100].join(
        "."
    );
}

function editForecast(obj) {
    currentWeather.classList.remove("hidden");
    dailyWeather.classList.remove("hidden");
    let template = dailyWeather.children[0];
    dailyWeather.innerHTML = "";
    for (let i = 0; i < days; i++) {
        const item = obj.daily[i];
        let temp = template.cloneNode(true);
        let thisDate = new Date(item.dt * 1000);
        temp.children[0].textContent = weekdays[thisDate.getDay()];
        temp.children[1].textContent = formatDate1(thisDate);
        console.log(item);
        temp.children[2].src = `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`;
        let avgTemp = Math.round((item.temp.max + item.temp.min) / 2);
        temp.children[3].textContent = `${avgTemp} °C`;
        dailyWeather.appendChild(temp);
    }
}
