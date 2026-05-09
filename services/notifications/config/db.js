const mysql = require("mysql2/promise");

const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

const pool = mysql.createPool(dbConfig);

async function connectDB() {
  try {
    const connection = await pool.getConnection();
    return connection;
  } catch (err) {
    console.error("❌ Gagal mendapatkan koneksi dari pool:", err);
    throw err;
  }
}

const query = async (sql, params = []) => {
  const connection = await connectDB();
  try {
    const [results] = await connection.execute(sql, params);
    return results;
  } catch (err) {
    console.error("❌ Query Error:", err);
    throw err;
  } finally {
    connection.release();
  }
};

module.exports = {
  query,
};
