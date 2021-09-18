function GetLocation() {
    // Get location from client

    if ('geolocation' in navigator) {
        console.log('geolocation available');

        // We cna make this an async so we can call it at any time
        navigator.geolocation.getCurrentPosition(async position => {

            // Creating these variables no matter if we get data or not
            let lat, lon, temps, FirstCityAirQuality;

            lat = position.coords.latitude.toFixed(2);
            lon = position.coords.longitude.toFixed(2);

            // We can't do the API call to OpenWeather from the client for security reasons! So this has to be done from the server side
            const weather = await GetWeather(lat, lon);
            temps = weather.weather.main;
            const air_quality = weather.air_quality;
            console.log(temps);
            console.log(air_quality);

            // API temp is in K
            const CelsiusTemp = (temps.temp - 273.15).toFixed(2);

            // Getting air quality
            try {
                const AirQuality = (air_quality.results[0]);

                const CityAirQuality = AirQuality.city;
                console.log(`Got air quality from closest city: ${CityAirQuality}`);
                // There are 4 measurements, we'll take the 1st one, the pm10 and display it
                FirstCityAirQuality = AirQuality.measurements[0].value;
                const Units = AirQuality.measurements[0].unit
                console.log(`There is a pm10 value of ${FirstCityAirQuality} ${Units}`);

                ChangeDomWithLatLon(LatId="Latitude", LonId="Longitude", TempId="Temperature", AirQualityId="AirQuality", NearCityId="NearestCity", lat, lon, CelsiusTemp, FirstCityAirQuality, Units, CityAirQuality);

                

            } catch (error) {
                console.log("No values were found at the location!");

                // If we get an error we just create no data areas
                // temps = {value: NaN};
                FirstCityAirQuality = -1;

                ChangeDomWithLatLon(LatId="Latitude", LonId="Longitude", TempId="Temperature", AirQualityId="AirQuality", NearCityId="NearestCity", lat, lon, CelsiusTemp, "No available reading", "No Unit found", "No measurement found");
            }

            data = {lat, lon, temps, FirstCityAirQuality};

            // Sending data to server 
            const serverResp = await SendJSONData(data, endpoint="/location");
            console.log(`Server response: ${serverResp.respData.status}`);


        });
    } else {
        console.log("Geolocation not available");
    };
};



async function ChangeDomWithLatLon(LatId, LonId, TempId, AirQualId, NearCityId, lat, lon, temp, airQual, airQualUnit, nearCity) {
    // Change DOM elements with client side location
    document.getElementById(LatId).innerText = lat;
    document.getElementById(LonId).innerText = lon;
    document.getElementById(TempId).innerText = temp;
    document.getElementById(AirQualId).innerText = `${airQual} ${airQualUnit}`;
    document.getElementById(NearCityId).innerText = nearCity;
};

async function SendJSONData(data, endpoint) {
    // Send JSON Data back to the server
    // Return reponse

    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    };
    
    const response = await fetch(endpoint, options);
    const responseData = await response.json();

    return {resp: response, respData: responseData}
};

async function GetWeather(lat, lon) {
    // Do a server side request to get the weather from OpenWeather API
    const api_url = `weather_data/${lat},${lon}`;

    const response = await fetch(api_url);
    const json = await response.json();

    console.log("Weather queried successfully!");

    return json
};



// --------- Variables ------------
const GeoBtn = document.getElementById("GeoBtn");


// ---------- Execution -----------
GeoBtn.addEventListener('click', async event => {
    GetLocation();
});
