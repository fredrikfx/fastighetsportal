// pages/api/fastigheter/[id].js
import { getFastighet, updateFastighet, deleteFastighet, testConnection } from '../../../lib/sql';
import { enhanceProperty } from '../../../lib/propertyMapper';

export default async function handler(req, res) {
  const { id } = req.query;
  const method = req.method;
  
  // Kontrollera att vi har ett giltigt ID
  if (!id) {
    return res.status(400).json({ 
      error: 'Ogiltigt ID', 
      message: 'Fastighets-ID saknas'
    });
  }

  // GET-metod (behåll din befintliga implementation)
  if (method === 'GET') {
    try {
      console.log(`API [id]: Hämtar fastighet med ID: ${id}`);
      
      // Hämta fastighetsdata
      let fastighet;
      try {
        fastighet = await getFastighet(id);
        console.log(`API [id]: Hämtade data för fastighet ${id}:`, 
          fastighet ? 'Data hittades' : 'Ingen data hittades');
      } catch (dbError) {
        console.error(`API [id]: Databasfel vid hämtning av fastighet ${id}:`, dbError);
        return res.status(500).json({ 
          error: 'Databasfel',
          message: 'Kunde inte hämta fastigheten från databasen'
        });
      }
      
      // Kontrollera om fastigheten existerar
      if (!fastighet) {
        console.log(`API [id]: Fastighet med ID ${id} hittades inte`);
        return res.status(404).json({ error: 'Fastigheten hittades inte' });
      }
      
      // Förbättra fastigheten med ytterligare data
      let enhancedFastighet;
      try {
        console.log(`API [id]: Bearbetar fastighet ${id}`);
        enhancedFastighet = enhanceProperty(fastighet);
        console.log(`API [id]: Fastighet ${id} bearbetad`);
      } catch (mapError) {
        console.error(`API [id]: Fel vid bearbetning av fastighet ${id}:`, mapError);
        // Om mappning misslyckas, returnera rådata istället
        console.log(`API [id]: Returnerar obearbetad fastighet ${id} istället`);
        return res.status(200).json(fastighet);
      }
      
      // Returnera förbättrad fastighet
      console.log(`API [id]: Returnerar data för fastighet ${id}`);
      return res.status(200).json(enhancedFastighet || fastighet);
    } catch (error) {
      console.error(`API [id]: Generellt fel för fastighet ${id}:`, error);
      return res.status(500).json({ 
        error: 'Internt serverfel', 
        message: 'Något gick fel vid hämtning av fastigheten',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  } 
  // PUT-metod (uppdatera fastighet)
  else if (method === 'PUT') {
    try {
      console.log(`API [id]: Uppdaterar fastighet med ID: ${id}`);
      
      // Försök testa databasanslutning först
      try {
        const connectionTest = await testConnection();
        if (!connectionTest.success) {
          console.error('API [id]: Databasanslutningstest misslyckades:', connectionTest.error);
          return res.status(500).json({ 
            error: 'Databasfel',
            message: 'Kunde inte ansluta till databasen',
            details: process.env.NODE_ENV === 'development' ? connectionTest.error : undefined
          });
        }
      } catch (connError) {
        console.error('API [id]: Fel vid test av databasanslutning:', connError);
        return res.status(500).json({ 
          error: 'Anslutningsfel',
          message: 'Kunde inte testa databasanslutningen',
          details: process.env.NODE_ENV === 'development' ? connError.message : undefined
        });
      }
      
      // Kontrollera att fastigheten finns först
      const existingFastighet = await getFastighet(id);
      
      if (!existingFastighet) {
        console.log(`API [id]: Fastighet med ID ${id} hittades inte för uppdatering`);
        return res.status(404).json({ 
          error: 'Hittades inte',
          message: 'Fastigheten som ska uppdateras finns inte'
        });
      }
      
      // Uppdatera fastigheten
      const updatedFastighet = await updateFastighet(id, req.body);
      console.log(`API [id]: Fastighet ${id} har uppdaterats`);
      return res.status(200).json(updatedFastighet);
    } catch (error) {
      console.error(`API [id]: Fel vid uppdatering av fastighet med ID ${id}:`, error);
      return res.status(500).json({ 
        error: 'Databasfel',
        message: 'Kunde inte uppdatera fastigheten',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  // DELETE-metod (radera fastighet)
  else if (method === 'DELETE') {
    try {
      console.log(`API [id]: Raderar fastighet med ID: ${id}`);
      
      // Försök testa databasanslutning först
      try {
        const connectionTest = await testConnection();
        if (!connectionTest.success) {
          console.error('API [id]: Databasanslutningstest misslyckades:', connectionTest.error);
          return res.status(500).json({ 
            error: 'Databasfel',
            message: 'Kunde inte ansluta till databasen',
            details: process.env.NODE_ENV === 'development' ? connectionTest.error : undefined
          });
        }
      } catch (connError) {
        console.error('API [id]: Fel vid test av databasanslutning:', connError);
        return res.status(500).json({ 
          error: 'Anslutningsfel',
          message: 'Kunde inte testa databasanslutningen',
          details: process.env.NODE_ENV === 'development' ? connError.message : undefined
        });
      }
      
      // Kontrollera att fastigheten finns först
      const existingFastighet = await getFastighet(id);
      
      if (!existingFastighet) {
        console.log(`API [id]: Fastighet med ID ${id} hittades inte för radering`);
        return res.status(404).json({ 
          error: 'Hittades inte',
          message: 'Fastigheten som ska raderas finns inte'
        });
      }
      
      // Radera fastigheten
      const success = await deleteFastighet(id);
      
      if (success) {
        console.log(`API [id]: Fastighet ${id} har raderats`);
        return res.status(200).json({ 
          success: true, 
          message: 'Fastigheten har raderats' 
        });
      } else {
        console.error(`API [id]: Kunde inte radera fastighet ${id}`);
        return res.status(500).json({ 
          error: 'Raderingsfel',
          message: 'Kunde inte radera fastigheten' 
        });
      }
    } catch (error) {
      console.error(`API [id]: Fel vid radering av fastighet med ID ${id}:`, error);
      return res.status(500).json({ 
        error: 'Databasfel',
        message: 'Kunde inte radera fastigheten',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  // Andra metoder är inte tillåtna
  else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}