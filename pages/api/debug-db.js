// pages/api/debug-db.js
import { testConnection } from '../../lib/sql';

export default async function handler(req, res) {
  try {
    // Testa databasen
    const connectionResult = await testConnection();
    
    // Samla miljövariabelinformation (utan känsliga värden)
    const envInfo = {
      DB_SERVER_SET: !!process.env.DB_SERVER,
      DB_NAME_SET: !!process.env.DB_NAME,
      DB_USER_SET: !!process.env.DB_USER,
      DB_PASSWORD_SET: !!process.env.DB_PASSWORD,
      NODE_ENV: process.env.NODE_ENV,
    };

    // Skicka tillbaka diagnostikdata
    res.status(200).json({
      timestamp: new Date().toISOString(),
      connectionTest: connectionResult,
      environment: envInfo,
      nextjsInfo: {
        nextVersion: process.env.NEXT_PUBLIC_VERSION || 'unknown',
        nodeVersion: process.version
      }
    });
  } catch (error) {
    console.error('Debug API error:', error);
    res.status(500).json({
      error: 'Debug API failed', 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}