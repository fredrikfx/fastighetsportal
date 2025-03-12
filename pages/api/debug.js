// pages/api/debug.js
import { testConnection } from '../../lib/sql';

export default async function handler(req, res) {
  try {
    // Samla in miljöinformation
    const environment = {
      nodeEnv: process.env.NODE_ENV,
      dbConfig: {
        hasServer: !!process.env.DB_SERVER,
        hasName: !!process.env.DB_NAME,
        hasUser: !!process.env.DB_USER,
        hasPassword: !!process.env.DB_PASSWORD
      }
    };

    // Testa databasanslutningen
    let connectionResult;
    try {
      connectionResult = await testConnection();
    } catch (dbError) {
      connectionResult = {
        success: false,
        error: dbError.message,
        stack: process.env.NODE_ENV === 'development' ? dbError.stack : undefined
      };
    }

    // Skicka tillbaka diagnostikdata
    res.status(200).json({
      timestamp: new Date().toISOString(),
      environment,
      database: connectionResult,
      request: {
        method: req.method,
        url: req.url,
        headers: req.headers
      }
    });
  } catch (error) {
    res.status(500).json({
      error: 'Diagnostic API failed',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}