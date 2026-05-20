import { getCitiesRepo, getCityByNameRepo } from "../repositories/waetherAnalytics.js";


const analyticsServices = async (req, res) => {

    try {

        const { cities, threshold = 30 } = req.body;

        let cityDetails = await getCitiesRepo(cities);

        if (!cityDetails || cityDetails.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No city data found"
            });
        }

        // Average Temperature
        const totalTemp = cityDetails.reduce(
            (sum, city) => sum + Number(city.temp),
            0
        );

        const averageTemperature =
            totalTemp / cityDetails.length;

        // Highest Temperature
        const highestTemperature = cityDetails.reduce((max, city) =>
            city.temp > max.temp ? city : max
        );

        // Lowest Temperature
        const lowestTemperature = cityDetails.reduce((min, city) =>
            city.temp < min.temp ? city : min
        );

        // Hot Cities
        const hotCities = cityDetails
            .filter(city => Number(city.temp) > threshold)
            .map(city => city.city_name);

        let respData = {

            averageTemperature: Number(
                averageTemperature.toFixed(2)
            ),
            highestTemperature: {
                city: highestTemperature.city_name,
                temp: highestTemperature.temp
            },
            lowestTemperature: {
                city: lowestTemperature.city_name,
                temp: lowestTemperature.temp
            },
            hotCities
        }

        return respData

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