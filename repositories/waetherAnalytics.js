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

export {
    getCitiesRepo,
    getCityByNameRepo
}