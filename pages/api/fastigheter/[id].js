// pages/api/fastigheter/[id].js
import { getFastighet } from '../../../lib/sql';
import { enhanceProperty } from '../../../lib/propertyMapper';

export default async function handler(req, res) {
  const { id } = req.query;
  
  if (req.method === 'GET') {
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
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}