// lib/sqlConfig.js
import sql from 'mssql/msnodesqlv8';

export const sqlConfig = {
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  driver: 'msnodesqlv8',
  options: {
    trustedConnection: true
  }
};

export default sql;