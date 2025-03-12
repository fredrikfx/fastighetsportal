// lib/dbConfig.js
export const sqlConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    server: process.env.DB_SERVER,
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000
    },
    options: {
      encrypt: true, // för azure
      trustServerCertificate: true // ändra till true för lokal dev / självgenererade cert
    }
  }