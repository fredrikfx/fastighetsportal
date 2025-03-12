// pages/api/fastigheter/index.js
import { getFastigheter, testConnection } from '../../../lib/sql';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      console.log('API: Börjar hämta fastigheter');
      
      // Kontrollera databasanslutningen först
      try {
        const connectionTest = await testConnection();
        if (!connectionTest.success) {
          console.error('API: Databasanslutningstest misslyckades:', connectionTest.error);
          return res.status(500).json({ 
            error: 'Databasfel',
            message: 'Kunde inte ansluta till databasen',
            details: process.env.NODE_ENV === 'development' ? connectionTest.error : undefined
          });
        }
      } catch (connError) {
        console.error('API: Fel vid test av databasanslutning:', connError);
        return res.status(500).json({ 
          error: 'Anslutningsfel',
          message: 'Kunde inte testa databasanslutningen',
          details: process.env.NODE_ENV === 'development' ? connError.message : undefined
        });
      }
      
      // Försök hämta data
      let fastigheter;
      try {
        fastigheter = await getFastigheter();
        console.log(`API: Hämtade ${fastigheter?.length || 0} fastigheter från databasen`);
      } catch (dbError) {
        console.error('API: Databasfel vid hämtning av fastigheter:', dbError);
        return res.status(500).json({ 
          error: 'Databasfel',
          message: 'Kunde inte hämta fastigheter från databasen',
          details: process.env.NODE_ENV === 'development' ? dbError.message : undefined
        });
      }
      
      // Extra säkerhetskontroll för null/undefined
      if (!fastigheter) {
        console.error('API: Fastigheter är null eller undefined efter databasanrop');
        return res.status(500).json({ 
          error: 'Datafel',
          message: 'Hämtade ogiltigt data från databasen'
        });
      }
      
      // Vår data ser bra ut, skicka tillbaka den
      return res.status(200).json(fastigheter);
      
    } catch (error) {
      console.error('API: Okänt fel vid hantering av begäran:', error);
      return res.status(500).json({ 
        error: 'Internt serverfel', 
        message: 'Något gick fel vid bearbetning av begäran',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}