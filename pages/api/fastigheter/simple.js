// pages/api/fastigheter/simple.js
import { testConnection } from '../../../lib/sql';
import sql from 'mssql';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Först, testa anslutningen
      const connectionTest = await testConnection();
      if (!connectionTest.success) {
        return res.status(500).json({ 
          error: 'Databasanslutningen misslyckades', 
          details: connectionTest.error 
        });
      }
      
      // Konfigurera anslutningen manuellt (för felsökning)
      const sqlConfig = {
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        server: process.env.DB_SERVER,
        database: process.env.DB_NAME,
        options: {
          encrypt: true,
          trustServerCertificate: true
        }
      };
      
      // Anslut till databasen
      const pool = await new sql.ConnectionPool(sqlConfig).connect();
      
      // Försök hämta antal rader i tabellen (för att verifiera att tabellen finns)
      const countResult = await pool.request().query('SELECT COUNT(*) as count FROM Fastigheter');
      const count = countResult.recordset[0].count;
      
      // Hämta bara 2 fastigheter för att diagnostisera
      const result = await pool.request().query('SELECT TOP 2 * FROM Fastigheter');
      
      // Stäng poolen
      await pool.close();
      
      // Returnera diagnostikdata
      return res.status(200).json({
        status: 'success',
        tableCount: count,
        sampleData: result.recordset,
        connectionInfo: {
          server: process.env.DB_SERVER,
          database: process.env.DB_NAME,
          columnCount: result.recordset.length > 0 ? Object.keys(result.recordset[0]).length : 0
        }
      });
    } catch (error) {
      console.error('Simple API error:', error);
      return res.status(500).json({
        error: 'Något gick fel',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        code: error.code,
        state: error.state,
        number: error.number,
        // För SQL-specifika fel:
        sqlError: error instanceof sql.RequestError || error instanceof sql.ConnectionError
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}