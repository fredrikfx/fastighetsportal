const sql = require('mssql');
const dotenv = require('dotenv');

dotenv.config({ path: './.env.local' });

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};

async function testConnection() {
  try {
    console.log("Ansluter till:", config.server, "databas:", config.database);
    await sql.connect(config);
    const result = await sql.query`SELECT 'Anslutningen fungerar!' AS message`;
    console.log(result.recordset[0].message);
    await sql.close();
  } catch (err) {
    console.error("Anslutningsfel:", err);
  }
}

testConnection();