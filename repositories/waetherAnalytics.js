import pool from "../utils/db.js";


const getCitiesRepo = async (cityWhere) => {

    const query = `
        SELECT *
        FROM weather_city_logs
        WHERE city_name = ANY($1)
        ORDER BY created_date DESC
    `;

    const result = await pool.query(query, [cityWhere]);

    return result.rows;
};

const getCityByNameRepo = async (cityName) => {

    const query = `
        SELECT *
        FROM weather_city_logs
        WHERE city_name = $1
        ORDER BY created_date DESC
    `;

    const result = await pool.query(query, [cityName]);

    return result.rows;
};

const saveCityWeatherRepo =async (weatherInfo)=>{
try {
    // Parameterized query mapped exactly to your columns
    const query = `
      INSERT INTO weather_city_logs (city_name, temp, humidity, condition, log_date)
      VALUES ($1, $2, $3, $4, CURRENT_DATE)
      ON CONFLICT (city_name) 
      DO UPDATE SET 
        temp = EXCLUDED.temp,
        humidity = EXCLUDED.humidity,
        condition = EXCLUDED.condition,
        created_date = CURRENT_TIMESTAMP
      RETURNING *;
    `;

    const values = [
      weatherInfo.city_name,
      weatherInfo.temp,
      weatherInfo.humidity,
      weatherInfo.condition
    ];

    const result = await pool.query(query, values);
    return result.rows[0]; // Returns the saved record object

  } catch (error) {
    console.error("❌ Database Error in saveCityWeatherRepo:", error.message);
    throw error;
  }
}

export {
    getCitiesRepo,
    getCityByNameRepo,
    saveCityWeatherRepo
}