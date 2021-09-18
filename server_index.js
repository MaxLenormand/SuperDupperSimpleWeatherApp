// Imports
// const express = require('express');
// const DataStore = require('nedb');
// const fetch = require('node-fetch');
import express from "express";
import DataStore from "nedb";
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();
import { all } from "proxy-addr";


// Setting up express
const app = express();
const port = process.env.PORT;
app.listen(port, () => console.log(`listening at ${port}`));
app.use(express.static('public'));
app.use(express.json({limit: '1mb'}));

// Setting up Database
const database = new DataStore('weather_db.db');
database.loadDatabase();

// Loading API Key from dotenv
const APIkey = process.env.WEATHER_API_KEY;

// Post Endpoints
app.post("/location", (req, resp) => {
    console.log("Got response from client!");

    const data = req.body;
    // Adding a datetime to the recieved data
    data.recieveTime = Date.now();

    // Adding data to database
    database.insert(data);

    // Sending back a response to the client
    resp.json({
        status: "Recieved all data properly",
    });
});

// GET Endpoints
app.get("/database_read", (req, resp) => {
    database.find({}, (err, data) => {
        if (err) {
            // resp.json({status: "Data not retrieved correctly"});
            resp.end();
            console.log("Error Retrieving database info");
            return;
        } else {
            // data.status = "Successfully queried database";
            console.log(data);
            resp.json(data);
        }
    })
});

app.get("/weather_data/:latlon",  async (req, resp) => {
    // req contains params that will have our different variables
    console.log(req.params)
    const latlon = req.params.latlon.split(',');
    const lat = latlon[0];
    const lon = latlon[1];

    // Query OpenWeather API to get weather data
    const weather_api = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${APIkey}`;
    const weather_response = await fetch(weather_api);
    const weatherResp = await weather_response.json();

    // Also querying OpenAQ for air quality
    const radiusMeters = 1000;
    const openaq_api = `https://api.openaq.org/v2/latest?coordinates=${lat},${lon}&radius=${radiusMeters}`
    const openaq_response = await fetch(openaq_api);
    const openaqResp = await openaq_response.json();

    const all_data = {
        weather: weatherResp,
        air_quality: openaqResp
    }
    
    // Sending the result of the OpenWeather API back to the client
    // This is called a proxy server 
    resp.json(all_data);
});