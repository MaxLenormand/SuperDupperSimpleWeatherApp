// Setting up Leaflet map
const mymap = L.map('mymap').setView([52, 4], 10);
const attribution =
'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const tiles = L.tileLayer(tileUrl, { attribution });
tiles.addTo(mymap);



// Reading database of previous acquistions
async function ReadDb() {
    const response = await fetch("/database_read");
    const db = await response.json();

    console.log(db);

    const NbPts = document.getElementById('DatabaseCount');
    NbPts.innerText = `There are ${db.length} points in the Database`;
    // document.body.append(NbPts);

    DisplayDb(db);
};

function DisplayDb(data_items) {

    for (item of data_items) {
        // Creating some DOM elements
        const root = document.createElement('div');
        const lat = document.createElement('div');
        const lon = document.createElement('div');
        const time = document.createElement('div');
        const temp = document.createElement('div');
        const AirQual = document.createElement('div');
        const br = document.createElement('br');

        // Changing timestamp to local client time
        const timeString = new Date(item.recieveTime).toLocaleString();
        const CelsiusTemp = ((item.temps.temp) - 273.15).toFixed(2);

        lat.innerText = `Latitude: ${item.lat}`;
        lon.innerText = `Longitude: ${item.lon}`;
        time.innerText = `Time: ${timeString}`;
        temp.innerText = `Temp (C): ${CelsiusTemp}`;
        AirQual.innerText = `Air Quality: ${item.FirstCityAirQuality}`;
        

        // Commenting this out for now so we don't display those anymore but just show the map
        root.append(lat, lon, time, temp, AirQual, br);
        // document.body.append(root);

        const marker = L.marker([item.lat, item.lon]).addTo(mymap);
        let TextMarker = `Temp: ${item.temps.temp}. AirQuality: `;

        if (item.FirstCityAirQuality === -1) {
            console.log("No air data");
             TextMarker += "No Reading";
        } else {
            console.log("Air Quality available")
            TextMarker += `${item.FirstCityAirQuality}`;
        }

        marker.bindPopup(TextMarker).openPopup();
    };
};

ReadDb();