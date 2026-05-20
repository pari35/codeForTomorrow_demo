import { getCitiesRepo, getCityByNameRepo, saveCityWeatherRepo } from "../repositories/waetherAnalytics.js";

import url from 'url';

const API_KEY = '27ca77a5c296d4babd7f47e82016b73f';
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';


async function getWeatherByCity(cityName) {
 try {
    const apiUrl = `${BASE_URL}?q=${encodeURIComponent(cityName)}&appid=${API_KEY}&units=metric`;
    const response = await fetch(apiUrl);

    if (!response.ok) {
      if (response.status === 401) throw new Error("API key activating. Try again shortly.");
      if (response.status === 404) throw new Error(`City '${cityName}' not found.`);
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();

    // Explicitly mapped to match your exact database column names
    return {
      city_name: data.name,
      temp: data.main.temp,
      humidity: data.main.humidity,
      condition: data.weather[0].main
    };

  } catch (error) {
    console.error(`❌ Error fetching weather for ${cityName}:`, error.message);
    return null; 
  }
}

// 2. Main Analytics Controller
const analyticsServices = async (req, res) => {
    try {
        const { cities, threshold = 30 } = req.body;

        if (!cities || !Array.isArray(cities) || cities.length === 0) {
            return res.status(400).json({ success: false, message: "Please provide an array of cities." });
        }

        // Loop through requested cities, fetch current weather, and save to DB
        for (const city of cities) {
            const weatherInfo = await getWeatherByCity(city);

            if (weatherInfo) {

                let saveWeatherData = await saveCityWeatherRepo(weatherInfo);
                console.log(`Saved ${weatherInfo.city_name} to database.`);
            }
        }

        // Fetch the stored details back out of your DB (retaining your original logic)
        let cityDetails = await getCitiesRepo(cities);

        if (!cityDetails || cityDetails.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No city data found in database"
            });
        }

        // Average Temperature
        const totalTemp = cityDetails.reduce(
            (sum, city) => sum + Number(city.temp),
            0
        );
        const averageTemperature = totalTemp / cityDetails.length;

        // Highest Temperature
        const highestTemperature = cityDetails.reduce((max, city) =>
            Number(city.temp) > Number(max.temp) ? city : max
        );

        // Lowest Temperature
        const lowestTemperature = cityDetails.reduce((min, city) =>
            Number(city.temp) < Number(min.temp) ? city : min
        );

        // Hot Cities
        const hotCities = cityDetails
            .filter(city => Number(city.temp) > threshold)
            .map(city => city.city_name);

        let respData = {
            averageTemperature: Number(averageTemperature.toFixed(2)),
            highestTemperature: {
                city: highestTemperature.city_name,
                temp: Number(highestTemperature.temp)
            },
            lowestTemperature: {
                city: lowestTemperature.city_name,
                temp: Number(lowestTemperature.temp)
            },
            hotCities
        };

        // Return the response object to the client
        return {
             success: true,
            data: respData
        }
      

    } catch (error) {
        console.log("err", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};


const analyticsByCityServices = async (req, res) => {

    try {

        const name = req.params.name;

        let cityDetails = await getCityByNameRepo(name);

        if (!cityDetails || cityDetails.length === 0) {
            return res.status(404).json({
                success: false,
                message: "City data not found"
            });
        }

        // Current temperature
        const currentTemperature = cityDetails[0].temp;

        // Min temperature
        const minTemp = Math.min(
            ...cityDetails.map(city => Number(city.temp))
        );

        // Max temperature
        const maxTemp = Math.max(
            ...cityDetails.map(city => Number(city.temp))
        );

        // Next 5 forecast records
        const forecast = cityDetails
            .slice(0, 5)
            .map(city => ({
                date: city.date,
                temp: city.temp
            }));

        // Warning Logic
        let warning = null;

        if (currentTemperature > 35) {
            warning = "High temperature warning";
        }

        let cityData = {
            city: name,
            currentTemperature,
            minTemperature: minTemp,
            maxTemperature: maxTemp,
            forecast,
            warning
        }
        return cityData

    } catch (error) {

        console.log("err", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};


export {
    analyticsServices,
    analyticsByCityServices
}