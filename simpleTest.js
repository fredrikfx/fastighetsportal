const sql = require('mssql');

const config = {
  user: 'fastighetsportal',
  password: 'n1detfac',
  server: 'localhost',  // Prova med 'localhost' istället för fullständigt namn
  database: 'Fastighetsportal',
  options: {
    encrypt: false,  // Inaktivera kryptering för lokal testning
    trustServerCertificate: true
  }
};

async function testConnection() {
  try {
    console.log("Ansluter till:", config.server);
    await sql.connect(config);
    const result = await sql.query`SELECT 'Anslutningen fungerar!' AS message`;
    console.log(result.recordset[0].message);
    await sql.close();
  } catch (err) {
    console.error("Anslutningsfel:", err);
  }
}

testConnection();